var NumberRender = (props) => {
  return (
    <td>
      <p>{props.value}</p>
    </td>
  )
}

export default NumberRender

var NumberEdit = (props) => {
  return (
    <div className="inputWrapper">
      <label>{props.prototype.name}</label>
      <input type="number" value={props.value} onChange={(e) => {props.update({key: props.prototype.key, value: e.target.value})}} />
    </div>
  )
}

export { NumberEdit }
