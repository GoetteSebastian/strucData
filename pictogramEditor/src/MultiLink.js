import { useContext } from 'react'
import Select from 'react-select'
import { ContentContext } from "./Content.js"

var MultiLinkRender = (props) => {
  const lists = useContext(ContentContext)
  return (
    <td>
      <p>
        {
          props.value.map((value, index) => {
            return <span key={index} className="tag">{lists[props.prototypeKey].content.find((item) => {return item.id === value})[props.rel]}</span>
          })
        }
      </p>
    </td>
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
