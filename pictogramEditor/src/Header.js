import { useState } from "react"
import logo from './sbblogo.svg'
import Dialog from "./Dialog"
import ListEdit from "./ListEdit"

var Header = () => {
  const buildViewPort = () => {
    console.log("refresh")
    window.ipc.send("GET/lists.req", "")
  }

  const [ addListDialog, setAddListDialog ] = useState(false)
  const [ addListActions, setAddListActions] = useState("clear")
  const addListDialogActions = (action) => {
    switch(action) {
      case "close":
        setAddListDialog(false)
        break
      case "save":
        setAddListActions("put")
        break
      case "clear":
        setAddListActions("clear")
        break
    }
  }

 return (
   <>
    <div id="header">
      <img src={logo} className="mod_header_logo_content" />
      <button id="redrawCanvas" onClick={() => {buildViewPort()}}>Aktualisieren</button>
      <button id="createNewList" onClick={() => {setAddListDialog(true)}}>Neue Tabelle erstellen</button>
    </div>
    {
      addListDialog ?
        <Dialog action={addListDialogActions}>
          <ListEdit list={-1} actions={addListActions} setActions={addListDialogActions} />
        </Dialog>
      : null
    }
  </>
 )
}
export default Header
