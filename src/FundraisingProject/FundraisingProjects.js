import React, {useState, useEffect} from "react";
import FundraisingProject from "./FundraisingProject";
import '../fundraisingProjects.css';

export default function FundraisingProjects() {
    const [mounted, setMounted] = useState(false)
    const [fps, setFps] = useState([]);
    const [currentUser, setCurrentUser] = useState();
    const [loaded, isLoaded] = useState(false);

    if(!mounted) {
        fetch(`http://localhost:18080/fundraising-projects/visibleForUser`, {
            method: 'GET',
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken
            })
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                setFps(data);
            });
    }

    useEffect(() =>{
        setMounted(true);
        loadCurrentUser();
    },[]);

    async function loadCurrentUser() {
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
        isLoaded(true);
    }

    if (loaded === false) {
        return <div></div>
    }

    return (
        <ul className="wrapper">
            {fps !== undefined && fps.map(fp => {
                return <FundraisingProject fp={fp} isModeration={false} isSelfProfile={false} isCurrentUser={fp.founder.id === currentUser.id}/>
            })}
        </ul>
    );
}