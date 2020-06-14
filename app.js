var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('express-flash-notification');

var indexRouter = require('./routes/index');
var formRouter = require('./routes/form');
var usersRouter = require('./routes/users');


var app = express();

app.use(cookieParser());
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'peter',
}));

app.use(flash(app));

// set global vars
global.__path = require('./app/path');

// view engine setup
app.set('views', __path.views);
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', `${__path.views}/main.ejs`);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/form', formRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

//app.use(function (req, res, next) {
//res.locals.require = require;
//});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
