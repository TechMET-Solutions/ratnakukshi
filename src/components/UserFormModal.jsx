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
                                <option value="karyakarta">Karyakarta</option>
                                <option value="operations-manager">Operations Manager</option>
                                <option value="case-coordinator">Case Co-ordinator</option>
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