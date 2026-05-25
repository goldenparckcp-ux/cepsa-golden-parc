import Stripe from 'stripe';
// @ts-expect-error - no types available
import paypal from '@paypal/checkout-server-sdk';
import dayjs from 'dayjs';
import { supabase } from './supabase';

// Initialize SDKs (Credentials should be in .env.local)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
});

// PayPal Config
const PayPalEnvironment = new paypal.core.SandboxEnvironment(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || 'dummy',
    process.env.PAYPAL_CLIENT_SECRET || 'dummy'
);
const paypalClient = new paypal.core.PayPalHttpClient(PayPalEnvironment);

/**
 * Logic to calculate the Arboun (Deposit)
 */
export const calculateArboun = (totalPrice: number, serviceType: string) => {
    // 20% Deposit, but never less than 20 MAD
    const dynamicDeposit = totalPrice * 0.20;
    const fixedFee = 20; // MAD

    // Choose policy based on service
    if (serviceType === 'lavage') return Math.max(fixedFee, dynamicDeposit);
    if (serviceType === 'hotel') return dynamicDeposit; // Usually higher for hotels
    return fixedFee;
};

/**
 * Check if the current time is within the 45-minute non-refundable window
 */
export const checkCancellationWindow = (scheduledAt: string) => {
    const now = dayjs();
    const serviceTime = dayjs(scheduledAt);
    const diffMinutes = serviceTime.diff(now, 'minute');

    return {
        isRefundable: diffMinutes > 45,
        remainingMinutes: diffMinutes,
    };
};

/**
 * Create a Stripe Payment Intent for the Deposit
 */
export const createStripeDeposit = async (bookingId: string, amount: number, customerEmail?: string) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses cents (100 = 1.00 MAD)
        currency: 'mad',
        metadata: { bookingId, type: 'arboun' },
        receipt_email: customerEmail,
    });
    return paymentIntent;
};

/**
 * Create a PayPal Order for the Deposit
 */
export const createPayPalOrder = async (bookingId: string, amount: number) => {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'MAD',
                value: amount.toFixed(2)
            },
            custom_id: bookingId
        }]
    });

    const order = await paypalClient.execute(request);
    return order.result;
};

/**
 * Standard Refund/Wallet Credit Logic
 */
export const processSmartRefund = async (userId: string, bookingId: string, depositAmount: number) => {
    const CANCELLATION_FEE = 10; // MAD
    const refundToWallet = Math.max(0, depositAmount - CANCELLATION_FEE);

    // 1. Credit User Wallet
    const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single();
    const newBalance = (profile?.wallet_balance || 0) + refundToWallet;

    await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId);

    // 2. Log Transaction
    await supabase.from('wallet_transactions').insert({
        user_id: userId,
        amount: refundToWallet,
        type: 'refund',
        description: `Annulation Booking #${bookingId.slice(0, 5)} - Credit Wallet`,
        status: 'completed'
    });

    return refundToWallet;
};
