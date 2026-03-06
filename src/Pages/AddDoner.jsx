import React from 'react';
import { ChevronLeft } from 'lucide-react';

function AddDonor() {
    return (
        <div className="min-h-screen bg-gray-50 flex p-6 justify-center">
            <div className="w-full max-w-6xl bg-white p-6 shadow-sm">
                <form className="space-y-8">
                    <h3 className="text-red-500 font-semibold text-lg">Personal Details</h3>

                    {/* SECTION: Personal Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Salutation<span className="text-red-500">*</span></label>
                            <select className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100">
                                <option value="">Select</option>
                                <option value="Shri">Shri.</option>
                                <option value="Smt">Smt.</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name<span className="text-red-500">*</span></label>
                            <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gender<span className="text-red-500">*</span></label>
                            <select className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100">
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth<span className="text-red-500">*</span></label>
                            <input type="date" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Anniversary<span className="text-red-500">*</span></label>
                            <input type="date" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number<span className="text-red-500">*</span></label>
                            <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Alt Mobile Number</label>
                            <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email ID<span className="text-red-500">*</span></label>
                            <input type="email" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group<span className="text-red-500">*</span></label>
                            <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mother Tongue<span className="text-red-500">*</span></label>
                            <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Native Place<span className="text-red-500">*</span></label>
                            <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Aadhar Card<span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                // onChange={(e) => setPhoto(e.target.files[0])}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Pan Card<span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                // onChange={(e) => setPhoto(e.target.files[0])}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Photo<span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                onChange={(e) => setPhoto(e.target.files[0])}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>
                    </div>

                    {/* SECTION: Contact Person Details */}
                    <div className="space-y-4">
                        <h3 className="text-red-500 font-semibold text-lg">Contact Person Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person Name<span className="text-red-500">*</span></label>
                                <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person Mobile Number<span className="text-red-500">*</span></label>
                                <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: Residential Address */}
                    <div className="space-y-4">
                        <h3 className="text-red-500 font-semibold text-lg">Residential Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Res. Address 1<span className="text-red-500">*</span></label>
                                <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Res. City<span className="text-red-500">*</span></label>
                                <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Res. Pincode<span className="text-red-500">*</span></label>
                                <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Res. Contact Code<span className="text-red-500">*</span></label>
                                <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Res. Contact Number<span className="text-red-500">*</span></label>
                                <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Res. Proof<span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <select className="flex-1 p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100">
                                        <option value="">Select</option>
                                    </select>
                                    <div className="flex border rounded-md overflow-hidden"><button type="button" className="bg-gray-100 px-3 py-1 border-r text-sm">Upload</button></div>
                                </div>
                            </div>
                        </div>
                        <div className="max-w-xs">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Address For Communication<span className="text-red-500">*</span></label>
                            <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                    </div>

                    {/* SECTION: Communication Address */}
                    <div className="space-y-4">
                        <h3 className="text-red-500 font-semibold text-lg">Communication Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Communication Address 1<span className="text-red-500">*</span></label>
                                <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Communication Address 2<span className="text-red-500">*</span></label>
                                <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: Company Details */}
                    <div className="space-y-4">
                        <h3 className="text-red-500 font-semibold text-lg">Company Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name<span className="text-red-500">*</span></label>
                                <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Company Number<span className="text-red-500">*</span></label>
                                <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Company Address<span className="text-red-500">*</span></label>
                                <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-6">
                        <button type="button" className="flex-1 md:flex-none bg-[#EAB308] hover:bg-yellow-600 text-white px-12 py-2.5 rounded-md font-bold uppercase shadow-sm transition-all flex items-center justify-center gap-2">
                            <ChevronLeft size={20} /> Previous
                        </button>
                        <button type="button" className="flex-1 md:flex-none bg-[#EAB308] hover:bg-yellow-600 text-white px-12 py-2.5 rounded-md font-bold uppercase shadow-sm transition-all">
                            Back
                        </button>
                        <div className="flex-1"></div>
                        <button type="submit" className="flex-1 md:flex-none bg-[#EAB308] hover:bg-yellow-600 text-white px-16 py-2.5 rounded-md font-bold uppercase shadow-sm transition-all">
                            Next
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddDonor;