import { Search } from 'lucide-react';
import React, { useState } from 'react';

function DonorPaymentHistory() {
    // 1. Dummy Payment Data
    const initialPayments = [
        {
            id: 1,
            installment: "1st Installment",
            amount: "₹ 25,000",
            dueDate: "10/01/2026",
            receivedDate: "08/01/2026",
            mode: "Online (UPI)",
            utr: "BANK987654321"
        },
        {
            id: 2,
            installment: "2nd Installment",
            amount: "₹ 25,000",
            dueDate: "10/02/2026",
            receivedDate: "12/02/2026",
            mode: "Cheque",
            utr: "CHQ-552014"
        }
    ];

    const [payments] = useState(initialPayments);
    const [searchTerm, setSearchTerm] = useState("");

    // 2. Search Logic
    const filteredPayments = payments.filter(p =>
        p.installment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.utr.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 min-h-screen bg-gray-50 relative">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-700">Donor Payment History</h1>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Search Bar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="text-lg font-semibold text-gray-800">
                        Anil Jain
                    </div>
                    <div className="relative w-full max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by installment, mode, or UTR..."
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
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Installment</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Installment Due Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date Installment Received</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Mode of Payment</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">UTR Number</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map((payment, index) => (
                                <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{payment.installment}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-600">{payment.amount}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{payment.dueDate}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{payment.receivedDate}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                            {payment.mode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono text-gray-500 uppercase tracking-tight">
                                        {payment.utr}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-10 text-center text-gray-400">
                                    No payment records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DonorPaymentHistory;