import React from 'react';
import ReactDom from 'react-dom';

var App = React.createClass({
    getInitialState: function(){
        return{
            isLogin: false,
            username: "未登录",
            userid: this.generateUid(),
            messages: [],
            onlineUsers: {},
            onlineCount: 0,
            toggle: true,
            typing: false
        }
    },
    componentDidMount: function(){
        this.socket = io.connect("ws://"+window.location.host);
        this.refs.username.onkeyup = function(e){
            e = e || event;
            if (e.keyCode === 13) {
                this.login();
            }
        }.bind(this);
        this.refs.message.onfocus = function(){
            this.setState({typing: true});
            window.setTimeout(function(){this.refs.content.scrollTop = this.refs.content.scrollHeight}.bind(this), 200);
        }.bind(this);
        this.refs.message.onblur = function(){
            this.setState({typing: false});
        }.bind(this);
        this.refs.message.onkeyup = function(e){
            e = e || event;
            if (e.keyCode === 13) {
                var message = this.refs.message.value;
                this.refs.message.value = message.substr(0, message.length-1);
                this.send();
            }
        }.bind(this);
        this.socket.on('message', function(obj){
            console.log(obj);
            var messages = this.state.messages;
            messages.push(obj);
            this.setState({messages: messages});
        }.bind(this));
        this.socket.on('history', function(obj){
            console.log(obj);
            this.setState(obj);
        }.bind(this));
        this.socket.on('login_success', function(obj){
            console.log(obj);
            if(obj.user.userid == this.state.userid){
                //alert("success");
                this.setState({
                    isLogin: true,
                    toggle: false,
                    username: obj.user.username
                });
            }
            this.setState({
                onlineUsers: obj.onlineUsers,
                onlineCount: obj.onlineCount
            })
        }.bind(this));
        this.socket.on('login_error', function(obj){
            console.log(obj);
            alert("名字冲突，请重新输入");
            this.refs.username.value = "";
            this.refs.username.focus();
            this.setState({
                isLogin: false
            });
        }.bind(this));
        this.socket.on('logout', function(obj){
            //sys.innerHTML = obj.user.username + " 退出了聊天室";
            console.log(obj);
            this.setState({
                onlineUsers: obj.onlineUsers,
                onlineCount: obj.onlineCount
            })
        }.bind(this));
        //this.socket.emit("history");
    },
    generateUid: function(){
        var uid = "";
        for (var i = 1; i <= 16; i++){
            uid += Math.floor(Math.random()*16.0).toString(16);
        }
        return uid;
    },
    send: function(){
        console.log("send");
        //this.refs.message.blur();
        if(this.refs.message.value=="") return;
        if(this.state.isLogin!=true){
            this.setState({
                toggle: true
            })
            this.refs.username.focus();
            return alert("未登录");
        }
        else{
            this.socket.emit("message", {content: this.refs.message.value, userid: this.state.userid, username: this.state.username});
            this.refs.message.value = "";
        }
    },
    login: function(){
        if(this.state.isLogin != false) return;
        this.setState({isLogin: "ing"});
        var username = this.refs.username.value;
        if(username==""){
            return alert("名字不能为空");
        }
        if(username.length>20){
            return alert("名字不能超过20个字符");
        }
        this.socket.emit("login", {userid: this.state.userid, username: username});
    },
    componentDidUpdate: function(){
        console.log("update");
        console.log(this.refs.content.scrollTop);
        console.log(this.refs.content.scrollHeight);
        this.refs.content.scrollTop = this.refs.content.scrollHeight;
        console.log(this.refs.content.scrollTop);
        console.log(this.refs.content.scrollHeight);
    },
    toggle: function(){
        this.setState({toggle: !this.state.toggle});
    },
    render: function(){
        var ava = this.state.username.substr(0,1);
        var onlines = [];
        for(var x in this.state.onlineUsers){
            var user = this.state.onlineUsers[x];
            var a = user.username.substr(0,1);
            var t = (new Date(parseInt(user.time))).toTimeString().substr(0,5);
            var ins = (
                <div key={x} className="user">
                    <span className="avatar">{a}</span>
                    <span className="name">{user.username}</span>
                    <span className="time">{t} 加入</span>
                </div>
            )
            onlines.push(ins);
        }
        var messages = [];
        for(var x in this.state.messages){
            var message = this.state.messages[x];
            var a = message.username.substr(0,1);
            var t = (new Date(parseInt(message.time))).toTimeString().substr(0,8);
            var ins = (
                <div className={"message"+(message.userid==this.state.userid?" self":"")} key={x}>
                    <div className="avatar">{a}</div>
                    <div className="info">
                        <span className="name">{message.username}</span>
                        <span className="time"> {t}</span>
                    </div>
                    <div className="content">{message.content}</div>
                </div>
            )
            messages.push(ins);
        }
        return (
            <div className="full">
                <div className={"sidebar ease"+ (this.state.toggle?" toggle":"")} ref="sidebar">
                    <div className="head">
                        <div className="avatar ease">{ava}</div>
                        <div className="username ease">{this.state.username}</div>
                        <input style={{display: this.state.isLogin!=true?"inline":"none"}} placeholder="输入一个名字" ref="username"/>
                        <span style={{display: this.state.isLogin!=true?"inline":"none"}} onClick={this.login}>登录</span>
                    </div>
                    <div className="online-users ease" style={{top: this.state.isLogin!=true?"130px":"100px"}}>
                        {onlines}
                    </div>
                </div>
                <div className={"container ease"+ (this.state.toggle?" toggle":"")} id="container">
                    <div className="title">
                        <i className="fa fa-bars" id="toggle" onClick={this.toggle}></i>
                        Chatroom
                    </div>
                    <div className={"messages ease"+(this.state.typing?" typing":"")} ref="content">
                        {messages}
                    </div>
                    <div className="send" ref="sendContainer">
                        <textarea className="ease" ref="message" type="text" placeholder="Enter发送消息"></textarea>
                        <button ref="send" onClick={this.send}>发  送</button>
                    </div>
                </div>
            </div>
        );
    }
});

ReactDom.render(<App/>, document.getElementById("chat"));

export default App;