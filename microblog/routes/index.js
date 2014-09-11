var express = require('express');
var crypto = require('crypto');
var User = require('../models/user');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {   //路径对应的处理函数
  res.render('index', { title: 'Express' });
});

router.get('/reg',function(req,res){  //注册页面
   res.render('reg',{title:'Register'});
});

router.post("/reg",function(req,res){		 //提交注册信息		
   if(req.body['password-repeat'] != req.body['password']){
	   req.flash('error','not the same');     //页面显示的错误信息
	   return res.redirect('/reg');
   }
   var md5 = crypto.createHash('md5');
   var password = md5.update(req.body['password']).digest('base64');
   var newUser = new User({
	  name:req.body.username,
	  password:password,
   });
   User.get(newUser.name,function(err,user){//检查用户是否存在
	   if(user){
		   err = 'Username already exists.';   
	   }							  
	   if(err){
		   req.flash('error',err);
		   return res.redirect('/reg');
	   }
	   newUser.save(function(err){   //入库
		  if(err){
			  req.flash('error',err);
			  return res.redirect('/reg');
		  }					 
		  req.session.user = newUser;
		  req.flash('success','register success');
		  res.redirect('/');
	   });
	});
});

router.get('/login',function(req,res){
   res.render('login',{title:"Login"});
});
router.post('/login',function(req,res){//用户登录
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	console.log(password);
	User.get(req.body.username,function(err,user){//检查用户是否存在
		if(!user){
		    req.flash('error',"not exist");	
			return res.redirect('/login');
	    }
		if(user.password != password){
		    req.flash("error","password is wrong");
			return res.redirect("login");
	    }
		req.session.user = user;
		req.flash('success',"login success");
		res.redirect('/');
	});
});

router.get('/logout',function(req,res){  //登出
	req.session.user = null;
	req.flash('success', "logout success");
	res.redirect('/');
});

router.get('/hello/:username',function(req,res){
	res.send('the username is: ' + req.params.username);
});


module.exports = router;
