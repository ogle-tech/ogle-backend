const mongoose = require('mongoose');

const newsletterSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

const NewsletterSubscription = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);

module.exports = NewsletterSubscription;
