var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Links = require('../models/LinkShorten');
var User = require('../models/user');
var generator = require("../utils/randomStringGenerator")


//uis
router.get('/', function(req, res) {
  if(req.isAuthenticated()){
    res.redirect('/');
	}else{
    res.render('login', {title:'Login'});
  }
});

router.get('/login', function(req, res, next) {
  if(req.isAuthenticated()){
    res.redirect('/');
	}else{
    res.render('login', {title:'Login'});
  }
});

router.get('/register', function(req, res) {
  if(req.isAuthenticated()){
    res.redirect('/');
	}else{
    res.render('register', {title:'Register'});
  } 
});

router.get('/add', function(req, res) {
  if(req.isAuthenticated()){
    res.render('addlink', {title:'Add Link'});
	}else{
    res.redirect('/');
  }
});

router.get('/editLink', function(req, res) {
  if(req.isAuthenticated()){
    Links.getLinkByKeywordAndUser(req.query.endpoint,req.user.username,function(err,obj){
      if(!err){
        res.render('edit', {title:'Edit Link',data:obj});
        console.log(obj);
      }
      if(!obj){
        res.send("Invalid");
      }
    })
	}else{
    res.redirect('/');
  }
});

//apis
router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
   req.flash('success', 'You are now logged in');
   res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'Unknown User'});
    }

    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message:'Invalid Password'});
      }
    });
  });
}));

router.post('/register', upload.single('profileimage') ,function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  // Form Validator
  req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);

  // Check Errors
  var errors = req.validationErrors();

  if(errors){
  	res.render('register', {
  		errors: errors
  	});
  } else{
  	var newUser = new User({
      username: username,
      password: password
    });

    User.createUser(newUser, function(err, user){
      if (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
          req.flash('failure', 'Account already exists.');
        }
      }
    });

    req.flash('success', 'You are now registered and can login');

    res.location('/');
    res.redirect('/');
  }
});


router.post('/addlink', function(req, res) {
  
  var link = req.body.link;
  var date = req.body.date;

  // Form Validator
  req.checkBody('link','Link field is required').notEmpty();
  req.checkBody('date','Date field is required').notEmpty();

  // Check Errors
  var errors = req.validationErrors();

  if(errors){
  	res.render('addlink', {
  		errors: errors
  	});
  } else{
  	var newLink = new Links({
      originalUrl: link,
      validTill: date,
      endpoint: generator.generateString(6),
      userId: req.user.username
    });

    Links.createLink(newLink, function(err, link){    
      req.flash('success', 'Added');

      res.location('/');
      res.redirect('/');
    });
  }
});

router.post('/editLink', function(req, res) {
  
  var endpoint = req.query.endpoint;
  var newUrl = req.body.link;
  var username = req.user.username;

  Links.editByEndpoint(endpoint,username,newUrl, function(err, link){
    if(!err){
      res.location('/');
      res.redirect('/');
    }else{
      res.send(err);
    }
  });
});

router.get('/deleteLink', function(req, res) {
  
  var endpoint = req.query.endpoint;
  var username = req.user.username;

  Links.deleteByEndpoint(endpoint,username, function(err, link){
    if(!err){
      res.location('/');
      res.redirect('/');
    }else{
      res.send(err);
    }
  });
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
});

module.exports = router;
