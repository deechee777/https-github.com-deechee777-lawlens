import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface BadDecisionResult {
  riskScore: number;
  explanation: string;
}

export async function analyzeBadDecision(decisionText: string): Promise<BadDecisionResult> {
  try {
    /* 
    You are a Bad Decision Risk Analyzer. The user will describe a plan, and you will output:
    1) a single numerical risk score from 0 to 100
    2) a short humorous explanation of why it's risky or not
    3) never return text without a number, and never give a range

    Rules for scoring:
    - Consider financial risk, legal risk, social fallout, and practicality equally
    - Rate each on a scale of 0 to 10, then sum, multiply by 2.5 to get a 0-100 score
    - Low score (0-30): it's probably fine
    - Medium score (31-70): some red flags
    - High score (71-100): terrible idea

    Output format (JSON only):
    {
      "risk_score": [number],
      "message": "[short funny summary under 280 chars]"
    }
    */
    const prompt = `You are a Bad Decision Risk Analyzer. The user will describe a plan, and you will output:
1) a single numerical risk score from 0 to 100
2) a short humorous explanation of why it's risky or not
3) never return text without a number, and never give a range

Rules for scoring:
- Consider financial risk, legal risk, social fallout, and practicality equally
- Rate each on a scale of 0 to 10, then sum, multiply by 2.5 to get a 0-100 score
- Low score (0-30): it's probably fine
- Medium score (31-70): some red flags
- High score (71-100): terrible idea

Decision to analyze: "${decisionText}"

Output format (JSON only):
{
  "risk_score": [number],
  "message": "[short funny summary under 280 chars]"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const result = JSON.parse(content);
    
    // Validate the response structure
    if (typeof result.risk_score !== 'number' || typeof result.message !== 'string') {
      throw new Error('Invalid response structure from OpenAI');
    }

    // Ensure risk score is within bounds
    const riskScore = Math.max(0, Math.min(100, Math.round(result.risk_score)));

    return {
      riskScore,
      explanation: result.message,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback response if OpenAI fails
    const fallbackScore = Math.floor(Math.random() * 101);
    const fallbackExplanations = [
      "Our AI is having a bad decision moment of its own and can't analyze yours right now. But statistically speaking, most decisions people ask about aren't great. Consider getting a second opinion from someone who loves you enough to be honest.",
      "The AI is temporarily unavailable, much like your common sense when you thought this was a good idea. Take this as a sign from the universe to maybe reconsider your life choices.",
      "Our decision-analyzing AI is currently making its own questionable choices and is unavailable. In the meantime, ask yourself: would your grandmother approve? If not, that's probably your answer."
    ];
    
    return {
      riskScore: fallbackScore,
      explanation: fallbackExplanations[Math.floor(Math.random() * fallbackExplanations.length)],
    };
  }
}