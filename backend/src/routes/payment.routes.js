const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
// Stripe payment intent
router.post('/intent', protect, async (req, res) => {
  try {
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const intent = await stripe.paymentIntents.create({ amount: req.body.amount * 100, currency: 'aed' });
    res.status(200).json({ success: true, clientSecret: 'stripe_client_secret_placeholder' });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  res.status(200).json({ received: true });
});
module.exports = router;
