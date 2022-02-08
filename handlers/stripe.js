const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user');

console.log(process.env.STRIPE_SECRET_KEY, 'key check');

exports.createCustomer = async (req, res) => {
  try {
    // get user detail from body
    const { name, email } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ status: 'Failed', message: 'User Details required' });
    }

    // Stripe operation
    const customer = await stripe.customers.create({
      name: name,
      email: email,
      description: 'My Test Customer',
    });

    // Mongo db operation
    const user = await User.create({
      ...req.body,
      stripeCustomerId: customer.id,
    });

    return res.status(200).json({
      user,
      customer,
    });
  } catch (error) {
    console.log(error, 'error check');
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(req.body);
    //return res.send('success');

    if (!userId) {
      return res
        .status(400)
        .json({ status: 'Failed', message: 'UserId required' });
    }

    // Get User
    const user = await User.findById(userId);
    console.log(user);

    // Update stripe customer
    // const updatedCustomer = await stripe.customers.update(
    //   user.stripeCustomerId,
    //   {
    //     metadata: { order_id: '1234' },
    //   }
    // );
    const updatedCustomer = await stripe.customers.update(
      user.stripeCustomerId,
      req.body
    );
    return res.status(200).json(updatedCustomer);
  } catch (error) {
    console.log(error, 'error check');
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};
// Get Stripe Customer
exports.getCustomer = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ status: 'Failed', message: 'UserId required' });
    }

    // Get User
    const user = await User.findById(userId);
    console.log(user);

    // Update stripe customer
    const Customer = await stripe.customers.retrieve(user.stripeCustomerId);
    return res.status(200).json(Customer);
  } catch (error) {
    console.log(error, 'error check');
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.createSetupIntent = async (req, res) => {
  try {
    // Get User Data
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ status: 'Failed', message: 'UserId required' });
    }

    // Get User
    const user = await User.findById(userId);
    console.log(user);

    // Stripe operation
    const setupIntent = await stripe.setupIntents.create({
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
    });

    return res.status(200).json(setupIntent);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

exports.attachPaymentMethod = async (req, res) => {
  try {
    console.log(req.url);

    const { userId } = req.params;
    const { paymentMethod } = req.body;

    if (!userId || !paymentMethod) {
      return res.status(400).json({
        status: 'Failed',
        message: 'UserId and paymentMethod required',
      });
    }

    // Get User
    const user = await User.findById(userId);
    console.log(user);

    // Stripe operation
    const attachPaymentMethod = await stripe.paymentMethods.attach(
      paymentMethod,
      {
        customer: user.stripeCustomerId,
      }
    );
    console.log(attachPaymentMethod, 'attachPaymentMethod check');
    return res.status(200).json(attachPaymentMethod);
  } catch (error) {
    console.log(error);
  }
};

exports.createSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { priceId } = req.query;
    console.log(req.query);

    if (!userId || !priceId) {
      return res.status(400).json({
        status: 'Failed',
        message: 'UserId and PriceId required',
      });
    }
    const user = await User.findById(userId);
    let subscriptionPayload = {
      customer: user.stripeCustomerId,
      items: [{ price: priceId }],
    };

    if (req.query.paymentMethod) {
      subscriptionPayload['default_payment_method'] = req.query.paymentMethod;
    }

    console.log(subscriptionPayload);
    // return res.send('success');
    const subscription = await stripe.subscriptions.create(subscriptionPayload);

    console.log(subscription);
    return res.status(200).json(subscription);
  } catch (error) {
    console.log(error);
  }
};

// Webhook.
exports.webhooks = async (req, res) => {
  try {
    // 1. Stripe Webhook req comes in with a secret signature in headers
    const signature = req.headers['stripe-signature'];
    let event;
    event = stripe.webhooks.constructEvent(
      request.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    let customer;
    switch (event.type) {
      case 'customer.created':
        customer = event.data.object;
        console.log('*****customer created*****');
        console.log(customer, 'customer');
        console.log('*****customer created*****');
        // Then define and call a function to handle the event customer.created
        break;
      case 'customer.deleted':
        customer = event.data.object;
        console.log('*****customer deleted*****');
        console.log(customer, 'customer');
        console.log('*****customer deleted*****');
        // Then define and call a function to handle the event customer.deleted
        break;
      case 'customer.updated':
        customer = event.data.object;
        console.log('*****customer updated*****');
        console.log(customer, 'customer');
        console.log('*****customer updated*****');
        // Then define and call a function to handle the event customer.updated
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};
