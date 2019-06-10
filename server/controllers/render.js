'use strict'

// Twitch Clip Dashboard
// Template render module
// handlebars function handling

var handlebars = require('handlebars'),
    layouts = require('handlebars-layouts'),
    fs = require('fs'),
    path = require('path'),
    db = require('./database').Database,
    twitch = require('./twitch').Twitch;

// Register helpers
handlebars.registerHelper(layouts(handlebars));

// Register partials
handlebars.registerPartial('base', fs.readFileSync(
    path.join(__dirname, '..', 'templates', 'base.hbs'),
    'utf8'
));
handlebars.registerPartial('clip', fs.readFileSync(
    path.join(__dirname, '..', 'templates', 'partials', '_clips.hbs'),
    'utf8'
));

class Render {
    constructor() { }

    landing() {
        var template_text = fs.readFileSync(
            path.join(__dirname, '..', 'templates', 'landing.hbs'),
            'utf8');
        var template = handlebars.compile(template_text);
        return template({
            title: 'Index'
        });
    }

    async dashboard(user) {
        // find template file
        var template_file = fs.readFileSync(
            path.join(__dirname, '..', 'templates', 'dashboard.hbs'),
            'utf8'
        );
        // compile template file and send to user
        var template = handlebars.compile(template_file);

        var channels = await twitch.getFollowedChannels(user.id);
        var followed_clips = [];

        for (var i = 0; i < channels.length; i++) {
            var channel_clips = await twitch.getChannelClips(channels[i].id);
            followed_clips.push(channel_clips);
        }

        var user_clips = await db.getUserClips(user.id, 3);

        return template({
            title: 'Twitch Clip Dashboard',
            user: user,
            followed_clips: followed_clips,
            user_clips: user_clips
        });
    }

    async manage(user) {
        // find template file
        var template_file = fs.readFileSync(
            path.join(__dirname, '..', 'templates', 'manage.hbs'),
            'utf8'
        );
        // compile template file and send to user
        var template = handlebars.compile(template_file);

        var my_clips = await db.getUserClips(user.id, 10);

        return template({
            title: 'Manage Clips',
            user: user,
            user_clips: my_clips
        });
    }
}

exports.Render = new Render();