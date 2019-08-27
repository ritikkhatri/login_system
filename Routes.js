const session = require('express-session')
const passport = require('passport')
const mongo = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const routes = require('./Routes.js');
const multer = require("multer");

module.exports = function (app, db) {

    const upload = multer({
        dest: "uploads/"
        // you might also want to set some limits: https://github.com/expressjs/multer#limits
      });
      
  
  const  ensureAuthenticated = (req, res, next)=> {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/');
};
app.route('/')
  .get((req, res) => {
//   console.log(req.query.user + "hh")
 res.render(process.cwd() + '/views/pug/index', {title: 'Home Profile',succes : req.query.succes, message: 'Please login',showLogin: true,showRegistration : false,wrong : req.query.wrong})    // res.sendFile(process.cwd() + '/views/index.html');
  });

app.route('/login')
  .post(passport.authenticate('local',{ failureRedirect: '/?wrong=true' }),(req,res)=>{
  res.redirect('/profile');
   // res.render(process.cwd() + '/views/pug/profile')    // res.sendFile(process.cwd() + '/views/index.html');

})
app.route('/wrong')
  .get((req,res)=>{
  res.render(process.cwd() + '/views/pug/index', {title: 'Home Profile',wrong : true, message: 'Please login',showLogin: true,showRegistration : true})
  // res.redirect('/?worng=true')

})
  
app.route('/register')

  .get((req,res)=>{
  res.render(process.cwd() + '/views/pug/index', {title: 'Home Profile', message: 'Please Register here',showLogin: false,showRegistration : true,exist :req.query.exist})
})
app.route('/register')

  .post((req, res, next) => {
      db.collection('users').findOne({ username: req.body.username }, function (err, user) {
          if(err) {
              next(err);
          } else if (user) {
            console.log("Ye user phle se h")
              res.redirect('/register?exist=true');
          } else {
            var hash = bcrypt.hashSync(req.body.password, 12);
              db.collection('users').insertOne(
                {username: req.body.username,
                 password: hash,
                name :req.body.name,
                email : req.body.email
                }
                ,
                (err, doc) => {
                    if(err) {
                        res.redirect('/');
                    } else {
                        next(null, user);
                    }
                }
              )
          }
      })},
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
  // console.log("Profile ko bheja h")
        res.redirect('/profile');
    }
);
app.route('/profile')
  .get(ensureAuthenticated, (req,res) => {
  console.log(req.user.username)
  db.collection('users').findOne({
    username : req.user.username
  },(err,user)=>{
    console.log(user)
    res.render(process.cwd() + '/views/pug/profile.pug', {title: 'Profile Home', message: 'Please login', showLogin: false , username :user.name,email :user.email});  
  })
// res.render(process.cwd() + '/views/pug/profile.pug', {title: 'Profile Home', message: 'Please login', showLogin: false , username :req.user.username});  
});
  app.route('/forgot')
  .get((req,res) => {
  
res.render(process.cwd() + '/views/pug/forgot.pug' , {notFound :req.query.usernotfound});  
});
  
app.route('/reset')
  .post((req,res)=>{
  
  db.collection('users').findOne({
    username : req.body.username
  },(err,doc)=>{
    
    if(err){
        res.redirect('/forgot')
    }
    
  })
  
  db.collection('users').findOneAndUpdate({
    username : req.body.username
  },
    {
    $set :{
      password : bcrypt.hashSync(req.body.password, 12)
    }
  } ,(err,doc)=>{
    if (err){
      res.redirect('/forgot')
    }
    
  })
//   alert('Succesful')
  res.redirect('/?succes=true')
  // res.send("Updated")
})
app.route('/logout')
  .get((req, res) => {
      req.logout();
      res.redirect('/');
  });
  
app.route('/auth/github')


          .get(passport.authenticate('github'));
 
      
app.route('/auth/github/callback')
          .get(passport.authenticate('github', { failureRedirect: '/' }), (req,res) => {
              res.redirect('/profile');
          });

app.use((req, res, next) => {
  res.status(404)
    .type('text')
    .send("Not found");
});

}