import { useContext } from 'react'
import Select from 'react-select'
import { ContentContext } from "./Content.js"

var LinkRender = (props) => {
  const lists = useContext(ContentContext)
  return (
    <td>
      <p>
        <span className="tag">{lists[props.prototypeKey].content.find((item) => {return item.id === props.value})[props.rel]}</span>
      </p>
    </td>
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
        value={options.filter(option => props.value == option.value)}
        options={options}
        isMulti={false}
        isClearable={false}
        onChange={(value) => {props.update({key: props.prototype.key, value: value.value})}}
      />
    </div>
  )
}

export { LinkEdit }
