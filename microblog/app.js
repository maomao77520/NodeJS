var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require("connect-flash");
var settings = require('./settings');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(partials());

app.use(flash());
app.use(session({
	secret: settings.cookieSecret,
	store:new MongoStore({
	    db:settings.db,	
		host:'localhost',
		db:'microblog'
	})
}));

app.use(function(req,res,next){

   res.locals.user = req.session.user;
   res.locals.post = req.session.post;
   console.log(req.session.user);
   var error = req.flash('error');
   res.locals.error = error.length?error:null;
   var success = req.flash('success');
   res.locals.success = success.length?success:null;
   next();
});

app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);

app.use('/users', users);
app.listen(3000);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
