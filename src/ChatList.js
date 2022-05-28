import React from 'react'
import Chat from "./Chat";
import {useEffect} from "react";
import {useContext} from "react";
import Context from "./context";

export default function ChatList() {
    const {isEng} = useContext(Context);

    const [allChats, setAllChats] = React.useState([]);
    const [assignedChats, setAssignedChats] = React.useState([]);
    const [currentUser, setCurrentUser] = React.useState();
    const [isLoaded, loaded] = React.useState(false);

    useEffect(() => {
        loadData();
    },[]);

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
        await fetch(`http://localhost:18080/tech-support/unassigned-chats`,
            {
                method: 'GET',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            })
            .then(response => response.json())
            .then(data => {
                setAllChats(data);
            });
        await fetch(`http://localhost:18080/tech-support/all-chats`,
            {
                method: 'GET',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            })
            .then(response => response.json())
            .then(data => {
                setAssignedChats(data);
            })
            .then(() => loaded(true));
    }

    if (isLoaded === false) {
        return <div></div>
    }

    return (
        <div className="wrapper">
            {allChats.length > 0 &&
                <h2 style={{marginLeft: "80px", color: "#fff"}}>{isEng ? "Waiting for help" : "В ожидании помощи"}</h2>
            }
            <ul style={{listStyle: "none"}}>
                {allChats !== undefined && allChats.map(chat => {
                    return <Chat chat={chat}/>
                })}
            </ul>
            {assignedChats.length > 0 &&
                <h2 style={{marginLeft: "80px", color: "#fff"}}>{isEng ? "Started chats" : "Начатые чаты"}</h2>
            }
            <ul style={{listStyle: "none"}}>
                {assignedChats !== undefined && assignedChats.map(chat => {
                    return <Chat chat={chat}/>
                })}
            </ul>
        </div>
    );
}