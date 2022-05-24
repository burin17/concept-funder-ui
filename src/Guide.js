import React from 'react'
import {Link, useParams} from "react-router-dom";

export default function Guide() {
    const chat = useParams().isChatAvailable;

    return (
        <div>
            <li style={{marginLeft: 35}}>
                <div className="bg-light m-5 p-3 fpWrapper">
                    <h2 className="p-3">Prerequisite</h2>
                    <div style={{whiteSpace: "pre-line", marginLeft: "17px"}}>
                        To use the main functionality of the ConceptFunder: <br/>
                        1. Creation of a crowdfunding company <br/>
                        2. Participation in financing crowdfunding companies <br/>
                        it is necessary to have MetaMask browser extension with adjusted wallet and ehtereum account. During first visit of site MetaMask suggest to connect Ethereum account: <br/><br/>
                        1. <br/><img style={{border: "1px #888 solid"}} src="/images/connection1.png" alt="connection"/><br/><br/>
                        2. <br/><img style={{border: "1px #888 solid"}} src="/images/connection2.png" alt="connection"/><br/><br/>
                        Connected account will be used to accomblish interaction with contract: <br/>
                        - Creation crowdfunsing company <br/>
                        - Participating in crowdfunding company <br/>
                        - Creation request for payout <br/>
                        - Approve request for payout <br/>
                        <strong>If you have some questions you can ask for help.</strong>
                    </div>
                </div>
                <div className="bg-light m-5 p-3 fpWrapper">
                    <h2 className="p-3">How to create your first crowdfunding campaign</h2>
                    <div style={{whiteSpace: "pre-line", marginLeft: "17px"}}>
                        To create crowdfunding company press 'Start Fundraising Project' on top panel: <br/><br/>
                        <img src="/images/startFp1.png" alt="img"/><br/><br/>
                        After that you should fill form and specify: <br/>
                        - Title <br/>
                        - Brief description <br/>
                        - Goal of company <br/>
                        - Days to achieve goal <br/>
                        - Advanced story of project <br/>
                        Optionally you can specify links for youtube videos, upload images and files which will be accessible for viewers. Also you can add notes and files for moderation.

                        After you have created crowdfunding company you should wait for approval by moderator. It is preferably to specify communication channel in 'Moderation notes'.

                        If request for creation crowdfunding company approved your project you can start crowdfunding company by pressing: <br/><br/>
                        <img src="/images/startFp3.png" alt="img"/><br/><br/>
                        Then MetaMask window should appears: <br/><br/>
                        <img src="/images/startFp4.png" alt="img"/><br/><br/>

                        By pressing 'Confirm' button smart-contract connected with your project will be deployed and <strong>gas (small commission pay) will be deducted from account</strong>.

                        Deployment may take a time. When ethereum transaction finished, you project will be available for viewing by other users.

                        If company goal achieved you will have ability to request pay out <strong>(gas required)</strong> by press this button on company page: <br/><br/>
                        <img src="/images/startFp2.png" alt="img"/> <br/><br/>

                        You should specify: <br/>
                        - Ether amount <br/>
                        - Intention <br/>
                        - Reporting <br/>
                        - Days <br/>


                        Then participants of you company can approve your request. It is required that more then 50% of participants approve request. In this case requested amount of ethereum will be send to your account. When you achieve your goal you can attach report for request to earn the trust of the participants of financing. <br/>
                        <strong>If you have some questions you can ask for help.</strong>
                    </div>
                </div>
                <div className="bg-light m-5 p-3 fpWrapper">
                    <h2 className="p-3">How to help carry out the project</h2>
                    <div style={{whiteSpace: "pre-line", marginLeft: "17px"}}>
                        If you found interesting project you can become a participant of financing by specifying ethereum amount and pressing button <strong>(gas required)</strong>: <br/><br/>
                        <img src="/images/c1.png" alt="img"/><br/><br/>

                        When project achieve goal and founder create request for payout you can approve it <strong>(gas required)</strong>: <br/><br/>
                        <img src="/images/c2.png" alt="img"/><br/><br/>

                        Further you can check founder's report for payout request: <br/><br/>
                        <img src="/images/c3.png" alt="img"/><br/><br/>

                        If crowdfunding company goal will not be achieved you will get refund all ethereum which you specify for participation. <br/>
                        <strong>If you have some questions you can ask for help.</strong>
                    </div>
                </div>
                {chat === 'true' &&
                    <Link to="/messenger">
                        <button type="button" className="btn btn-light" style={{marginLeft: "45%"}}>Ask for help
                        </button>
                    </Link>
                }
            </li>
        </div>
    )
}
