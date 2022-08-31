import React, { useContext } from 'react'
import Select from 'react-select'
import ValueRender from "./ValueRender"
import { ContentContext } from "./Content.js"

var LinkRender = (props) => {
  const lists = useContext(ContentContext)
  const getLink = () => {
    if(lists[props.prototypeKey].content.length > 0 && lists[props.prototypeKey].content.filter((item) => {return item.id === props.value}).length > 0) {
      var value = lists[props.prototypeKey].content.find((item) => {return item.id === props.value})[props.rel]
      var prototype = lists[props.prototypeKey].prototype.find(proto => proto.key === props.rel)
      return <ValueRender type={prototype.type} value={value} rel={prototype.rel} prototypeKey={prototype.key}/>
    }
    else {
      return "Error: Link not found!"
    }
  }
  return (
    getLink()
  )
}

export default LinkRender


var LinkEdit = (props) => {
  const lists = useContext(ContentContext)
  const options = lists[props.prototype.key].content.map((item, index) => {return {value: item.id, label: item[props.prototype.rel]}})
  return (
    <div className="inputWrapper">
      <label>{lists[props.prototype.key].name}</label>
      <Select
        value={options.filter(option => props.value === option.value)}
        options={options}
        isMulti={false}
        isClearable={false}
        onChange={(value) => {props.update({key: props.prototype.key, value: value.value})}}
      />
    </div>
  )
}

export { LinkEdit }
