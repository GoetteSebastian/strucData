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
          <button onClick={() => {console.log("todo: delete element")}}>Löschen</button>
          <button className="red" onClick={() => {console.log("todo: save changes")}}>Speichern</button>
          <button onClick={() => {props.close()}}>Abbrechen</button>
        </div>
      </div>
    </div>
    , parent)
}

export default Dialog
