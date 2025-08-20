import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/auth';

function verifyAdminAccess(request: NextRequest) {
  const adminUser = requireAdminAuth(request);
  if (!adminUser) {
    throw new Error('Unauthorized: Invalid or expired session');
  }
  return adminUser;
}

export async function GET(request: NextRequest) {
  try {
    verifyAdminAccess(request);

    // Get total questions
    const { count: totalQuestions } = await supabaseAdmin
      .from('questions')
      .select('*', { count: 'exact', head: true });

    // Get answered questions
    const { count: answeredQuestions } = await supabaseAdmin
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'answered');

    // Get pending questions
    const { count: pendingQuestions } = await supabaseAdmin
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get total payments
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('amount_cents, payment_type, subscription_status');

    const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0;
    
    const activeSubscriptions = payments?.filter(p => 
      p.payment_type === 'subscription' && p.subscription_status === 'active'
    ).length || 0;

    const oneTimePayments = payments?.filter(p => p.payment_type === 'one_time').length || 0;

    // Get Bad Decision Calculator stats
    const { count: totalBadDecisions } = await supabaseAdmin
      .from('bad_decisions')
      .select('*', { count: 'exact', head: true });

    const { data: badDecisionsToday } = await supabaseAdmin
      .from('bad_decisions')
      .select('id')
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    const { data: avgRiskScore } = await supabaseAdmin
      .from('bad_decisions')
      .select('risk_score');

    const averageRisk = avgRiskScore?.length 
      ? Math.round(avgRiskScore.reduce((sum, item) => sum + item.risk_score, 0) / avgRiskScore.length)
      : 0;

    // Get recent activity
    const { data: recentQuestions } = await supabaseAdmin
      .from('questions')
      .select(`
        id,
        question_text,
        status,
        created_at,
        payments (user_email)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      stats: {
        totalQuestions: totalQuestions || 0,
        answeredQuestions: answeredQuestions || 0,
        pendingQuestions: pendingQuestions || 0,
        totalRevenue: totalRevenue / 100, // Convert cents to dollars
        activeSubscriptions,
        oneTimePayments,
        totalBadDecisions: totalBadDecisions || 0,
        badDecisionsToday: badDecisionsToday?.length || 0,
        averageRiskScore: averageRisk,
      },
      recentQuestions
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}