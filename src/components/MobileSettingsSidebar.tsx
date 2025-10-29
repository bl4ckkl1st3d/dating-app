import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Import necessary icons
import { X, SlidersHorizontal, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; //

interface MobileSettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterClick?: () => void; // Prop for filter click
}

const MobileSettingsSidebar: React.FC<MobileSettingsSidebarProps> = ({
  isOpen,
  onClose,
  onFilterClick,
}) => {
  const { logout } = useAuth(); //
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout(); //
    navigate('/login'); // Redirects to login page
  };

  const handleFilter = () => {
    if (onFilterClick) {
      onFilterClick(); // Calls the function passed from AppNavbar to open filter modal
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-pink-500">
                <X size={24} />
              </button>
            </div>

            {/* Menu */}
            <div className="flex flex-col p-4 space-y-1">
              {/* Edit Profile Link */}
              <Link
                to="/edit-profile" // Navigates to EditProfile page
                className="text-gray-700 font-medium text-left hover:text-pink-500 py-2 flex items-center" // Use flex
                onClick={onClose} // Close sidebar when navigating
              >
                <User size={18} className="mr-2" /> {/* <-- Added User Icon */}
                Edit Profile
              </Link>

              {/* Filter Button */}
              {onFilterClick && (
                <button
                  onClick={handleFilter} // Opens the filter modal
                  className="text-gray-700 font-medium text-left hover:text-pink-500 py-2 flex items-center" // Use flex
                >
                  <SlidersHorizontal size={18} className="mr-2" /> {/* <-- Added Filter Icon */}
                  Filter
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout} // Logs the user out
                className="text-gray-700 font-medium text-left hover:text-pink-500 py-2 flex items-center" // Use flex
              >
                 <LogOut size={18} className="mr-2" /> {/* <-- Added Logout Icon */}
                Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSettingsSidebar;