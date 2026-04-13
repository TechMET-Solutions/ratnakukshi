import { X } from 'lucide-react';
import React from 'react'

const UserFormModal = ({
    title,
    submitLabel,
    mode,
    isOpen,
    values,
    errors,
    isSubmitting,
    apiError,
    onClose,
    onChange,
    onPhotoChange,
    onSubmit,
}) => {
    if (!isOpen) return null;
    const expertPanelSubRoles = [
        { value: "expert-panel-medical", label: "Expert Panel - Medical" },
        { value: "expert-panel-job", label: "Expert Panel - Job" },
        { value: "expert-panel-educations", label: "Expert Panel - Educations" },
        { value: "expert-panel-food", label: "Expert Panel - Grocery" },
        { value: "expert-panel-rent", label: "Expert Panel - Rent" },
        { value: "expert-panel-housing", label: "Expert Panel - Housing" },
        { value: "expert-panel-vaiyavacch", label: "Expert Panel - Vaiyavacch" },
        {
            value: "expert-panel-livelihoodexpenses",
            label: "Expert Panel - LivelihoodExpenses",
        },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mt-4 px-6">
                    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            name="name"
                            type="text"
                            value={values.name}
                            onChange={onChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                        />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                name="role"
                                value={values.role}
                                onChange={onChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                            >
                                <option value="admin">Admin</option>
                                <option value="staff">Staff</option>
                                <option value="account">Account Panal</option>
                                <option value="karyakarta">Karyakarta</option>
                                <option value="operations-manager">Operations Manager</option>
                                <option value="case-coordinator">Case Co-ordinator</option>
                                <option value="expert-panel">Expert Panel</option>
                                {expertPanelSubRoles.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                                <option value="committee-member">Committee Member</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mobile No
                            </label>
                            <input
                                name="mobile"
                                type="text"
                                maxLength={10}
                                value={values.mobile}
                                onChange={(e) => {
                                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                                    onChange({ target: { name: "mobile", value: onlyNumbers } });
                                }}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                            />
                            {errors.mobile && (
                                <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>
                            )}
                        </div>
                    </div>
{/* 
                    {values.role === "karyakarta" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assign Location
                            </label>

                            {values.assignLocations?.map((loc, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={loc}
                                        onChange={(e) => {
                                            const updated = [...values.assignLocations];
                                            updated[index] = e.target.value;
                                            onChange({
                                                target: { name: "assignLocations", value: updated },
                                            });
                                        }}
                                        placeholder={`Location ${index + 1}`}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = [...values.assignLocations, ""];
                                            onChange({
                                                target: { name: "assignLocations", value: updated },
                                            });
                                        }}
                                        className="px-3 bg-green-500 text-white rounded-md"
                                    >
                                        +
                                    </button>

                                    {values.assignLocations.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = values.assignLocations.filter(
                                                    (_, i) => i !== index
                                                );
                                                onChange({
                                                    target: { name: "assignLocations", value: updated },
                                                });
                                            }}
                                            className="px-3 bg-red-500 text-white rounded-md"
                                        >
                                            -
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )} */}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={values.email}
                            onChange={onChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                        />
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Profile Photo
                        </label>
                        <input
                            name="profilePhoto"
                            type="file"
                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                            onChange={onPhotoChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                        />
                        {errors.profilePhoto && (
                            <p className="text-xs text-red-600 mt-1">{errors.profilePhoto}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password{mode === "update" ? " (Optional)" : ""}
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={values.password}
                                onChange={onChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                            />
                            {errors.password && (
                                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                name="confirmPassword"
                                type="password"
                                value={values.confirmPassword}
                                onChange={onChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    {apiError && <p className="text-sm text-red-600">{apiError}</p>}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm text-white bg-[#fbc02d] rounded-md shadow-sm disabled:opacity-60"
                        >
                            {isSubmitting ? "Saving..." : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal
