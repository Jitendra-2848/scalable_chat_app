import React from "react";
import { ArrowLeft } from "lucide-react";

interface NavbarProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ showBack, onBack, title }) => {
  return (
    <div className="bg-purple-600 text-white px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={onBack} className="p-1">
            <ArrowLeft size={24} />
          </button>
        )}
        <h1 className="text-xl font-bold">{title || "💬 Chatkaro"}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="bg-white text-purple-600 px-4 py-2 rounded font-medium text-sm">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;