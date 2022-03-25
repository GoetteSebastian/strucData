import { useState, useEffect } from 'react'
import Select from 'react-select'
import PrototypeEdit from './PrototypeEdit'


var ListEdit = (props) => {
  const [ list, setList ] = useState({
    name: "",
    sort: [],
    prototype: [{name: "Id", key: "id", type: "index", rel: ""}],
    linkableLists: [],
    dataTypes: {}
  })
  const options = list.prototype.reduce((filtered, option) => {
    if(option.type != "index") {
      filtered.push({value: option.key, label: option.name})
    }
    return filtered
  }, [])
  useEffect(() => {
    window.ipc.on('GET/listEdit.res', (args) => {
      setList(args)
    })
    window.ipc.on('PUT/listEdit.res', (args) => {
      console.log(args.status)
      if(args.status == "success") {
        props.setActions("close")
      }
    })
    window.ipc.on('POST/listEdit.res', (args) => {
      console.log(args.status)
      if(args.status == "success") {
        props.setActions("close")
      }
    })
    window.ipc.on('DELETE/listEdit.res', (args) => {
      console.log(args.status)
      if(args.status == "success") {
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
        window.ipc.send('POST/listEdit.req', {prototype: list.prototype, list: props.list, name: list.name, sort: list.sort}) // add name and sort to the mix
        props.setActions("clear")
        break
      case "delete":
        window.ipc.send('DELETE/listEdit.req', {list: props.list, id: props.uid})
        props.setActions("clear")
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

  const addColumn = () => {
    let newPrototype = [...list.prototype]
    newPrototype.push({
      type: list.dataTypes[Object.keys(list.dataTypes)[0]].key,
      name: "",
      key: "",
      rel: "",
      action: "new"
    })
    setList(prevList => ({
      ...prevList,
      prototype: newPrototype
    }))
    console.log(list)
  }

  return (
    <>
      <div className="inputWrapper">
        <label>Name</label>
        <input type="text" value={list.name} onChange={(e) => {setList(prevEntry => ({ ...prevEntry, name: e.target.value}))}} />
      </div>
      <div className="inputWrapper">
        <label>Sortierung</label>
        <Select
          value={options.filter(option => list.sort.includes(option.value))}
          options={options}
          isMulti={true}
          isClearable={true}
          onChange={(values) => {setList(prevEntry => ({ ...prevEntry, sort: values.map((value, index) => {return value.value})}))}}
        />
      </div>
      <div className="inputWrapper">
      <button className="red right" onClick={(e) => {addColumn()}}>Neues Attribut</button>
      </div>
      {
        list.prototype.map((proto, index) => {
          if(proto.type != "index") {
            return <PrototypeEdit prototype={proto} key={index} uid={index} update={updatePrototype} linkableLists={list.linkableLists} dataTypes={list.dataTypes} editable={proto.action == "new" ? true : false}/>
          }
        }
        )
      }
    </>
  )
}

export default ListEdit
