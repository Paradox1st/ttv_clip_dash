'use strict'

// Twitch Clip Dashboard
// main module
// routes to different modules

// dependencies
var express     = require('express'),
    session     = require('express-session'),
    bodyparser  = require('body-parser'),
    fs          = require('fs'),
    db          = require('./server/controllers/database').Database,
    passport    = require('./server/controllers/passport').passport,
    render      = require('./server/controllers/render').Render;

// define constants
const SESSION_SECRET = fs.readFileSync('credentials/session_secret', 'utf8');

// Initialize Express and middlewares
var app = express();
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(express.static('server/templates'));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyparser.urlencoded({extended:false}));   // body-parser stuff
app.use(bodyparser.json());   // body-parser stuff

// Set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', passport.authenticate('twitch'));

// Set route for OAuth redirect
app.get('/auth/twitch/callback', passport.authenticate('twitch', { successRedirect: '/', failureRedirect: '/' }));

// If user has an authenticated session, display it, otherwise display link to authenticate
app.get('/', function (req, res) {
    if (req.session && req.session.passport && req.user) {
        res.redirect('/dashboard');
    } else {
        res.send(render.landing());
    }
});

app.get('/dashboard', async function (req, res) {
    if (req.session && req.session.passport && req.user) {
        var html = await render.dashboard(req.user);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

app.get('/manage', async function (req, res) {
    if (req.session && req.session.passport && req.user) {
        var html = await render.manage(req.user);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

app.post('/addClip', async function (req, res){
    var result = await db.addClip(
        req.user.id,
        req.body.clip_id,
        req.body.title);
    res.send(result);
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Port listener
app.listen(8080, function () {
    console.log('Twitch Clip Dashboard started on port 8080.');
});