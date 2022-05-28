import React, {useState} from "react";
import 'bootstrap/dist/css/bootstrap.css';
import {useParams} from "react-router-dom";
import {useEffect} from "react";
import {useContext} from "react";
import Context from "./context";

export default function Investments(props) {
    const {isEng} = useContext(Context);

    const investments = props.location.state.investments;
    const fp = props.location.state.fp;

    return (
        <div style={{width: "80%", margin: "0 auto", marginTop: "130px", color: "#fff"}}>
            {console.log(props.location.state)}
            <h2 style={{marginBottom: "20px"}}>{isEng ? "Investments in the " : "Участники финансирования "} "{fp.title}"</h2>
            <table className="table" style={{color: "#fff", marginBottom: "40px"}}>
                <thead>
                <tr>
                    <th scope="col">{isEng ? "Username": "Имя пользователя"}</th>
                    <th scope="col">{isEng ? "Email" : "Почта"}</th>
                    <th scope="col">{isEng ? "Ethereum account" : "Аккаунт Ethereum"}</th>
                    <th scope="col">ETH</th>
                </tr>
                </thead>
                <tbody>
                {investments.map(investment => {
                    return <tr>
                        <td scope="row">{investment.investor.username}</td>
                        <td>{investment.investor.email}</td>
                        <td>{investment.fromEthereumAddress}</td>
                        <td>{investment.ethAmount}</td>
                    </tr>
                })}
                </tbody>
            </table>
        </div>
    )
}