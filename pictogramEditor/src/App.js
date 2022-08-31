import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Notifications from './Notifications'
import Lists from './Lists'
import List from './List'

var App = () => {
  useEffect(() => {
    window.ipc.on('PUSH/notification', (args) => {
      //TODO: create notifications
      console.log(args)
    })
    window.ipc.on('PUSH/setTitle', (args) => {
      document.title = "List and Link - " + args.title
    })
  }, [])

  useEffect(() => () => {
    window.ipc.removeAll('PUSH/lnotification')
    window.ipc.removeAll('PUSH/setTitle')
  }, [])

 return (
   <>
    <Notifications />
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
