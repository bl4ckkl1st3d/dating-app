import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut } from 'lucide-react';

interface SettingsDropdownProps {
  onClose: () => void;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({ onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
      <div className="py-1">
        <Link
          to="/edit-profile"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={onClose}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Edit Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsDropdown;