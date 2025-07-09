import React from 'react';

interface DeleteModalProps {
  onDelete: () => void;
  onClose: () => void;
  showModal: boolean;
  loading?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ onDelete, onClose, showModal, loading }) => {
  if (!showModal) return null; // Don't render modal if not shown

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this customer? This action cannot be undone.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
