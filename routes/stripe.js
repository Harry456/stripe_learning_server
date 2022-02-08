const express = require('express');
const stripeRoutes = express.Router();

const stripe = require('../handlers/stripe');

// Customer Routes
stripeRoutes.post('/create-customer', stripe.createCustomer);
stripeRoutes.get('/get-customer/:userId', stripe.updateCustomer);
stripeRoutes.patch('/update-customer/:userId', stripe.updateCustomer);

// Setup intent
stripeRoutes.get('/setup-intent/:userId', stripe.createSetupIntent);

// PaymentMethod
// Attach paymentmethod.
stripeRoutes.get('/attach-paymentMethod/:userId', stripe.attachPaymentMethod);

// Subscription.
stripeRoutes.post('/createSubscription/:userId', stripe.createSubscription);
module.exports = stripeRoutes;

// Webhook
stripeRoutes.get('/stripe-webhooks', stripe.webhooks);
