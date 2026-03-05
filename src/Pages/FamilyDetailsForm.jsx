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
    const [assistanceTypes] = useState(['Medical', 'Education', 'Jobs', 'Unemployed Farmer', 'Tiffin Services']);
    const [additionalRelations, setAdditionalRelations] = useState({});
    const [headOfFamily, setHeadOfFamily] = useState(null);

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
                    relationName: '',
                    relationDetailsName: '',
                    fullName: '',
                    aadharNumber: '',
                    photo: '',
                    ayushman: null,
                    amount: '',
                    mediclaim: null,
                    needAssistance: null,
                    assistanceCategories: []
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

    const handleHeadOfFamilyChange = (relation) => {
        // If the current head is being unchecked, set to null
        if (headOfFamily === relation) {
            setHeadOfFamily(null);
        } else {
            // Set the new head of family (exclusive)
            setHeadOfFamily(relation);
        }
    };

    const handleProfileUpload = (relation, event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                handleRelationDetailChange(relation, 'photo', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAssistanceCategory = (relation, category) => {
        setRelationDetails(prev => ({
            ...prev,
            [relation]: {
                ...prev[relation],
                assistanceCategories: prev[relation]?.assistanceCategories.includes(category)
                    ? prev[relation].assistanceCategories.filter(c => c !== category)
                    : [...(prev[relation]?.assistanceCategories || []), category]
            }
        }));
    };

    const handleAddRelationRow = (baseRelation) => {
        const relationType = baseRelation;
        const count = (additionalRelations[relationType]?.length || 0) + 1;
        const newRelationId = `${relationType}-${count}`;

        setAdditionalRelations(prev => ({
            ...prev,
            [relationType]: [...(prev[relationType] || []), newRelationId]
        }));

        setRelationDetails(prev => ({
            ...prev,
            [newRelationId]: {
                relationName: '',
                relationDetailsName: '',
                fullName: '',
                aadharNumber: '',
                photo: '',
                ayushman: null,
                amount: '',
                mediclaim: null,
                needAssistance: null,
                assistanceCategories: []
            }
        }));

        setFormData(prev => ({
            ...prev,
            relations: [...prev.relations, newRelationId]
        }));

        // Auto-expand the new accordion
        setExpandedRelations(prev => ({
            ...prev,
            [newRelationId]: true
        }));
    };

    const handleRemoveRelationRow = (relationId, baseRelation) => {
        setAdditionalRelations(prev => ({
            ...prev,
            [baseRelation]: prev[baseRelation]?.filter(id => id !== relationId) || []
        }));

        setFormData(prev => ({
            ...prev,
            relations: prev.relations.filter(r => r !== relationId)
        }));

        setRelationDetails(prev => {
            const newDetails = { ...prev };
            delete newDetails[relationId];
            return newDetails;
        });

        setExpandedRelations(prev => {
            const newExpanded = { ...prev };
            delete newExpanded[relationId];
            return newExpanded;
        });
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
                        {formData.relations.map((rel) => {
                            const baseRelation = rel.split('-')[0];
                            const isAdditionalRow = rel !== baseRelation;

                            return (
                                <div key={rel} className="border border-slate-300 rounded-md mb-3">

                                    <div className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedRelations(prev => ({ ...prev, [rel]: !prev[rel] }))}
                                            className="flex-1 flex items-center justify-between"
                                        >
                                            <span className="font-medium text-slate-800">{rel} Details</span>
                                            {expandedRelations[rel] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>

                                        {isAdditionalRow && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRelationRow(rel, baseRelation)}
                                                className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md flex-shrink-0"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>

                                    {expandedRelations[rel] && (
                                        <div className="flex p-4 border-t border-slate-300 space-y-4">
                                            <div className="w-[85%]">
                                                {/* Head of Family Member - Exclusive */}
                                                <div className="mb-4 p-3 w-[180px] bg-blue-50 rounded-md">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={headOfFamily === rel}
                                                            onChange={() => handleHeadOfFamilyChange(rel)}
                                                            className="w-5 h-5 border-slate-400 rounded"
                                                        />
                                                        <span className="font-semibold text-slate-700">Head of Family</span>
                                                    </label>
                                                </div>

                                                {/* Conditional Fields for "Other" Relation */}
                                                {rel === 'Other' && (
                                                    <div className="flex gap-6 mb-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-1">Relation Name<span className="text-red-500">*</span></label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g., Cousin, Uncle, Aunt"
                                                                value={relationDetails[rel]?.relationName || ''}
                                                                onChange={(e) => handleRelationDetailChange(rel, 'relationName', e.target.value)}
                                                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                                            />
                                                        </div>

                                                    </div>
                                                )}

                                                <div className="flex  gap-4">
                                                    {/* Full Name */}
                                                    <div className='w-[350px]'>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name<span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={relationDetails[rel]?.fullName || ''}
                                                            onChange={(e) => handleRelationDetailChange(rel, 'fullName', e.target.value)}
                                                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                                        />
                                                    </div>

                                                    {/* Aadhar Number */}
                                                    <div className='w-[250px]'>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Aadhar Number<span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={relationDetails[rel]?.aadharNumber || ''}
                                                            onChange={(e) => handleRelationDetailChange(rel, 'aadharNumber', e.target.value)}
                                                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                                        />
                                                    </div>

                                                    {/* Pan Number */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Pan Number<span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={relationDetails[rel]?.panNumber || ''}
                                                            onChange={(e) => handleRelationDetailChange(rel, 'panNumber', e.target.value)}
                                                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                                        />
                                                    </div>

                                                 


                                                </div>

                                                <div className="flex gap-6 mt-4 w-full">
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
                                                   
                                                    {/* Do they have any Mediclaim policy?* Radio */}
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700 mb-2">Do they have any Mediclaim policy?<span className="text-red-500">*</span></p>
                                                        <div className="flex gap-4">
                                                            <label className="flex items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name={`mediclaim-${rel}`}
                                                                    checked={relationDetails[rel]?.mediclaim === true}
                                                                    onChange={() => handleRelationDetailChange(rel, 'mediclaim', true)}
                                                                />
                                                                Yes
                                                            </label>
                                                            <label className="flex items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name={`mediclaim-${rel}`}
                                                                    checked={relationDetails[rel]?.mediclaim === false}
                                                                    onChange={() => handleRelationDetailChange(rel, 'mediclaim', false)}
                                                                />
                                                                No
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700 mb-2">Need Assistance<span className="text-red-500">*</span></p>
                                                        <div className="flex gap-4">
                                                            <label className="flex items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name={`needAssistance-${rel}`}
                                                                    checked={relationDetails[rel]?.needAssistance === true}
                                                                    onChange={() => handleRelationDetailChange(rel, 'needAssistance', true)}
                                                                />
                                                                Yes
                                                            </label>
                                                            <label className="flex items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name={`needAssistance-${rel}`}
                                                                    checked={relationDetails[rel]?.needAssistance === false}
                                                                    onChange={() => handleRelationDetailChange(rel, 'needAssistance', false)}
                                                                />
                                                                No
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Amount - Conditional Render */}
                                                {relationDetails[rel]?.ayushman === true && (
                                                    <div className="w-[200px] mt-4">
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount<span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={relationDetails[rel]?.amount || ''}
                                                            onChange={(e) => handleRelationDetailChange(rel, 'amount', e.target.value)}
                                                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                                        />
                                                    </div>
                                                )} 
                                                {/* Show Assistance Categories when Need Assistance is Yes */}
                                                {relationDetails[rel]?.needAssistance === true && (
                                                    <div className="w-full mt-6">
                                                        <p className="text-sm font-medium text-slate-700 mb-3">Assistances<span className="text-red-500">*</span></p>
                                                        <div className="flex flex-wrap gap-4">
                                                            {assistanceTypes.map((type) => (
                                                                <label key={type} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={relationDetails[rel]?.assistanceCategories?.includes(type) || false}
                                                                        onChange={() => handleAssistanceCategory(rel, type)}
                                                                        className="w-4 h-4 border-slate-400 rounded"
                                                                    />
                                                                    <span>{type}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Photo Upload Preview - Right Side */}
                                            <div className="flex justify-center items-start mt-10 w-[15%] mb-4">
                                                <div className="relative flex-shrink-0 group">
                                                    <img
                                                        src={
                                                            relationDetails[rel]?.photo
                                                                ? relationDetails[rel].photo
                                                                : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E'
                                                        }
                                                        alt="profile"
                                                        className="w-[120px] h-[120px] border-2 border-gray-400 rounded object-cover"
                                                    />
                                                    <div
                                                        className="absolute inset-0 w-[120px] h-[120px] flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded cursor-pointer"
                                                        onClick={() =>
                                                            document.getElementById(`photoUpload-${rel}`).click()
                                                        }
                                                    >
                                                        <span className="text-white text-xs font-semibold">Upload</span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        id={`photoUpload-${rel}`}
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleProfileUpload(rel, e)}
                                                    />
                                                </div>
                                            </div>

                                           

                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 justify-end p-4 border-t border-slate-300 bg-slate-50">
                                        {/* <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md"
                                        >
                                            Cancel
                                        </button> */}
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add Row Buttons for Son, Daughter, Brother, Sister */}
                        {formData.relations.includes('Son') && (
                            <button
                                type="button"
                                onClick={() => handleAddRelationRow('Son')}
                                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md mb-3 flex items-center justify-center gap-2"
                            >
                                <span className="text-lg">+</span> Add Son
                            </button>
                        )}

                        {formData.relations.includes('Daughter') && (
                            <button
                                type="button"
                                onClick={() => handleAddRelationRow('Daughter')}
                                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md mb-3 flex items-center justify-center gap-2"
                            >
                                <span className="text-lg">+</span> Add Daughter
                            </button>
                        )}

                        {formData.relations.includes('Brother') && (
                            <button
                                type="button"
                                onClick={() => handleAddRelationRow('Brother')}
                                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md mb-3 flex items-center justify-center gap-2"
                            >
                                <span className="text-lg">+</span> Add Brother
                            </button>
                        )}

                        {formData.relations.includes('Sister') && (
                            <button
                                type="button"
                                onClick={() => handleAddRelationRow('Sister')}
                                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md mb-3 flex items-center justify-center gap-2"
                            >
                                <span className="text-lg">+</span> Add Sister
                            </button>
                        )}
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