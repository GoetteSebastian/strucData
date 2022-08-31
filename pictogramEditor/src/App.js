import React, { useEffect } from 'react'
import Header from './Header'
import Notifications from './Notifications'
import Content from './Content'

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
    <Content />
  </>
 )
}
export default App
