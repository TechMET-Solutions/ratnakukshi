import React, { useState } from 'react';
import { Plus, X, Trash2, Edit } from 'lucide-react';

function UserList() {
    // Dummy Data State
    const [users, setUsers] = useState([
        { id: 1, name: "Arjun Mehta", role: "Admin", email: "arjun@example.com", mobile: "9876543210" },
        { id: 2, name: "Sana Sharma", role: "Staff", email: "sana@design.io", mobile: "9123456789" },
        { id: 3, name: "Rahul Varma", role: "Admin", email: "rahul@corp.com", mobile: "8877665544" }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form submission handler
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const newUser = {
            id: users.length + 1,
            name: formData.get('name'),
            role: formData.get('role'),
            email: formData.get('email'),
            mobile: formData.get('mobile'),
        };

        setUsers([...users, newUser]);
        setIsModalOpen(false);
    };

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-700">User Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#d94452] hover:bg-[#c13946] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add User
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input name="name" required type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#d94452] outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select name="role" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#d94452] outline-none">
                                        <option>Admin</option>
                                        <option>Staff</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No</label>
                                    <input name="mobile" required type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#d94452] outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input name="email" required type="email" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#d94452] outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input name="password" required type="password" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#d94452] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <input name="confirmPassword" required type="password" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#d94452] outline-none" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm text-white bg-[#d94452] hover:bg-[#c13946] rounded-md shadow-sm">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Sr no</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Role</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Mobile No</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user, index) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'Staff' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{user.mobile}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="flex gap-3">
                                        <button className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                                        <button className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserList;