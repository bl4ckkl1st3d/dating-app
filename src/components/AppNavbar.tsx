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

  // Handler specifically for opening the mobile sidebar
  const openMobileSidebar = () => {
    setShowSettings(true);
  };

  // Handler specifically for toggling the desktop dropdown
  const toggleDesktopDropdown = () => {
    setShowSettings((prev) => !prev);
  };

  return (
    <>
      <nav
        className="
          fixed bottom-0 left-0 right-0
          md:sticky md:top-0 md:bottom-auto /* Changed from md:fixed */
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
              {/* Desktop Settings Dropdown */}
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={toggleDesktopDropdown} // Use specific handler
                  className="text-gray-500 hover:text-pink-500 p-2 rounded-full hover:bg-pink-50"
                >
                  <Settings size={24} />
                </button>
                {/* Conditionally render dropdown ONLY for desktop view */}
                {showSettings && (
                  <div className="hidden md:block"> {/* Hide on mobile */}
                    <SettingsDropdown onClose={() => setShowSettings(false)} />
                  </div>
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
            {/* Mobile Settings Sidebar Trigger */}
            <button
              onClick={openMobileSidebar} // Use specific handler
              className="text-gray-500 hover:text-pink-500 p-3 rounded-full hover:bg-pink-50"
            >
              <Settings size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar - Wrapped to hide on desktop */}
      {/* FIX: Added 'md:hidden' class here */}
      <div className="md:hidden">
        <MobileSettingsSidebar
          isOpen={showSettings} // State now controls sidebar visibility on mobile
          onClose={() => setShowSettings(false)}
        />
      </div>
    </>
  );
};

export default AppNavbar;