import { useContext, useState, useEffect } from 'react'
import Entry from "./Entry"
import EntryEdit from "./EntryEdit"
import Dialog from "./Dialog"
import ListEdit from "./ListEdit"
import { ContentContext } from "./Content.js"

var List = (props) => {
  const lists = useContext(ContentContext)

  //add entry element
  const [ addEntryDialog, setAddEntryDialog ] = useState(false)
  const [ addEntryActions, setAddEntryActions] = useState("clear")
  const addEntryDialogActions = (action) => {
    switch(action) {
      case "close":
        setAddEntryDialog(false)
        break
      case "save":
        setAddEntryActions("post")
        break
      case "delete":
        setAddEntryActions("delete")
        break
      case "clear":
        setAddEntryActions("clear")
        break
    }
  }

  //edit table elements
  const [ editTableDialog, setEditTableDialog ] = useState(false)
  const [ editTableActions, setEditTableActions ] = useState("clear")
  const editTableDialogActions = (action) => {
    switch (action) {
      case "close":
        setEditTableDialog(false)
        break
      case "save":
        csetAddEntryActions("put")
        break
      case "delete":
        setAddEntryActions("delete")
        break
      case "clear":
        setAddEntryActions("clear")
    }
  }

  return (
    <>
     <div key={lists[props.list].id}>
      <h1>{lists[props.list].name}
        <button className="right" onClick={() => {setEditTableDialog(true)}}>Tabelle bearbeiten</button>
        <button className="right red marginRight" onClick={() => {setAddEntryDialog(true)}}>Elemente hinzufügen</button>
      </h1>
      <table>
        <thead>
          <tr>
            {
              lists[props.list].prototype.map((prototype, index) =>
                prototype.type != "index" ? <th key={index}>{prototype.name}</th> : null
              )
            }
          </tr>
        </thead>
        <tbody>
          {
            lists[props.list].content.map((content, index) =>
              <Entry list={props.list} content={content} prototype={lists[props.list].prototype} key={index}/>
            )
          }
        </tbody>
      </table>
     </div>
     {
       addEntryDialog ?
         <Dialog action={addEntryDialogActions}>
           <EntryEdit list={props.list} uid={-1} actions={addEntryActions} setActions={addEntryDialogActions} />
         </Dialog>
       : null
     }
     {
       editTableDialog ?
        <Dialog action={editTableDialogActions}>
          <ListEdit list={props.list} actions={editTableActions} setActions={editTableDialogActions} />
        </Dialog>
      : null
     }
   </>
 )
}
export default List
