import React, { useState } from "react"
import { Link } from "react-router-dom"
import logo from './sbblogo.svg'
import Dialog from "./Dialog"
import ListEdit from "./ListEdit"

var Header = () => {
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
      default: 
        break
    }
  }

 return (
   <>
    <div id="header">
      <img src={logo} className="mod_header_logo_content" alt="SBB Logo" />
      <Link to="/"><span className="icon home"></span></Link>
      <button onClick={() => {setAddListDialog(true)}}><span className="icon addDocument"></span></button>
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
