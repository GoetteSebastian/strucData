import React from "react"

var SVGRender = (props) => {
  return (
    props.value.length > 0 ? <img className="svg" src={`data:image/svg+xml;utf8,${encodeURIComponent(props.value)}`} alt="svg preview" /> : null
  )
}

export default SVGRender

var SVGEdit = (props) => { //TODO: If SVG is used as a link rel, the svg code will be shown in the react select dropdown, fix that. 
  var inputElement
  const loadSVG = (event) => {
    if(event.target.files.length > 0) {
      const parser = new DOMParser()
      const reader = new FileReader()
      const file = event.target.files[0]
      reader.originalFileName = file.name.replace(".svg", "")
      reader.addEventListener('load', (e) => {
        var data = parser.parseFromString(e.target.result, "image/svg+xml")
        if(data.getElementById("content_1_") != null) {
          data.getElementById("content_1_").id = "content"
        }
        if(data.getElementById("Content") != null) {
          data.getElementById("Content").id = "content"
        }
        props.update({key: props.prototype.key, value: data.documentElement.outerHTML})
      })
      if(file.name.includes(".svg")) {
        reader.readAsText(file)
      }
    }
  }

  return (
    <div className="inputWrapper">
      <label>{props.prototype.name}</label>
      <div className="svgPreview" onClick={(e) => {inputElement.click()}}>
        {
          props.value.length > 0 ? <img className="svg" src={`data:image/svg+xml;utf8,${encodeURIComponent(props.value)}`} alt="svg preview"/> : null
        }
      </div>
      <input ref={input => inputElement = input} type="file" className="hidden" accept="image/svg+xml" onChange={(e) => {loadSVG(e)}} />
    </div>
  )
}

export { SVGEdit }
