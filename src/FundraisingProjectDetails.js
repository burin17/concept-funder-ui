import React, {useLayoutEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.css';
import {useEffect} from "react";
import web3 from './contract/web3';
import {useHistory, useParams} from "react-router-dom";
import PayoutRequest from "./PayoutRequest"
import './fundraisingProjects.css';
import crowdfundProject from './contract/crowdfundProjectInstance';
import {useLocation} from "react-router-dom";
import {node} from "prop-types";
import './loading.css';

export default function FundraisingProjectDetails() {
    const history = useHistory();
    const locationData = useLocation();
    const {fpId} = useParams();
    const [fProj, setFp] = React.useState();
    const [payoutRequests, setPayoutRequests] = React.useState([]);
    const [currentUser, setCurrentUser] = React.useState();
    const [accounts, setAccounts] = React.useState([]);
    const [isLoaded, loaded] = React.useState(false);
    const [isDurationAvailable, setIsDurationAvailable] = React.useState(false);
    const [moderationFiles, setModerationFiles] = React.useState();
    const [images, setImages] = React.useState();
    const [otherFiles, setOtherFiles] = React.useState();
    const [activeTab, setActiveTab] = React.useState('RFPO');
    const [loading, setLoading] = React.useState(false);
    const [rfpoLoading, setRfpoLoading] = React.useState(false);

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

        if (locationData.state.isModeration) {
            await fetch(`http://localhost:18080/api/fundraising-projects/moderation-files/` + fpId,
                {
                    method: 'GET',
                    headers: new Headers({
                        "Authorization": sessionStorage.jwtToken
                    })
                })
                .then(response => {
                    if (response.status === 200) {
                        return response.json()
                    } else return undefined;
                })
                .then(data => {
                    setModerationFiles(data);
                });
        }

        await fetch(`http://localhost:18080/api/fundraising-projects/image-files/` + fpId,
            {
                method: 'GET',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            })
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                } else return undefined;
            })
            .then(data => {
                setImages(data);
            });

        await fetch(`http://localhost:18080/api/fundraising-projects/other-files/` + fpId,
            {
                method: 'GET',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            })
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                } else return undefined;
            })
            .then(data => {
                setOtherFiles(data);
            });

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
        if (!/^[\d.]+$/.test(ethAmount)) {
            document.getElementById("ethAmount").value = "";
            alert("Ether amount must be float");
        } else {
            setLoading(true);

            const contractAddress = fProj.contractAddress;
            await crowdfundProject(contractAddress).methods.contribute().send({
                from: accounts[0],
                value: web3.utils.toWei(String(ethAmount), 'ether'),
            }).then((res) => {
                setLoading(false);
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
                })
                .catch(() => setLoading(false));
        }
    }

    function setRPFormVisibility(isVisible) {
        if (isVisible) {
            document.getElementById("formWrapper").style.display = "flex";
        } else {
            document.getElementById("formWrapper").style.display = "none";
        }
    }

    async function requestPayout() {
        let currentlyRequested = 0;
        payoutRequests.map(payoutRequest => {
            currentlyRequested += payoutRequest.ethAmount;
        })
        const remainEth = fProj.currentAmount - currentlyRequested;
        const ethAmount = document.getElementById("etherAmount").value;
        const intention = document.getElementById("intention").value;
        const reporting = document.getElementById("reporting").value;
        const days = document.getElementById("days").value;
        if (!/^[\d.]+$/.test(ethAmount)) {
            document.getElementById("errorMessage").style.display = "block";
            document.getElementById("errorMessage").innerText = "Ether amount field must be float";
        } else if (!/^[\d]+$/.test(days)) {
            document.getElementById("errorMessage").style.display = "block";
            document.getElementById("errorMessage").innerText = "Days field must be integer";
        } else if (ethAmount === "" || intention === "" || reporting === "" || days === "") {
            document.getElementById("errorMessage").style.display = "block";
            document.getElementById("errorMessage").innerText = "Please fill all mandatory fields";
        } else if (ethAmount > remainEth) {
            document.getElementById("errorMessage").style.display = "block";
            document.getElementById("errorMessage").innerText = "Ether amount exceed remains ether on smart-contract";
        } else {
            setRfpoLoading(true);
            let requiredCountOfApproves;
            document.getElementById("errorMessage").style.display = "none";
            document.getElementById("errorMessage").innerText = "";
            let requestIdx = await crowdfundProject(fProj.contractAddress).methods.payOutRequst(
                web3.utils.toWei(String(ethAmount), 'ether'), days
            ).send({
                from: accounts[0],
            }).then(res => {
                console.log(res.events.PayoutRequestCreated.returnValues);
                requiredCountOfApproves = Math.floor(res.events.PayoutRequestCreated.returnValues.requiredCountOfApproves / 2) + 1;
                return res.events.PayoutRequestCreated.returnValues.requestIdx;
            }).catch(() => setRfpoLoading(false));

            // update balance when payout happens
            // await fetch("http://localhost:18080/fundraising-projects//updateCurrentBalance?id = " + fpId
            //     + "&currentBalance=" + )
            if (requestIdx > -1) {
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
                        setRfpoLoading(false);
                        document.getElementById("formWrapper").style.display = "none";
                        document.getElementById("etherAmount").value = "";
                        document.getElementById("intention").value = "";
                        document.getElementById("reporting").value = "";
                        document.getElementById("days").value = "";
                    });
            }
        }
    }

    function downloadFile(file) {
        fetch(file.url, {
            method: "GET",
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken,
            }),
        }).then((res) => { return res.blob(); })
            .then((data) => {
                const a = document.createElement("a");
                a.href = window.URL.createObjectURL(data);
                a.download = file.name;
                a.click();
            });
    }

    function createVkPost() {
        window.open(`https://vk.com/share.php?url=${document.URL}&title=${fProj.title}`,
            '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
    }

    function sendTelegram() {
        window.open(`https://telegram.me/share/url?url=${document.URL}&text=${fProj.title}`,
            '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
    }

    function block() {
        fetch("http://localhost:18080/moderation/block/" + fProj.fundraisingProjectId, {
            method: "POST",
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken,
            }),
        }).then(resp => resp.json())
            .then(data => setFp(data))
            .then(() => history.push('/fundraising-projects'))
    }

    return (
        <div>
            <li>
                <div id="formWrapper" className="auth-wrapper" style={{position: "absolute", display: "none"}}>
                    <div className="auth-inner">
                        <div id="errorMessage" style={{display: "none", color:"red", textAlign: "center", marginBottom: "5px"}}></div>
                        <form>
                            <h3>Request for payout</h3>

                            <div className="form-group">
                                <label>Ether amount</label>
                                <input id="etherAmount" type="text" className="form-control" placeholder="Ether amount" />
                            </div>

                            <div className="form-group">
                                <label>Intention</label>
                                <textarea id="intention" className="form-control" placeholder="Intention" style={{height: "150px"}}/>
                            </div>

                            <div className="form-group">
                                <label>Reporting</label>
                                <textarea id="reporting" className="form-control" placeholder="Reporting" style={{height: "150px"}}/>
                            </div>

                            <div className="form-group">
                                <label>Days</label>
                                <input id="days" type="text" className="form-control" placeholder="Days" />
                            </div>

                            <br/>
                            <button type="button" className="btn btn-primary btn-block" onClick={() => requestPayout()}>Request</button>
                            {rfpoLoading &&
                                <div className="loader" style={{position: "absolute", left: "836px", bottom: "198px"}}></div>
                            }
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
                    <div style={{display: "flex", justifyContent: "space-between", width: "96%"}}>
                        <div className="p-3">{fProj.tags.map(tag => "#" + tag + " ")}</div>
                        <div style={{display: "flex", marginTop: "14px"}}>
                            <div>
                                <img id="vkImg" src="/images/vk.png" width="40" onClick={createVkPost}/>
                            </div>
                            <div>
                                <img id="vkImg" src="/images/tg.png" width="43" onClick={sendTelegram}/>
                            </div>
                        </div>
                    </div>
                    {fProj.founder.id != currentUser.id && currentUser.id !== undefined && currentUser.role === "USER" &&
                        <div style={{display: "flex"}}>
                            <div className="input-group m-2 w-25">
                                <input id="ethAmount" type="text" className="form-control" placeholder="ETH amount"
                                       aria-label="ETH amount" aria-describedby="basic-addon2"/>
                                <button id="startBtn" type="button" className="btn btn-primary"
                                        onClick={() => invest()}>Contribute
                                </button>
                            </div>
                            {loading &&
                                <div className="loader"></div>
                            }
                        </div>
                    }
                    {currentUser.id !== undefined && currentUser.role === "ADMIN" &&
                        <button id="startBtn" type="button" className="m-2 btn btn-danger"
                                onClick={block}>Block</button>
                    }
                    {fProj.founder.id == currentUser.id && fProj.status == "FINANCED" &&
                        <button id="startBtn" type="button" className="m-2 btn btn-primary"
                                onClick={() => setRPFormVisibility(true)}>Request payout</button>
                    }
                </div>
            </li>
            <div id="tabsWrapper">
                <div id="storyTab" onClick={() => {
                    setActiveTab("Story");
                    for (let i = 0; i < document.getElementById("tabsWrapper").children.length; i++) {
                        document.getElementById("tabsWrapper").children[i].style.color = '#fff';
                    }
                    document.getElementById("storyTab").style.color = '#000';
                }}>
                    Story
                </div>
                <div id="rfpoTab" onClick={() => {
                    setActiveTab("RFPO");
                    for (let i = 0; i < document.getElementById("tabsWrapper").children.length; i++) {
                        document.getElementById("tabsWrapper").children[i].style.color = '#fff';
                    }
                    document.getElementById("rfpoTab").style.color = '#000';
                }}>
                    Requests for payout
                </div>
                <div id="imagesTab" onClick={() => {
                    setActiveTab("Images");
                    for (let i = 0; i < document.getElementById("tabsWrapper").children.length; i++) {
                        document.getElementById("tabsWrapper").children[i].style.color = '#fff';
                    }
                    document.getElementById("imagesTab").style.color = '#000';
                }}>Images</div>
                <div id="videosTab" onClick={() => {
                    setActiveTab("Videos");
                    for (let i = 0; i < document.getElementById("tabsWrapper").children.length; i++) {
                        document.getElementById("tabsWrapper").children[i].style.color = '#fff';
                    }
                    document.getElementById("videosTab").style.color = '#000';
                }}>Videos</div>
                <div id="otherFilesTab" onClick={() => {
                    setActiveTab("Other");
                    for (let i = 0; i < document.getElementById("tabsWrapper").children.length; i++) {
                        document.getElementById("tabsWrapper").children[i].style.color = '#fff';
                    }
                    document.getElementById("otherFilesTab").style.color = '#000';
                }}>Other files</div>
                {locationData.state.isModeration &&
                    <div id="moderationFilesTab" onClick={() => {
                        setActiveTab("Moderation");
                        for (let i = 0; i < document.getElementById("tabsWrapper").children.length; i++) {
                            document.getElementById("tabsWrapper").children[i].style.color = '#fff';
                        }
                        document.getElementById("moderationFilesTab").style.color = '#000';
                    }}>Moderation</div>
                }
            </div>
            {activeTab === 'Story' &&
                <div style={{whiteSpace: "pre-line"}} className="bg-light m-5 p-3 fpWrapper">
                    {fProj.story}
                </div>
            }
            {payoutRequests.length > 0 && activeTab === 'RFPO' &&
                <div>
                    <ul style={{listStyle: "none"}}>
                        {payoutRequests.map(payoutRequest => {
                            return <PayoutRequest pr={payoutRequest} fpId={fProj.fundraisingProjectId} account={accounts[0]} currentUserId={currentUser.id}
                            fpContractAddress={fProj.contractAddress}/>
                        })}
                    </ul>
                </div>
            }
            {activeTab === 'Other' && otherFiles &&
                <div>
                    <ul style={{listStyle: "none"}}>
                        {otherFiles.map(file => {
                                return <li style={{marginLeft: "25px"}}>
                                    <span style={{color: "#000", textDecoration: "none"}}>
                                        {file.name}
                                    </span>
                                    <button id="startBtn" type="button" className="m-2 btn btn-light" onClick={() => downloadFile(file)}>Download</button>
                                </li>
                            })
                        }
                    </ul>
                </div>
            }
            {activeTab === 'Images' && images &&
                <div>
                    <ul style={{listStyle: "none"}}>
                        {images.map(file => {
                                return <li style={{margin: "25px", textAlign: "center"}}>
                                    <img style={{width:"100%", maxWidth: "1400px"}} src={file.url} alt="img"/>
                                </li>
                            })
                        }
                    </ul>
                </div>
            }
            {activeTab === 'Moderation' && moderationFiles &&
                <div>
                    <div className="bg-light m-5 p-3 fpWrapper">
                        {fProj.moderationNotes}
                    </div>
                    <div id="moderationFilesWrapper">
                        <ul style={{listStyle: "none"}}>
                            {moderationFiles.map(file => {
                                return <li style={{marginLeft: "25px"}}>
                                    <span style={{color: "#000", textDecoration: "none"}}>
                                        {file.name}
                                    </span>
                                    <button id="startBtn" type="button" className="m-2 btn btn-light" onClick={() => downloadFile(file)}>Download</button>
                                </li>
                                })
                            }
                        </ul>
                    </div>
                </div>
            }
            {activeTab === 'Videos' &&
                <div>
                    <div id="youtubeVideosWrapper">
                        <ul style={{listStyle: "none"}}>
                            {fProj.youtubeLinks.map(link => {
                                return <li style={{width: "56%", margin: "40px auto"}}>
                                            <div>
                                                {console.log(link)}
                                                <iframe
                                                    src={link}
                                                    frameBorder="0"
                                                    allow="autoplay; encrypted-media"
                                                    allowFullScreen
                                                    title="video"
                                                    width="1000px"
                                                    height="600px"
                                                />
                                                {" "}
                                            </div>
                                        </li>
                            })
                            }
                        </ul>
                    </div>
                </div>
            }

        </div>
    )
}