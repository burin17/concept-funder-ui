import React, {useState, useEffect} from "react";
import FundraisingProject from "./FundraisingProject/FundraisingProject";
import './fundraisingProjects.css';

export default function Moderation() {
    const [mounted, setMounted] = useState(false);
    const [fps, setFps] = useState([]);

    if(!mounted) {
        fetch(`http://localhost:18080/fundraising-projects/all`, {
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
        setMounted(true)
    },[])

    return (
        <ul className="wrapper">
            {fps.map(fp => {
                return <FundraisingProject fp={fp} isModeration={true} isSelfProfile={false} isCurrentUser={false}/>
            })}
        </ul>
    );
}