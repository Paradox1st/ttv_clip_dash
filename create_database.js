'use strict'

var dbinfo = require("./credentials/dbinfo.json"),
    mysql = require('mysql');

var db = mysql.createConnection(dbinfo);
db.query('DROP database IF EXISTS ttv_clip_dash;');
db.query('create database ttv_clip_dash;');
db.query('use ttv_clip_dash;');
db.query(`create table users (id int key,
    username varchar(20) not null,
    dispname varchar(50) character set utf8mb4 not null,
    img varchar(255) not null);`);
db.query(`create table clips (clip_id varchar(100) key,
    clip_title varchar(255) character set utf8mb4,
    modified_date date,
    user_id int,
    foreign key (user_id) references users(id),
    unique (clip_id, user_id));`);

db.end();