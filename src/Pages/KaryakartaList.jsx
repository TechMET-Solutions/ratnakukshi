import { Edit, Eye, Plus, Search, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function KaryakartaList() {
    const navigate = useNavigate();

    // States
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Dummy Data
    const initialKaryakartas = [
        {
            id: 1,
            k_id: "KR-101",
            name: "Suresh Jain",
            contact: "+91 98765 43210",
            email: "suresh.jain@example.com",
            area: "Andheri, Mumbai",
        },
        {
            id: 2,
            k_id: "KR-102",
            name: "Mahesh Mehta",
            contact: "+91 87654 32109",
            email: "mahesh.m@example.com",
            area: "Kothrud, Pune",
        }
    ];

    const [karyakartas] = useState(initialKaryakartas);

    const filteredKaryakartas = karyakartas.filter(k =>
        k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.contact.includes(searchTerm) ||
        k.k_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Input Style Constant
    const inputClass = "w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-yellow-100 outline-none text-sm transition-all";

    return (
        <div className="p-8 min-h-screen bg-gray-50 relative">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-700">Karyakarta List</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#ECB000] hover:bg-[#d9a200] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add Karyakarta
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative w-full max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by ID, name or contact..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Sr. No.</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Karyakarta ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Karyakarta Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Contact No.</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Area</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredKaryakartas.map((k, index) => (
                            <tr key={k.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-700">{k.k_id}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-800">{k.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{k.contact}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{k.email}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{k.area}</td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    <div className="flex gap-3">
                                        <button onClick={() => navigate("/karyakarta/" + k.id)} className="hover:text-blue-600"><Eye size={18} /></button>
                                        <button className="hover:text-green-600"><Edit size={18} /></button>
                                        <button className="hover:text-red-600"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ADD KARYAKARTA MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-slate-800">Add New Karyakarta</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 uppercase">Full Name</label>
                                    <input type="text" placeholder="Enter Name" className={inputClass} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 uppercase">Email ID</label>
                                    <input type="email" placeholder="email@example.com" className={inputClass} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 uppercase">Mobile No.</label>
                                    <input type="text" placeholder="99999 99999" className={inputClass} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 uppercase">Area</label>
                                    <input type="text" placeholder="Area" className={inputClass} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 uppercase">Password</label>
                                    <input type="password" placeholder="••••••••" className={inputClass} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 uppercase">Confirm Password</label>
                                    <input type="password" placeholder="••••••••" className={inputClass} />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-md font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#ECB000] text-white rounded-md font-bold hover:bg-[#d9a200] transition-colors shadow-md"
                                >
                                    Save Karyakarta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KaryakartaList; 