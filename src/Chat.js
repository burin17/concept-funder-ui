import React, {useState} from "react";
import 'bootstrap/dist/css/bootstrap.css';
import {Link, withRouter} from "react-router-dom";

function Chat({chat}) {
    return (
        <li>
            <div className="bg-light m-5 p-3 fpWrapper">
                <Link to={`/tech-support-messenger/${chat.chatId}`} style={{ textDecoration: 'none' }}><h2 className="p-3">{chat.startedBy.username} asked for help</h2></Link>
            </div>
        </li>
    )
}

export default withRouter(Chat);