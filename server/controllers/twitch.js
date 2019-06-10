'use strict'

// Twitch Clip Dashboard
// twitch module
// twitch api call handler

// dependencies
var request = require('request-promise'),
    fs = require('fs');

// constants
const TWITCH_CLIENT_ID = '3uwsh7juq64q095l48dgxgx88qhwse';
const TWITCH_SECRET = fs.readFileSync('credentials/ttv_secret', 'utf8');
const CALLBACK_URL = 'http://localhost:8080/auth/twitch/callback';

function channel_compare(channel_a, channel_b) {
    return channel_b.view_count - channel_a.view_count;
}

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

    async getFollowedChannels(user_id, count=3) {
        let options_0 = {
            url: 'https://api.twitch.tv/helix/users/follows',
            method: 'GET',
            headers: {
                'Client-ID': TWITCH_CLIENT_ID
            },
            qs: {
                'from_id': user_id,
                'first': 100
            }
        };

        var response_0 = JSON.parse(await request(options_0));

        var channel_list = response_0.data.map(follow=>follow.to_id);

        let options_1 = {
            url: 'https://api.twitch.tv/helix/users',
            method: 'GET',
            headers: {
                'Client-ID': TWITCH_CLIENT_ID
            },
            qs: {
                'id': channel_list
            }
        }

        var response_1 = JSON.parse(await request(options_1));
        var channel_sort = response_1.data.sort( channel_compare );

        return channel_sort.slice(0,count);
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

    async getClips(clip_ids){
        if(clip_ids.length === 0){
            return [];
        }
        
        let options = {
            url: 'https://api.twitch.tv/helix/clips',
            method: 'GET',
            headers: {
                'Client-ID': TWITCH_CLIENT_ID
            },
            qs: {
                'id': clip_ids
            }
        }

        var response = JSON.parse(await request(options));

        return response.data;
    }
}

exports.Twitch = new Twitch();