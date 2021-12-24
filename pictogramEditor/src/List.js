import { useContext } from 'react'
import Entry from "./Entry"
import { ContentContext } from "./Content.js"

var List = (props) => {

  const lists = useContext(ContentContext)
  return (
   <div key={lists[props.list].id}>
    <h1>{lists[props.list].name}
      <button className="right" onClick={() => {console.log("edit Table")}}>Tabelle bearbeiten</button>
      <button className="right red marginRight" onClick={() => {console.log("add Element")}}>Elemente hinzufügen</button>
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
 )
}
export default List
