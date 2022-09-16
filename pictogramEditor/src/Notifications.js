import React from "react"


var Notification = (props) => {
  return (
    <div id="notificationCanvas" className={props.type}>
      <span className={"icon " + props.type}></span>
      <span className="message">{props.message}</span>
      <button className={"icon " + props.type} onClick={() => {
        props.removeNotification(props.timeStamp)
      }}></button>
    </div>
  )
}

var Notifications = (props) => {
  
 return (
  <div id="notificationContainer">
    {
      props.notifications.map((notification, index) => 
        <Notification type={notification.type} message={notification.message} timeStamp={notification.timeStamp} key={index} removeNotification={props.removeNotification} />
      )
    }
   </div>
 )
}
export default Notifications
