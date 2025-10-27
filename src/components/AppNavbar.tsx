import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Settings } from 'lucide-react';
import SettingsDropdown from './SettingsDropdown';
import MobileSettingsSidebar from './MobileSettingsSidebar';

const AppNavbar: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav
        className="
          fixed bottom-0 left-0 right-0
          md:fixed md:top-0 md:bottom-auto
          bg-white border-t border-gray-200
          md:border-b md:border-t-0
          shadow-t-lg md:shadow-sm
          z-40
        "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navbar */}
          <div className="hidden md:flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-pink-500">💕 Bond</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/messages"
                className="text-gray-500 hover:text-pink-500 p-2 rounded-full hover:bg-pink-50"
              >
                <MessageSquare size={24} />
              </Link>
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setShowSettings((prev) => !prev)}
                  className="text-gray-500 hover:text-pink-500 p-2 rounded-full hover:bg-pink-50"
                >
                  <Settings size={24} />
                </button>
                {showSettings && (
                  <SettingsDropdown onClose={() => setShowSettings(false)} />
                )}
              </div>
            </div>
          </div>

          {/* Mobile Bottom Navbar */}
          <div className="flex md:hidden justify-around items-center h-16">
            <Link
              to="/messages"
              className="text-gray-500 hover:text-pink-500 p-3 rounded-full hover:bg-pink-50"
            >
              <MessageSquare size={28} />
            </Link>

            <button
              onClick={() => setShowSettings(true)} // 👈 opens sidebar
              className="text-gray-500 hover:text-pink-500 p-3 rounded-full hover:bg-pink-50"
            >
              <Settings size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <MobileSettingsSidebar
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

export default AppNavbar;
