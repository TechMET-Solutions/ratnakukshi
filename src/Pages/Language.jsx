import React, { useState, useMemo } from 'react';
import { useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { API } from '../api/BaseURL';

// Mock Modal Component (Replace with your actual Modal components)
const DeleteModal = ({ isOpen, onClose, onConfirm, languageName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                <h2 className="text-xl font-bold mb-4">Delete Language</h2>
                <p>Are you sure you want to delete <strong>{languageName}</strong>?</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
                </div>
            </div>
        </div>
    );
};

const LanguageModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({ name: "", status: "active" });

    // Sync form data when modal opens or initialData changes
    React.useEffect(() => {
        if (initialData) {
            setFormData({ name: initialData.name, status: initialData.status });
        } else {
            setFormData({ name: "", status: "active" });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? "Edit Language" : "Add New Language"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Spanish"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium bg-[#d94452] hover:bg-[#c13946] text-white rounded-md transition-colors"
                        >
                            {initialData ? "Update Language" : "Save Language"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

function Language() {
    // State for Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 5;

    const [form, setForm] = useState({
        name: "",
        status: "active",
    });


    const fetchLanguages = async () => {
        try {
            setIsLoading(true);

            const res = await fetch(`${API}/api/languages/list`);
            const data = await res.json();

            setLanguages(data);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLanguages();
    }, []);


    const handleSaveLanguage = async (formData) => {
        try {
            setIsLoading(true);

            if (selectedLanguage) {
                // UPDATE
                await fetch(`${API}/api/languages/update/${selectedLanguage.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
            } else {
                // CREATE
                await fetch(`${API}/api/languages/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
            }

            fetchLanguages(); // refresh list
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`${API}/api/languages/delete/${selectedLanguage.id}`, {
                method: "DELETE",
            });

            fetchLanguages();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.log(error);
        }
    };

    // --- Logic ---

    const filteredLanguages = useMemo(() => {
        return languages.filter(lang =>
            lang.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [languages, searchTerm]);

    const totalPages = Math.ceil(filteredLanguages.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLanguages = filteredLanguages.slice(startIndex, startIndex + itemsPerPage);

    const openUpdateModal = (lang) => {
        setSelectedLanguage(lang);
        setForm({ name: lang.name, status: lang.status });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (lang) => {
        setSelectedLanguage(lang);
        setIsDeleteModalOpen(true);
    };

    const closeAllModals = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedLanguage(null);
    };

    

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-700">Language</h1>
                <button
                    onClick={() => {
                        setSelectedLanguage(null); // Ensure no old data is loaded
                        setIsAddModalOpen(true);
                    }}                    className="bg-[#d94452] hover:bg-[#c13946] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add Language
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <Search size={16} />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by language name..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <p className="text-sm text-gray-600">
                        Showing {filteredLanguages.length} result(s)
                    </p>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Sr no</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Language Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : paginatedLanguages.length > 0 ? (
                            paginatedLanguages.map((lang, index) => (
                                <tr key={lang.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {lang.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${lang.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {lang.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => openUpdateModal(lang)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(lang)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                    No languages found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <LanguageModal
                isOpen={isAddModalOpen || isEditModalOpen}
                initialData={selectedLanguage}
                onClose={closeAllModals}
                onSave={handleSaveLanguage}
            />

            {/* Modals */}
            <DeleteModal
                isOpen={isDeleteModalOpen}
                languageName={selectedLanguage?.name}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}

export default Language;