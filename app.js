const express = require('express');
const cors = require('cors');
const stripeRoutes = require('./routes/stripe');
const app = express();

app.use(cors());

app.use(express.json({ limit: '10kb' }));

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Routes
app.use('/api/v1', stripeRoutes);

app.use('/', (req, res) => {
  res.status(200).json({
    status: 'Success',
    message: 'Welcome To Stripe API',
  });
});

app.all('*', (req, res, next) => {
  next(`Can't find ${req.originalUrl} on this server`, 404);
});

// Global Error Middleware
//app.use(globalErrorHandlerMiddleware);

module.exports = app;
