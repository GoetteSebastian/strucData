import ReactDOM from 'react-dom'
const parent = document.body

var Dialog = (props) => {

  return ReactDOM.createPortal(
    <div className="editCanvas">
      <div className="editFrame">
        <div className="editContainer">
          {props.children}
        </div>
        <div className="editFooter">
          <button onClick={() => {props.action("delete")}}>Löschen</button>
          <button className="red" onClick={() => {props.action("save")}}>Speichern</button>
          <button onClick={() => {props.action("close")}}>Abbrechen</button>
        </div>
      </div>
    </div>
    , parent)
}

export default Dialog
