import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Settings, Home, SlidersHorizontal } from 'lucide-react'; // Using SlidersHorizontal
import SettingsDropdown from './SettingsDropdown'; //
import MobileSettingsSidebar from './MobileSettingsSidebar'; //
import FilterModal from './FilterModal'; // Assumes FilterModal.tsx exists
// --- Import useFilters and AgeFilters ---
import { useFilters, AgeFilters } from '../context/FilterContext'; // Import hook and type from your FilterContext file
// --- End Import ---


const AppNavbar: React.FC = () => {
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false); // State for desktop dropdown
  const settingsRef = useRef<HTMLDivElement>(null); // Ref for desktop dropdown

  // --- Use Filter Context ---
  const { filters, setFilters } = useFilters(); // Get state and setter from context
  // --- End Use Context ---


  // Effect for closing desktop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false); // Close desktop dropdown
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openMobileSidebar = () => setShowSettingsSidebar(true);
  const closeMobileSidebar = () => setShowSettingsSidebar(false);
  const toggleFilterModal = () => setShowFilterModal((prev) => !prev);
  const toggleDesktopDropdown = () => setShowSettingsDropdown((prev) => !prev);

  const handleMobileFilterClick = () => {
    closeMobileSidebar();
    toggleFilterModal();
  };

  // --- Function to Apply Filters ---
  const handleApplyFilters = (newFilters: AgeFilters) => {
    console.log('[AppNavbar] Filters Applied:', newFilters);
    setFilters(newFilters); // Use context setter
    // Triggering refetch happens in Dashboard via useEffect dependency
  };
  // --- End Apply Filters Function ---


  return (
    <>
      <nav
        className="
          fixed bottom-0 left-0 right-0
          md:sticky md:top-0 md:bottom-auto
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
              {/* Desktop Filter Button */}
              <button
                onClick={toggleFilterModal} // Opens filter modal directly
                className="text-gray-500 hover:text-pink-500 p-2 rounded-full hover:bg-pink-50"
                aria-label="Open filters"
              >
                <SlidersHorizontal size={24} />
              </button>
              <Link
                to="/messages"
                className="text-gray-500 hover:text-pink-500 p-2 rounded-full hover:bg-pink-50"
              >
                <MessageSquare size={24} />
              </Link>
              {/* Desktop Settings Dropdown */}
              <div className="relative" ref={settingsRef}>
                 <button onClick={toggleDesktopDropdown} className="text-gray-500 hover:text-pink-500 p-2 rounded-full hover:bg-pink-50">
                    <Settings size={24} />
                 </button>
                 {showSettingsDropdown && (
                   <div className="hidden md:block">
                     <SettingsDropdown onClose={() => setShowSettingsDropdown(false)} />
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Mobile Bottom Navbar */}
          <div className="flex md:hidden justify-around items-center h-16">
             <Link to="/dashboard" className="text-gray-500 hover:text-pink-500 p-3 rounded-full hover:bg-pink-50">
                <Home size={28} />
             </Link>
             <Link to="/messages" className="text-gray-500 hover:text-pink-500 p-3 rounded-full hover:bg-pink-50">
                <MessageSquare size={28} />
             </Link>
             <button onClick={openMobileSidebar} className="text-gray-500 hover:text-pink-500 p-3 rounded-full hover:bg-pink-50">
                <Settings size={28} />
             </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <MobileSettingsSidebar
          isOpen={showSettingsSidebar}
          onClose={closeMobileSidebar}
          onFilterClick={handleMobileFilterClick}
        />
      </div>

      {/* Render Filter Modal - Pass state from context and handler */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={toggleFilterModal}
        initialMinAge={filters.minAge} // Pass current min age from context state
        initialMaxAge={filters.maxAge} // Pass current max age from context state
        onApplyFilters={handleApplyFilters}  // Pass the handler function
      />
    </>
  );
};

export default AppNavbar;