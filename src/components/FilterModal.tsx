// src/components/FilterModal.tsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react'; // Import CheckCircle for success message

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  // --- Added Props ---
  initialMinAge: number; // Receive current min age
  initialMaxAge: number; // Receive current max age
  onApplyFilters: (filters: { minAge: number; maxAge: number }) => void; // Callback function
  // --- End Added Props ---
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  // --- Destructure new props ---
  initialMinAge,
  initialMaxAge,
  onApplyFilters,
  // --- End Destructure ---
}) => {
  // Initialize state from props
  const [minAge, setMinAge] = useState(initialMinAge);
  const [maxAge, setMaxAge] = useState(initialMaxAge);
  const [showSuccess, setShowSuccess] = useState(false); // State for success message

  // Reset local state if initial props change (e.g., modal reopens with different filters)
  useEffect(() => {
    if (isOpen) {
      setMinAge(initialMinAge);
      setMaxAge(initialMaxAge);
      setShowSuccess(false); // Reset success message when modal opens
    }
  }, [isOpen, initialMinAge, initialMaxAge]);

  const handleApply = () => {
    // Basic validation: ensure minAge is not greater than maxAge
    if (minAge > maxAge) {
      // Handle error - maybe show an error message instead of success
      console.error("Min age cannot be greater than max age");
      // Optionally set an error state here
      return;
    }

    console.log('Applying filters:', { minAge, maxAge });
    onApplyFilters({ minAge, maxAge }); // Pass the selected values back up

    // Show success message
    setShowSuccess(true);
    // Optionally close the modal after a short delay
    setTimeout(() => {
        onClose();
        // setShowSuccess(false); // Reset success when modal actually closes (handled by useEffect on isOpen)
    }, 1500); // Close after 1.5 seconds
  };

  // Prevent closing immediately if success message is shown
  const handleClose = () => {
    if (!showSuccess) {
        onClose();
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose} // Use handleClose
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Filter Matches</h2>
              <button onClick={handleClose} className="text-gray-500 hover:text-pink-500" disabled={showSuccess}>
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Conditional Success Message */}
              {showSuccess ? (
                  <div className="flex items-center justify-center text-green-600 p-4 bg-green-50 rounded-md">
                    <CheckCircle size={20} className="mr-2"/>
                    <span>Filter applied!</span>
                  </div>
              ) : (
                <>
                  <h3 className="text-md font-medium text-gray-700">Age Range</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label htmlFor="minAge" className="block text-sm text-gray-600 mb-1">Min</label>
                      <input
                        type="number"
                        id="minAge"
                        value={minAge}
                        onChange={(e) => setMinAge(Math.max(18, parseInt(e.target.value, 10) || 18))} // Ensure min is 18, handle NaN
                        min="18"
                        max={maxAge} // Dynamic max based on maxAge state
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="maxAge" className="block text-sm text-gray-600 mb-1">Max</label>
                      <input
                        type="number"
                        id="maxAge"
                        value={maxAge}
                        onChange={(e) => setMaxAge(Math.min(100, parseInt(e.target.value, 10) || 100))} // Ensure max is 100, handle NaN
                        min={minAge} // Dynamic min based on minAge state
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                   {/* Display current range */}
                   <p className="text-center text-gray-500 text-sm">Selected range: {minAge} - {maxAge}</p>
                </>
              )}
            </div>

            {/* Footer - Disable buttons when success message is shown */}
            {!showSuccess && (
                <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-pink-500 text-white rounded-md text-sm font-medium hover:bg-pink-600 transition-colors"
                    onClick={handleApply}
                  >
                    Apply Filters
                  </button>
                </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterModal;