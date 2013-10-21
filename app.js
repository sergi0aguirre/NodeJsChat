
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  ,socket = require('socket.io')
  ,http = require('http')
  ,MongoClient = require('mongodb').MongoClient
  , format = require('util').format; 


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
app.use(express.compiler({ src : __dirname + '/public', enable: ['less']}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Compatible

// Now less files with @import 'whatever.less' will work(https://github.com/senchalabs/connect/pull/174)
var TWITTER_BOOTSTRAP_PATH = './vendor/twitter/bootstrap/less';
express.compiler.compilers.less.compile = function(str, fn){
  try {
    var less = require('less');var parser = new less.Parser({paths: [TWITTER_BOOTSTRAP_PATH]});
    parser.parse(str, function(err, root){fn(err, root.toCSS());});
  } catch (err) {fn(err);}
}

// Routes

app.get('/', routes.index);

app.get('/chatroom', routes.chatroom);
app.get('/about', routes.about);




app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

//Chat Websocket

var mongo_conection=process.env.MONGO_NOJSCHAT_URL == undefined ? process.env.MONGOHQ_URL : process.env.MONGO_NOJSCHAT_URL;


var storeMessages= function(collection,name,data){
  collection.insert({name :name, data: data}, function(err, records) {
    if (err) throw err;
    console.log("Record added as "+records[0]._id);
  });
}


var io = socket.listen(app);
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

console.log(mongo_conection);

MongoClient.connect(mongo_conection, function(err, db) {

    //connect away
    
        if (err) throw err;
        console.log("Connected to Database");
        var collection = db.collection('nodeJSChat');
  io.sockets.on('connection', function(client){
    console.log('client comming');

    //client.emit('messages', {hello: 'Hello world'});
    //client.emit('messages', 'Welcome to Chat');


          client.on('messages', function(data){
            client.get('nickname',function(err,name){
              console.log(data);
                storeMessages(collection,name,data);
                client.emit('messages','<span>'+name+ ':</span> '+ data); // Send message to sender
                client.broadcast.emit('messages','<span>'+name+'</span>: '+data); // Send message to everyone BUT sender
            });
          });


          client.on('join', function(name){
            client.set('nickname',name);
            console.log(name+' logged to chat');
            
            collection.find().sort('_id','ascending').each(function(err, message) {
                if(message != null)
                client.emit('messages','<span>'+message.name+ ':</span> '+ message.data);
              });
                
            client.emit('messages','Welcome <span>'+name+ ':</span>  !'); // Send message to sender
            client.broadcast.emit('messages','<span>'+name+'</span> has joined to the room'); // Send message to everyone BUT sender

          });


      });

});



