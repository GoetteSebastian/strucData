import { useState, useEffect } from 'react'
import { TextEdit } from "./Text"
import { LongTextEdit } from "./LongText"
import { NumberEdit } from "./Number"
import { LinkEdit } from "./Link"
import { MultiLinkEdit } from "./MultiLink"
import { BooleanEdit } from "./Boolean"
import { SVGEdit } from "./SVG"


var ValueEdit = (props) => {
  const [entry, setEntry] = useState({content: {}, prototype: []})
  const updateEntry = (args) => {
    setEntry(prevEntry => ({
      ...prevEntry,
      content: {
        ...prevEntry.content,
        [args.key]: args.value
      }
    }))
  }
  useEffect(() => {
    window.ipc.on('GET/entry.res', (args) => {
      setEntry(args)
    })
    window.ipc.send('GET/entry.req', {list: props.list, id:props.uid})
  }, [])
  useEffect(() => () => {
    window.ipc.removeAll('GET/entry.res')
  }, [])
  useEffect(() => {
    console.log(entry)
  }, [ entry ])

 return (
   <>
     {
       entry.prototype.map((proto, index) => {
         switch(proto.type){
           case "text":
             return <TextEdit value={entry.content[proto.key]} prototype={proto} update={updateEntry} key={index} />
             break
           case "longText":
             return <LongTextEdit value={entry.content[proto.key]} prototype={proto} update={updateEntry} key={index}/>
             break
           case "number":
             return <NumberEdit value={entry.content[proto.key]} prototype={proto} update={updateEntry} key={index}/>
             break
           case "link":
             return <LinkEdit value={entry.content[proto.key]} prototype={proto} update={updateEntry} key={index}/>
             break
           case "multiLink":
             return <MultiLinkEdit value={entry.content[proto.key]} prototype={proto} update={updateEntry} key={index}/>
             break
           case "boolean":
             return <BooleanEdit value={entry.content[proto.key]} prototype={proto} update={updateEntry} key={index}/>
             break
           case "svg":
             return <SVGEdit value={entry.content[proto.key]} prototype={proto} update={updateEntry} key={index}/>
             break
          }
       })
     }
   </>
  )
}

export default ValueEdit
