import React, {Component} from "react";

export default class CreateFP extends Component {
    async requestFP(title, description, amountGoal, days) {
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
                    "days": days
                    }
            )
        }).then(response => response.json())
            .then(json => {console.log(json)});
    }

    render() {
        return (
            <div className="create-fp-wrapper">
                <div className="create-fp-inner">
                    <form>
                        <h3>Start Fundraising Company</h3>

                        <div className="form-group">
                            <label>Title</label>
                            <input id="title" type="text" className="form-control" placeholder="Title" />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <input id="description" type="text" className="form-control" placeholder="Description" />
                        </div>

                        <div className="form-group">
                            <label>Goal</label>
                            <input id="amountGoal" type="text" className="form-control" placeholder="Goal" />
                        </div>

                        <div className="form-group">
                            <label>Days</label>
                            <input id="days" type="text" className="form-control" placeholder="Days" />
                        </div>

                        <br/>
                        <button type="button" className="btn btn-primary btn-block"
                                onClick={(event) => this.requestFP(
                                    document.getElementById('title').value,
                                    document.getElementById('description').value,
                                    document.getElementById('amountGoal').value,
                                    document.getElementById('days').value,
                                )}>Create Fundraising Project</button>
                    </form>
                </div>
            </div>
        );
    }
}