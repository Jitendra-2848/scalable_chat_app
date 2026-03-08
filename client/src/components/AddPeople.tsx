import React from 'react';
import { user_info } from '../types';
import { useUser } from '../hooks/useUser';

interface AddPeopleProps {
  onClose: () => void;
  onSelectUser: (user: user_info) => void;
}

const AddPeople: React.FC<AddPeopleProps> = ({ onClose, onSelectUser }) => {
  const { userSearch, searchUserData, search } = useUser();

  return (
    <div className="fixed inset-0 p-5 flex justify-center items-center bg-black bg-opacity-40 z-50">
      <div className="bg-white w-96 max-h-[70vh] rounded-lg shadow-lg p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">Add People</h2>

        <input
          type="text"
          placeholder="Search people..."
          onChange={(e) => userSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && userSearch((e.target as HTMLInputElement).value)}
          className="w-full border text-sm rounded-lg focus:outline-none p-2 mb-4"
        />

        <div className="overflow-y-auto max-h-[50vh] space-y-1">
          {searchUserData.length === 0 && search.length > 0 ? (
            <span className="text-xs flex justify-center items-center">User not found!!</span>
          ) : (
            searchUserData.map((user: user_info) => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="rounded-lg bg-slate-300 p-2 flex items-center space-x-3 duration-500 border hover:cursor-pointer select-none hover:bg-slate-100"
              >
                <img src="" alt="avatar" className="h-10 aspect-[1] rounded-full bg-slate-600" />
                <div className="text-nowrap">
                  <p className="font-bold text-md">{user.name}</p>
                  <p className="truncate w-40 text-xs ps-1">{user.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPeople;