import React from 'react'

const DeleteModal = ({ isOpen, userName, isDeleting, apiError, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-lg font-semibold text-gray-900">Delete User</h2>
                <p className="text-sm text-gray-600 mt-2">
                    Are you sure you want to delete <span className="font-semibold">{userName}</span>?
                </p>
                {apiError && <p className="text-sm text-red-600 mt-3">{apiError}</p>}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm disabled:opacity-60"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal