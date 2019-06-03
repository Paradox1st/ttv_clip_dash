'use strict'

// Twitch Clip Dashboard
// database module
// handles database queries

// dependencies
var mysql           = require('mysql'),
    dbinfo          = require('../../credentials/dbinfo.json');

class Database {
  constructor(config) {
    config["database"] = "ttv_clip_dash";
    this.con = mysql.createConnection(config);
    this.con.connect((err) => {
      if (err) {
        console.log('Error connecting to database: ');
        console.log(err);
      } else {
        console.log('Connected to database');
      }
    })
  }

  async query(sql) {
    var self = this;
    return new Promise((resolve, reject) => {
      self.con.query(sql, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getUser(user_id) {
    var query_str = 'SELECT * FROM users WHERE ID=' + this.con.escape(user_id) + ' LIMIT 1';

    var response = await this.query(query_str);

    var user = 0;

    if(response.length>0) user = response[0];

    return user;
  }

  async addUser(user_id, username, display_name, img) {
    var query_str = 'INSERT INTO users (ID, USERNAME, DISPNAME, IMG) VALUES (' +
      this.con.escape(user_id) + ',' + this.con.escape(username) + ',' +
      this.con.escape(display_name) + ',' + this.con.escape(img) + ')';

    await this.query(query_str);

    return await this.getUser(user_id);
  }
}

exports.Database = new Database(dbinfo);