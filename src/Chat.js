import React, {useState} from "react";
import 'bootstrap/dist/css/bootstrap.css';
import {Link, withRouter} from "react-router-dom";
import {useContext} from "react";
import Context from "./context";

function Chat({chat}) {
    const {isEng} = useContext(Context);

    return (
        <li>
            <div className="bg-light m-5 p-3 fpWrapper">
                <Link to={`/tech-support-messenger/${chat.chatId}`} style={{ textDecoration: 'none' }}><h2 className="p-3">{chat.startedBy.username} {isEng ? "asked for help" : "задал вопрос"}</h2></Link>
            </div>
        </li>
    )
}

export default withRouter(Chat);