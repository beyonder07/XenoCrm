const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const config = require('./index');
const User = require('../models/user.model');
const logger = require('../utils/logger');

// Cookie extractor function for JWT
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  return token;
};

// Configure passport strategies
module.exports = (passport) => {
  // JWT Strategy for API authentication
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          ExtractJwt.fromAuthHeaderAsBearerToken(),
          cookieExtractor,
        ]),
        secretOrKey: config.jwt.secret,
      },
      async (jwtPayload, done) => {
        try {
          // Find the user based on the JWT payload
          const user = await User.findById(jwtPayload.id);
          
          if (!user) {
            return done(null, false);
          }
          
          // Check if token issued before password change
          if (jwtPayload.iat < parseInt(user.passwordChangedAt / 1000, 10)) {
            return done(null, false);
          }
          
          return done(null, user);
        } catch (error) {
          logger.error('Error authenticating user:', error);
          return done(error, false);
        }
      }
    )
  );

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists in database
          let user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            // User exists, update their Google profile info
            user.googleId = profile.id;
            user.name = user.name || profile.displayName;
            user.avatar = user.avatar || profile.photos[0].value;
            await user.save();
            return done(null, user);
          }
          
          // User doesn't exist, create a new one
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0].value,
            isActive: true,
            role: 'user',
          });
          
          return done(null, user);
        } catch (error) {
          logger.error('Error during Google authentication:', error);
          return done(error, false);
        }
      }
    )
  );
};