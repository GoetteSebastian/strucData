import { useEffect } from 'react'
import Select from 'react-select'

var PrototypeEdit = (props) => {
  return (
    <div className="prototypeWrapper">
      <div className="inputWrapper">
        <label>Feldtyp</label>
          <Select
            value={{label: props.dataTypes[props.prototype.type].name, value: props.dataTypes[props.prototype.type].key}}
            options={Object.keys(props.dataTypes).map((type) => {return {label: props.dataTypes[type].name, value: props.dataTypes[type].key}})}
            isMulti={false}
            isClearable={false}
            onChange={(value) => {props.update({uid: props.uid, key: "type", value: value.value})}}
            isDisabled={props.editable ? false : true}
        />
      </div>
      {
        props.dataTypes[props.prototype.type].showKey ?
        <div className="inputWrapper">
          <label>Feld Schlüssel</label>
          <input type="text" value={props.prototype.key} onChange={(e) => {props.update({uid: props.uid, key: "key", value: e.target.value})}} disabled={props.editable ? false : true}/>
        </div>
        : null
      }
      {
        props.dataTypes[props.prototype.type].showLink ?
        <div className="inputWrapper">
          <label>Verknüpfte Liste</label>
          <Select
            value={{
              label: props.prototype.name,
              value: props.prototype.key
            }}
            options={props.linkableLists.map(list => {return {label: list.name, value: list.key}})}
            isMulti={false}
            isClearable={false}
            onChange={(value) => {
              props.update({uid: props.uid, key: "key", value: value.value})
              props.update({uid: props.uid, key: "name", value: value.label})
            }}
            isDisabled={props.editable ? false : true}
            />
        </div>
        : null
      }
      {
        props.dataTypes[props.prototype.type].showRel ?
        <div className="inputWrapper">
          <label>Dargestellter Wert</label>
          <Select
            value={
              {
              label: props.linkableLists.find(list => list.key == props.prototype.key).prototype.find(proto => proto.key == props.prototype.rel).name, //prüfen ob Liste ausgewählt ist und erst dann Wert wählen. 
              value: props.linkableLists.find(list => list.key == props.prototype.key).prototype.find(proto => proto.key == props.prototype.rel).key
            }}
            options={props.linkableLists.find(list => list.key == props.prototype.key).prototype.map(proto => {return {label: proto.name, value: proto.key}})}
            isMulti={false}
            isClearable={false}
            onChange={(value) => {props.update({uid: props.uid, key: "rel", value: value.value})}}
            />
        </div>
        : null
      }
      {
        props.dataTypes[props.prototype.type].showName ?
        <div className="inputWrapper">
          <label>Anzeigename</label>
          <input type="text" value={props.prototype.name} onChange={(e) => {props.update({uid: props.uid, key: "name", value: e.target.value})}} />
        </div>
        : null
      }
    </div>
  )
}

export default PrototypeEdit
