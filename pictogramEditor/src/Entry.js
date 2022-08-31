import React, { useState } from 'react'
import ValueRender from "./ValueRender"
import Dialog from "./Dialog"
import EntryEdit from "./EntryEdit"

var Entry = (props) => {
  const [ dialog, setDialog ] = useState(false)
  const [ actions, setActions] = useState("clear")
  const [ isDeletable, setIsDeletable ] = useState(false)
  const dialogActions = (action) => {
    switch(action) {
      case "close":
        setDialog(false)
        break
      case "save":
        setActions("post")
        break
      case "delete":
        setActions("delete")
        break
      case "clear":
        setActions("clear")
        break
      default: 
        break
    }
  }

  return (
    <>
      <tr onClick={() => {
        setDialog(true)
      }}>
        {
          props.prototype.sort((a, b) => a.sort - b.sort).map((p, i) =>
            p.type !== "index" ? <td key={i}><ValueRender key={i} type={p.type} value={props.content[p.key]} rel={p.rel} prototypeKey={p.key}/></td> : null
          )
        }
      </tr>
      {
        dialog ?
          <Dialog action={dialogActions} isDeletable={isDeletable}>
            <EntryEdit list={props.list} uid={props.content.id} actions={actions} setActions={dialogActions} setIsDeletable={setIsDeletable} />
          </Dialog>
        : null
      }
    </>
  )
}

export default Entry
