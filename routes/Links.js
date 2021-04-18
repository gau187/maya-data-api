var express = require('express');
var router = express.Router();
var Links = require('../models/LinkShorten');
var generator = require("../utils/randomStringGenerator");

//link type /users/userlinks?username=gau187
router.get("/userLinks",function(req, res) {
  if(!req.query.username)
    res.send({done:false,message:"Invalid Params"});
  else{
    Links.getLinkByUser(req.query.username,function(err,obj){
      res.send({done:true,data:obj});
      console.log(obj);
    });
  }
});

router.post("/addLink",function(req, res) {
  if(req.body.link && req.body.date && req.body.username){
    var newLink = new Links({
      originalUrl: req.body.link,
      validTill: req.body.date,
      endpoint: generator.generateString(6),
      userId: req.body.username
    });
    Links.createLink(newLink, function(err, link){
      if(!err){
        res.send({done:true,data: link});
      }else{
        res.send({done:false,data: err});
      }
    });
  }else{
    res.send({done:false,message:"Invalid Params"});
  }
});

router.post('/deleteLink', function(req, res) {
  
  var endpoint = req.query.endpoint;
  var username = req.body.username;

  if(endpoint && username){
    Links.deleteByEndpoint(endpoint,username, function(err, link){
      if(!err && link){
        if(link.deletedCount===1){
          res.send({done:true,data: "Successfully Deleted"});
        }else{
          res.send({done:false,data: "Cannot Delete"});
        }
      }else{
        res.send({done:false,data: err});
      }
    });
  }else{
    res.send({done:false,message:"Invalid Params"});
  }
});

router.post('/editLink', function(req, res) {
  
  var endpoint = req.query.endpoint;
  var newUrl = req.body.link;
  var username = req.body.username;

  if(endpoint && newUrl && username){
    Links.editByEndpoint(endpoint,username,newUrl, function(err, link){
      if(!err && link){
        res.send({done:true,data: "Successfully Edited"});
      }else{
        res.send({done:false,data: err});
      }
    });
  }else{
    res.send({done:false,message:"Invalid Params"});
  }
});

module.exports = router;