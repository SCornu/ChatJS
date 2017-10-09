var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nickNames = {};

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(function(req, res, next){
  res.io = io;
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

  // res.status(err.status || 500);
  // res.render('error', {
  //   message: err.message,
  //   error: {}
  // });
  
});

//sockets
io.sockets.on('connection', function(socket){
  socket.on('sendMessage', function(data){
    io.sockets.emit('newMessage',{
      msg: data,
      nick: socket.nickName
    });  
  });

  // socket.on('writingMessage', function(data){
  //   io.sockets.emit('alerMessage',{
  //     nick: socket.nickName,
  //     msg: data
  //   });
  // });

  socket.on('newUser', function(data, callback){
    if(data in nickNames){
      callback(false);
    }else{
      callback(true);
      socket.nickName = data;
      nickNames[socket.nickName] = 1;
      updateNickNames();
    }
  });

  socket.on('disconnect', function(data){
    if(!socket.nickName) return ;
    delete nickNames[socket.nickName];
    updateNickNames();
  });

  function updateNickNames(){
    io.sockets.emit('userNames', nickNames);
  }

  socket.on("typing", function(data) {
    io.sockets.emit("isTyping", {
      isTyping: data,
      nick: socket.nickName
    });
  });


});

// module.exports = app;
module.exports = {app: app, server: server};