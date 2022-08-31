const GoogleStrategy = require('passport-google-oauth20').Strategy,
    mongoose = require('mongoose'),
    User = require('../models/User');


module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: '147269736966-b9v8mtekthp5411bdvh9p30adlu2kap0.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
          email: profile.emails[0].value
        }

        try {
          let user = await User.findOne({ googleId: profile.id })

          if (user) {
            done(null, user);
          } else {
            user = await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  )


  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });
}
