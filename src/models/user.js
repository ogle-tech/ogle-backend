const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email address',
      ],
      unique: true,
      lowerCase: true,
    },
    password: { type: String },
    name: { type: String },
    gender: { type: String, enum: ['Male', 'Female'] },
    dateOfBirth: { type: String },
    address: { type: String },
    phoneNumber: { type: String },
    about: { type: String },
    role: { type: String, enum: ['agent', 'admin'] },
    verified: { type: Boolean, default: false },
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    wishlist: [
      {
        property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
        dateAdded: { type: Date, default: Date.now },
      },
    ],
    profilePictureUrl: { type: String },
    website: { type: String },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
