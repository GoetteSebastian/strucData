import React from "react"

var TextRender = (props) => {
  return (
    <span>{props.value}</span>
  )
}

export default TextRender

const TextEdit = (props) => {
  return (
    <div className="inputWrapper">
      <label>{props.prototype.name}</label>
      <input type="text" value={props.value} onChange={(e) => {props.update({key: props.prototype.key, value: e.target.value})}} />
    </div>
  )
}

export { TextEdit }
