import React, { useState, useEffect } from 'react'
import { TextEdit } from "./Text"
import { LongTextEdit } from "./LongText"
import { NumberEdit } from "./Number"
import { LinkEdit } from "./Link"
import { MultiLinkEdit } from "./MultiLink"
import { BooleanEdit } from "./Boolean"
import { SVGEdit } from "./SVG"

var EntryEdit = (props) => {
  const [entry, setEntry] = useState({content: [], prototype: [], isDeletable: false})
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
      console.log(args)
      setEntry(args)
      props.setIsDeletable(args.isDeletable)
    })
    window.ipc.on('PUT/entry.res', (args) => {
      console.log(args.status)
      if(args.status === "success") {
        props.setActions("close")
      }
    })
    window.ipc.on('POST/entry.res', (args) => {
      console.log(args.status)
      if(args.status === "success") {
        props.setActions("close")
      }
    })
    window.ipc.on('DELETE/entry.res', (args) => {
      console.log(args.status)
      if(args.status === "success") {
        props.setActions("close")
      }
    })
    window.ipc.send('GET/entry.req', {list: props.list, id:props.uid})
  }, [])
  useEffect(() => () => {
    window.ipc.removeAll('GET/entry.res')
    window.ipc.removeAll('PUT/entry.res')
    window.ipc.removeAll('POST/entry.res')
    window.ipc.removeAll('DELETE/entry.res')
  }, [])
  useEffect(() => {
    switch(props.actions) {
      case "post":
        window.ipc.send('POST/entry.req', {entry: entry.content, list: props.list, id: props.uid})
        props.setActions("clear")
        break
      case "put":
        window.ipc.send('PUT/entry.req', {entry: entry.content, list: props.list})
        props.setActions("clear")
        break
      case "delete":
        window.ipc.send('DELETE/entry.req', {list: props.list, id: props.uid})
        props.setActions("clear")
        break
      default: 
        break
    }
  }, [ props.actions ])

  return (
    <>
      {
        entry.prototype.map((proto, index) => {
          switch(proto.type){
            case "text":
              return <TextEdit value={entry.content[proto.key]} prototype={proto} update={updateEntry} key={index}/>
            case "longText":
              return <LongTextEdit value={entry.content[proto.key]} prototype={proto} update={updateEntry} key={index}/>
            case "number":
              return <NumberEdit value={entry.content[proto.key]} prototype={proto} update={updateEntry} key={index}/>
            case "link":
              return <LinkEdit value={entry.content[proto.key]} prototype={proto} update={updateEntry} key={index}/>
            case "multiLink":
              return <MultiLinkEdit value={entry.content[proto.key]} prototype={proto} update={updateEntry} key={index}/>
            case "boolean":
              return <BooleanEdit value={entry.content[proto.key]} prototype={proto} update={updateEntry} key={index}/>
            case "svg":
              return <SVGEdit value={entry.content[proto.key]} prototype={proto} update={updateEntry} key={index}/>
            default: 
              return <></>
          }
       })
     }
   </>
  )
}

export default EntryEdit
