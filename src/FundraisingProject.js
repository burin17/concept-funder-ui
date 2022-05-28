import React, {useState} from "react";
import 'bootstrap/dist/css/bootstrap.css';
import {useEffect} from "react";
import crowdfundInstance from './contract/crowdfundInstance';
import crowdfundProject from './contract/crowdfundProjectInstance';
import web3 from './contract/web3';
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import {withRouter} from "react-router-dom";
import './loading.css';
import {useContext} from "react";
import Context from "./context";

function FundraisingProject({fp, isModeration, isSelfProfile, isCurrentUser}) {
    const {isEng} = useContext(Context);

    const [fProj, setFp] = React.useState(fp);
    const [isInApprovedState, setIsInApprovedState] = React.useState(false);
    const [isNotConsidered, setIsNotConsidered] = React.useState(false);
    const [isDurationAvailable, setIsDurationAvailable] = React.useState(false);
    const [accounts, setAccounts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [isExpired, setIsExpired] = React.useState(false);

    const statuses = {
        FINANCED : "ПРОФИНАНСИРОВАНО",
        NOT_CONSIDERED : "МОДЕРАЦИЯ",
        IN_PROGRESS : "ФИНАНСИРОВАНИЕ",
        APPROVED : "ОДОБРЕНО",
        REJECTED : "ОТКЛОНЕНО",
        BLOCKED : "ЗАБЛОКИРОВАНО",
        EXPIRED : "НЕ ДОСТИГЛО ЦЕЛИ"
    }

    function approve() {
        fetch(`http://localhost:18080/moderation/${fProj.fundraisingProjectId}?` + new URLSearchParams({
            isValid: true,
        }), {
            method: 'POST',
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken
            })
        }).then(response => response.json())
            .then(data => {
                setFp(data);
                setIsNotConsidered(fProj.status == "NOT_CONSIDERED");
                document.getElementById("moderationDiv").style.display = "none";
            });
    }

    function reject() {
        fetch(`http://localhost:18080/moderation/${fProj.fundraisingProjectId}?` + new URLSearchParams({
            isValid: false,
        }), {
            method: 'POST',
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken
            })
        }).then(response => response.json())
            .then(data => {
                setFp(data);
                setIsNotConsidered(fProj.status == "NOT_CONSIDERED");
                document.getElementById("moderationDiv").style.display = "none";
            });
    }

    function startFp() {
        setLoading(true);
        crowdfundInstance.methods.startProject(
            fProj.title,
            fProj.days,
            web3.utils.toWei(String(fProj.amountGoal), 'ether'),
        ).send({
            from: accounts[0],
        }).then((res) => {
            const projectInfo = res.events.ProjectStarted.returnValues;
            setLoading(false);
            projectInfo.currentAmount = 0;
            projectInfo.currentState = 0;
            projectInfo.contract = crowdfundProject(projectInfo.contractAddress);
            console.log(projectInfo);
            fetch(`http://localhost:18080/fundraising-projects/start?id=` + fProj.fundraisingProjectId
                + "&contractAddress=" + projectInfo.contractAddress, {
                method: 'POST',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            }).then(response => response.json())
              .then(data => {
                setFp(data);
                setIsInApprovedState(false);
                setIsDurationAvailable(true);
              });
        }).catch(() => setLoading(false));
    }


    useEffect(() =>{
        setFp(fp)
        setIsInApprovedState(fProj.status == "APPROVED");
        setIsNotConsidered(fProj.status == "NOT_CONSIDERED");
        setIsDurationAvailable(fProj.duration != undefined);
        web3.eth.getAccounts().then((accounts) => {
            setAccounts(accounts);
        });
        if (Date.parse(fp.duration) < Date.now() && fp.status == "IN_PROGRESS") {
            fetch("http://localhost:18080/fundraising-projects/expired?fpId=" + fp.fundraisingProjectId, {
                method: "POST",
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            }).then(response => response.json())
                .then(data => {
                    setFp(data);
                }).then(() => {
                    setIsExpired(true);
            });
        }
    },[fp])


    return (
        <li>
            <div className="bg-light m-5 p-3 fpWrapper">
                <Link fp={fProj} to={{pathname:`/fundraising-project-details/${fProj.fundraisingProjectId}`, state: {isModeration: isModeration}}} style={{ textDecoration: 'none' }}><h2 className="p-3">{fProj.title}</h2></Link>
                <div className="p-3">{fProj.description}</div>
                <div className="row p-3">
                    <div className="col-sm">{isEng ? "User" : "Пользователь"}: {fProj.founder.username}</div>
                    <div className="col-sm">{isEng ? "Goal" : "Цель"}: {fProj.amountGoal} ETH</div>
                    {isDurationAvailable > 0 &&
                        <div className="col-sm">{isEng ? "Due date" : "Сборы до"}: {fProj.duration.substring(0, fProj.duration.indexOf('T'))}</div>
                    }
                    {isModeration > 0 &&
                        <div className="col-sm">{isEng ? "Days" : "Дней"}: {fProj.days}</div>
                    }
                    <div className="col-sm">{isEng ? "Raised" : "Собрано"}: {fProj.currentAmount} ETH</div>
                </div>
                <div className="p-3">{fProj.tags.map(tag => "#" + tag + " ")}</div>
                {isModeration > 0 &&
                    <div>
                        <div className="p-3">{isEng ? "Status" : "Статус"}: {isEng ? fProj.status : statuses[fProj.status.toString()]}</div>
                        {isNotConsidered > 0 &&
                            <div  id="moderationDiv" className="p-1">
                                <button type="button" className="btn btn-primary btn-block m-2"
                                        onClick={() => approve()}>{isEng ? "Approve" : "Подтвердить"}
                                </button>
                                <button type="button" className="btn btn-primary btn-block m-2"
                                        onClick={() => reject()}>{isEng ? "Reject" : "Отклонить"}
                                </button>
                            </div>
                        }
                    </div>
                }
                {isSelfProfile > 0 && !(isModeration > 0) &&
                    <div>
                        <div className="p-3">{isEng ? "Status" : "Статус"}: {isEng ? fProj.status : statuses[fProj.status.toString()]}</div>
                    </div>
                }
                {isInApprovedState > 0 && isSelfProfile > 0 &&
                    <div style={{display: "flex"}}>
                    <button id="startBtn" type="button" className="btn btn-primary btn-block m-2" onClick={() => startFp()}>{isEng ? "Start company" : "Начать кампанию"}</button>
                        {loading &&
                            <div className="loader"></div>
                        }
                    </div>
                }
                {isExpired && isSelfProfile &&
                    <button id="startBtn" type="button" className="btn btn-danger btn-block m-2">{isEng ? "Refund" : "Возврат"}</button>
                }
            </div>
        </li>
    )
}

export default withRouter(FundraisingProject);