import React, {Component, useContext} from "react";

import Context from "./context";

export default class Register extends Component {

    async handleRegister(firstName, lastName, patronymic, email, username, password) {

        if (firstName === '' || lastName === '' || email === '' || username === '' || password === '') {
            document.getElementById("errorMessage").style.display = "block";
            document.getElementById("errorMessage").innerText = "Please fill all mandatory fields";
        } else {
            fetch(`http://localhost:18080/register`, {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(
                    {
                        "firstName": firstName,
                        "lastName": lastName,
                        "patronymic": patronymic,
                        "email": email,
                        "username": username,
                        "password": password
                    }
                )
            }).then(response => {
                if (response.status === 409) {
                    document.getElementById("errorMessage").style.display = "block";
                    response.json().then(json => {
                        document.getElementById("errorMessage").innerText = json[Object.keys(json)[0]];
                    })
                } else {
                    document.getElementById("errorMessage").style.display = "none";
                    document.getElementById("errorMessage").innerText = "";
                    this.props.history.push({
                        pathname: `/sign-in`
                    });
                }
            });
        }
    }

    render() {

        return (
            <div className="auth-wrapper">
                <div className="auth-inner">
                    <div id="errorMessage" style={{display: "none", color:"red", textAlign: "center", marginBottom: "5px"}}></div>
                    <form>
                        <h3>{this.context.isEng ? "Sign Up" : "Регистрация"}</h3>
                        <div className="form-group">
                            <label>{this.context.isEng ? "First name" : "Имя"}</label>
                            <input id="firstName" type="text" className="form-control"/>
                        </div>

                        <div className="form-group">
                            <label>{this.context.isEng ? "Last name" : "Фамилия"}</label>
                            <input id="lastName" type="text" className="form-control"/>
                        </div>

                        <div className="form-group">
                            <label>{this.context.isEng ? "Patronymic" : "Отчество"}</label>
                            <input id="patronymic" type="text" className="form-control"/>
                        </div>

                        <div className="form-group">
                            <label>{this.context.isEng ? "Email" : "Почта"}</label>
                            <input id="email" type="email" className="form-control"/>
                        </div>

                        <div className="form-group">
                            <label>{this.context.isEng ? "Username" : "Логин"}</label>
                            <input id="username" type="email" className="form-control"/>
                        </div>


                        <div className="form-group">
                            <label>{this.context.isEng ? "Password" : "Пароль"}</label>
                            <input id="password" type="password" className="form-control"/>
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
                                )}>{this.context.isEng ? "Sign Up" : "Зарегистрироваться"}</button>
                    </form>
                </div>
            </div>
        );
    }
}