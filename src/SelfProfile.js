import React from "react";
import 'bootstrap/dist/css/bootstrap.css';
import './selfProfile.css'
import {useEffect, useState} from "react";
import FundraisingProject from "./FundraisingProject/FundraisingProject";
import './fundraisingProjects.css';
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";

export default function SelfProfile() {
    const [mounted, setMounted] = useState(false);
    const [profile, setProfile] = useState([]);
    const [selfFps, setSelfFps] = useState([]);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    if(!mounted) {
        fetch(`http://localhost:18080/user/selfProfile`, {
            method: 'GET',
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken
            })
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                setProfile(data);
            });
        fetch(`http://localhost:18080/fundraising-projects/selfProfile`, {
            method: 'GET',
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken
            })
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                setSelfFps(data);
            });
    }

    useEffect(() =>{
        setMounted(true)
    },[])

    return (
        <div>
                <div className="container d-flex justify-content-center card p-5 profileWrapper w-50">
                        <div className="row">
                            <div className="d-flex col-sm">
                                <div className="col-xxl-9">
                                    <div className="d-flex flex-row gap-2">
                                        Username: {profile.username}
                                    </div>
                                    <div className="d-flex flex-row gap-2">
                                        Email: {profile.email}
                                    </div>
                                    <div className="d-flex flex-row gap-2">
                                        First name: {profile.firstName}
                                    </div>
                                    <div className="d-flex flex-row gap-2">
                                        Last name: {profile.lastName}
                                    </div>
                                    <div className="d-flex flex-row gap-2">
                                        Patronymic: {profile.patronymic}
                                    </div>
                                    <div className="d-flex flex-row gap-2">
                                        Role: {profile.role}
                                    </div>

                                    <div className="d-flex flex-row gap-2">
                                        Ethereum address: {profile.username}
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-5 m-4">
                                <Link className="nav-link" to={"/start-fundraising-project"}>
                                    <Button type="button" className="btn btn-primary btn-block">Start new fundraising company</Button>
                                </Link>
                                <button type="button" className="btn btn-primary btn-block m-3">Edit profile</button>
                            </div>
                        </div>
                </div>
            <ul className="wrapperSelf">
                {selfFps.map(fp => {
                    return <FundraisingProject fp={fp} isModeration={false} isSelfProfile={true} isCurrentUser={true}/>
                })}
            </ul>
        </div>
    );
}