import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendQuestionAnsweredEmail } from '@/lib/email';
import { requireAdminAuth, AdminAuth } from '@/lib/auth';

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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabaseAdmin
      .from('questions')
      .select(`
        *,
        payments (
          user_email,
          stripe_payment_id,
          amount_cents,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: questions, error } = await query;

    if (error) {
      console.error('Error fetching questions:', error);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }

    return NextResponse.json({ questions });

  } catch (error) {
    console.error('Admin questions GET error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    verifyAdminAccess(request);

    const { question_text, answer_text, source_url, is_public = true } = await request.json();

    if (!question_text) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    const { data: question, error } = await supabaseAdmin
      .from('questions')
      .insert({
        question_text,
        answer_text,
        source_url,
        is_public,
        status: answer_text ? 'answered' : 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
    }

    return NextResponse.json({ question });

  } catch (error) {
    console.error('Admin questions POST error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    verifyAdminAccess(request);

    const { id, question_text, answer_text, source_url, is_public, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    // Get the question with payment info to send email if being marked as answered
    const { data: currentQuestion, error: fetchError } = await supabaseAdmin
      .from('questions')
      .select(`
        *,
        payments (user_email, stripe_payment_id)
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (question_text !== undefined) updateData.question_text = question_text;
    if (answer_text !== undefined) updateData.answer_text = answer_text;
    if (source_url !== undefined) updateData.source_url = source_url;
    if (is_public !== undefined) updateData.is_public = is_public;
    if (status !== undefined) updateData.status = status;

    // If marking as answered and we have an answer, update status
    if (answer_text && status !== 'answered') {
      updateData.status = 'answered';
    }

    const { data: question, error } = await supabaseAdmin
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating question:', error);
      return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
    }

    // If question was just marked as answered and has a payment, send email
    if (answer_text && currentQuestion.status !== 'answered' && currentQuestion.payments?.length > 0) {
      try {
        const payment = currentQuestion.payments[0];
        await sendQuestionAnsweredEmail(
          payment.user_email,
          question.question_text,
          answer_text,
          source_url
        );
        console.log(`Email sent to ${payment.user_email} for answered question ${id}`);
      } catch (emailError) {
        console.error('Failed to send answer email:', emailError);
        // Don't fail the whole request if email fails
      }
    }

    return NextResponse.json({ question });

  } catch (error) {
    console.error('Admin questions PUT error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    verifyAdminAccess(request);

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin questions DELETE error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}