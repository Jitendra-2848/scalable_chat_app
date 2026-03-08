import { Plus, SearchIcon } from 'lucide-react';
import React from 'react';
import { useChat } from '../hooks/useChat';
import { User } from '../types';

interface PeopleProps {
  onAddClick: () => void;
}

const People: React.FC<PeopleProps> = ({ onAddClick }) => {
  const { filteredUsers, selectUser, users, selectedUser, searchQuery, setSearchQuery } = useChat();
  return (
    <div className="sm:max-w-[25%] w-full h-screen flex flex-col overflow-hidden border-r border-gray-200">
      <div className="p-2 bg-orange-300 flex-none">
        <div className='flex justify-between items-center'>
        <h1 className="font-extrabold text-3xl tracking-tighter text-white">Chat kare!!</h1>
        <button onClick={()=>{onAddClick()}} title='Add people' className='target:text-black px-2 hover:bg-gray-400 py-2 hover:bg-opacity-30 rounded-full'><Plus color='white' size={20}/></button>
        </div>
        <p className="text-xs p-1 text-orange-900 opacity-80">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum, eos.
        </p>
        <div className="w-full mt-2">
          <hr className="my-2 border-orange-400" />
          <div className="flex w-full relative items-center">
            <input
              type="text"
              placeholder="search..."
              className="border-none rounded-md bg-white/90 flex-1 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all pe-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon size={16} className="absolute right-3 text-gray-500" />
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto bg-gray-100 min-h-0'>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user: User,idx) => (
            <div
              key={idx}
              onClick={() => selectUser(user)}
              className={`hover:bg-gray-200 cursor-pointer duration-200 transition-all py-4 px-3 flex justify-between border-b border-gray-200 ${
                selectedUser?.id === user.id ? 'bg-gray-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center min-w-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-12 w-12 rounded-full flex-none object-cover border border-gray-300"
                />
                <div className="flex flex-col px-3 min-w-0">
                  <h1 className="font-semibold text-base truncate">{user.name}</h1>
                  <h1 className="text-sm px-4 text-gray-500 truncate">{user.last_message}</h1>
                </div>
              </div>
              <div className="flex-none">
                <h1 className="text-[10px] font-medium text-gray-500">{user.last_message_time?.split('T')[1].split(':').splice(0,2).join(":")}</h1>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-gray-400 text-sm italic">
            No users found
          </div>
        )}
      </div>
    </div>
  );
};

export default People;
