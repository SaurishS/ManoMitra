// src/components/SettingsModal.jsx
import { X } from 'lucide-react'; // We use the 'X' icon

function SettingsModal({ isOpen, onClose, isCameraHidden, onToggleCamera }) {
  if (!isOpen) return null;

  return (
    // Full-screen semi-transparent background
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75"
      onClick={onClose} // Close modal when clicking background
    >
      {/* The Modal itself */}
      <div
        className="relative w-11/12 max-w-md rounded-lg bg-gray-800 p-6 text-white shadow-lg"
        onClick={(e) => e.stopPropagation()} // Prevent background click
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="mb-6 text-2xl font-semibold text-cyan-400">
          Settings
        </h2>

        {/* The "Hide Camera" Toggle */}
        <div className="flex items-center justify-between">
          <label htmlFor="hide-camera" className="text-lg text-gray-200">
            Hide My Camera Feed
          </label>
          <button
            id="hide-camera"
            onClick={onToggleCamera}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isCameraHidden ? 'bg-cyan-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isCameraHidden ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Note: Your mood will still be analyzed, but your
          video will not be visible to you.
        </p>
      </div>
    </div>
  );
}

export default SettingsModal;