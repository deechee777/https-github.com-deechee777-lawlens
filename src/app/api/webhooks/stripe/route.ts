import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { question_id, user_email, question_text } = session.metadata!;

  // Update payment record
  await supabaseAdmin
    .from('payments')
    .update({
      stripe_payment_id: session.payment_intent as string,
      stripe_customer_id: session.customer as string,
    })
    .eq('stripe_payment_id', session.id);

  // Send notification email about new paid question
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: 'New Paid Question - LawLens',
      text: `
        A new question has been submitted and paid for:
        
        Question: ${question_text}
        Customer Email: ${user_email}
        Question ID: ${question_id}
        Payment ID: ${session.payment_intent}
        
        Please research and answer this question in the admin panel:
        ${process.env.NEXTAUTH_URL}/admin
      `,
    });
  } catch (emailError) {
    console.error('Failed to send notification email:', emailError);
  }
}

async function handleSubscriptionPayment(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  // Get customer details
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  
  if (!customer.email) return;

  // Update or create subscription payment record
  await supabaseAdmin
    .from('payments')
    .upsert({
      user_email: customer.email,
      stripe_customer_id: customerId,
      stripe_payment_id: invoice.id,
      amount_cents: invoice.amount_paid,
      payment_type: 'subscription',
      subscription_status: 'active',
    });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Get customer details
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  
  if (!customer.email) return;

  let status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  
  switch (subscription.status) {
    case 'active':
      status = 'active';
      break;
    case 'canceled':
      status = 'cancelled';
      break;
    case 'past_due':
      status = 'past_due';
      break;
    default:
      status = 'inactive';
  }

  // Update subscription status
  await supabaseAdmin
    .from('payments')
    .update({ subscription_status: status })
    .eq('stripe_customer_id', customerId)
    .eq('payment_type', 'subscription');
}