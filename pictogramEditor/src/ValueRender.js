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
          break
        case "longText":
          return <LongTextRender value={props.value}/>
          break
        case "number":
          return <NumberRender value={props.value}/>
          break
        case "link":
          return <LinkRender value={props.value} prototypeKey={props.prototypeKey} rel={props.rel}/>
          break
        case "multiLink":
          return <MultiLinkRender value={props.value} prototypeKey={props.prototypeKey} rel={props.rel}/>
          break
        case "boolean":
          return <BooleanRender value={props.value}/>
          break
        case "svg":
          return <SVGRender value={props.value} />
          break
        default:
          return <></>
          break
      }
    })()
  )
}

export default ValueRender
