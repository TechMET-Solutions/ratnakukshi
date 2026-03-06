// import { Plus } from 'lucide-react'
// import React from 'react'
// import { Link } from 'react-router-dom'

// function DonorList() {
//   return (
//       <div className="p-8 min-h-screen">
//           {/* Header Section */}
//           <div className="flex justify-between items-center mb-6">
//               <h1 className="text-2xl font-bold text-slate-700">
//                   Donor List
//               </h1>
//               <Link
//                   to="/donor-add"
//                   className="bg-[#ECB000] hover:bg-[#ECB000] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
//               >
//                   <Plus size={18} />
//                   Add Donor
//               </Link>
//           </div>
//           {/* <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
// fgdf
//               </div> */}

//           <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
//               <div className="flex">
//                   {/* search and Filter Dropdown */}
//               </div>
//               <table className="w-full text-left border-collapse">
//                   <thead>
//                       <tr className="bg-gray-50 border-b border-gray-100">
//                           <th className="px-6 py-4 text-sm font-semibold text-gray-700">
//                               Sr. No.
//                           </th>
//                           <th className="px-6 py-4 text-sm font-semibold text-gray-700">
//                               Donor Name
//                           </th>
//                           <th className="px-6 py-4 text-sm font-semibold text-gray-700">
//                               Contact No.
//                           </th>
//                           <th className="px-6 py-4 text-sm font-semibold text-gray-700">
//                               Email
//                           </th>
//                           <th className="px-6 py-4 text-sm font-semibold text-gray-700">
//                               Total Donation
//                           </th>
//                           <th className="px-6 py-4 text-sm font-semibold text-gray-700">
//                               Due Amount
//                           </th>
                          
//                           <th className="px-6 py-4 text-sm font-semibold text-gray-700">
//                               Actions
//                           </th>
//                           <th className="px-6 py-4 text-sm font-semibold text-gray-700">
//                               Recepit
//                           </th>
//                       </tr>
//                   </thead>
//                   <tbody>
                      
//                   </tbody>
//               </table>
//           </div>
//       </div>
//   )
// }

// export default DonorList

import { Plus, Search, Filter, Edit, Trash2, FileText, CreditCard, Award } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function DonorList() {
    // 1. Dummy Data
    const initialDonors = [
        {
            id: 1,
            name: "Rahul Sharma",
            contact: "+91 98765 43210",
            email: "rahul.s@example.com",
            totalDonation: 50000,
            dueAmount: 5000,
        },
        {
            id: 2,
            name: "Anjali Gupta",
            contact: "+91 87654 32109",
            email: "anjali.g@example.com",
            totalDonation: 25000,
            dueAmount: 0,
        }
    ];

    const [donors] = useState(initialDonors);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    // 2. Search and Filter Logic
    const filteredDonors = donors.filter(donor => {
        const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donor.contact.includes(searchTerm);

        if (filterStatus === "Due") return matchesSearch && donor.dueAmount > 0;
        if (filterStatus === "Paid") return matchesSearch && donor.dueAmount === 0;
        return matchesSearch;
    });

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-700">Donor List</h1>
                <Link
                    to="/donor/add"
                    className="bg-[#ECB000] hover:bg-[#d9a200] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add Donor
                </Link>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

                {/* Search and Filter Dropdown */}
                <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by name or contact..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-100"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Donors</option>
                            <option value="Due">Due Amount</option>
                            <option value="Paid">Fully Paid</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Sr. No.</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Donor Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Contact No.</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total Donation</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Due Amount</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Receipt</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredDonors.length > 0 ? (
                            filteredDonors.map((donor, index) => (
                                <tr key={donor.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{donor.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{donor.contact}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{donor.email}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">₹{donor.totalDonation.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${donor.dueAmount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            ₹{donor.dueAmount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex gap-3 text-gray-400">
                                            <button className="hover:text-blue-600 transition-colors"><Edit size={18} /></button>
                                            <button className="hover:text-green-600 transition-colors"><CreditCard size={18} /></button>
                                            <button className="hover:text-red-600 transition-colors"><Award size={18} /></button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-center">
                                        <button className="text-yellow-600 hover:text-yellow-700 inline-flex items-center gap-1 font-medium">
                                            <FileText size={16} />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-6 py-10 text-center text-gray-400">
                                    No donors found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DonorList;