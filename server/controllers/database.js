'use strict'

// Twitch Clip Dashboard
// database module
// handles database queries

// dependencies
var mysql = require('mysql'),
    dbinfo = require('../../credentials/dbinfo.json'),
    twitch = require('./twitch').Twitch;

class Database {
    constructor(config) {
        config["database"] = "ttv_clip_dash";
        this.con = mysql.createConnection(config);
        this.con.connect(async (err) => {
            if (err) {
                console.log('Error connecting to database: ');
                console.log(err);
            } else {
                console.log('Connected to database');
            }
        });
    }

    async query(sql) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.con.query(sql, (err, rows) => {
                if (err) resolve(err);
                else resolve(rows);
            });
        });
    }

    async getUser(user_id) {
        var query_str = 'SELECT * FROM users WHERE ID=' + this.con.escape(user_id) + ' LIMIT 1';

        var response = await this.query(query_str);

        var user = 0;

        if (response.length > 0) user = response[0];

        return user;
    }

    async addUser(user_id, username, display_name, img) {
        var query_str = 'INSERT INTO users (ID, USERNAME, DISPNAME, IMG) VALUES (' +
            this.con.escape(user_id) + ',' + this.con.escape(username) + ',' +
            this.con.escape(display_name) + ',' + this.con.escape(img) + ')';

        await this.query(query_str);

        return await this.getUser(user_id);
    }

    async getUserClips(user_id, count) {
        var query_str = 'select clip_id, clip_title, modified from clips where user_id=' +
            this.con.escape(user_id) + ' order by modified desc limit ' +
            this.con.escape(count);

        var response = await this.query(query_str);
        if (response.length === 0) {
            return [];
        }
        var clip_ids = response.map(clip => clip.clip_id);
        var clips_info = await twitch.getClips(clip_ids);
        clips_info.map((info, idx) => {
            var found = response.find((clip) => {
                return clip.clip_id === info.id;
            });
            info["my_title"] = found.clip_title;
        });

        return clips_info;
    }

    async addClip(user_id, clip_id, clip_title) {
        var clip = await twitch.getClips(clip_id);
        var msg = "";

        if (clip.length < 1) {
            return 'Not a Clip!';
        }

        if (clip_title === "") {
            clip_title = clip[0].title;
        }

        var query_str = 'insert into clips (clip_id, user_id, clip_title) ' +
            'values (' + this.con.escape(clip_id) + ',' +
            this.con.escape(user_id) + ',' +
            this.con.escape(clip_title) + ');';

        var response = await this.query(query_str)

        if (response.errno === 1062) {
            msg = 'Duplicate Clip!';
        } else {
            msg = 'Added Clip!';
        }

        return msg;
    }
}

exports.Database = new Database(dbinfo);