import React, { useState } from 'react'
import People from '../components/People'
import Chat from '../components/Chat'
import AddPeople from '../components/AddPeople'
import { useChat } from '../hooks/useChat'

const Home = () => {
    const [openAddPeople, setOpenAddPeople] = useState(false)
    const { selectUser } = useChat()
    const [selectedUser, setSelectedUser] = useState<{
        id: number,
        name: string,
        email: string,
    } | {}>({})
    return (
        <div className="flex relative">
            <People onAddClick={() => setOpenAddPeople(true)} />
            <div className='hidden w-full sm:block'><Chat User={selectedUser} /></div>
            {openAddPeople && (
                <AddPeople onClose={() => setOpenAddPeople(false)}
                    onSelectUser={(x) => {
                        console.log(x)
                        setSelectedUser(x)
                        selectUser(x);
                        setOpenAddPeople(false);
                    }
                    }
                />
            )}
        </div>
    )
}

export default Home