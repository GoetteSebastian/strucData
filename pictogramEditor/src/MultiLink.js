import React, { useContext } from 'react'
import Select from 'react-select'
import ValueRender from "./ValueRender"
import { ContentContext } from "./Content.js"

var MultiLinkRender = (props) => {
  const lists = useContext(ContentContext)
  const getLink = (uid, key) => {
    if(lists[props.prototypeKey].content.length > 0 && lists[props.prototypeKey].content.filter(item => item.id === uid).length > 0) {
      var value = lists[props.prototypeKey].content.find((item) => {return item.id === uid})[props.rel]
      var prototype = lists[props.prototypeKey].prototype.find(proto => proto.key === props.rel)
      return <ValueRender type={prototype.type} value={value} rel={prototype.rel} prototypeKey={prototype.key} key={key}/>
    }
    else {
      return "Error: Link not found!"
    }
  }
  return (
      props.value.map((value, index) => {
        return getLink(value, index)
      })
  )
}

export default MultiLinkRender

var MultiLinkEdit = (props) => {
  const lists = useContext(ContentContext)
  const options = lists[props.prototype.key].content.map((item, index) => {return {value: item.id, label: item[props.prototype.rel]}})
  return (
    <div className="inputWrapper">
      <label>{lists[props.prototype.key].name}</label>
      <Select
        value={options.filter(option => props.value.includes(option.value))}
        options={options}
        isMulti={true}
        isClearable={false}
        onChange={(values) => {props.update({key: props.prototype.key, value: values.map((value, index) => {return value.value})})}}
      />
    </div>
  )
}

export { MultiLinkEdit }
