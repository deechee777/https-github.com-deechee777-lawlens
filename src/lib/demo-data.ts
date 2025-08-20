// Mock data for demo mode when real services aren't available
export interface MockQuestion {
  id: string;
  question_text: string;
  answer_text: string;
  source_url: string;
  is_public: boolean;
  status: 'answered' | 'pending' | 'researching';
  created_at: string;
  updated_at: string;
  relevance_score?: number;
}

export const mockQuestions: MockQuestion[] = [
  {
    id: '1',
    question_text: 'Can I live in an RV on my own property in Lexington?',
    answer_text: 'You can temporarily park and live in an RV on private property if it is not used as a permanent residence, but zoning laws prohibit long-term habitation.',
    source_url: 'https://lexingtonky.gov/planning',
    is_public: true,
    status: 'answered',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    question_text: 'Is it legal to have chickens in a residential backyard in Louisville?',
    answer_text: 'Yes, but you must limit flock size and maintain a clean enclosure. Roosters may be prohibited in some zones.',
    source_url: 'https://louisvilleky.gov/animalservices',
    is_public: true,
    status: 'answered',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    question_text: 'Can I collect rainwater in Kentucky?',
    answer_text: 'Yes. Kentucky does not restrict rainwater collection for personal use.',
    source_url: 'https://ky.gov/environment',
    is_public: true,
    status: 'answered',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    question_text: 'Do I need a permit to build a fence in Lexington?',
    answer_text: 'Fences over 6 feet require a building permit and must meet setback requirements.',
    source_url: 'https://lexingtonky.gov/buildingpermits',
    is_public: true,
    status: 'answered',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    question_text: 'Are pocket knives legal to carry in Kentucky?',
    answer_text: 'Yes, there are no length restrictions, but they cannot be carried in schools or government buildings.',
    source_url: 'https://kentuckystatepolice.org/laws',
    is_public: true,
    status: 'answered',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    question_text: 'Can I run a business out of my home in Kentucky?',
    answer_text: 'Home businesses are allowed if they do not create traffic, noise, or signage. Check local zoning ordinances for specific limits.',
    source_url: 'https://lexingtonky.gov/zoning',
    is_public: true,
    status: 'answered',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    question_text: 'Is it legal to sleep in your car overnight in Kentucky?',
    answer_text: 'Generally yes, but some cities have ordinances against sleeping in vehicles on public streets.',
    source_url: 'https://kentucky.gov',
    is_public: true,
    status: 'answered',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    question_text: 'Are fireworks legal in Kentucky?',
    answer_text: 'Consumer fireworks are legal but restricted in certain cities. Always verify local ordinances.',
    source_url: 'https://kyfiremarshal.ky.gov',
    is_public: true,
    status: 'answered',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '9',
    question_text: 'Can I keep bees in urban areas of Kentucky?',
    answer_text: 'Beekeeping is allowed, but hives must be placed a certain distance from property lines and streets.',
    source_url: 'https://kyagr.com/statevet/bee',
    is_public: true,
    status: 'answered',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10',
    question_text: 'Do I need a fishing license to fish on my own land in Kentucky?',
    answer_text: 'No license is required if fishing on private land that you own, with no access to public waterways.',
    source_url: 'https://fw.ky.gov',
    is_public: true,
    status: 'answered',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '11',
    question_text: 'Can I legally own a pet monkey in New York City?',
    answer_text: 'No, it is illegal to own a monkey as a pet in New York City. According to NYC Health Code Article 161.01, it is prohibited to possess, sell, or import non-human primates within the five boroughs. This includes all species of monkeys, apes, and lemurs. Violations can result in fines and the animal being confiscated.',
    source_url: 'https://www1.nyc.gov/site/doh/about/press/pr2021/health-department-issues-reminder-about-illegal-pets.page',
    is_public: true,
    status: 'answered',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '12',
    question_text: 'Is it illegal to carry an ice cream cone in your back pocket in Alabama?',
    answer_text: 'This is actually a myth! While there are various claims about this law online, there is no evidence of any Alabama state law or municipal ordinance that specifically prohibits carrying ice cream cones in back pockets. This appears to be an urban legend that has persisted on the internet.',
    source_url: 'https://www.alabama.gov/portal/secondary.jsp?page=Laws',
    is_public: true,
    status: 'answered',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Mock search function for demo mode
export function mockSearch(query: string): MockQuestion[] {
  const queryLower = query.toLowerCase();
  const searchWords = queryLower.split(/\s+/).filter(word => word.length > 2);
  
  return mockQuestions
    .filter(question => {
      const questionText = question.question_text.toLowerCase();
      const answerText = question.answer_text.toLowerCase();
      
      // Check if any search word appears in question or answer
      return searchWords.some(word => 
        questionText.includes(word) || answerText.includes(word)
      ) || questionText.includes(queryLower) || answerText.includes(queryLower);
    })
    .map(question => ({
      ...question,
      relevance_score: calculateRelevance(query, question.question_text, question.answer_text)
    }))
    .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
}

function calculateRelevance(query: string, questionText: string, answerText: string): number {
  const queryLower = query.toLowerCase();
  const questionLower = questionText.toLowerCase();
  const answerLower = answerText.toLowerCase();

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

// Mock bad decision responses for demo mode
export function mockBadDecisionAnalysis(decision: string): { risk_score: number; message: string } {
  const decisionLower = decision.toLowerCase();
  
  // Analyze decision for common risky keywords
  let baseScore = 40; // Start with medium risk
  
  // Financial risk indicators
  if (decisionLower.includes('quit') || decisionLower.includes('invest') || decisionLower.includes('money') || decisionLower.includes('savings')) {
    baseScore += 20;
  }
  
  // Legal risk indicators
  if (decisionLower.includes('illegal') || decisionLower.includes('law') || decisionLower.includes('police')) {
    baseScore += 25;
  }
  
  // Social risk indicators
  if (decisionLower.includes('tattoo') || decisionLower.includes('ex') || decisionLower.includes('drunk') || decisionLower.includes('naked')) {
    baseScore += 15;
  }
  
  // Practical risk indicators
  if (decisionLower.includes('tiktok') || decisionLower.includes('youtube') || decisionLower.includes('streamer') || decisionLower.includes('influencer')) {
    baseScore += 30;
  }
  
  // Cap the score
  const risk_score = Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 20) - 10));
  
  // Generate appropriate message based on score
  let message: string;
  
  if (risk_score <= 30) {
    const lowRiskMessages = [
      "Actually, this might not end in disaster. Shocking, I know.",
      "Your risk assessment skills are surprisingly intact. Proceed with caution.",
      "This falls into the 'probably won't ruin your life' category. Rare!",
    ];
    message = lowRiskMessages[Math.floor(Math.random() * lowRiskMessages.length)];
  } else if (risk_score <= 60) {
    const medRiskMessages = [
      "Red flags are waving, but they're only medium-sized red flags.",
      "Your future self is giving you a concerned look right now.",
      "This has 'seemed like a good idea at the time' written all over it.",
    ];
    message = medRiskMessages[Math.floor(Math.random() * medRiskMessages.length)];
  } else {
    const highRiskMessages = [
      "Darwin Award committee is taking notes. Please reconsider immediately.",
      "This is how people end up on reality TV shows about bad decisions.",
      "Even your bad luck would be embarrassed by this plan.",
      "Your guardian angel just called in sick. That should tell you something.",
    ];
    message = highRiskMessages[Math.floor(Math.random() * highRiskMessages.length)];
  }
  
  return { risk_score, message };
}

// Check if we're in demo mode (when services aren't configured)
export function isDemoMode(): boolean {
  const hasValidOpenAI = process.env.OPENAI_API_KEY && 
    process.env.OPENAI_API_KEY !== 'sk-placeholder_openai_api_key' &&
    !process.env.OPENAI_API_KEY.includes('placeholder');
    
  const hasValidSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
    
  return !hasValidOpenAI || !hasValidSupabase;
}