import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, SearchAlert } from 'lucide-react';
import { API } from '../api/BaseURL';

/* ---------------- Delete Modal ---------------- */
const DeleteModal = ({ isOpen, onClose, onConfirm, bankName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                <h2 className="text-xl font-bold mb-4">Delete Bank</h2>
                <p>Are you sure you want to delete <strong>{bankName}</strong>?</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
                </div>
            </div>
        </div>
    );
};

/* ---------------- Add/Edit Modal ---------------- */
const BankModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        bank_name: "",
        account_holder_name: "",
        branch_name: "",
        ifsc_code: "",
        account_no: "",
        status: "active"
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                bank_name: "",
                account_holder_name: "",
                branch_name: "",
                ifsc_code: "",
                account_no: "",
                status: "active"
            });
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">
                        {initialData ? "Edit Bank" : "Add Bank"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <input
                        required
                        placeholder="Bank Name"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />

                    <input
                        required
                        placeholder="Account Holder Name"
                        value={formData.account_holder_name}
                        onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />

                    <input
                        placeholder="Branch Name"
                        value={formData.branch_name}
                        onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />

                    <input
                        placeholder="IFSC Code"
                        value={formData.ifsc_code}
                        onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />

                    <input
                        required
                        placeholder="Account Number"
                        value={formData.account_no}
                        onChange={(e) => setFormData({ ...formData, account_no: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />

                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" className="bg-[#d94452] text-white px-4 py-2 rounded">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ---------------- Main Page ---------------- */
function RBFBankDetails() {

    const [banks, setBanks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBank, setSelectedBank] = useState(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // const fetchBanks = async () => {
    //     try {
    //         const res = await fetch(`${API}/api/banks`);
    //         const data = await res.json();
    //         setBanks(data);
    //     } catch (err) {
    //         console.error(err);
    //     }
    // };


    const fetchBanks = async () => {
        try {
            const res = await fetch(`${API}/api/banks`);
            const data = await res.json();

            // ✅ FIX: Ensure it's always an array
            if (Array.isArray(data)) {
                setBanks(data);
            } else if (Array.isArray(data?.data)) {
                setBanks(data.data);
            } else if (Array.isArray(data?.banks)) {
                setBanks(data.banks);
            } else {
                setBanks([]);
            }

        } catch (err) {
            console.error(err);
            setBanks([]); // fallback
        }
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    const handleSave = async (formData) => {
        try {
            if (selectedBank) {
                await fetch(`${API}/api/banks/${selectedBank.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });
            } else {
                await fetch(`${API}/api/banks/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });
            }

            fetchBanks();
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const handleDelete = async () => {
        await fetch(`${API}/api/banks/${selectedBank.id}`, {
            method: "DELETE"
        });
        fetchBanks();
        setIsDeleteModalOpen(false);
    };
    const filtered = useMemo(() => {
        if (!Array.isArray(banks)) return [];

        return banks.filter(b =>
            String(b?.bank_name || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
    }, [banks, searchTerm]);
    return (
        <div className="p-8 bg-gray-50 min-h-screen">

            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Bank Details</h1>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-[#d94452] hover:bg-[#c13946] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                    <Plus size={18} /> Add Bank
                </button>
            </div>

            {/* <input
                placeholder="Search bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input mb-4"
            /> */}

             <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                                <div className="relative w-full sm:max-w-sm">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <SearchAlert size={16} />
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
                                    Showing  result(s)
                                </p>
                            </div>

            <table className="w-full bg-white">
                <thead>
                    <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Bank</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Holder</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">IFSC</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(b => (
                        <tr key={b.id}>
                            <td>{b.bank_name}</td>
                            <td>{b.account_holder_name}</td>
                            <td>{b.ifsc_code}</td>
                            <td>{b.status}</td>
                            <td>
                                <Edit onClick={() => {
                                    setSelectedBank(b);
                                    setIsEditModalOpen(true);
                                }} />
                                <Trash2 onClick={() => {
                                    setSelectedBank(b);
                                    setIsDeleteModalOpen(true);
                                }} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <BankModal
                isOpen={isAddModalOpen || isEditModalOpen}
                initialData={selectedBank}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setSelectedBank(null);
                }}
                onSave={handleSave}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                bankName={selectedBank?.bank_name}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}

export default RBFBankDetails;
