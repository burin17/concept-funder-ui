import React from "react";
import "./messenger.css"
import {useEffect} from "react";
import SockJS from "sockjs-client";
import {useContext} from "react";
import Context from "./context";

var stompClient = null;
export default function Messenger() {
    const {isEng} = useContext(Context);
    const [currentUser, setCurrentUser] = React.useState();
    const [currentChat, setCurrentChat] = React.useState();
    const [messages, setMessages] = React.useState([]);
    const [isLoaded, loaded] = React.useState(false);

    const connect = () => {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        if (currentUser !== undefined) {
            const Stomp = require("stompjs");
            var SockJS = require("sockjs-client");
            SockJS = new SockJS("http://localhost:19080/ws");
            stompClient = Stomp.over(SockJS);
            stompClient.connect({}, onConnected, onError);
        }
    };

    const onConnected = () => {
        if (currentUser !== undefined) {
            console.log("connected");
            console.log(currentUser);
            stompClient.subscribe(
                "/user/" + currentUser.id + "/queue/messages",
                onMessageReceived
            );
        }
    };

    const onError = (err) => {
        console.log(err);
    };

    const onMessageReceived = (msg) => {
        fetch(`http://localhost:18080/user/selfProfile`,
            {
                method: 'GET',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            })
            .then(response => response.json())
            .then(data => {
                setCurrentUser(data);
                return data;
            }).then((data) => {
                if (JSON.parse(msg.body).author.id != data.id) {
                    console.log("current user id = " + currentUser.id);
                    console.log("author id = " + JSON.parse(msg.body).author.id);
                    setCurrentChat(JSON.parse(msg.body).chat);
                    const message = JSON.parse(msg.body);
                    document.getElementById("messengerUl").innerHTML += `
                        <li class="messengerLiLeft">
                            <div class="msgContentWrapper">${message.content}</div>
                        </li>
                    `
                    // setMessages([...messages, message]);
                    if (document.getElementById("noMessagesText") != null) {
                        document.getElementById("noMessagesText").style.display = "none";
                    }
                }});
    };

    const sendMessage = () => {
        let message;
        if (currentChat.techSpecialist != null) {
            message = {
                chatId: currentChat.chatId,
                senderId: currentUser.id,
                receiverId: currentChat.techSpecialist.id,
                content: document.getElementById("messageContent").value,
            };
        } else {
            message = {
                chatId: currentChat.chatId,
                senderId: currentUser.id,
                content: document.getElementById("messageContent").value,
            };
        }
        stompClient.send("/app/chat", {}, JSON.stringify(message));

        message.author = {};
        message.author.username = currentUser.username;


        // const newMessages = [...messages];
        // newMessages.push(message);
        // setMessages(newMessages);

        if (currentChat.techSpecialist == null) {
            fetch(`http://localhost:18080/tech-support/` + currentChat.chatId,
                {
                    method: 'GET',
                    headers: new Headers({
                        "Authorization": sessionStorage.jwtToken
                    })
                })
                .then(response => response.json())
                .then(data => {
                    setCurrentChat(data);
                });
        }

        document.getElementById("messageContent").value = "";
        document.getElementById("messengerUl").innerHTML += `
            <li class="messengerLiRight">
                <div class="msgContentWrapper">${message.content}</div>
            </li>
        `
        if (document.getElementById("noMessagesText") != null) {
            document.getElementById("noMessagesText").style.display = "none";
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => connect(),[currentUser]);

    async function loadData() {
        await fetch(`http://localhost:18080/user/selfProfile`,
            {
                method: 'GET',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            })
            .then(response => response.json())
            .then(data => {
                setCurrentUser(data);
            });
        await fetch(`http://localhost:18080/tech-support/unresolved`,{
                method: 'GET',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            })
            .then(response => response.json())
            .then(data => {
                    setCurrentChat(data);
                    fetch(`http://localhost:18080/tech-support/chat/` + data.chatId,
                        {
                            method: 'GET',
                            headers: new Headers({
                                "Authorization": sessionStorage.jwtToken
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            setMessages(data);
                        })
                        .then(() => loaded(true));
            }).catch(() => {
                fetch("http://localhost:18080/tech-support/start-chat",
                    {
                        method: 'POST',
                        headers: new Headers({
                            "Authorization": sessionStorage.jwtToken
                        })
                    })
                    .then(resp => resp.json())
                    .then(data => {
                            setCurrentChat(data);
                            fetch(`http://localhost:18080/tech-support/chat/` + data.chatId,
                                {
                                    method: 'GET',
                                    headers: new Headers({
                                        "Authorization": sessionStorage.jwtToken
                                    })
                                })
                                .then(response => response.json())
                                .then(data => {
                                    setMessages(data);
                                })
                                .then(() => loaded(true));
                        }
                    )
            })
    }

    if (isLoaded === false) {
        return <div></div>
    }

    function markAsClosed() {
        fetch("http://localhost:18080/tech-support/mark-as-solved?chatId=" + currentChat.chatId, {
            method: "PATCH",
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken
            })
        })
        document.getElementById("closeBtn").style.display = "none";
    }

    function send() {
        const content = document.getElementById("messageContent").value;
        fetch("http://localhost:18080/tech-support/send-message?chatId=" + currentChat.chatId + "&content=" + content,
            {
                method: 'POST',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            }).then(resp => resp.json())
              .then(data => setMessages([...messages, data]))
                .then(() => document.getElementById("messageContent").value = "");
    }



    // const messages = [
    //     {content:"Hi!", author: {username:"ivanov"}},
    //     {content:"Hello!", author: {username:"testuser"}},
    //     {content:"New to React and trying to loop Object attributes but React complains about Objects not being valid React children, can someone please give me some advice on how to resolve this problem? I've added createFragment but not completely sure where this needs to go or what approach I should take?", author: {username:"ivanov"}},
    // ];

    return (
        <div>
            {console.log(currentChat)}
            <li style={{marginLeft: 35}}>
                <div className="bg-light m-5 p-3 fpWrapper">
                    <div className="techSupportText">{isEng ? "Tech support dialog" : "????????????????????????"}</div>
                    {messages.length === 0 &&
                        <div id="noMessagesText" style={{textAlign: "center", padding: "60px"}}>{isEng ? "Ask your question here.." : "?????????????? ???????????? ..."}</div>
                    }
                    <ul id="messengerUl" className="messengerUl">
                        {messages.map(msg => {
                                if (currentUser.username === msg.author.username) {
                                    return <li className="messengerLiRight">
                                            <div className="msgContentWrapper">{msg.content}</div>
                                           </li>
                                } else {
                                    return <li className="messengerLiLeft">
                                            <div className="msgContentWrapper">{msg.content}</div>
                                           </li>
                                }
                            })
                        }
                    </ul>

                    <div className="input-group">
                        <input id="messageContent" type="text" className="form-control" aria-describedby="basic-addon2"/>
                        <button id="startBtn" type="button" className="btn btn-primary" onClick={() => sendMessage()}>{isEng ? "Send" : "??????????????????"}</button>
                    </div>
                    <button id="closeBtn" type="button" className="btn btn-primary"
                            style={{marginTop: "10px", marginLeft: '790px'}}
                            onClick={() => markAsClosed()}>
                        {isEng ? "Close chat" : "?????????????? ??????"}
                    </button>
                </div>
            </li>
        </div>
    )
}
