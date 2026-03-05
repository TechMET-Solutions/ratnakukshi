import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const FamilyDetailsForm = () => {
    const [formData, setFormData] = useState({
        permanentAddress: '',
        currentAddress: '',
        village: '',
        taluka: '',
        district: '',
        pinCode: '',
        houseDetails: '',
        typeOfHouse: '',
        maintenanceCost: '',
        lightBillCost: '',
        rentCost: '',
        relations: [],
        mediclaim: null,
        ngoAssistance: null
    });

    const [relationDetails, setRelationDetails] = useState({});
    const [expandedRelations, setExpandedRelations] = useState({});

    const handleCheckbox = (relation) => {
        setFormData(prev => ({
            ...prev,
            relations: prev.relations.includes(relation)
                ? prev.relations.filter(r => r !== relation)
                : [...prev.relations, relation]
        }));

        // Initialize relation details if not exists
        if (!relationDetails[relation]) {
            setRelationDetails(prev => ({
                ...prev,
                [relation]: {
                    fullName: '',
                    aadharNumber: '',
                    photo: '',
                    ayushman: null,
                    amount: ''
                }
            }));
        }

        // Toggle accordion expansion
        setExpandedRelations(prev => ({
            ...prev,
            [relation]: !prev[relation]
        }));
    };

    const handleRelationDetailChange = (relation, field, value) => {
        setRelationDetails(prev => ({
            ...prev,
            [relation]: {
                ...prev[relation],
                [field]: value
            }
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex p-6 justify-center">
            <div className="w-full max-w-6xl bg-white p-6 shadow-sm">

                {/* Header */}
                <div className="flex items-center gap-2 mb-8 text-slate-800">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 className="text-xl font-bold">Family Basic Details</h2>
                </div>

                <form className="space-y-6">
                    {/* Address Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Address (Permanent)<span className="text-red-500">*</span></label>
                            <input type="text" value={formData.permanentAddress} onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Address (Current)<span className="text-red-500">*</span></label>
                            <input type="text" value={formData.currentAddress} onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                    </div>

                    {/* Location Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Village<span className="text-red-500">*</span></label>
                            <input type="text" value={formData.village} onChange={(e) => setFormData({ ...formData, village: e.target.value })} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Taluka<span className="text-red-500">*</span></label>
                            <input type="text" value={formData.taluka} onChange={(e) => setFormData({ ...formData, taluka: e.target.value })} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">District<span className="text-red-500">*</span></label>
                            <input type="text" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Pin Code<span className="text-red-500">*</span></label>
                            <input type="text" value={formData.pinCode} onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                    </div>

                    {/* House Details Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">House Details<span className="text-red-500">*</span></label>
                            <div className="flex gap-6 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="house" value="own" checked={formData.houseDetails === 'own'} onChange={(e) => setFormData({ ...formData, houseDetails: e.target.value })} className="w-4 h-4 text-blue-600" /> <span>Own</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="house" value="rented" checked={formData.houseDetails === 'rented'} onChange={(e) => setFormData({ ...formData, houseDetails: e.target.value })} className="w-4 h-4 text-blue-600" /> <span>Rented</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type Of House<span className="text-red-500">*</span></label>
                            <input type="text" value={formData.typeOfHouse} onChange={(e) => setFormData({ ...formData, typeOfHouse: e.target.value })} className="w-full p-2 border border-slate-300 rounded-md outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Maintenance Cost<span className="text-red-500">*</span></label>
                            <input type="text" value={formData.maintenanceCost} onChange={(e) => setFormData({ ...formData, maintenanceCost: e.target.value })} className="w-full p-2 border border-slate-300 rounded-md outline-none" />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        {/* Rent Cost - Conditional Render */}
                        {formData.houseDetails === 'rented' && (
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rent Cost<span className="text-red-500">*</span></label>
                                <input type="text" value={formData.rentCost} onChange={(e) => setFormData({ ...formData, rentCost: e.target.value })} className="w-full p-2 border border-slate-300 rounded-md outline-none" />
                            </div>
                        )}

                        {/* Light Bill */}
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Light Bill cost<span className="text-red-500">*</span></label>
                            <input type="text" value={formData.lightBillCost} onChange={(e) => setFormData({ ...formData, lightBillCost: e.target.value })} className="w-full p-2 border border-slate-300 rounded-md outline-none" />
                        </div>

                    </div>

                    {/* Relations Section */}
                    <div>
                        <label className="block text-md font-bold text-slate-800 mb-3">Relations<span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-4 mb-4">
                            {['Father', 'Mother', 'Husband', 'Wife', 'Son', 'Daughter', 'Brother', 'Sister', 'Other'].map((rel) => (
                                <label key={rel} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.relations.includes(rel)}
                                        onChange={() => handleCheckbox(rel)}
                                        className="w-5 h-5 border-slate-400 rounded"
                                    />
                                    <span>{rel}</span>
                                </label>
                            ))}
                        </div>

                        {/* Relation Details Accordions */}
                        {formData.relations.map((rel) => (
                            <div key={rel} className="border border-slate-300 rounded-md mb-3">
                                <button
                                    type="button"
                                    onClick={() => setExpandedRelations(prev => ({ ...prev, [rel]: !prev[rel] }))}
                                    className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200"
                                >
                                    <span className="font-medium text-slate-800">{rel} Details</span>
                                    {expandedRelations[rel] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>

                                {expandedRelations[rel] && (
                                    <div className="p-4 border-t border-slate-300 space-y-4">
                                        {/* Full Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name<span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={relationDetails[rel]?.fullName || ''}
                                                onChange={(e) => handleRelationDetailChange(rel, 'fullName', e.target.value)}
                                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                            />
                                        </div>

                                        {/* Aadhar Number */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Aadhar Number<span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={relationDetails[rel]?.aadharNumber || ''}
                                                onChange={(e) => handleRelationDetailChange(rel, 'aadharNumber', e.target.value)}
                                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                            />
                                        </div>

                                        {/* Photo Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Upload Photo<span className="text-red-500">*</span></label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleRelationDetailChange(rel, 'photo', e.target.files?.[0]?.name || '')}
                                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                            />
                                        </div>

                                        {/* Ayushman Radio */}
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 mb-2">Does this person have Ayushman coverage?<span className="text-red-500">*</span></p>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name={`ayushman-${rel}`}
                                                        checked={relationDetails[rel]?.ayushman === true}
                                                        onChange={() => handleRelationDetailChange(rel, 'ayushman', true)}
                                                    />
                                                    Yes
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name={`ayushman-${rel}`}
                                                        checked={relationDetails[rel]?.ayushman === false}
                                                        onChange={() => handleRelationDetailChange(rel, 'ayushman', false)}
                                                    />
                                                    No
                                                </label>
                                            </div>
                                        </div>

                                        {/* Amount - Conditional Render */}
                                        {relationDetails[rel]?.ayushman === true && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Amount<span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={relationDetails[rel]?.amount || ''}
                                                    onChange={(e) => handleRelationDetailChange(rel, 'amount', e.target.value)}
                                                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Radio Questions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">Does the family have any Mediclaim policy?<span className="text-red-500">*</span></p>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2"><input type="radio" name="mediclaim" checked={formData.mediclaim === true} onChange={() => setFormData({ ...formData, mediclaim: true })} /> Yes</label>
                                <label className="flex items-center gap-2"><input type="radio" name="mediclaim" checked={formData.mediclaim === false} onChange={() => setFormData({ ...formData, mediclaim: false })} /> No</label>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">Is any NGO assistance received?<span className="text-red-500">*</span></p>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2"><input type="radio" name="ngo" checked={formData.ngoAssistance === true} onChange={() => setFormData({ ...formData, ngoAssistance: true })} /> Yes</label>
                                <label className="flex items-center gap-2"><input type="radio" name="ngo" checked={formData.ngoAssistance === false} onChange={() => setFormData({ ...formData, ngoAssistance: false })} /> No</label>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-dashed border-blue-200">
                        <div className="flex gap-4">
                            <button type="button" className="flex items-center justify-center gap-2 bg-[#EAB308] hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-md min-w-[120px]">
                                <span className="text-lg">←</span> Previous
                            </button>
                            <button type="button" className="bg-[#EAB308] hover:bg-yellow-600 text-white font-bold py-2 px-8 rounded-md min-w-[120px]">
                                Cancel
                            </button>
                        </div>
                        <button type="submit" className="bg-[#EAB308] hover:bg-yellow-600 text-white font-bold py-2 px-12 rounded-md min-w-[160px]">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FamilyDetailsForm;