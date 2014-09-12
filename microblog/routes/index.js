var express = require('express');
var crypto = require('crypto');
var User = require('../models/user');
var Blog = require("../models/blog");
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {   //路径对应的处理函数
  Blog.get(null,function(err,blogs){
  	if(err){
  		blogs = [];
  	}
     res.render('index', { title: 'Microblog',blogs:blogs});
  });	
});

router.get('/reg',checkNotLogin);
router.get('/reg',function(req,res){  //注册页面
   res.render('reg',{title:'Register'});
});
router.post('/reg',checkNotLogin);
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
		  return res.redirect('/');
	   });
	});
});
router.get('/login',checkNotLogin);
router.get('/login',function(req,res){
   res.render('login',{title:"Login"});
});
router.post('/login',checkNotLogin);
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
		return res.redirect('/');
	});
});
router.get('/logout',checkLogin);
router.get('/logout',function(req,res){  //登出
	req.session.user = null;
	req.flash('success', "logout success");
	return res.redirect('/');
});

router.post('/postblog',checkLogin);
router.post('/postblog',function(req,res){
   var currentuser = req.session.user;
   var blog = new Blog(currentuser.name,req.body.blogtext);
   blog.save(function(err){
   	   if(err){
           req.flash("error","error");
           console.log("*******************");
           console.log(err);
           return res.redirect('/');
   	   }
   	   req.flash("success","post success");
   	   res.redirect("/u/" + currentuser.name);
   })
});

router.get('/u/:user',function(req,res){
	User.get(req.params.user,function(err,user){
		if(!user){
			req.flash("error","user not exist");
			return res.redirect('/');
		}
		Blog.get(user.name,function(err,blogs){
            if(err){
            	req.flash("error",err);
            	return redirect('/');
            }
            res.render("user",{title:user.name,blogs:blogs});
		});
	});
});

function checkLogin(req,res,next){
   if(!req.session.user){
	   req.flash('error','have not login');
	   return res.redirect('/login');
   }	
   next();
}
function checkNotLogin(req,res,next){
   if(req.session.user){
	   req.flash("error","already login");
	   return res.redirect('/');
   }
   next();
}


module.exports = router;
