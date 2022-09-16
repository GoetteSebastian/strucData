import React, { useContext } from 'react'
import Select from 'react-select'

import ValueRender from "./ValueRender"
import { ContentContext } from "./List.js"

var LinkRender = (props) => {
  const lists = useContext(ContentContext)
  const getLink = () => {
    if(lists[props.prototypeKey].content.length > 0 && lists[props.prototypeKey].content.filter((entry) => {return entry.id === props.value}).length > 0) {
      var value = lists[props.prototypeKey].content.find((entry) => {return entry.id === props.value}).value
      var prototype = lists[props.prototypeKey].prototype
      return <ValueRender type={prototype.type} value={value} rel={prototype.rel} prototypeKey={prototype.key}/>
    }
    else {
      return "Error: Link not found!"
    }
  }
  return props.prototypeKey in lists ? (
    getLink()
  ) : null
}

export default LinkRender


var LinkEdit = (props) => {
  const lists = useContext(ContentContext)
  console.log(lists)
  const options = lists[props.prototype.key].content.map(item => {return {value: item.id, label: item.value}})
  return (
    <div className="inputWrapper">
      <label>{props.prototype.key}</label>
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
