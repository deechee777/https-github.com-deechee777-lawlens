import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Stripe client will be dynamically imported when needed
let Stripe: any = null;
let stripe: any = null;

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe client if not already done
    if (!stripe) {
      if (!Stripe) {
        Stripe = (await import('stripe')).default;
      }
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2024-11-20.acacia',
      });
    }

    const { email, question } = await request.json();

    if (!email || !question) {
      return NextResponse.json(
        { error: 'Email and question are required' },
        { status: 400 }
      );
    }

    // Create the question in the database first
    const { data: questionData, error: questionError } = await supabaseAdmin
      .from('questions')
      .insert({
        question_text: question,
        status: 'pending',
        is_public: false // Will be made public once answered
      })
      .select()
      .single();

    if (questionError) {
      console.error('Error creating question:', questionError);
      return NextResponse.json(
        { error: 'Failed to create question' },
        { status: 500 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Legal Question Research',
              description: `Research and answer for: "${question.substring(0, 100)}..."`,
            },
            unit_amount: 100, // $1.00 in cents
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        question_id: questionData.id,
        user_email: email,
        question_text: question,
      },
      success_url: `${request.nextUrl.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/search?q=${encodeURIComponent(question)}`,
    });

    // Store payment record
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_email: email,
        question_id: questionData.id,
        amount_cents: 500,
        payment_type: 'one_time',
        stripe_payment_id: session.id
      });

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      // Continue anyway - we can reconcile this via webhook
    }

    return NextResponse.json({
      checkout_url: session.url,
      question_id: questionData.id
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}