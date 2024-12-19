import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { updateUserPremiumStatus } from '../../firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  console.log('🎯 Webhook received');

  if (!signature) {
    console.error('❌ No stripe signature found');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('✅ Event received:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (!userId) {
        console.error('❌ No user ID in session metadata');
        return NextResponse.json({ error: 'No user ID' }, { status: 400 });
      }

      try {
        console.log('📝 Updating premium status for user:', userId);
        await updateUserPremiumStatus(userId, true);
        console.log('✅ Premium status updated successfully');
      } catch (error) {
        console.error('💥 Error updating premium status:', error);
        return NextResponse.json(
          { error: 'Failed to update premium status' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('💥 Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

