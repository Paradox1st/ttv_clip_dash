'use strict'

// Twitch Clip Dashboard
// passport module config
// modify passport to fit program

// dependencies
var passport        = require('passport'),
    OAuth2Strategy  = require('passport-oauth').OAuth2Strategy,
    twitch          = require('./twitch').Twitch,
    db              = require('./database').Database;


// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = async function (accessToken, done) {
  var user = await twitch.getTwitchUser(accessToken);
  done(null, user);
}

passport.serializeUser(function (user, done) {
  console.log('serializing user: ' + user.username);
  done(null, user.id);
});

passport.deserializeUser(async function (user_id, done) {
  console.log('deserializing user with id: ' + user_id);
  var user = await db.getUser(user_id);
  done(null, user);
});

passport.use('twitch', new OAuth2Strategy(twitch.ttv_oauth,
  async function (accessToken, refreshToken, profile, done) {
    var user = await db.getUser(profile.id);
    if (user == 0) {
      console.log('creating user...');
      user = await db.addUser(profile.id,
        profile.login,
        profile.display_name,
        profile.profile_image_url);
    } else {
      console.log('found user');
    }

    done(null, user);
  }
));

exports.passport = passport;