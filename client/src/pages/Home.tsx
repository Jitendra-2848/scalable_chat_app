import React, { useState } from 'react';
import People from '../components/People';
import Chat from '../components/Chat';
import AddPeople from '../components/AddPeople';
import { useChat } from '../hooks/useChat';

const Home = () => {
  const [openAddPeople, setOpenAddPeople] = useState(false);
  const { selectUser } = useChat();

  return (
    <div className="flex relative">
      <People onAddClick={() => setOpenAddPeople(true)} />
      <div className="hidden w-full sm:block">
        <Chat />
      </div>
      {openAddPeople && (
        <AddPeople
          onClose={() => setOpenAddPeople(false)}
          onSelectUser={(user) => {
            selectUser(user);
            setOpenAddPeople(false);
          }}
        />
      )}
    </div>
  );
};

export default Home;