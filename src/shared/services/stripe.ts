import { loadStripe, Stripe } from '@stripe/stripe-js';

// Replace with your Stripe publishable key
const stripePromise: Promise<Stripe | null> = loadStripe('pk_test_51QRamoK2tw1lar2SFnlUBO10gFn4ShXqCtBDET5JtTxzwe3XKQg9sKbVgeX6w6WpKUuvlrTV0I1CgaaWDMfQVQvL00ofiORstJ');

export default stripePromise;
