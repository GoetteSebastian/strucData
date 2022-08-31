import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Header from './Header'
import Notifications from './Notifications'
import Content from './Content'
import Lists from './Lists'
import List from './List'

var App = () => {
  useEffect(() => {
    window.ipc.on('PUSH/notification', (args) => {
      //todo, create notifications
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
    <Header />
    <BrowserRouter>
      <Routes>
        <Route index element={<Lists />} />
        <Route path='list/:listId' element={<List list="Test1" />} />
        <Route element={<Content />} />
      </Routes>
    </BrowserRouter>
  </>
 )
}
export default App
