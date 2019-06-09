'use strict'

// Twitch Clips Dashboard
// main module
// routes to different modules

// dependencies
var express         = require('express'),
    session         = require('express-session'),
    fs              = require('fs'),
    handlebars      = require('handlebars'),
    path            = require('path'),
    twitch          = require('./server/controllers/twitch').Twitch,
    db              = require('./server/controllers/database').Database,
    passport        = require('./server/controllers/passport').passport;

// define constants
const SESSION_SECRET   = fs.readFileSync('credentials/session_secret','utf8');

// Initialize Express and middlewares
var app = express();
app.use(session({secret: SESSION_SECRET, resave: false, saveUninitialized: false}));
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

// Set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user_read' }));

// Set route for OAuth redirect
app.get('/auth/twitch/callback', passport.authenticate('twitch', { successRedirect: '/', failureRedirect: '/' }));

// If user has an authenticated session, display it, otherwise display link to authenticate
app.get('/', function (req, res) {
  if(req.session && req.session.passport && req.user) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname + '/server/templates/landing.html'));
  }
});

app.get('/dashboard', async function(req, res){
  if(req.session && req.session.passport && req.user){
    // find template file
    var template_file = fs.readFileSync(
    path.join(__dirname + '/server/templates/dashboard.html'),'utf8');
    // compile template file and send to user
    var template = handlebars.compile(template_file);

    var channels = await twitch.getFollowedChannels(req.user.id);
    var clips = [];

    for(var i=0;i<channels.length;i++){
      var channel_clips = await twitch.getChannelClips(channels[i].to_id);
      clips.push(channel_clips);
    }
    
    res.send(template({user:req.user, clips:clips}));
  }else{
    res.redirect('/');
  }
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Port listener
app.listen(8080, function () {
  console.log('Twitch Clip Dashboard started on port 8080.')
});