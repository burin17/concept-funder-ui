import React, {useState, useEffect, useContext} from "react";
import FundraisingProject from "./FundraisingProject";
import './fundraisingProjects.css';
import {add} from "react-modal/lib/helpers/classList";
import Context from "./context";

export default function FundraisingProjects() {
    const {isEng} = useContext(Context);

    const [mounted, setMounted] = useState(false)
    const [fps, setFps] = useState([]);
    const [currentUser, setCurrentUser] = useState();
    const [loaded, isLoaded] = useState(false);
    const [tags, setTags] = useState([]);

    function allVisibleFps() {
        fetch(`http://localhost:18080/fundraising-projects/visibleForUser`, {
            method: 'GET',
            headers: new Headers({
                "Authorization": sessionStorage.jwtToken
            })
        }).then(response => response.json())
            .then(data => {
                setFps(data);
            });
    }

    if(!mounted) {
        allVisibleFps();
    }

    useEffect(() =>{
        setMounted(true);
        loadCurrentUser();
    },[]);

    async function loadCurrentUser() {
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
            });
        isLoaded(true);
    }

    function addTag(event) {
        if (event.key === 'Enter') {
            const tag = document.getElementById("tagInput").value;
            document.getElementById("tagInput").value = '';
            setTags([...tags, tag]);
            search([...tags,tag]);
        }
    }

    function search(_tags) {
        const ttlPiece = document.getElementById('titleInput').value;

        if (_tags.length > 0 && ttlPiece === '') {
            console.log(1)
            fetch(`http://localhost:18080/fundraising-projects/search-by-tags?tags=` + _tags, {
                method: 'GET',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            }).then(response => response.json())
                .then(data => {
                    setFps(data);
                });
        } else if (ttlPiece !== '') {
            console.log(2)
            fetch(`http://localhost:18080/fundraising-projects/search/` + ttlPiece + "?tags=" + _tags, {
                method: 'GET',
                headers: new Headers({
                    "Authorization": sessionStorage.jwtToken
                })
            }).then(response => response.json())
                .then(data => {
                    setFps(data);
                });
        } else {
            console.log(3)
            allVisibleFps();
        }
    }

    function clear() {
        setTags([]);
        document.getElementById('titleInput').value = '';
        allVisibleFps();
    }

    if (loaded === false) {
        return <div></div>
    }

    return (
        <div>
            {console.log(isEng)}
            <div style={{position: "absolute", top: "80px", width: "93%", left: '80px'}}>
                <input id="titleInput" type="text" className="form-control" placeholder={isEng ? "Title" : "Название кампании"} onChange={() => search(tags)}/>
                <input id="tagInput" type="text" className="form-control" placeholder={isEng ? "Tags" : "Метки"} style={{marginTop: "5px"}} onKeyDown={addTag}/>
                <button type="button" className="btn btn-light btn-block" style={{marginTop: "5px", marginLeft: "1632px"}} onClick={() => clear()}>{isEng ? "Clear" : "Сброс"}</button>
            </div>
            <div id="selectedTags" style={{display: 'flex', position: "absolute", top: "170px", left: '90px'}}>
                {tags.map(tag => "#" + tag + " ")}
            </div>
            <ul className="wrapper" style={{marginTop: "230px"}}>
                {fps !== undefined && fps !== [] && fps.map(fp => {
                    return <FundraisingProject fp={fp} isModeration={false} isSelfProfile={false} isCurrentUser={fp.founder.id === currentUser.id}/>
                })}
            </ul>
        </div>
    );
}