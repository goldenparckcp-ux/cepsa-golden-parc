// @ts-expect-error - no types available
import paypal from '@paypal/checkout-server-sdk';
import dayjs from 'dayjs';
import { supabase } from './supabase';

// PayPal Config
const PayPalEnvironment = new paypal.core.SandboxEnvironment(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || 'dummy',
    process.env.PAYPAL_CLIENT_SECRET || 'dummy'
);
const paypalClient = new paypal.core.PayPalHttpClient(PayPalEnvironment);

/**
 * Logic to calculate the Arboun (Deposit)
 */
export const calculateArboun = (totalPrice: number, _serviceType?: string) => {
    // 30% Deposit, but never less than 20 MAD (unless total price is less than 20)
    const calculatedDeposit = totalPrice * 0.30;
    const minDeposit = calculatedDeposit < 20 ? 20 : calculatedDeposit;
    return Math.min(totalPrice, minDeposit);
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
 * Create a PayPal Order for the Deposit
 */
export const createPayPalOrder = async (bookingId: string, amount: number) => {
    // 10 MAD = $1 USD for simulation purposes
    const usdAmount = amount / 10;
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: usdAmount.toFixed(2)
            },
            custom_id: bookingId
        }]
    });

    const order = await paypalClient.execute(request);
    return order.result;
};
