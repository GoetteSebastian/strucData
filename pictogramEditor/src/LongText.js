import React from "react"

var LongTextRender = (props) => {
  return (
    <span alt={props.value}>{props.value.substring(0,40) + "..."}</span>
  )
}

export default LongTextRender

var LongTextEdit = (props) => {
  return (
    <div className="inputWrapper">
      <label>{props.prototype.name}</label>
      <textarea onChange={(e) => {props.update({key: props.prototype.key, value: e.target.value})}}>{props.value}</textarea>
    </div>
  )
}

export { LongTextEdit }
