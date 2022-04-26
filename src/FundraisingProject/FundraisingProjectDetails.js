import React, {useLayoutEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.css';
import {useEffect} from "react";
import web3 from '../contract/web3';
import {useParams} from "react-router-dom";
import PayoutRequest from"../PayoutRequest"
import '../fundraisingProjects.css';
import crowdfundProject from '../contract/crowdfundProjectInstance';

export default function FundraisingProjectDetails() {
    const {fpId} = useParams()
    const [fProj, setFp] = React.useState();
    const [payoutRequests, setPayoutRequests] = React.useState([]);
    const [currentUser, setCurrentUser] = React.useState();
    const [accounts, setAccounts] = React.useState([]);
    const [isLoaded, loaded] = React.useState(false);
    const [isDurationAvailable, setIsDurationAvailable] = React.useState(false);

    useEffect(() =>{
        loadData();
    }, [fpId])

    async function loadData() {
        await fetch(`http://localhost:18080/fundraising-projects/` + fpId,
            {
                method: 'GET',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            })
            .then(response => response.json())
            .then(data => {
                setFp(data);
                setIsDurationAvailable(data.duration != undefined);
            });

        await fetch(`http://localhost:18080/payout-requests/` + fpId,
            {
                method: 'GET',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            })
            .then(response => response.json())
            .then(data => {
                setPayoutRequests(data);
            })
        console.log(payoutRequests);
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
            })
        await web3.eth.getAccounts().then((accounts) => {
            setAccounts(accounts);
            loaded(true);
        });
    }

    if (isLoaded === false) {
        return <div></div>
    }

    async function invest() {
        const ethAmount = document.getElementById("ethAmount").value;
        const contractAddress = fProj.contractAddress;
        await crowdfundProject(contractAddress).methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei(String(ethAmount), 'ether'),
        }).then((res) => {
            const currentAmount = (parseInt(res.events.FundingReceived.returnValues.currentTotal, 10) / 1000000000000000000);
            fProj.currentAmount = currentAmount;
            return fetch(`http://localhost:18080/fundraising-projects/invest?id=` + fProj.fundraisingProjectId
                + "&currentAmount=" + currentAmount + "&investor=" + currentUser.id + "&ethAmount=" + ethAmount, {
                method: 'POST',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            });
        }).then(response => response.json())
            .then(data => {
                setFp(data);
            });
    }

    function setRPFormVisibility(isVisible) {
        if (isVisible) {
            document.getElementById("formWrapper").style.display = "flex";
        } else {
            document.getElementById("formWrapper").style.display = "none";
        }
    }

    async function requestPayout() {
        const ethAmount = document.getElementById("etherAmount").value;
        const intention = document.getElementById("intention").value;
        const reporting = document.getElementById("reporting").value;
        const days = document.getElementById("days").value;
        console.log(fProj);
        let requiredCountOfApproves;
        let requestIdx = await crowdfundProject(fProj.contractAddress).methods.payOutRequst(
            web3.utils.toWei(String(ethAmount), 'ether'), intention, reporting, days
        ).send({
            from: accounts[0],
        }).then(res => {
            console.log(res.events.PayoutRequestCreated.returnValues);
            requiredCountOfApproves = res.events.PayoutRequestCreated.returnValues.requiredCountOfApproves;
            return res.events.PayoutRequestCreated.returnValues.requestIdx;
        });

        // update balance when payout happens
        // await fetch("http://localhost:18080/fundraising-projects//updateCurrentBalance?id = " + fpId
        //     + "&currentBalance=" + )
        await fetch("http://localhost:18080/payout-requests/create", {
            method: "POST",
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                "ethAmount": ethAmount,
                "intention": intention,
                "reporting": reporting,
                "days": days,
                "fundraisingProjectId": fpId,
                "requestIdx": requestIdx,
                "requiredAmountOfApproves": requiredCountOfApproves
            })
        }).then(resp => resp.json())
            .then(data => {
                let prs = [...payoutRequests, data];
                setPayoutRequests(prs);
        });
    }

    return (
        <div>
            <li style={{marginLeft: 35}}>
                <div id="formWrapper" className="auth-wrapper" style={{position: "absolute", display: "none"}}>
                    <div className="auth-inner">
                        <form>
                            <h3>Request for payout</h3>

                            <div className="form-group">
                                <label>Ether amount</label>
                                <input id="etherAmount" type="text" className="form-control" placeholder="Ether amount" />
                            </div>

                            <div className="form-group">
                                <label>Intention</label>
                                <input id="intention" type="text" className="form-control" placeholder="Intention" />
                            </div>

                            <div className="form-group">
                                <label>Reporting</label>
                                <input id="reporting" type="text" className="form-control" placeholder="Reporting" />
                            </div>

                            <div className="form-group">
                                <label>Days</label>
                                <input id="days" type="text" className="form-control" placeholder="Days" />
                            </div>

                            <br/>
                            <button type="button" className="btn btn-primary btn-block" onClick={() => requestPayout()}>Request</button>
                            <button type="button" className="btn btn-secondary btn-block" style={{marginLeft: "175px"}}
                                    onClick={() => setRPFormVisibility(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
                <div className="bg-light m-5 p-3 fpWrapper">
                    <h2 className="p-3">{fProj.title}</h2>
                    <div className="p-3">{fProj.description}</div>
                    <div className="row p-3">
                        <div className="col-sm">User: {fProj.founder.username}</div>
                        <div className="col-sm">Goal: {fProj.amountGoal} ETH</div>
                        {isDurationAvailable > 0 &&
                            <div className="col-sm">Due
                                date: {fProj.duration.substring(0, fProj.duration.indexOf('T'))}</div>
                        }
                        <div className="col-sm">Days: {fProj.days}</div>
                        <div className="col-sm">Raised: {fProj.currentAmount} ETH</div>
                    </div>
                    <div className="p-3">Tags:</div>
                    {fProj.founder.id != currentUser.id &&
                        <div className="input-group m-2 w-25">
                            <input id="ethAmount" type="text" className="form-control" placeholder="ETH amount"
                                   aria-label="ETH amount" aria-describedby="basic-addon2"/>
                            <button id="startBtn" type="button" className="btn btn-primary"
                                    onClick={() => invest()}>Contribute
                            </button>
                        </div>
                    }
                    {fProj.founder.id == currentUser.id && fProj.status == "FINANCED" &&
                        <button id="startBtn" type="button" className="m-2 btn btn-primary"
                                onClick={() => setRPFormVisibility(true)}>Request payout</button>
                    }
                </div>
            </li>
            <h3 style={{marginLeft: 80, color: "#fff"}}>Requests for pay out:</h3>
            <ul style={{listStyle: "none"}}>
                {payoutRequests.map(payoutRequest => {
                    return <PayoutRequest pr={payoutRequest} fpId={fProj.fundraisingProjectId} account={accounts[0]} currentUserId={currentUser.id}
                                          fpContractAddress={fProj.contractAddress}/>
                })}
            </ul>
        </div>
    )
}