import React from "react"
import { useNavigate } from "react-router-dom"

const ListBox = (props) => {
    let navigate = useNavigate()
    return (
        <div className="listBoxContainer" onClick={() => navigate(`/list/${props.list.name}`)}>
            <h2>{props.list.name}</h2>
            <p className="multiLine">
                {props.list.abstract}
            </p>
            <p>
                {props.list.length} Einträge 
            </p>
        </div>
    )
}

export default ListBox