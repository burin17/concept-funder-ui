import React, {useState} from "react";
import 'bootstrap/dist/css/bootstrap.css';
import {useEffect} from "react";
import web3 from "./contract/web3";
import crowdfundProject from './contract/crowdfundProjectInstance';
import data from "bootstrap/js/src/dom/data";

export default function PayoutRequest({pr, fpId, account, currentUserId, fpContractAddress}) {
    const [payoutRequest, setPayoutRequest] = React.useState(pr);
    const [isInvestor, setIsInvestor] = React.useState(false);
    const [isApproved, setIsApproved] = React.useState(false);

    useEffect(() =>{
        setPayoutRequest(pr);
        loadData();
    }, [pr])

    async function loadData() {
        // isCurrentUser investor
        await fetch("http://localhost:18080/user/isInvestor?fpId=" + fpId, {
            method: "GET",
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken
            })
        }).then(response => response.json())
            .then(data => {
                setIsInvestor(data);
            });
        await fetch("http://localhost:18080/payout-requests/isApproved?prId=" + pr.id, {
            method: "GET",
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken
            })
        }).then(response => response.json())
            .then(data => {
                setIsApproved(data);
                console.log(2)
        });
    }


    function approve() {
        crowdfundProject(fpContractAddress).methods.approveRequest(pr.requestIdx).send({
            from: account
        }).then(res => {
            console.log(res.events.Approved.returnValues);
            return parseInt(res.events.Approved.returnValues.countOfApproves);
        }).then(countOfApproves =>
            fetch("http://localhost:18080/payout-requests/approve?payoutRequestId=" +
            pr.id + "&approverId=" + currentUserId + "&countOfApproves=" + countOfApproves, {
            method: "POST",
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken,
            }),
        }))
            .then(resp => resp.json())
          .then(data => {
            setPayoutRequest(data);
        }).then(data => {
            setIsApproved(true);
        })
    }

    return (
        <li key={pr}>
            <div className="bg-light m-5 p-3 fpWrapper" style={{borderRadius: "15px"}}>
                <h3 className="p-3">Requested sum: {payoutRequest.ethAmount}</h3>
                <div className="p-3">Intention: {payoutRequest.intention}</div>
                <div className="p-3">Promised report: {payoutRequest.reporting}</div>
                <div className="row p-3">
                    <div className="col-sm">Due date: {payoutRequest.achieveBy.substring(0, payoutRequest.achieveBy.indexOf('T'))}</div>
                    <div className="col-sm">Count of approves: {payoutRequest.countOfApproves}</div>
                    <div className="col-sm">Required amount of approves: {payoutRequest.requiredAmountOfApproves}</div>
                </div>
                {isInvestor && !isApproved &&
                    <button id="startBtn" type="button" className="m-2 btn btn-primary" onClick={() => approve()}>Approve</button>
                }
            </div>
        </li>
    )
}