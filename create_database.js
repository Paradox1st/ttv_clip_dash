var dbinfo = require("./credentials/dbinfo.json"),
  mysql = require('mysql');

var db = mysql.createConnection(dbinfo)

db.connect((err)=>{
  if(err){console.log(err)}
  else{
    db.query('DROP database IF EXISTS ttv_clip_dash;')
    db.query('create database ttv_clip_dash;');
    db.query('use ttv_clip_dash;');
    db.query(`create table users (id int key,
        username varchar(20) not null,
        dispname varchar(50) character set utf8mb4 not null,
        img varchar(255) not null);`);
    db.query(`create table clips (clip_id int key,
        user_id int,
        foreign key (user_id) references users(id));`);
    
    db.end();
    
    console.log('Database Created');
  }
});