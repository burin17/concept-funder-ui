import React, { Component } from "react";
import "./Login.css";
import 'bootstrap/dist/css/bootstrap.css';
import Context from "./context";

export default function Login() {
    const {loadCurrentUser} = React.useContext(Context);

    async function handleLogin(username, password) {
        await fetch(`http://localhost:18080/auth`, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({"username": username, "password": password})
        }).then(response => response.json())
            .then(json => {
                console.log(json["jwt"]);
                sessionStorage.setItem("jwtToken", "Bearer_" + json["jwt"]);
            }).then(() => loadCurrentUser());
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-inner">
                <form>
                    <h3>Sign In</h3>

                    <div className="form-group">
                        <label>Username</label>
                        <input id="username" className="form-control" placeholder="Enter username" />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input id="password" type="password" className="form-control" placeholder="Enter password" />
                    </div>

                    <div className="form-group">
                        <div className="custom-control custom-checkbox">
                            <input type="checkbox" className="custom-control-input" id="customCheck1" />
                            <label className="custom-control-label" htmlFor="customCheck1">Remember me</label>
                        </div>
                    </div>
                    <br/>
                    <button type="button" className="btn btn-primary btn-block"
                            onClick={(event) =>
                                handleLogin(document.getElementById('username').value,
                                    document.getElementById('password').value)}>Submit</button>
                    <p className="forgot-password text-right">
                        Forgot <a href="#">password?</a>
                    </p>
                </form>
            </div>
        </div>
    );
}