var db = require('./server/controllers/database').Database;

async function create_database() {
  await db.query('drop database ttv_clip_dash;');
  await db.query('create database ttv_clip_dash;');
  await db.query('use ttv_clip_dash;');
  await db.query(`create table users (id int key,
    username varchar(20) not null,
    dispname varchar(50) character set utf8mb4 not null,
    img varchar(255) not null);`);
  await db.query(`create table clips (clip_id int key,
    user_id int,
    foreign key (user_id) references users(id));`);

  await db.con.end();

  console.log('Database Created');
}

create_database();