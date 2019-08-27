'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
// const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session')
const passport = require('passport')
const app = express();
const mongo = require('mongodb').MongoClient;
const routes = require('./Routes.js');
const auth = require('./Auth.js')
require('dotenv').config();



app.set('view engine', 'pug')
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

mongo.connect(process.env.DATABASE , (err, dbo) => {
    if(err) {
        console.log('Database error: ' + err);
    } else {
        console.log('Successful database connection');
        //serialization and app.listen

      var db = dbo.db('users');
        
      auth(app,db);
      
      routes(app,db);
      
      app.listen(3000, () => {
  console.log("Listening on port 3000" );
});
      
      }});

  