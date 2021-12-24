var TextRender = (props) => {
  return (
    <td>
      <p>{props.value}</p>
    </td>
  )
}

export default TextRender

var TextEdit = (props) => {
  return (
    <div className="inputWrapper">
      <label>{props.prototype.name}</label>
      <input type="text" value={props.value} onChange={(e) => {props.update({key: props.prototype.key, value: e.target.value})}} />
    </div>
  )
}

export { TextEdit }
