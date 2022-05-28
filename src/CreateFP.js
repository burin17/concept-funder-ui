import React, {Component, useState} from "react";
import {add} from "react-modal/lib/helpers/classList";
import { useHistory } from "react-router-dom";
import {useContext} from "react";
import Context from "./context";

export default function CreateFP() {
    const {isEng} = useContext(Context);

    const history = useHistory();
    const [images, setImages] = useState([]);
    const [moderationFiles, setModerationFiles] = useState([]);
    const [fpFiles, setFpFiles] = useState([]);
    const [youtubeLinks, setYoutubeLinks] = useState([]);
    const [tags, setTags] = useState([]);

    async function requestFP(title, description, amountGoal, days, story, moderationNotes) {
        if (title === "" || description === "" || amountGoal === "" || days === "" || story === "") {
            document.getElementById("errorMessage").style.display = "block";
            document.getElementById("errorMessage").innerText = "Please fill all mandatory fields";
        } else if (!/^[\d.]+$/.test(amountGoal)) {
            document.getElementById("errorMessage").style.display = "block";
            document.getElementById("errorMessage").innerText = "Goal field must be float";
        } else if (!/^[\d]+$/.test(days)) {
            document.getElementById("errorMessage").style.display = "block";
            document.getElementById("errorMessage").innerText = "Days field must be integer";
        } else {
            fetch(`http://localhost:18080/fundraising-projects/create`, {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    "Authorization": sessionStorage.jwtToken
                }),
                body: JSON.stringify(
                    {
                        "title": title,
                        "description": description,
                        "amountGoal": amountGoal,
                        "days": days,
                        "story": story,
                        "moderationNotes": moderationNotes,
                        "youtubeLinks": youtubeLinks,
                        "tags": tags
                    }
                )
            }).then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    document.getElementById("errorMessage").style.display = "block";
                    document.getElementById("errorMessage").innerText = "Specified title already in use";
                    return undefined;
                }
            }).then(fp => {
                if (fp !== undefined) {
                    if (images.length > 0) {
                        const imagesFormData = new FormData();
                        for (const image of images) {
                            imagesFormData.append("files", image);
                        }
                        fetch("http://localhost:18080/api/fundraising-projects/upload-images/" + fp.fundraisingProjectId, {
                            method: "POST",
                            headers: new Headers({
                                "Authorization": sessionStorage.jwtToken
                            }),
                            body: imagesFormData
                        })
                    }
                    if (moderationFiles.length > 0) {
                        const moderationFormData = new FormData();
                        for (const file of moderationFiles) {
                            moderationFormData.append("files", file);
                        }
                        fetch("http://localhost:18080/api/fundraising-projects/upload-moderation/" + fp.fundraisingProjectId, {
                            method: "POST",
                            headers: new Headers({
                                "Authorization": sessionStorage.jwtToken
                            }),
                            body: moderationFormData
                        })
                    }
                    if (fpFiles.length > 0) {
                        const otherFormData = new FormData();
                        for (const file of fpFiles) {
                            otherFormData.append("files", file);
                        }
                        fetch("http://localhost:18080/api/fundraising-projects/upload-other/" + fp.fundraisingProjectId, {
                            method: "POST",
                            headers: new Headers({
                                "Authorization": sessionStorage.jwtToken
                            }),
                            body: otherFormData
                        })
                    }
                    document.getElementById("errorMessage").style.display = "none";
                    document.getElementById("errorMessage").innerText = "";
                    history.push('/self-profile');
                }
            });
        }
    }

    function addModerationFile(event) {
        setModerationFiles([...moderationFiles,event.target.files[0]]);
        document.getElementById("selectedModerationFilesWrapper").style.display = "block";
        document.getElementById("selectedModerationFilesWrapper").innerHTML +=
            `<div>${event.target.files[0].name}</div>`
        event.target.value = '';
        let initMarginBottom = document.getElementById("fpCreation").style.marginBottom;
        initMarginBottom = parseInt(initMarginBottom.substring(0, initMarginBottom.indexOf("p")));
        initMarginBottom += 45;
        document.getElementById("fpCreation").style.marginBottom = initMarginBottom + "px";
    }

    function addImage(event) {
        setImages([...images,event.target.files[0]]);
        document.getElementById("selectedImagesWrapper").style.display = "block";
        document.getElementById("selectedImagesWrapper").innerHTML +=
            `<div>${event.target.files[0].name}</div>`
        event.target.value = '';
        let initMarginBottom = document.getElementById("fpCreation").style.marginBottom;
        initMarginBottom = parseInt(initMarginBottom.substring(0, initMarginBottom.indexOf("p")));
        initMarginBottom += 45;
        document.getElementById("fpCreation").style.marginBottom = initMarginBottom + "px";
    }

    function addOtherFile(event) {
        setFpFiles([...fpFiles,event.target.files[0]]);
        document.getElementById("selectedOtherFilesWrapper").style.display = "block";
        document.getElementById("selectedOtherFilesWrapper").innerHTML +=
            `<div>${event.target.files[0].name}</div>`
        event.target.value = '';
        let initMarginBottom = document.getElementById("fpCreation").style.marginBottom;
        initMarginBottom = parseInt(initMarginBottom.substring(0, initMarginBottom.indexOf("p")));
        initMarginBottom += 45;
        document.getElementById("fpCreation").style.marginBottom = initMarginBottom + "px";
    }

    function addYoutube() {
        const fullLink = document.getElementById("youtubeLink").value;
        let videoId = fullLink.substring(fullLink.indexOf('=') + 1, fullLink.length);
        const link = "https://www.youtube.com/embed/" + videoId;
        setYoutubeLinks([...youtubeLinks, link]);
        document.getElementById("selectedYoutube").style.display = "block";
        document.getElementById("selectedYoutube").innerHTML +=
            `<div>${link}</div>`
        document.getElementById("youtubeLink").value = '';
        let initMarginBottom = document.getElementById("fpCreation").style.marginBottom;
        initMarginBottom = parseInt(initMarginBottom.substring(0, initMarginBottom.indexOf("p")));
        initMarginBottom += 45;
        document.getElementById("fpCreation").style.marginBottom = initMarginBottom + "px";
    }

    function addTag(event) {
        if (event.key === 'Enter') {
            document.getElementById("selectedTags").style.display = "block";
            const tag = document.getElementById("tag").value;
            document.getElementById("tag").value = '';
            setTags([...tags, tag]);
            document.getElementById("selectedTags").innerHTML += `<span> #${tag} </span>`
        }
    }

    return (
        <div id="fpCreation" className="create-fp-wrapper" style={{marginTop: "100px", marginBottom: "550px", display: "block"}}>
            <div className="create-fp-inner" style={{width: "800px"}}>
                <div id="errorMessage" style={{display: "none", color:"red", textAlign: "center", marginBottom: "10px"}}></div>
                <form className="createFpForm" style={{position: "relative"}}>
                    <h3>{isEng ? "Request Fundraising Company" : "Создать краудфандинговую кампанию"}</h3>

                    <div className="form-group">
                        <label>{isEng ? "Title" : "Название"}</label>
                        <input id="title" type="text" className="form-control"/>
                    </div>

                    <div className="form-group">
                        <label>{isEng ? "Brief description" : "Краткое описание"}</label>
                        <textarea id="description" className="form-control" style={{height: "120px"}}/>
                    </div>

                    <div className="form-group">
                        <label>{isEng ? "Goal" : "Цель"}</label>
                        <input id="amountGoal" type="text" className="form-control"/>
                    </div>

                    <div className="form-group">
                        <label>{isEng ? "Days" : "Кол-во дней"}</label>
                        <input id="days" type="text" className="form-control"/>
                    </div>

                    <div className="form-group">
                        <label>{isEng ? "Tell advanced story of fundraising company" : "Описание финансируемого проекта"}</label>
                        <textarea id="story" className="form-control" style={{height: "380px"}}/>
                    </div>

                    <div className="input-group">
                        <input id="tag" type="text" className="form-control" placeholder={isEng ? "Tags" : "Метки"} onKeyDown={addTag}/>
                    </div>

                    <div id="selectedTags" style={{display: 'none'}}>
                        <label>{isEng ? "Tags" : "Метки"}: </label>
                    </div>

                    <div className="input-group">
                        <input id="youtubeLink" type="text" className="form-control" placeholder={isEng ? "YouTube video" : "YouTube видео"} />
                        <button type="button" className="btn btn-primary btn-block" onClick={() => addYoutube()}>{isEng ? "Add" : "Добавить"}</button>
                    </div>

                    <div id="selectedYoutube" style={{display: 'none'}}>
                        <label>{isEng ? "Selected YouTube videos" : "YouTube видео"}:</label>
                    </div>



                    <div id="imagesFilesWrapper" className="form-group">
                        <label>{isEng ? "Images for fundraising company" : "Изображения для крауд-кампании"}</label><br/>
                        <input type="file" onChange={addImage}/>
                    </div>

                    <div id="otherFilesWrapper" className="form-group">
                        <label>{isEng ? "Other files which will be available for viewing" : "Файлы, доступные для просмотра"}</label><br/>
                        <input type="file" onChange={addOtherFile}/>
                    </div>

                    <div id="selectedImagesWrapper" style={{display: 'none'}}>
                        <label>{isEng ? "Selected images for fundraising company" : "Выбранные изображения"}:</label>
                    </div>

                    <div id="selectedOtherFilesWrapper" style={{display: 'none'}}>
                        <label>{isEng ? "Other files" : "Выбранные файлы"}:</label>
                    </div>

                    <div className="form-group">
                        <label>{isEng ? "Moderation notes" : "Комментарии для модерации"}</label>
                        <textarea id="moderationNotes" className="form-control" style={{height: "120px"}}/>
                    </div>

                    <div id="moderationFilesWrapper" className="form-group">
                        <label>{isEng ? "Files that help with moderation" : "Файлы для модерации"}</label><br/>
                        <input type="file" onChange={addModerationFile}/>
                    </div>

                    <div id="selectedModerationFilesWrapper" style={{display: 'none'}}>
                        <label>{isEng ? "Selected files for moderation" : "Выбранные файлы для модерации"}:</label>
                    </div>

                    <br/>
                    <button type="button" className="btn btn-primary btn-block"
                            onClick={(event) => requestFP(
                                document.getElementById('title').value,
                                document.getElementById('description').value,
                                document.getElementById('amountGoal').value,
                                document.getElementById('days').value,
                                document.getElementById('story').value,
                                document.getElementById('moderationNotes').value,
                            )}>{isEng ? "Create" : "Создать"}</button>
                </form>
            </div>
        </div>
    );
}