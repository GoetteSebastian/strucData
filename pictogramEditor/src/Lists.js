import React, { useState, useEffect } from 'react'
import Header from './Header'
import ListBox from './ListBox'

var Lists = (props) => {
    const [lists, setLists] = useState([])
    useEffect(() => {
        window.ipc.on('GET/lists.res', (args) => {
            setLists(args)
        })
        window.ipc.send('GET/lists.req', "")
    }, [])

    useEffect(() => () => {
        window.ipc.removeAll('GET/lists.res')
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