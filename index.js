var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
 
app.use(express.static(__dirname + '/web'));

app.get('/', function(req, res){
    res.send("welcome to my lab");
});
app.get('/chat', function(req, res){
    res.sendFile("/web/index.html", {root: __dirname});
    return;
});
 
//online clients
var onlineUsers = {};
//online
var onlineCount = 0;
//messages
var messages = [];
//max cache
var max = 500;
 
io.on('connection', function(socket){
    console.log('a user connected');

    socket.emit('history', {
        messages: messages,
        onlineUsers: onlineUsers,
        onlineCount: onlineCount
    });
    console.log("history send to " + socket.id);

    socket.on('login', function(obj){
        for(var x in onlineUsers){
            if(onlineUsers[x].username==obj.username){
                return socket.emit("login_error", {type: "login_error", userid: obj.userid})
            }
        }
        if(!onlineUsers.hasOwnProperty(obj.userid)) {
            onlineUsers[obj.userid] = {
                username: obj.username,
                time: (new Date()).getTime()
            };
            onlineCount++;
        }
        else{
            return socket.emit("login_error", {type: "login_error", userid: obj.userid})
        }

        socket.id = obj.userid;
        io.emit('login_success', {type: "login_success", onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
        console.log(obj.username+'加入了聊天室');
    });
     
    socket.on('disconnect', function(){
        if(onlineUsers.hasOwnProperty(socket.id)) {
            var obj = {userid:socket.id, username:onlineUsers[socket.id]};
            delete onlineUsers[socket.id];
            onlineCount--;

            io.emit('logout', {type: "logout", onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
            console.log(obj.username+'退出了聊天室');
        }
    });
     
    socket.on('message', function(obj){
        obj.time = (new Date()).getTime();
        obj.type = "message";
        messages.push(obj);
        io.emit('message', obj);
        if(messages.length > max){
            messages.splice(messages.length-max, max);
        }
        console.log(obj.username+'说：'+obj.content);
    });

    socket.on('history', function(obj){
        if(obj==undefined){
            socket.emit('history', {
                messages: messages,
                onlineUsers: onlineUsers,
                onlineCount: onlineCount
            });
            console.log("history send to " + socket.id);
        }
    });
   
});
 
http.listen(3000, function(){
    console.log('listening on *:3000');
});