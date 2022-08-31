import React from "react"

var BooleanRender = (props) => {
  return (
    <span className={props.value ? "icon true" : "icon false"}></span>
  )
}

export default BooleanRender

var BooleanEdit = (props) => {
  return (
    <div className="inputWrapper checkboxWrapper">
      <label>{props.prototype.name}</label>
      <input type="checkbox" checked={props.value} onChange={(e) => {props.update({key: props.prototype.key, value: e.target.checked})}} />
    </div>
  )
}

export { BooleanEdit }
