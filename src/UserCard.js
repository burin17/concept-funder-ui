import React, {useState} from "react";
import 'bootstrap/dist/css/bootstrap.css';
import {Link, withRouter} from "react-router-dom";
import {useContext} from "react";
import Context from "./context";

function UserCard({user}) {
    const {isEng} = useContext(Context);

    return (
        <li>
            <div className="bg-light m-5 p-3 fpWrapper">
                <h2 className="p-3">{user.username}</h2>
                <Link to={{pathname:`/users-investments/${user.id}`, state: user}}><button className="btn btn-primary">{isEng ? "Show funding statistics" : "Показать статистику финансирования"}</button></Link>
            </div>
        </li>
    )
}

export default withRouter(UserCard);