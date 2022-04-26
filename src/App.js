import React from 'react'
import Login from "./Login";
import Register from "./Register";
import CreateFP from "./FundraisingProject/CreateFP";
import SelfProfile from "./SelfProfile";
import FundraisingProjects from "./FundraisingProject/FundraisingProjects";
import './App.css';
import {BrowserRouter, Route, Switch, Link, useHistory, withRouter, Redirect} from "react-router-dom";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Moderation from "./Moderation";
import FundraisingProjectDetails from "./FundraisingProject/FundraisingProjectDetails";
import {useEffect, useState} from "react";
import Context from "./context";


function App() {
    const [loaded, isLoaded] = useState(false);
    const [currentUser, setCurrentUser] = useState();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    function logOut() {
        sessionStorage.removeItem("jwtToken")
        setIsLoggedIn(false);
    }

    useEffect(() =>{
        loadCurrentUser();
    },[]);

     function loadCurrentUser() {
        fetch(`http://localhost:18080/user/selfProfile`,
            {
                method: 'GET',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            })
            .then(response => {
                if (response.status == "403") {
                    setIsLoggedIn(false);
                    return undefined;
                } else {
                    setIsLoggedIn(true);
                    return response.json();
                }
            }).then(data => {
                setCurrentUser(data);
            }).then(data => {
                isLoaded(true);
            });
    }

    if (loaded === false) {
        return <div></div>
    }

    return (
        <Context.Provider value={{loadCurrentUser}}>
            <BrowserRouter>
                <div className="App">
                    <nav className="navbar navbar-expand-lg navbar-light fixed-top">
                        <div className="container">
                            <Link className="navbar-brand" to={"/sign-in"}>ConceptFunder</Link>
                            <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
                                <ul className="navbar-nav ml-auto">
                                    <li className="nav-item">
                                        <Link className="nav-link" to={"/fundraising-projects"}>Fundraising Projects</Link>
                                    </li>
                                    {isLoggedIn &&
                                        <li className="nav-item">
                                            <Link className="nav-link" to={"/start-fundraising-project"}>Start Fundraising Project</Link>
                                        </li>
                                    }
                                    {isLoggedIn && currentUser.role === "ADMIN" &&
                                        <li className="nav-item">
                                            <Link className="nav-link"
                                                  to={"/moderate-fundraising-project"}>Moderation</Link>
                                        </li>
                                    }
                                    {isLoggedIn &&
                                        <li className="nav-item">
                                            <Link className="nav-link" to={"/self-profile"}>SelfProfile</Link>
                                        </li>
                                    }
                                    {!isLoggedIn &&
                                        <li className="nav-item">
                                            <Link className="nav-link" to={"/sign-in"}>Login</Link>
                                        </li>
                                    }
                                    {!isLoggedIn &&
                                        <li className="nav-item">
                                        <Link id="signIn" className="nav-link" to={"/register"}>Sign up</Link>
                                        </li>
                                    }
                                    {isLoggedIn &&
                                        <li className="nav-item">
                                            <Link className="nav-link" onClick={() => logOut()}>Log out</Link>
                                        </li>
                                    }
                                </ul>
                            </div>
                        </div>
                    </nav>

                    <Switch>
                        <Route path="/sign-in" component={Login} />
                        <Route path="/register" component={Register} />
                        <Route path="/start-fundraising-project" component={CreateFP} />
                        <Route path="/moderate-fundraising-project" component={Moderation} />
                        <Route path="/fundraising-projects" component={FundraisingProjects}></Route>
                        <Route path="/self-profile" component={SelfProfile} />
                        <Route path="/fundraising-project-details/:fpId" component={FundraisingProjectDetails}/>
                    </Switch>
                </div>
            </BrowserRouter>
        </Context.Provider>
    );
}


export default withRouter(App);
