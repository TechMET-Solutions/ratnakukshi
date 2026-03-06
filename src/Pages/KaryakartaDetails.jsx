import React, { useState } from 'react';
import { ArrowLeft, Eye, FileText, Download } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

const KaryakartaDetails = () => {

    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('pending');

    // Dummy data for the table based on the image
    const requestsData = {
        pending: [
            { id: 1, familyHead: "Prakash Shah", memberName: "Ravi Shah", karyakarta: "Suresh Jain", assistance: "Medical", amount: "₹ 50,000" }
        ],
        approved: [
            { id: 2, familyHead: "Amit Patel", memberName: "Sonia Patel", karyakarta: "Suresh Jain", assistance: "Education", amount: "₹ 20,000" }
        ],
        rejected: [
            { id: 3, familyHead: "Rahul Gupta", memberName: "Vijay Gupta", karyakarta: "Suresh Jain", assistance: "Medical", amount: "₹ 15,000" }
        ]
    };

    const labelStyle = "text-gray-500 text-sm";
    const valueStyle = "text-gray-900 font-medium text-sm";

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-red-500 font-bold mb-6 hover:underline">
                <ArrowLeft size={20}  />
                Karyakarta Details
            </button>

            {/* Profile Header Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
                <div className="flex gap-8">
                    <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150"
                        alt="Karyakarta"
                        className="w-24 h-24 rounded-lg object-cover border border-gray-100"
                    />
                    <div className="grid grid-cols-2 flex-grow gap-x-12 gap-y-2">
                        <div className="space-y-2">
                            <p className={labelStyle}>Karyakarta ID : <span className={valueStyle}>KR1234</span></p>
                            <p className={labelStyle}>Karyakarta Name : <span className={valueStyle}>Amol Shah</span></p>
                            <p className={labelStyle}>Area assigned : <span className={valueStyle}>Malad</span></p>
                            <p className={labelStyle}>Date Joined : <span className={valueStyle}>15th March 2022</span></p>
                            <p className={labelStyle}>Contact Number : <span className={valueStyle}>99999 99999</span></p>
                        </div>
                        <div className="space-y-2 border-l pl-12 border-gray-100">
                            <p className={labelStyle}>Email ID : <span className={valueStyle}>ravi1234_kr@ratnakukshi.org</span></p>
                            <p className={labelStyle}>Date of Birth : <span className={valueStyle}>8th May 1998</span></p>
                            <p className={labelStyle}>Age : <span className={valueStyle}>25</span></p>
                            <p className={labelStyle}>Education : <span className={valueStyle}>Graduation</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Work Related Insights Section */}
            <h3 className="text-red-500 font-bold mb-4">Work Related Insights</h3>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
                {/* Tabs Headers */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'pending' ? 'bg-yellow-100/50 text-gray-800' : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        Pending Requests <span className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">1</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium border-x border-gray-200 transition-colors ${activeTab === 'approved' ? 'bg-green-50 text-gray-800' : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        Approved Requests <span className="bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">10</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('rejected')}
                        className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'rejected' ? 'bg-red-50 text-gray-800' : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        Rejected Requests <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">3</span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    <h4 className="font-bold text-gray-700 mb-4 capitalize">{activeTab} Requests</h4>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#ECB0004D]/80">
                                <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">Family Head</th>
                                <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">Member Name</th>
                                <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">Karyakarta</th>
                                <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">Assistance</th>
                                <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">Requested Amt.</th>
                                <th className="p-3 text-center text-xs font-bold text-gray-600 border-b">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requestsData[activeTab].map((req) => (
                                <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="p-3 text-sm text-gray-700">{req.familyHead}</td>
                                    <td className="p-3 text-sm text-gray-700">{req.memberName}</td>
                                    <td className="p-3 text-sm text-gray-700">{req.karyakarta}</td>
                                    <td className="p-3 text-sm text-gray-700">{req.assistance}</td>
                                    <td className="p-3 text-sm text-gray-700 font-semibold">{req.amount}</td>
                                    <td className="p-3 text-center">
                                        <button className="text-yellow-600 hover:scale-110 transition-transform"><Eye size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Uploaded Documents Section */}
            <h3 className="text-red-500 font-bold mb-4">Uploaded Documents</h3>
            <div className="flex gap-4">
                {[
                    { name: 'Amol_shah_adharcard.pdf' },
                    { name: 'Amol_Shah_passport.pdf' }
                ].map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 bg-white min-w-[320px] shadow-sm">
                        <div className="bg-red-50 p-2.5 rounded">
                            <FileText className="text-red-500" size={28} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">{doc.name}</span>
                            <button className="text-blue-500 text-[10px] font-bold flex items-center gap-1 hover:underline mt-1">
                                <Download size={12} /> DOWNLOAD
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KaryakartaDetails;