import React, { useState, useEffect } from 'react'
import ListBox from './ListBox'

var Lists = (props) => {
    const [lists, setLists] = useState([])
    useEffect(() => {
        window.ipc.on('GET/listsX.res', (args) => {
            console.log(args)
        setLists(args)
        })
    }, [])

    useEffect(() => () => {
        window.ipc.removeAll('GET/listsX.res')
    }, [])

    return (
        <div id="listsContainerCanvas">
            {
            lists.map((list, index) =>
                <ListBox list={list} key={index} />
            )
            }
        </div>
    )
}

export default Lists