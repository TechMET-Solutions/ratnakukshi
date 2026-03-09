import React, { useEffect, useState } from "react";
import { Plus, X, Trash2, Edit } from "lucide-react";
import { API } from "../api/BaseURL";

const initialFormState = {
    name: "",
    role: "Admin",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    profilePhoto: null,
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^\d{10}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"];

function UserList() {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [apiError, setApiError] = useState("");
    const [formValues, setFormValues] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});

    const normalizeUser = (item) => ({
        id: item?.id || item?.userId || item?._id || Date.now(),
        name: item?.name || item?.fullName || "",
        role: item?.role || "Staff",
        email: item?.email || "",
        mobile: item?.mobile || item?.mobileNo || item?.phone || "",
        profilePhoto: item?.profilePhoto || item?.profile_photo || item?.photo || item?.image || null,
    });

    const fetchUsers = async () => {
        try {
            setIsLoadingUsers(true);
            setApiError("");

            const response = await fetch(`${API}/api/user/list`);
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.message || "Failed to fetch users.");
            }

            const list = Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.users)
                    ? data.users
                    : Array.isArray(data)
                        ? data
                        : [];

            setUsers(list.map(normalizeUser));
        } catch (error) {
            setApiError(error.message || "Failed to fetch users.");
        } finally {
            setIsLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const validateForm = () => {
        const errors = {};

        if (!formValues.name.trim()) errors.name = "Full name is required.";
        if (!emailRegex.test(formValues.email.trim()))
            errors.email = "Enter a valid email address.";
        if (!mobileRegex.test(formValues.mobile.trim()))
            errors.mobile = "Mobile number must be exactly 10 digits.";
        if (!passwordRegex.test(formValues.password))
            errors.password =
                "Password must be 8+ chars with 1 uppercase, 1 number, and 1 symbol.";
        if (formValues.confirmPassword !== formValues.password)
            errors.confirmPassword = "Confirm password must match password.";

        if (
            formValues.profilePhoto &&
            !allowedImageTypes.includes(formValues.profilePhoto.type)
        ) {
            errors.profilePhoto = "Only JPG, JPEG, and PNG images are allowed.";
        }

        return errors;
    };

    const resetForm = () => {
        setFormValues(initialFormState);
        setFormErrors({});
        setApiError("");
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0] || null;
        setFormValues((prev) => ({ ...prev, profilePhoto: file }));
        setFormErrors((prev) => ({ ...prev, profilePhoto: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = new FormData();
            payload.append("name", formValues.name.trim());
            payload.append("role", formValues.role);
            payload.append("email", formValues.email.trim().toLowerCase());
            payload.append("mobile", formValues.mobile.trim());
            payload.append("password", formValues.password);
            payload.append("confirmPassword", formValues.confirmPassword);
            if (formValues.profilePhoto) {
                payload.append("profilePhoto", formValues.profilePhoto);
            }

            const response = await fetch(`${API}/api/user/create`, {
                method: "POST",
                body: payload,
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data?.message || "Failed to create user.");
            }

            const createdUser = data?.data || data?.user || {};
            const localPreview = formValues.profilePhoto
                ? URL.createObjectURL(formValues.profilePhoto)
                : null;

            const normalizedUser = normalizeUser({
                ...createdUser,
                name: createdUser?.name || formValues.name.trim(),
                role: createdUser?.role || formValues.role,
                email: createdUser?.email || formValues.email.trim().toLowerCase(),
                mobile: createdUser?.mobile || formValues.mobile.trim(),
                profilePhoto:
                    createdUser?.profilePhoto ||
                    createdUser?.photo ||
                    createdUser?.image ||
                    localPreview,
            });

            setUsers((prev) => [normalizedUser, ...prev]);
            handleModalClose();
        } catch (error) {
            setApiError(error.message || "Something went wrong while creating user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 min-h-screen bg-gray-50">
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

            {apiError && !isModalOpen && (
                <p className="text-sm text-red-600 mb-4">{apiError}</p>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center mt-4 px-6">
                            <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
                            <button
                                onClick={handleModalClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    value={formValues.name}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                                />
                                {formErrors.name && (
                                    <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <select
                                        name="role"
                                        value={formValues.role}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                                    >
                                        <option value="" disabled>
                                            Select Role
                                        </option>
                                        <option value="admin">Admin</option>
                                        <option value="staff">Staff</option>
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
                                        value={formValues.mobile}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                                    />
                                    {formErrors.mobile && (
                                        <p className="text-xs text-red-600 mt-1">
                                            {formErrors.mobile}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formValues.email}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                                />
                                {formErrors.email && (
                                    <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Profile Photo
                                </label>
                                <input
                                    name="profilePhoto"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                    onChange={handlePhotoChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                                />
                                {formErrors.profilePhoto && (
                                    <p className="text-xs text-red-600 mt-1">
                                        {formErrors.profilePhoto}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        name="password"
                                        type="password"
                                        value={formValues.password}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                                    />
                                    {formErrors.password && (
                                        <p className="text-xs text-red-600 mt-1">
                                            {formErrors.password}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        value={formValues.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                                    />
                                    {formErrors.confirmPassword && (
                                        <p className="text-xs text-red-600 mt-1">
                                            {formErrors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {apiError && <p className="text-sm text-red-600">{apiError}</p>}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleModalClose}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm text-white bg-[#fbc02d] hover:bg-[#c13946] rounded-md shadow-sm disabled:opacity-60"
                                >
                                    {isSubmitting ? "Creating..." : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Sr no</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Photo</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Role</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                Mobile No
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoadingUsers ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                    Loading users...
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((user, index) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <img
                                            src={user.profilePhoto}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "Admin"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : user.role === "Staff"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.mobile}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex gap-3">
                                            <button className="text-blue-500 hover:text-blue-700">
                                                <Edit size={18} />
                                            </button>
                                            <button className="text-red-500 hover:text-red-700">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                    No users found. Create a user to see records here.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserList;
