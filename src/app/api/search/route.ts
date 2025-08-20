import { NextRequest, NextResponse } from 'next/server';
import { findBestMatch, searchRelatedQuestions } from '@/lib/search';
import { isDemoMode, mockSearch } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const multiple = searchParams.get('multiple') === 'true';
  const limit = parseInt(searchParams.get('limit') || '5');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  // Validate query length
  if (query.trim().length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters long' }, { status: 400 });
  }

  // Prevent overly long queries
  if (query.length > 500) {
    return NextResponse.json({ error: 'Query is too long' }, { status: 400 });
  }

  try {
    // Check if we're in demo mode
    if (isDemoMode()) {
      console.log('Running in demo mode - using mock data');
      const mockResults = mockSearch(query.trim());
      
      if (multiple) {
        const limitedResults = mockResults.slice(0, Math.min(limit, 20));
        return NextResponse.json({ 
          answers: limitedResults,
          found: limitedResults.length > 0,
          count: limitedResults.length,
          query: query.trim(),
          demo: true
        });
      } else {
        const bestMatch = mockResults[0] || null;
        
        if (bestMatch) {
          return NextResponse.json({ 
            answer: bestMatch,
            found: true,
            relevance_score: bestMatch.relevance_score || 0,
            demo: true
          });
        }

        return NextResponse.json({ 
          answer: null,
          found: false,
          message: 'No matching answers found in our demo database',
          demo: true
        });
      }
    }

    // Real database search mode
    if (multiple) {
      // Search for multiple related questions
      const questions = await searchRelatedQuestions(query.trim(), Math.min(limit, 20));
      
      return NextResponse.json({ 
        answers: questions,
        found: questions.length > 0,
        count: questions.length,
        query: query.trim()
      });
    } else {
      // Search for the best single match
      const bestMatch = await findBestMatch(query.trim());
      
      if (bestMatch) {
        return NextResponse.json({ 
          answer: bestMatch,
          found: true,
          relevance_score: bestMatch.relevance_score || 0
        });
      }

      // No matching answer found
      return NextResponse.json({ 
        answer: null,
        found: false,
        message: 'No matching answers found in our database'
      });
    }

  } catch (error) {
    console.error('Search error:', error);
    
    // Fallback to demo mode if database fails
    console.log('Database error, falling back to demo mode');
    const mockResults = mockSearch(query.trim());
    
    if (multiple) {
      const limitedResults = mockResults.slice(0, Math.min(limit, 20));
      return NextResponse.json({ 
        answers: limitedResults,
        found: limitedResults.length > 0,
        count: limitedResults.length,
        query: query.trim(),
        demo: true,
        fallback: true
      });
    } else {
      const bestMatch = mockResults[0] || null;
      
      if (bestMatch) {
        return NextResponse.json({ 
          answer: bestMatch,
          found: true,
          relevance_score: bestMatch.relevance_score || 0,
          demo: true,
          fallback: true
        });
      }

      return NextResponse.json({ 
        answer: null,
        found: false,
        message: 'No matching answers found (demo mode)',
        demo: true,
        fallback: true
      });
    }
  }
}