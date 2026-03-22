// AddPeople.tsx
import React from 'react';
import { user_info } from '../types';
import { useUser } from '../hooks/useUser';
import { X, Search, UserPlus } from 'lucide-react';

interface AddPeopleProps {
  onClose: () => void;
  onSelectUser: (user: user_info) => void;
}

const AddPeople: React.FC<AddPeopleProps> = ({ onClose, onSelectUser }) => {
  const { userSearch, searchUserData, search } = useUser();

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-slate-900/50 backdrop-blur-sm z-50">
      <div className="bg-white w-[420px] max-h-[75vh] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <UserPlus size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Add People</h2>
              <p className="text-xs text-white/60">Find someone to chat with</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              onChange={(e) => userSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && userSearch((e.target as HTMLInputElement).value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:bg-white border border-slate-200 focus:border-violet-400 transition-all"
            />
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[45vh] p-3">
          {searchUserData.length === 0 && search.length > 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Search size={24} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchUserData.map((user: user_info) => (
                <div
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className="rounded-xl bg-slate-50 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 p-3 flex items-center gap-3 cursor-pointer transition-all duration-200 group border border-transparent hover:border-violet-200"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-none shadow-lg shadow-violet-500/20">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700 group-hover:text-violet-700 transition-colors">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-8 w-8 rounded-full bg-violet-500 flex items-center justify-center">
                      <UserPlus size={14} className="text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPeople;