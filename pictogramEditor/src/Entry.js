import { useState, useEffect } from 'react'
import ValueRender from "./ValueRender"
import Dialog from "./Dialog"
import EntryEdit from "./EntryEdit"

var Entry = (props) => {
  const [ dialog, setDialog ] = useState(false)
  const [ actions, setActions] = useState("clear")
  const dialogActions = (action) => {
    switch(action) {
      case "close":
        setDialog(false)
        break
      case "save":
        setActions("put")
        break
      case "delete":
        setActions("delete")
        break
      case "clear":
        setActions("clear")
        break
    }
  }

  return (
    <>
      <tr onClick={() => {
        setDialog(true)
      }}>
        {
          props.prototype.map((p, i) =>
            <ValueRender key={i} type={p.type} value={props.content[p.key]} rel={p.rel} prototypeKey={p.key}/>
          )
        }
      </tr>
      {
        dialog ?
          <Dialog action={dialogActions}>
            <EntryEdit list={props.list} uid={props.content.id} actions={actions} setActions={dialogActions} />
          </Dialog>
        : null
      }
    </>
  )
}

export default Entry
