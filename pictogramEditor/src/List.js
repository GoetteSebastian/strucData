import React, { useContext, useState } from 'react'
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
  const [ isDeletable, setIsDeletable ] = useState(false)
  const addEntryDialogActions = (action) => {
    switch(action) {
      case "close":
        setAddEntryDialog(false)
        break
      case "save":
        setAddEntryActions("put")
        break
      case "delete":
        setAddEntryActions("delete") //do we need that here?
        break
      case "clear":
        setAddEntryActions("clear")
        break
      default:
        break
    }
  }

  //edit list elements
  const [ editListDialog, setEditListDialog ] = useState(false)
  const [ editListActions, setEditListActions ] = useState("clear")
  const editListDialogActions = (action) => {
    switch (action) {
      case "close":
        setEditListDialog(false)
        break
      case "save":
        setEditListActions("post")
        break
      case "delete":
        setEditListActions("delete")
        break
      case "clear":
        setEditListActions("clear")
        break
      default: 
        break
    }
  }

  return (
    <>
     <div key={lists[props.list].id}>
      <h1>{lists[props.list].name}
        <button className="icon" onClick={() => {setEditListDialog(true)}}><span className="icon edit"></span></button>
        <button className="right red marginRight" onClick={() => {setAddEntryDialog(true)}}>Elemente hinzufügen</button>
      </h1>
      <table>
        <thead>
          <tr>
            {
              lists[props.list].prototype.sort((a, b) => a.sort - b.sort).map((prototype, index) =>
                prototype.type !== "index"
                  ? <th key={index}>{prototype.name}</th>
                  : null
              )
            }
          </tr>
        </thead>
        <tbody>
          {
            lists[props.list].content.sort((a, b) => { //TODO: add sort logic for links, they have to sort depending on the displayed link value and not the link index value
              var result = 0
              lists[props.list].sort.forEach(sortKey => {
                if(result === 0) {
                  result = a[sortKey] < b[sortKey] ? -1 : a[sortKey] > b[sortKey] ? 1 : 0
                }
              })
              return result
            }).map((content, index) =>
              <Entry list={props.list} content={content} prototype={lists[props.list].prototype} key={index}/>
            )
          }
        </tbody>
      </table>
     </div>
     {
       addEntryDialog ?
         <Dialog action={addEntryDialogActions} dialogTitle="Add new Entry" isDeletable={false}>
           <EntryEdit list={props.list} uid={-1} actions={addEntryActions} setActions={addEntryDialogActions} setIsDeletable={setIsDeletable} />
         </Dialog>
       : null
     }
     {
       editListDialog ?
        <Dialog action={editListDialogActions} dialogTitle={"Edit List: " + lists[props.list].name} isDeletable={isDeletable}>
          <ListEdit list={props.list} actions={editListActions} setActions={editListDialogActions} setIsDeletable={setIsDeletable} />
        </Dialog>
      : null
     }
   </>
 )
}
export default List
