import React from 'react'
import People from '../components/People'
import Chat from '../components/Chat'

const Home = () => {
    return (
        <div className="flex">
            <People />
            <Chat />
        </div>
    )
}

export default Home