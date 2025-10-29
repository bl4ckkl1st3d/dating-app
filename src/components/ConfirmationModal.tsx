// src/components/ConfirmationModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean; // To style the confirm button differently
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel} // Close on overlay click
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-message"
          >
            <div className="p-6">
              <div className="flex items-start space-x-3">
                 {isDestructive && (
                     <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100 sm:h-10 sm:w-10">
                         <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                     </div>
                 )}
                <div className="flex-1">
                   <h3 className="text-lg leading-6 font-semibold text-gray-900" id="modal-title">
                       {title}
                   </h3>
                   <div className="mt-2">
                     <p className="text-sm text-gray-500" id="modal-message">
                       {message}
                     </p>
                   </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
              <button
                type="button"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm transition-colors
                  ${isDestructive
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-pink-600 hover:bg-pink-700 focus:ring-pink-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;