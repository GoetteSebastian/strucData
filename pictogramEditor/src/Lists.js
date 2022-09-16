import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"

import Header from './Header'
import ListBox from './ListBox'

var Lists = (props) => {
    let navigate = useNavigate()
    const [lists, setLists] = useState([])
    
    useEffect(() => { //on load
        window.ipc.on('GET/lists.res', (args) => {
            setLists(args)
        })
        window.ipc.on("PUSH/redirectTo", target => {
            navigate(target)
          })
        window.ipc.send('GET/lists.req', "")
    }, [])

    useEffect(() => () => { //on unload
        window.ipc.removeAll('GET/lists.res')
        window.ipc.removeAll('PUSH/redirectTo')
    }, [])

    return (
        <>
        <Header />
        <div id="listsContainerCanvas">
            {
            lists.map((list, index) =>
                <ListBox list={list} key={index} />
            )
            }
        </div>
        </>
    )
}

export default Lists