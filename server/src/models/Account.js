const mongoose = require('mongoose');
const { Schema } = mongoose;

const accountSchema = new Schema({
  oauthId: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: String,
  givenName: String,
  familyName: String,
  avatarUrl: String,
  contactEmail: String,
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
