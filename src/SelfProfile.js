import React from "react";
import 'bootstrap/dist/css/bootstrap.css';
import './selfProfile.css'
import {useEffect, useState} from "react";
import FundraisingProject from "./FundraisingProject";
import './fundraisingProjects.css';
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";
import {useContext} from "react";
import Context from "./context";

export default function SelfProfile() {
    const {isEng} = useContext(Context);

    const [mounted, setMounted] = useState(false);
    const [profile, setProfile] = useState([]);
    const [selfFps, setSelfFps] = useState([]);
    const [investedFps, setInvestedFps] = useState([]);
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
        fetch(`http://localhost:18080/invested-fundraising-projects`, {
            method: 'GET',
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken
            })
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                setInvestedFps(data);
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
                                        {isEng ? "Username" : "Логин"}: {profile.username}
                                    </div>
                                    <div className="d-flex flex-row gap-2">
                                        {isEng ? "Email" : "Почта"}: {profile.email}
                                    </div>
                                    <div className="d-flex flex-row gap-2">
                                        {isEng ? "First name" : "Имя"}: {profile.firstName}
                                    </div>
                                    <div className="d-flex flex-row gap-2">
                                        {isEng ? "Last name" : "Фамилия"}: {profile.lastName}
                                    </div>
                                    <div className="d-flex flex-row gap-2">
                                        {isEng ? "Patronymic" : "Отчество"}: {profile.patronymic}
                                    </div>
                                </div>
                            </div>
                            {profile.role !== "ADMIN" &&
                                <div className="col-sm-5" style={{position: "absolute", right: "80px", top: "87px"}}>
                                    <Link className="nav-link" to={"/start-fundraising-project"}>
                                        <Button type="button" className="btn btn-primary btn-block" style={{
                                            width: "120%",
                                            height: "50px"
                                        }}>{isEng ? "Start new fundraising company" : "Создать кампанию"}</Button>
                                    </Link>
                                </div>
                            }
                        </div>
                </div>
            {selfFps.length > 0 &&
                <div style={{marginTop: "50px"}}>
                    <h3 style={{marginLeft: 80, color: "#fff"}}>{isEng ? "My fundraising projects": "Мои краудфандинговые кампании"}:</h3>
                    <ul className="wrapperSelf">
                {selfFps.map(fp => {
                    return <FundraisingProject fp={fp} isModeration={false} isSelfProfile={true} isCurrentUser={true}/>
                })}
                    </ul>
                </div>
            }
            {investedFps.length > 0 &&
                <div style={{marginTop: "50px"}}>
                    <h3 style={{marginLeft: 80, color: "#fff"}}>{isEng ? "Invested fundraising projects" : "Профинансированные краудфандинговые кампании"}:</h3>
                    <ul className="wrapperSelf">
                        {investedFps.map(fp => {
                            return <FundraisingProject fp={fp} isModeration={false} isSelfProfile={true}
                                                       isCurrentUser={true}/>
                        })}
                    </ul>
                </div>
            }
        </div>
    );
}