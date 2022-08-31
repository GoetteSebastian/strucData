import React from "react"
import { useNavigate } from "react-router-dom"

const ListBox = (props) => {
    let navigate = useNavigate()
    return (
        <div className="listBoxContainer" onClick={() => navigate(`/list/${props.list}`)}>
            <h2>{props.list}</h2>
            <p>
                Blabla
                <br />
                Blahblah
            </p>
        </div>
    )
}

export default ListBox