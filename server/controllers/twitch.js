'use strict'

// Twitch Clip Dashboard
// twitch module
// twitch api call handler

// dependencies
var request         = require('request-promise'),
    fs              = require('fs');

// constants
const TWITCH_CLIENT_ID = '3uwsh7juq64q095l48dgxgx88qhwse';
const TWITCH_SECRET = fs.readFileSync('credentials/ttv_secret','utf8');
const CALLBACK_URL = 'http://localhost:8080/auth/twitch/callback';

class Twitch {
  constructor() {
    this.ttv_oauth = {
      authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
      tokenURL: 'https://id.twitch.tv/oauth2/token',
      clientID: TWITCH_CLIENT_ID,
      clientSecret: TWITCH_SECRET,
      callbackURL: CALLBACK_URL,
      state: true
    }
  }

  async getTwitchUser(accessToken) {
    var options = {
      url: 'https://api.twitch.tv/helix/users',
      method: 'GET',
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Authorization': 'Bearer ' + accessToken
      }
    };

    var response = JSON.parse(await request(options));
    return response.data[0];
  }

  async getFollowedChannels(user_id) {
    var options = {
      url: 'https://api.twitch.tv/helix/users/follows',
      method: 'GET',
      headers: {
        'Client-ID': TWITCH_CLIENT_ID
      },
      qs: {
        'from_id': user_id,
        'first': 3
      }
    };

    var response = JSON.parse(await request(options));
    return response.data;
  }

  async getChannelClips(channel_id) {
    var options = {
      url: 'https://api.twitch.tv/helix/clips',
      method: 'GET',
      headers: {
        'Client-ID': TWITCH_CLIENT_ID
      },
      qs: {
        'broadcaster_id': channel_id,
        'first': 3
      }
    };

    var response = JSON.parse(await request(options));
    return response.data;
  }
}

exports.Twitch = new Twitch();