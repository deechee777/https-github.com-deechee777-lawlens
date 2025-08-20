import { supabase } from './supabase';

interface SearchResult {
  id: string;
  question_text: string;
  answer_text: string;
  source_url: string | null;
  is_public: boolean;
  status: string;
  created_at: string;
  relevance_score?: number;
}

export class LawLensSearch {
  /**
   * Comprehensive search function that tries multiple search strategies
   */
  static async searchQuestions(query: string, limit: number = 5): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cleanQuery = query.trim();
    const results: SearchResult[] = [];

    try {
      // Strategy 1: Full-text search with ranking
      const fullTextResults = await this.fullTextSearch(cleanQuery, limit);
      results.push(...fullTextResults);

      // Strategy 2: If we don't have enough results, try fuzzy matching
      if (results.length < limit) {
        const remainingLimit = limit - results.length;
        const fuzzyResults = await this.fuzzySearch(cleanQuery, remainingLimit, results.map(r => r.id));
        results.push(...fuzzyResults);
      }

      // Strategy 3: If still not enough, try keyword matching
      if (results.length < limit) {
        const remainingLimit = limit - results.length;
        const keywordResults = await this.keywordSearch(cleanQuery, remainingLimit, results.map(r => r.id));
        results.push(...keywordResults);
      }

      return results.slice(0, limit);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to simple search
      return await this.simpleSearch(cleanQuery, limit);
    }
  }

  /**
   * Full-text search using PostgreSQL's text search capabilities
   */
  private static async fullTextSearch(query: string, limit: number): Promise<SearchResult[]> {
    // Convert query to tsquery format
    const tsQuery = query
      .split(/\s+/)
      .filter(word => word.length > 2)
      .map(word => `${word}:*`)
      .join(' | ');

    if (!tsQuery) return [];

    const { data, error } = await supabase
      .rpc('search_questions_fulltext', {
        search_query: tsQuery,
        result_limit: limit
      });

    if (error) {
      console.error('Full-text search error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Fuzzy search for partial matches
   */
  private static async fuzzySearch(query: string, limit: number, excludeIds: string[] = []): Promise<SearchResult[]> {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    if (queryWords.length === 0) return [];

    let queryBuilder = supabase
      .from('questions')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'answered')
      .order('created_at', { ascending: false })
      .limit(limit * 2); // Get more results to filter out excluded ones

    if (excludeIds.length > 0) {
      queryBuilder = queryBuilder.not('id', 'in', `(${excludeIds.map(id => `'${id}'`).join(',')})`);
    }

    // Use multiple ILIKE conditions for better matching
    for (const word of queryWords) {
      queryBuilder = queryBuilder.or(`question_text.ilike.%${word}%,answer_text.ilike.%${word}%`);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Fuzzy search error:', error);
      return [];
    }

    return (data || [])
      .map(item => ({
        ...item,
        relevance_score: this.calculateRelevanceScore(query, item.question_text, item.answer_text)
      }))
      .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
      .slice(0, limit);
  }

  /**
   * Keyword-based search for individual terms
   */
  private static async keywordSearch(query: string, limit: number, excludeIds: string[] = []): Promise<SearchResult[]> {
    const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    if (keywords.length === 0) return [];

    let queryBuilder = supabase
      .from('questions')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'answered')
      .order('created_at', { ascending: false })
      .limit(limit * 2);

    if (excludeIds.length > 0) {
      queryBuilder = queryBuilder.not('id', 'in', `(${excludeIds.map(id => `'${id}'`).join(',')})`);
    }

    // Search for any of the keywords
    const keywordConditions = keywords.map(keyword => 
      `question_text.ilike.%${keyword}%,answer_text.ilike.%${keyword}%`
    ).join(',');

    queryBuilder = queryBuilder.or(keywordConditions);

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Keyword search error:', error);
      return [];
    }

    return (data || [])
      .map(item => ({
        ...item,
        relevance_score: this.calculateRelevanceScore(query, item.question_text, item.answer_text)
      }))
      .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
      .slice(0, limit);
  }

  /**
   * Simple fallback search
   */
  private static async simpleSearch(query: string, limit: number): Promise<SearchResult[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'answered')
      .ilike('question_text', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Simple search error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Calculate relevance score based on query match
   */
  private static calculateRelevanceScore(query: string, questionText: string, answerText: string | null): number {
    const queryLower = query.toLowerCase();
    const questionLower = questionText.toLowerCase();
    const answerLower = (answerText || '').toLowerCase();

    let score = 0;

    // Exact phrase match in question (highest score)
    if (questionLower.includes(queryLower)) {
      score += 100;
    }

    // Exact phrase match in answer
    if (answerLower.includes(queryLower)) {
      score += 50;
    }

    // Individual word matches
    const queryWords = queryLower.split(/\s+/);
    for (const word of queryWords) {
      if (word.length > 2) {
        if (questionLower.includes(word)) score += 10;
        if (answerLower.includes(word)) score += 5;
      }
    }

    // Bonus for shorter questions (likely more specific)
    if (questionText.length < 100) score += 5;

    return score;
  }
}

/**
 * Get the best matching question for a query (for single result search)
 */
export async function findBestMatch(query: string): Promise<SearchResult | null> {
  const results = await LawLensSearch.searchQuestions(query, 1);
  return results.length > 0 ? results[0] : null;
}

/**
 * Search for multiple related questions
 */
export async function searchRelatedQuestions(query: string, limit: number = 5): Promise<SearchResult[]> {
  return await LawLensSearch.searchQuestions(query, limit);
}