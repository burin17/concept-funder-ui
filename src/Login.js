import React, { Component } from "react";
import "./Login.css";
import 'bootstrap/dist/css/bootstrap.css';
import Context from "./context";
import { useHistory } from "react-router-dom";
import {useContext} from "react";

export default function Login() {
    const {isEng} = useContext(Context);
    const history = useHistory();
    const {loadCurrentUser} = React.useContext(Context);

    async function handleLogin(username, password) {
        await fetch(`http://localhost:18080/auth`, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({"username": username, "password": password})
        }).then(response => {
            if (response.status === 200) {
                return response.json()
            } else {

                return undefined;
            }
        }).then(json => {
                if (json !== undefined) {
                    document.getElementById("errorMessage").style.display = "none";
                    document.getElementById("errorMessage").innerText = "";
                    sessionStorage.setItem("jwtToken", "Bearer_" + json["jwt"]);
                    return "";
                } else {
                    document.getElementById("errorMessage").style.display = "block";
                    document.getElementById("errorMessage").innerText = "Invalid username or password";
                    return undefined;
                }
            }).then((res) => {
                if (res !== undefined) {
                    loadCurrentUser();
                }
                return res;
            }).then(res => {
                if (res !== undefined) {
                    history.push('/fundraising-projects')
                }
        });
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-inner">
                <div id="errorMessage" style={{display: "none", color:"red", textAlign: "center", marginBottom: "10px"}}></div>
                <form>
                    <h3>{isEng ? "Sign In" : "Войти"}</h3>

                    <div className="form-group">
                        <label>{isEng ? "Username" : "Логин"}</label>
                        <input id="username" className="form-control"/>
                    </div>
                    <div className="form-group">
                        <label>{isEng ? "Password" : "Пароль"}</label>
                        <input id="password" type="password" className="form-control"/>
                    </div>

                    <br/>
                    <button type="button" className="btn btn-primary btn-block"
                            onClick={(event) =>
                                handleLogin(document.getElementById('username').value,
                                    document.getElementById('password').value)}>{isEng ? "Submit" : "Войти"}</button>
                </form>
            </div>
        </div>
    );
}