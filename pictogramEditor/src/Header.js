import logo from './sbblogo.svg'

var Header = () => {
  const buildViewPort = () => {
    console.log("refresh")
    window.ipc.send("GET/lists.req", "")
  }

 return (
   <div id="header">
    <img src={logo} className="mod_header_logo_content" />
    <button id="redrawCanvas" onClick={() => {buildViewPort()}}>Aktualisieren</button>
    <button id="createNewList" onClick={() => {console.log('add list')}}>Neue Tabelle erstellen</button>
   </div>
 )
}
export default Header
