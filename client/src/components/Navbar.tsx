// Navbar.tsx
import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useUser } from '../hooks/useUser';

interface NavbarProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ showBack, onBack, title }) => {
  const { logout } = useUser();

  return (
    <div className="bg-[#7c6f64] text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-lg font-semibold tracking-tight">{title || '💬 Chat Kare'}</h1>
      </div>
      <button
        onClick={() => logout()}
        className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-3 py-2 rounded-xl text-sm font-medium transition-all"
      >
        <LogOut size={14} />
        Logout
      </button>
    </div>
  );
};

export default Navbar;