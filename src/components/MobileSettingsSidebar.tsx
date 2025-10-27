import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface MobileSettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSettingsSidebar: React.FC<MobileSettingsSidebarProps> = ({
  isOpen,
  onClose,
}) => {
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
            <div className="flex flex-col p-4 space-y-4">
              <button className="text-gray-700 font-medium text-left hover:text-pink-500">
                Account Settings
              </button>
              <button className="text-gray-700 font-medium text-left hover:text-pink-500">
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
