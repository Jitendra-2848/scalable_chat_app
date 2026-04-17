import { useState } from 'react';
import People from '../components/People';
import Chat from '../components/Chat';
import AddPeople from '../components/AddPeople';
import { useChat } from '../hooks/useChat';

const Home = () => {
  const [openAddPeople, setOpenAddPeople] = useState(false);
  const { selectUser, selectedUser } = useChat();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f5f1]">
  {/* People list */}
  <div className={`${selectedUser ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-[28%] h-full`}>
    <People onAddClick={() => setOpenAddPeople(true)} />
  </div>

  {/* Chat area */}
  <div className={`${selectedUser ? 'flex' : 'hidden sm:flex'} flex-col w-full h-full`}>
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