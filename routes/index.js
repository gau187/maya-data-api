var express = require('express');
var router = express.Router();
var Links = require('../models/LinkShorten');
const axios = require('axios');

//get with our code
router.get('/:code', function(req, res) {
  Links.getLinkByKeyword(req.params.code,function(err,obj){
    if(!err){
      if(obj){
        res.redirect(obj.originalUrl);
      }else{
        res.send("Invalid Link");
      }
    }else{
      res.send(err);
    }
  });
});
/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  Links.getLinkByUser(req.user.username,function(err,obj){
    res.render('index', { title: 'Members',data:obj});
  });
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/users/login');
}

router.get("/userLinks",function(req, res) {
  Links.getLinkByUser(req.user.username,function(err,obj){
    res.json(obj);
    console.log(obj);
  });
});

module.exports = router;
