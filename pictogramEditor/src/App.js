import React, { useEffect, useState, useRef } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Notifications from './Notifications'
import Lists from './Lists'
import List from './List'

const notificationsDisplayTime = 5000

var App = () => {
  const [ notifications, setNotifications ] = useState([])
  const notificationsRef = useRef([])

  const removeNotification = (timeStamp) => {
    var notificationsList = [...notificationsRef.current]
    const getIndex = (element) => element.timeStamp === timeStamp
    notificationsList.splice(notifications.findIndex(getIndex), 1)
    setNotifications(notificationsList)
  }

  useEffect(() => {
    notificationsRef.current = notifications
    console.log(notifications)
  }, [notifications])

  useEffect(() => {
    window.ipc.on('PUSH/notification', (args) => {
      const date = new Date()
      var prevNotifications = [...notificationsRef.current]
      var newNotification = args
      newNotification.timeStamp = date.valueOf()
      prevNotifications.unshift(newNotification)
      setNotifications(prevNotifications)
      setTimeout(removeNotification, notificationsDisplayTime, date.toString())
    })

    window.ipc.on('PUSH/setTitle', (args) => {
      document.title = "List and Link - " + args.title
    })
  }, [])

  useEffect(() => () => {
    window.ipc.removeAll('PUSH/notification')
    window.ipc.removeAll('PUSH/setTitle')
  }, [])

 return (
   <>
    <Notifications notifications={notifications} removeNotification={removeNotification} />
    <BrowserRouter>
      <Routes>
        <Route index element={<Lists />} />
        <Route path='list/:listName' element={<List />} />
      </Routes>
    </BrowserRouter>
  </>
 )
}
export default App
