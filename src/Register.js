import React, { Component } from "react";

export default class Register extends Component {
    async handleRegister(firstName, lastName, patronymic, email, username, password) {
        fetch(`http://localhost:18080/register`, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(
                {  "firstName": firstName,
                        "lastName": lastName,
                        "patronymic": patronymic,
                        "email": email,
                        "username": username,
                        "password": password}
            )
        }).then(response => response.json())
            .then(json => {console.log(json)});
    }

    render() {
        return (
            <div className="auth-wrapper">
                <div className="auth-inner">
                    <form>
                        <h3>Sign Up</h3>

                        <div className="form-group">
                            <label>First name</label>
                            <input id="firstName" type="text" className="form-control" placeholder="First name" />
                        </div>

                        <div className="form-group">
                            <label>Last name</label>
                            <input id="lastName" type="text" className="form-control" placeholder="Last name" />
                        </div>

                        <div className="form-group">
                            <label>Patronymic</label>
                            <input id="patronymic" type="text" className="form-control" placeholder="Patronymic" />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input id="email" type="email" className="form-control" placeholder="Email" />
                        </div>

                        <div className="form-group">
                            <label>Username</label>
                            <input id="username" type="email" className="form-control" placeholder="Username" />
                        </div>


                        <div className="form-group">
                            <label>Password</label>
                            <input id="password" type="password" className="form-control" placeholder="Enter password" />
                        </div>
                        <br/>
                        <button type="button" className="btn btn-primary btn-block"
                                onClick={(event) => this.handleRegister(
                                    document.getElementById('firstName').value,
                                    document.getElementById('lastName').value,
                                    document.getElementById('patronymic').value,
                                    document.getElementById('email').value,
                                    document.getElementById('username').value,
                                    document.getElementById('password').value
                                )}>Sign Up</button>
                        <p className="forgot-password text-right">
                            Already registered <a href="#">sign in?</a>
                        </p>
                    </form>
                </div>
            </div>
        );
    }
}