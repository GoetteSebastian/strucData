import React, { useState, useEffect } from 'react'
import Select from 'react-select'

var PrototypeEdit = (props) => {
  const [ dataType, setDataType ] = useState(
    {
      value: {label: props.dataTypes[props.prototype.type].name, value: props.dataTypes[props.prototype.type].key},
      options: Object.keys(props.dataTypes).map((type) => {
        const option = {label: props.dataTypes[type].name, value: props.dataTypes[type].key}
        option.disabled = props.linkableLists.filter(list => !list.inUse).length === 0 && props.dataTypes[type].isLink ? true : false
        return option
      })
    }
  )
  const [ linkedList, setLinkedList ] = useState(
    {
      value: {value: "", label: ""},
      options: []
    }
  )
  const [ linkedAttribute, setLinkedAttribute ] = useState(
    {
      value: {value: "", label: ""},
      options: []
    }
  )

  /*const selectStyle = {
    menu: (provided, state) => ({
      ...provided, 
      position: "fix",
      opacity: 0.5
    })
  }*/

  useEffect(() => { // on load
    if(Object.keys(props.dataTypes).filter(type => props.dataTypes[type].isLink).includes(props.prototype.type)) {
      setLinkedList(prevValue => ({
        ...prevValue,
        value: {value: props.prototype.key, label: props.linkableLists.find(list => list.value === props.prototype.key).label}
      }))
      setLinkedAttribute({
        value: props.linkableLists.find(list => list.value === props.prototype.key).attributes.find(attribute => attribute.value === props.prototype.rel),
        options: props.linkableLists.find(list => list.value === props.prototype.key).attributes
      })
    }
  }, [])

  const updateDataType = (args) => {
    if(props.dataTypes[args.value].isLink && !props.dataTypes[props.prototype.type].isLink) { //from "not link" to "link"
      props.update({uid: props.uid, key: "key", value: props.linkableLists[0].value})
      props.update({uid: props.uid, key: "name", value: props.linkableLists[0].label})
      props.update({uid: props.uid, key: "rel", value: props.linkableLists[0].attributes[0].value})
      setLinkedList(prevValue => ({
        ...prevValue,
        value: {
          value: props.linkableLists.filter(list => !list.inUse)[0].value,
          label: props.linkableLists.filter(list => !list.inUse)[0].label
        },
        options: props.linkableLists.filter(list => !list.inUse).map(list => {return {value: list.value, label: list.label}})
      }))
      setLinkedAttribute({
        value: props.linkableLists.filter(list => !list.inUse)[0].attributes[0],
        options: props.linkableLists.filter(list => !list.inUse)[0].attributes
      })
    }
    else if(!props.dataTypes[args.value].isLink && props.dataTypes[props.prototype.type].isLink) { //from "link" to "not link"
      props.update({uid: props.uid, key: "rel", value: ""})
      props.update({uid: props.uid, key: "key", value: ""})
      props.update({uid: props.uid, key: "name", value: ""})
    }
    props.update({uid: props.uid, key: "type", value: args.value})
    setDataType(prevValue => ({
      ...prevValue,
      value: args
    }))
  }

  const updateLinkedList = (args) => {
    props.update({uid: props.uid, key: "key", value: args.value})
    props.update({uid: props.uid, key: "name", value: args.label})
    props.update({uid: props.uid, key: "rel", value: props.linkableLists.find(list => list.value === args.value).attributes[0].value})
    setLinkedList(prevValue => ({
      ...prevValue,
      value: args
    }))
    setLinkedAttribute({
      value: props.linkableLists.find(list => list.value === args.value).attributes[0],
      options: props.linkableLists.find(list => list.value === args.value).attributes
    })
  }

  const updatelinkedAttribute = (args) => {
    props.update({uid: props.uid, key: "rel", value: args.value})
    setLinkedAttribute(prevValue => ({
      ...prevValue,
      value: args
    }))
  }

  const deletePrototype = () => {
    props.delete({uid: props.uid})
  }

  return (
    <div className={props.action === "delete" ? "prototypeWrapper delete" : "prototypeWrapper"}>
      <div className="sortHandle">
        <button className='icon up' disabled={!props.up} onClick={(e) => {props.move({uid: props.uid, direction: "up"})}}></button>
        <button className='icon down' disabled={!props.down} onClick={(e) => {props.move({uid: props.uid, direction: "down"})}}></button>
      </div>
      <div className="inputWrapper">
        <label>Feldtyp</label>
        <Select
          classNamePrefix="dialogSelect"
          value={dataType.value}
          options={dataType.options}
          isMulti={false}
          isClearable={false}
          onChange={(value) => {updateDataType(value)}}
          isDisabled={props.editable ? false : true}
          isOptionDisabled={(option) => option.disabled}
        />
      </div>
      {
        props.dataTypes[props.prototype.type].isLink
        ? null
        : <>
            <div className="inputWrapper">
              <label>Feld Schlüssel</label>
              <input type="text" value={props.prototype.key} onChange={(e) => {props.update({uid: props.uid, key: "key", value: e.target.value})}} disabled={props.editable ? false : true}/>
            </div>
            <div className="inputWrapper">
              <label>Anzeigename</label>
              <input type="text" value={props.prototype.name} onChange={(e) => {props.update({uid: props.uid, key: "name", value: e.target.value})}} disabled={props.prototype.type === "index"} />
            </div>
          </>
      }
      {
        props.dataTypes[props.prototype.type].isLink
        ? <>
          <div className="inputWrapper">
            <label>Verknüpfte Liste</label>
            <Select
              value={linkedList.value}
              options={linkedList.options}
              isMulti={false}
              isClearable={false}
              onChange={(value) => {updateLinkedList(value)}}
              isDisabled={props.editable ? false : true}
            />
          </div>
          <div className="inputWrapper">
            <label>Dargestellter Wert</label>
            <Select
              value={linkedAttribute.value}
              options={linkedAttribute.options}
              isMulti={false}
              isClearable={false}
              onChange={(value) => {updatelinkedAttribute(value)}}
            />
          </div>
        </>
        : null
      }
      <button className="icon" onClick={(e) => {deletePrototype()}} disabled={props.prototype.isDeletable ? false : true}><span className="icon delete"></span></button>
    </div>
  )
}

export default PrototypeEdit
