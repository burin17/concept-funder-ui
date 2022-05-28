import React, {useState} from "react";
import 'bootstrap/dist/css/bootstrap.css';
import {useParams} from "react-router-dom";
import {useEffect} from "react";
import {useContext} from "react";
import Context from "./context";

export default function UserInfo(props) {
    const {isEng} = useContext(Context);
    const user = props.location.state;
    const {userId} = useParams();
    const [investments, setInvestments] = useState([]);
    const [total, setTotal] = useState();

    useEffect(() => {
        loadData();
    },[]);

    function loadData() {
        console.log(user);
        fetch("http://localhost:18080/user/investments/" + userId, {
            method: 'GET',
            headers: new Headers({
            "Authorization": sessionStorage.jwtToken
            })
        }).then(resp => resp.json())
            .then(data => {
                setInvestments(data);
                let totallyContributed = 0;
                data.map(i => totallyContributed += i.ethAmount);
                setTotal(totallyContributed);
            })
    }

    return (
        <div style={{width: "80%", margin: "0 auto", marginTop: "130px", color: "#fff"}}>
            <h2 style={{marginBottom: "20px"}}>{user.username}</h2>
            <table className="table" style={{color: "#fff", marginBottom: "40px"}}>
                <thead>
                <tr>
                    <th scope="col">{isEng ? "Crowdfunding Company" : "Кампания"}</th>
                    <th scope="col">ETH</th>
                </tr>
                </thead>
                <tbody>
                {investments.map(investment => {
                    return <tr>
                            <th scope="row">{investment.fundraisingProject.title}</th>
                            <td>{investment.ethAmount}</td>
                           </tr>
                })}
                </tbody>
            </table>
            {total !== undefined &&
                <h2>{isEng ? "Totally contributed" : "Всего"}: {total.toString().substring(0, 7)}</h2>
            }
        </div>
    )
}