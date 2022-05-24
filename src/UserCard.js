import React, {useState} from "react";
import 'bootstrap/dist/css/bootstrap.css';
import {Link, withRouter} from "react-router-dom";

function UserCard({user}) {
    return (
        <li>
            <div className="bg-light m-5 p-3 fpWrapper">
                <h2 className="p-3">{user.username}</h2>
                <Link to={{pathname:`/users-investments/${user.id}`, state: user}}><button className="btn btn-primary">Show investments</button></Link>
            </div>
        </li>
    )
}

export default withRouter(UserCard);