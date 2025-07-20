const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const Account = require('../models/Account');
require('dotenv').config();

passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const newAccount = {
          oauthId: profile.id,
          fullName: profile.displayName,
          givenName: profile.name.givenName,
          familyName: profile.name.familyName,
          avatarUrl: profile.photos[0].value,
          contactEmail: profile.emails[0].value,
        };
  
        try {
          let account = await Account.findOne({ oauthId: profile.id });
  
          if (account) {
            // Account exists, update profile
            account = await Account.findOneAndUpdate({ oauthId: profile.id }, newAccount, { new: true });
            done(null, account);
          } else {
            // Create new account
            account = await new Account(newAccount).save();
            done(null, account);
          }
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );
  
  passport.serializeUser((account, done) => {
    done(null, account.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const account = await Account.findById(id);
      done(null, account);
    } catch (err) {
      done(err, null);
    }
  });
  
  module.exports = passport;