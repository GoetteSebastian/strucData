import React from "react"
import TextRender from "./Text"
import LongTextRender from "./LongText"
import NumberRender from "./Number"
import LinkRender from "./Link"
import MultiLinkRender from "./MultiLink"
import BooleanRender from "./Boolean"
import SVGRender from "./SVG"



var ValueRender = (props) => {
   return (
     (() => {
      switch(props.type){
        case "text":
          return <TextRender value={props.value}/>
        case "longText":
          return <LongTextRender value={props.value}/>
        case "number":
          return <NumberRender value={props.value}/>
        case "link":
          return <LinkRender value={props.value} prototypeKey={props.prototypeKey} rel={props.rel}/>
        case "multiLink":
          return <MultiLinkRender value={props.value} prototypeKey={props.prototypeKey} rel={props.rel}/>
        case "boolean":
          return <BooleanRender value={props.value}/>
        case "svg":
          return <SVGRender value={props.value} />
        default:
          return <></>
      }
    })()
  )
}

export default ValueRender
