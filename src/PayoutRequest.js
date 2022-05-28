import React, {useState} from "react";
import 'bootstrap/dist/css/bootstrap.css';
import {useEffect} from "react";
import web3 from "./contract/web3";
import crowdfundProject from './contract/crowdfundProjectInstance';
import data from "bootstrap/js/src/dom/data";
import './loading.css';
import {useContext} from "react";
import Context from "./context";

export default function PayoutRequest({pr, fpId, account, currentUserId, fpContractAddress}) {
    const {isEng} = useContext(Context);
    const [payoutRequest, setPayoutRequest] = React.useState(pr);
    const [isInvestor, setIsInvestor] = React.useState(false);
    const [isApproved, setIsApproved] = React.useState(false);
    const [reportFilesToSend, setReportFilesToSend] = useState([]);
    const [reportFiles, setReportFiles] = useState([]);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [approveLoading, setApproveLoading] = useState(false);

    useEffect(() =>{
        setPayoutRequest(pr);
        console.log(pr);
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

        await fetch(`http://localhost:18080/api/payout-requests/report-files/` + pr.id,
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
                setReportFiles(data);
            })
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


    function approve() {
        setApproveLoading(true);
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
            setApproveLoading(false);
        }).catch(() => setApproveLoading(false));
    }

    function setReportFormVisibility(isVisible) {
        if (isVisible) {
            document.getElementById("reportFormWrapper").style.display = "flex";
        } else {
            document.getElementById("reportFormWrapper").style.display = "none";
        }
    }

    function addReport() {
        const reportFormData = new FormData();
        if (reportFilesToSend.length > 0) {
            for (const file of reportFilesToSend) {
                reportFormData.append("files", file);
            }
        }
        const notes = document.getElementById("reportNotes").value;
        fetch("http://localhost:18080/api/payout-requests/addReport/" + payoutRequest.id + "?notes=" + notes, {
            method: "PUT",
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken
            }),
            body: reportFormData
        }).then(resp => resp.json())
            .then(data => setPayoutRequest(data))
            .then(() => {
                fetch(`http://localhost:18080/api/payout-requests/report-files/` + pr.id,
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
                        setReportFiles(data);
                    });
            })
            .then(() => setReportFormVisibility(false))
    }

    function addReportFile(event) {
        setReportFilesToSend([...reportFilesToSend,event.target.files[0]]);
        document.getElementById("selectedReportFilesWrapper").style.display = "block";
        document.getElementById("selectedReportFilesWrapper").innerHTML +=
            `<div>${event.target.files[0].name}</div>`
        event.target.value = '';
    }

    function checkReport() {
        if (!isReportVisible) {
            document.getElementById("checkReport").innerText = isEng ? "Close report" : "Закрыть отчет";
            setIsReportVisible(true);
        } else {
            document.getElementById("checkReport").innerText = isEng ? "Check report" : "Посмотреть отчет";
            setIsReportVisible(false);
        }
    }

    return (
        <li key={pr} style={{marginLeft: "-30px"}}>
            <div id="reportFormWrapper" className="auth-wrapper" style={{position: "fixed", top: "-50px", display: "none"}}>
                <div className="auth-inner">
                    <form>
                        <h3>{isEng ? "Add report" : "Добавить отчет"}</h3>

                        <div className="form-group">
                            <label>{isEng ? "Notes" : "Комментарии"}</label>
                            <textarea id="reportNotes" className="form-control" placeholder={isEng ? "Notes" : "Комментарии"} style={{height: "150px"}}/>
                        </div>

                        <div id="reportFilesWrapper" className="form-group">
                            <label>{isEng ? "Attach files" : "Прикрепить файл"}</label><br/>
                            <input type="file" onChange={addReportFile}/>
                        </div>

                        <div id="selectedReportFilesWrapper" style={{display: 'none'}}>
                            <label>{isEng ? "Files": "Файлы"}</label>
                        </div>

                        <br/>
                        <button type="button" className="btn btn-primary btn-block" onClick={() => addReport()}>{isEng ? "Save" : "Сохранить"}</button>
                        <button type="button" className="btn btn-secondary btn-block" style={{marginLeft: "135px", position: "absolute"}}
                                onClick={() => setReportFormVisibility(false)}>{isEng ? "Cancel" : "Отменить"}</button>
                    </form>
                </div>
            </div>

            <div className="bg-light m-5 p-3 fpWrapper" style={{borderRadius: "15px"}}>
                <h3 className="p-3">{isEng ? "Requested sum" : "Запрашиваемая сумма"}: {payoutRequest.ethAmount}</h3>
                <div className="p-3">{isEng ? "Intention" : "Цель"}: {payoutRequest.intention}</div>
                <div className="p-3">{isEng ? "Promised report" : "Обещанный отчет"}: {payoutRequest.reporting}</div>
                <div className="row p-3">
                    <div className="col-sm">{isEng ? "Due date" : "Срок"}: {payoutRequest.achieveBy.substring(0, payoutRequest.achieveBy.indexOf('T'))}</div>
                    <div className="col-sm">{isEng ? "Count of approves" : "Кол-во подтверждений"}: {payoutRequest.countOfApproves}</div>
                    <div className="col-sm">{isEng ? "Required amount of approves" : "Необходимое кол-во подтверждений"}: {payoutRequest.requiredAmountOfApproves}</div>
                    {payoutRequest.countOfApproves >= payoutRequest.requiredAmountOfApproves && payoutRequest.reportNotes === null &&
                        <div className="col-sm">{isEng ? "STATUS: PAID OUT" : "СТАТУС : ВЫПЛАЧЕНО"}</div>
                    }
                    {payoutRequest.countOfApproves < payoutRequest.requiredAmountOfApproves && payoutRequest.reportNotes === null &&
                        <div className="col-sm">{isEng ? "STATUS: WAITING FOR APPROVE" : "СТАТУС : ОЖИДАЕТ ПОДТВЕРЖДЕНИЯ"}</div>
                    }
                    {payoutRequest.reportNotes !== null &&
                        <div className="col-sm">{isEng ? "STATUS: REPORTED" : "СТАТУС : ОТЧЕТ ЗАГРУЖЕН"}</div>
                    }
                </div>
                {payoutRequest.reportNotes !== null &&
                    <div>

                    </div>
                }
                {isInvestor && !isApproved && payoutRequest.countOfApproves < payoutRequest.requiredAmountOfApproves &&
                    <div style={{display: "flex"}}>
                        <button id="startBtn" type="button" className="m-2 btn btn-primary" onClick={() => approve()}>{isEng ? "Approve" : "Подтвердить"}</button>
                        {approveLoading &&
                            <div className="loader"></div>
                        }
                    </div>
                }
                {currentUserId === payoutRequest.fundraisingProject.founder.id && payoutRequest.reportNotes === null && payoutRequest.countOfApproves >= payoutRequest.requiredAmountOfApproves &&
                    <div>
                        <button id="addReport" type="button" className="m-2 btn btn-primary" onClick={() => setReportFormVisibility(true)}>{isEng ? "Add report" : "Добавить отчет"}</button>
                    </div>
                }

                {isReportVisible &&
                    <div>
                        <div style={{marginLeft: "15px", marginTop: "15px"}}>{isEng ? "Report" : "Отчет"}: {payoutRequest.reportNotes}</div>
                        <div>
                            <ul style={{listStyle: "none"}}>
                        {reportFiles.map(file => {
                            return <li style={{marginLeft: "-18px"}}>
                            <span style={{color: "#000", textDecoration: "none"}}>
                        {file.name}
                            </span>
                            <button id="startBtn" type="button" className="m-2 btn btn-dark" onClick={() => downloadFile(file)}>{isEng ? "Download" : "Загрузить"}</button>
                            </li>
                        })
                        }
                            </ul>
                        </div>
                    </div>
                }

                {payoutRequest.reportNotes !== null && currentUserId !== undefined &&
                    <div>
                        <button id="checkReport" type="button" className="m-2 btn btn-primary" onClick={() => checkReport()}>{isEng ? "Check report" : "Посмотреть отчет"}</button>
                    </div>
                }
            </div>
        </li>
    )
}