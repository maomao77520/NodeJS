var express = require('express');
var path = require('path');
var app = express();
app.use(function(req,res,next){
    console.log('111');
    next();
    console.log('222');
});

app.use(function(req,res,next){
    console.log("333");
    next();
});

app.use(express.static(path.join(__dirname, 'public')));