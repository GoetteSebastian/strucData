import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import PrototypeEdit from './PrototypeEdit'
import md5 from 'md5'


var ListEdit = (props) => {
  const [ list, setList ] = useState({
    name: "",
    sort: [],
    prototype: [],
    linkableLists: [],
    dataTypes: {}
  })
  const sortOptions = list.prototype.map(option => {
    return {value: option.key, label: option.name}
  })

  useEffect(() => {
    window.ipc.on('GET/listEdit.res', (args) => {
      setList(args)
      props.setIsDeletable(args.isDeletable)
    })
    window.ipc.on('PUT/listEdit.res', (args) => {
      console.log(args.status)
      if(args.status === "success") {
        props.setActions("close")
      }
    })
    window.ipc.on('POST/listEdit.res', (args) => {
      console.log(args.status)
      if(args.status === "success") {
        props.setActions("close")
      }
    })
    window.ipc.on('DELETE/listEdit.res', (args) => {
      console.log(args.status)
      if(args.status === "success") {
        props.setActions("close")
      }
    })
    window.ipc.send('GET/listEdit.req', {list: props.list})
  }, [])

  useEffect(() => () => {
    window.ipc.removeAll('GET/listEdit.res')
    window.ipc.removeAll('PUT/listEdit.res')
    window.ipc.removeAll('POST/listEdit.res')
    window.ipc.removeAll('DELETE/listEdit.res')
  }, [])

  useEffect(() => {
    switch(props.actions) {
      case "put":
        window.ipc.send('PUT/listEdit.req', {list: list})
        props.setActions("clear")
        break
      case "post":
        window.ipc.send('POST/listEdit.req', {prototype: list.prototype, list: props.list, name: list.name, sort: list.sort})
        props.setActions("clear")
        break
      case "delete":
        window.ipc.send('DELETE/listEdit.req', {list: props.list, id: props.uid}) //id unused
        props.setActions("clear")
        break
      default: 
        break
    }
  }, [ props.actions ])

  const updatePrototype = (args) => {
    let newPrototype = [...list.prototype]
    newPrototype[args.uid][args.key] = args.value
    setList(prevList => ({
      ...prevList,
        prototype: newPrototype
    }))
  }

  const deletePrototype = (args) => {
    let newPrototype = [...list.prototype]
    if(newPrototype[args.uid].isDeletable) {
      newPrototype[args.uid].action === "new" ? newPrototype.splice(args.uid, 1) : newPrototype[args.uid].action = newPrototype[args.uid].action === "delete" ? "" : "delete"
    }
    setList(prevList => ({
      ...prevList,
      prototype: newPrototype
    }))
  }

  const movePrototype = (args) => {
    let newPrototype = [...list.prototype]
    if(args.direction === "up" && newPrototype[args.uid - 1]) {
      newPrototype[args.uid].sort = args.uid - 1
      newPrototype[args.uid - 1].sort = args.uid
    }
    if(args.direction === "down"&& newPrototype[args.uid + 1]) {
      newPrototype[args.uid].sort = args.uid + 1
      newPrototype[args.uid + 1].sort = args.uid
    }
    setList(prevList => ({
      ...prevList,
      prototype: newPrototype
    }))
  }

  const addAttribute = () => {
    let newPrototype = [...list.prototype]
    newPrototype.push({
      type: list.dataTypes[Object.keys(list.dataTypes)[0]].key,
      name: "",
      key: "",
      rel: "",
      sort: list.prototype.length,
      action: "new",
      isDeletable: true,
      uid: md5(String(Date.now()))
    })
    setList(prevList => ({
      ...prevList,
      prototype: newPrototype
    }))
  }

  return (
    <>
      <div className="prototypeWrapper">
        <div className="inputWrapper">
          <label>Name</label>
          <input type="text" value={list.name} onChange={(e) => {setList(prevEntry => ({ ...prevEntry, name: e.target.value}))}} />
        </div>
        <div className="inputWrapper">
          <label>Sortierung</label>
          <Select
            value={sortOptions.filter(option => list.sort.includes(option.value))}
            options={sortOptions}
            isMulti={true}
            isClearable={true}
            onChange={(values) => {setList(prevEntry => ({ ...prevEntry, sort: values.map((value, index) => {return value.value})}))}}
          />
        </div>
        <div className="inputWrapper">
          <button className="red right" onClick={(e) => {addAttribute()}}>Neues Attribut</button>
        </div>
      </div>
      {
        list.prototype.sort((a, b) => {
          return a.sort - b.sort
        }).map((proto, index) => {           
          return <PrototypeEdit 
            prototype={proto} 
            key={proto.uid} 
            uid={index} 
            update={updatePrototype} 
            linkableLists={list.linkableLists} 
            dataTypes={list.dataTypes} 
            editable={proto.action === "new" ? true : false} 
            action={proto.action} 
            delete={deletePrototype}
            move={movePrototype}
            up={index > 1}
            down={!(index === list.prototype.length - 1  || index === 0)}
          />
        }
        )
      }
    </>
  )
}

export default ListEdit
