import React, {useState} from "react";
import Chat from "./Chat";
import UserCard from "./UserCard";

export default function UsersStatistics() {
    const [users, setUsers] = useState([]);

    function searchUser() {
        let piece = document.getElementById('usernameInput').value;
        if (piece !== '') {
            fetch("http://localhost:18080/user/piece?usernamePiece=" + piece, {
                method: 'GET',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            }).then(resp => resp.json())
                .then(data => setUsers(data));
        } else {
            setUsers([]);
        }
    }

    return (
        <div>
            <div style={{position: "absolute", top: "80px", width: "93%", left: '80px'}}>
                <input id="usernameInput" type="text" className="form-control" placeholder="Username" onChange={searchUser}/>
            </div>
            <ul style={{listStyle: "none", marginTop: "180px"}}>
                {users.map(user => {
                    return <UserCard user={user}/>
                })}
            </ul>
        </div>
    )
}