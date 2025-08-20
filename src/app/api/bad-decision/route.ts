import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import OpenAI from 'openai';
import { isDemoMode, mockBadDecisionAnalysis } from '@/lib/demo-data';

function generateShareSlug(): string {
  // Generate a random slug for sharing (8 characters)
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Initialize OpenAI client only when needed
let client: OpenAI | null = null;

function getClientInfo(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return { ip, userAgent };
}

export async function POST(request: NextRequest) {
  try {
    const { decisionText } = await request.json();

    if (!decisionText || typeof decisionText !== 'string' || decisionText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Decision text must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Limit decision text length to prevent abuse
    if (decisionText.length > 500) {
      return NextResponse.json(
        { error: 'Decision text must be less than 500 characters' },
        { status: 400 }
      );
    }

    let riskScore: number;
    let explanation: string;

    // Check if we're in demo mode
    if (isDemoMode()) {
      console.log('Running Bad Decision Calculator in demo mode');
      const mockResult = mockBadDecisionAnalysis(decisionText.trim());
      riskScore = mockResult.risk_score;
      explanation = mockResult.message;
    } else {
      // Initialize OpenAI client if not already done
      if (!client) {
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      }
      
      // Real OpenAI API call
      const prompt = `
  Rate the following decision on financial, legal, social, and practical risk (0-10 each).
  Sum them, multiply by 2.5 to get a 0-100 risk_score.
  Then write a short funny message under 280 chars.

  Decision: "${decisionText.trim()}"

  Output strictly in JSON like this:
  {"risk_score": 75, "message": "This is a bad idea. Hide your wallet and your dignity."}
  `;

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      });

      const raw = completion.choices[0]?.message?.content?.trim();
      if (!raw) {
        throw new Error('No response from OpenAI');
      }

      const aiResult = JSON.parse(raw);
      
      // Validate response structure
      if (typeof aiResult.risk_score !== 'number' || typeof aiResult.message !== 'string') {
        throw new Error('Invalid response structure from OpenAI');
      }

      riskScore = Math.max(0, Math.min(100, Math.round(aiResult.risk_score)));
      explanation = aiResult.message;
    }

    // Handle database storage (skip in demo mode)
    if (isDemoMode()) {
      // In demo mode, don't try to store in database
      return NextResponse.json({
        riskScore,
        explanation,
        shareSlug: null, // No sharing in demo mode
        id: null,
        demo: true
      });
    }

    // Generate unique share slug for real database
    let shareSlug = generateShareSlug();
    let attempts = 0;
    
    // Ensure slug is unique (try up to 5 times)
    while (attempts < 5) {
      const { data: existing } = await supabaseAdmin
        .from('bad_decisions')
        .select('id')
        .eq('share_slug', shareSlug)
        .single();
      
      if (!existing) break;
      
      shareSlug = generateShareSlug();
      attempts++;
    }

    // Get client info for analytics (no personal data)
    const { ip, userAgent } = getClientInfo(request);

    // Store in database
    const { data: badDecision, error } = await supabaseAdmin
      .from('bad_decisions')
      .insert({
        decision_text: decisionText.trim(),
        risk_score: riskScore,
        ai_explanation: explanation,
        share_slug: shareSlug,
        ip_address: ip,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      // Still return the analysis even if we can't store it
      return NextResponse.json({
        riskScore,
        explanation,
        shareSlug: null, // No sharing if we can't store it
        id: null,
      });
    }

    return NextResponse.json({
      riskScore,
      explanation,
      shareSlug,
      id: badDecision.id,
    });

  } catch (error) {
    console.error('Bad decision API error:', error);
    
    // Fallback to demo mode analysis if real API fails
    const mockResult = mockBadDecisionAnalysis(decisionText.trim());
    
    return NextResponse.json({
      riskScore: mockResult.risk_score,
      explanation: mockResult.message,
      shareSlug: null, // No sharing in fallback mode
      id: null,
      demo: true,
      fallback: true
    });
  }
}

// GET route for retrieving shared results
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shareSlug = searchParams.get('share');

  if (!shareSlug) {
    return NextResponse.json(
      { error: 'Share slug is required' },
      { status: 400 }
    );
  }

  try {
    const { data: badDecision, error } = await supabaseAdmin
      .from('bad_decisions')
      .select('decision_text, risk_score, ai_explanation, created_at')
      .eq('share_slug', shareSlug)
      .single();

    if (error || !badDecision) {
      return NextResponse.json(
        { error: 'Shared result not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      decisionText: badDecision.decision_text,
      riskScore: badDecision.risk_score,
      explanation: badDecision.ai_explanation,
      createdAt: badDecision.created_at,
    });

  } catch (error) {
    console.error('Error retrieving shared result:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve result' },
      { status: 500 }
    );
  }
}