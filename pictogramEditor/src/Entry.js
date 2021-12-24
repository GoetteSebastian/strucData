import { useState, useEffect } from 'react'
import ValueRender from "./ValueRender"
import Dialog from "./Dialog"
import ValueEdit from "./ValueEdit"

var Entry = (props) => {
  const [ dialog, setDialog ] = useState(false)
  const closeDialog = () => {
    setDialog(false)
  }

  return (
    <>
      <tr onClick={() => {setDialog(true)}}>
        {
          props.prototype.map((p, i) =>
            <ValueRender key={i} type={p.type} value={props.content[p.key]} rel={p.rel} prototypeKey={p.key}/>
          )
        }
      </tr>
      {
        dialog ?
          <Dialog close={closeDialog} list={props.list}>
            <ValueEdit list={props.list} uid={props.content.id} />
          </Dialog>
        : null
      }
    </>
  )
}

export default Entry
