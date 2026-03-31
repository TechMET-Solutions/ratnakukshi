import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { API } from '../api/BaseURL';

// --- Modals ---

const DeleteModal = ({ isOpen, onClose, onConfirm, resProofName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                <h2 className="text-xl font-bold mb-4">Delete ResProof</h2>
                <p>Are you sure you want to delete <strong>{resProofName}</strong>?</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
                </div>
            </div>
        </div>
    );
};

const ResProofModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({ name: "", status: "active" });

    useEffect(() => {
        if (initialData) {
            setFormData({ name: initialData.name, status: initialData.status });
        } else {
            setFormData({ name: "", status: "active" });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const saved = await onSave(formData);
        if (saved) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? "Edit ResProof" : "Add New ResProof"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ResProof Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Identity Proof"
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
                            {initialData ? "Update ResProof" : "Save ResProof"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Component ---

function ResProof() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedResProof, setSelectedResProof] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [resProofs, setResProofs] = useState([]);
    const itemsPerPage = 5;

    const fetchResProofs = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API}/api/resproof/list`);
            if (!res.ok) throw new Error("Failed to fetch ResProofs");
            const data = await res.json();
            setResProofs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setResProofs([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchResProofs();
    }, []);

    const handleSaveResProof = async (formData) => {
        try {
            setIsLoading(true);
            const payload = {
                name: String(formData?.name || "").trim(),
                status: formData?.status || "active",
            };

            if (!payload.name) {
                alert("ResProof name is required");
                return false;
            }

            if (selectedResProof) {
                // UPDATE
                const res = await fetch(`${API}/api/resproof/update/${selectedResProof.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Failed to update ResProof");
            } else {
                // CREATE
                const res = await fetch(`${API}/api/resproof/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Failed to create ResProof");
            }

            await fetchResProofs();
            return true;
        } catch (error) {
            console.error(error);
            alert(error?.message || "Failed to save ResProof");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedResProof?.id) return;
        try {
            setIsLoading(true);
            const res = await fetch(`${API}/api/resproof/delete/${selectedResProof.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete ResProof");

            await fetchResProofs();
            setIsDeleteModalOpen(false);
            setSelectedResProof(null);
        } catch (error) {
            console.error(error);
            alert(error?.message || "Failed to delete ResProof");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredResProofs = useMemo(() => {
        return resProofs.filter(item =>
            String(item?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [resProofs, searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, resProofs.length]);

    const totalPages = Math.ceil(filteredResProofs.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedResProofs = filteredResProofs.slice(startIndex, startIndex + itemsPerPage);

    const openUpdateModal = (resProof) => {
        setSelectedResProof(resProof);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (resProof) => {
        setSelectedResProof(resProof);
        setIsDeleteModalOpen(true);
    };

    const closeAllModals = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedResProof(null);
    };

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-700">ResProof</h1>
                <button
                    onClick={() => {
                        setSelectedResProof(null);
                        setIsAddModalOpen(true);
                    }}
                    className="bg-[#d94452] hover:bg-[#c13946] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add ResProof
                </button>
            </div>

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
                            placeholder="Search by ResProof name..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <p className="text-sm text-gray-600">
                        Showing {filteredResProofs.length} result(s)
                    </p>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Sr no</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">ResProof Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">Loading...</td>
                            </tr>
                        ) : paginatedResProofs.length > 0 ? (
                            paginatedResProofs.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600">{startIndex + index + 1}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => openUpdateModal(item)} className="text-blue-500 hover:text-blue-700">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => openDeleteModal(item)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">No ResProofs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
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

            <ResProofModal
                isOpen={isAddModalOpen || isEditModalOpen}
                initialData={selectedResProof}
                onClose={closeAllModals}
                onSave={handleSaveResProof}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                resProofName={selectedResProof?.name}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}

export default ResProof;