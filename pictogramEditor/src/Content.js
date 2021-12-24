import { useState, createContext, useEffect } from 'react'
import List from './List'

export const ContentContext = createContext()

var Content = (props) => {
  const [lists, setLists] = useState([])
  useEffect(() => {
    window.ipc.on('GET/lists.res', (args) => {
      setLists(args)
    })
  }, [])
  useEffect(() => () => {
    window.ipc.removeAll('GET/lists.res')
  }, [])

  return (
    <ContentContext.Provider value={lists}>
      <div id="contentCanvas">
        {Object.keys(lists).map((list, index) =>
            <List list={list} key={index}/>
        )}
      </div>
    </ContentContext.Provider>
  )
}
export default Content
