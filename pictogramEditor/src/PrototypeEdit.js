import { useState } from 'react'
import Select from 'react-select'

var PrototypeEdit = (props) => {

  const [ dataType, setDataType ] = useState(
    {
      value: {label: props.dataTypes[props.prototype.type].name, value: props.dataTypes[props.prototype.type].key},
      options: Object.keys(props.dataTypes).map((type) => {return {label: props.dataTypes[type].name, value: props.dataTypes[type].key}})
    }
  )

  const updateDataType = (args) => {
    if(props.dataTypes[args.value].isLink && !props.dataTypes[props.prototype.type].isLink) { //from not link to link
      props.update({uid: props.uid, key: "rel", value: displayValue.value.value})
      props.update({uid: props.uid, key: "key", value: linkedList.value.value})
      props.update({uid: props.uid, key: "name", value: linkedList.value.label})
    }
    else if(!props.dataTypes[args.value].isLink && props.dataTypes[props.prototype.type].isLink) {
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

  const [ linkedList, setLinkedList ] = useState(
    {
      value:
        props.linkableLists.find(list => list.key == props.prototype.key)
          ? {label: props.prototype.name, value: props.prototype.key}
          : (props.linkableLists.length > 0 ? {label: props.linkableLists[0].name, value: props.linkableLists[0].key} : null)
        ,
      options: props.linkableLists.map(list => {return {label: list.name, value: list.key}})
    }
  )

  const updateLinkedList = (args) => {
    props.update({uid: props.uid, key: "key", value: args.value})
    props.update({uid: props.uid, key: "name", value: args.label})
    setLinkedList(prevValue => ({
      ...prevValue,
      value: args
    }))
    var newDisplayValue = props.linkableLists.find(list => list.key == props.prototype.key).prototype.find(proto => proto.key == props.prototype.rel)
    setDisplayValue({
      value: newDisplayValue
        ? {label: newDisplayValue.name, value: newDisplayValue.key}
        : {label: props.linkableLists.find(list => list.key == props.prototype.key).prototype[0].name, value: props.linkableLists.find(list => list.key == props.prototype.key).prototype[0].key},
      options: props.linkableLists.find(list => list.key == props.prototype.key).prototype.map(proto => {return {label: proto.name, value: proto.key}})
    })
  }

  const [ displayValue, setDisplayValue ] = useState(
    props.linkableLists.length > 0 ?
    {
      value:
        props.linkableLists.find(list => list.key == linkedList.value.value).prototype.find(proto => proto.key == props.prototype.rel)
        ? {
          label: props.linkableLists.find(list => list.key == linkedList.value.value).prototype.find(proto => proto.key == props.prototype.rel).name,
          value: props.linkableLists.find(list => list.key == linkedList.value.value).prototype.find(proto => proto.key == props.prototype.rel).key
        }
        : {
          label: props.linkableLists.find(list => list.key == linkedList.value.value).prototype[0].name,
          value: props.linkableLists.find(list => list.key == linkedList.value.value).prototype[0].key
        }
        ,
      options: props.linkableLists.find(list => list.key == linkedList.value.value).prototype.map(proto => {return {label: proto.name, value: proto.key}})
    }
    : {value: null, options: []}
  )

  const updateDisplayValue = (args) => {
    props.update({uid: props.uid, key: "rel", value: args.value})
    setDisplayValue(prevValue => ({
      ...prevValue,
      value: args
    }))
  }

  return (
    <div className="prototypeWrapper">
      <div className="inputWrapper">
        <label>Feldtyp</label>
          <Select
            value={dataType.value}
            options={dataType.options}
            isMulti={false}
            isClearable={false}
            onChange={(value) => {updateDataType(value)}}
            isDisabled={props.editable ? false : true}
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
              <input type="text" value={props.prototype.name} onChange={(e) => {props.update({uid: props.uid, key: "name", value: e.target.value})}} />
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
              value={displayValue.value}
              options={displayValue.options}
              isMulti={false}
              isClearable={false}
              onChange={(value) => {updateDisplayValue(value)}}
              />
          </div>
        </>
        : null
      }
    </div>
  )
}

export default PrototypeEdit
