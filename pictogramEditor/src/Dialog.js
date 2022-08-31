import React from 'react'
import ReactDOM from 'react-dom'
const parent = document.body

var Dialog = (props) => {

  return ReactDOM.createPortal(
    <div className="editCanvas">
      <div className="editFrame">
        <div className="editHeader">
          {props.dialogTitle}
          <button onClick={() => {props.action("close")}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" stroke="#000" d="M6,17.9997 L18,5.9997 M18,17.9997 L6,5.9997"/>
          </svg>
          </button>
        </div>
        <div className="editContainer">
          {props.children}
        </div>
        <div className="editFooter">
          <button onClick={() => {props.action("delete")}} disabled={!props.isDeletable}>Löschen</button>
          <div className='spacer'></div>
          <button className="red" onClick={() => {props.action("save")}}>Speichern</button>
          <button onClick={() => {props.action("close")}}>Abbrechen</button>
        </div>
      </div>
    </div>
    , parent)
}

export default Dialog
