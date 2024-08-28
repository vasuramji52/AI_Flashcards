import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const formatAmountForStripe = (amount) => {
  return Math.round(amount * 100)
}

export async function POST(req) {
  let subscriptionType

  try {
    const body = await req.json()
    subscriptionType = body.subscriptionName
  } catch (error){
    return NextResponse.json({error: 'Invalid JSON input'}, {status: 400})
  }

  const priceDetails = subscriptionType === 'Basic' 
    ? {amount: formatAmountForStripe(5), name: 'Basic subscription'}
    : {amount: formatAmountForStripe(10), name: 'Pro subscription'}
    
  const params = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: priceDetails.name,
          },
          unit_amount: priceDetails.amount, // $10.00 in cents
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${req.headers.get('origin')}/result?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.get('origin')}/result?session_id={CHECKOUT_SESSION_ID}`,
  };
  const checkoutSession = await stripe.checkout.sessions.create(params);

  try {
    const checkoutSession = await stripe.checkout.sessions.create(params);
    return NextResponse.json(checkoutSession, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams
  const session_id = searchParams.get('session_id')

  try {
    if (!session_id) {
      throw new Error('Session ID is required')
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id)

    return NextResponse.json(checkoutSession)
  } catch (error) {
    console.error('Error retrieving checkout session:', error)
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }
} 