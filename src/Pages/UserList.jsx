import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import DeleteModal from "../components/DeleteModal";
import UserFormModal from "../components/UserFormModal";

const initialFormState = {
    name: "",
    role: "admin",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    profilePhoto: null,
    assignLocations: [""],
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^\d{10}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"];
const photoPlaceholder =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3C/svg%3E";

const normalizeUser = (item) => ({
    id: item?.id || item?.userId || item?._id || Date.now(),
    name: item?.name || item?.fullName || "",
    role: String(item?.role || "staff").toLowerCase(),
    email: item?.email || "",
    mobile: item?.mobile || item?.mobileNo || item?.phone || "",
    profilePhoto:
        item?.profilePhoto || item?.profile_photo || item?.photo || item?.image || null,

    // ✅ IMPORTANT FIX
    assign_locations: item?.assign_locations
        ? typeof item.assign_locations === "string"
            ? JSON.parse(item.assign_locations)
            : item.assign_locations
        : [],
});

const roleLabel = (role) =>
    String(role || "")
        .toLowerCase()
        .replace(/^./, (m) => m.toUpperCase());

const resolvePhotoUrl = (photo) => {
    if (!photo || typeof photo !== "string") return photoPlaceholder;
    if (/^https?:\/\//i.test(photo)) return photo;
    if (photo.startsWith("/")) return `${API}${photo}`;
    return `${API}/uploads/${photo}`;
};

const validateUserForm = (values, mode = "create") => {
    const errors = {};

    if (!values.name.trim()) errors.name = "Full name is required.";
    if (!emailRegex.test(values.email.trim()))
        errors.email = "Enter a valid email address.";
    if (!mobileRegex.test(values.mobile.trim()))
        errors.mobile = "Mobile number must be exactly 10 digits.";

    const hasPasswordInput = Boolean(values.password || values.confirmPassword);
    if (mode === "create" || hasPasswordInput) {
        if (!passwordRegex.test(values.password)) {
            errors.password =
                "Password must be 8+ chars with 1 uppercase, 1 number, and 1 symbol.";
        }
        if (values.confirmPassword !== values.password) {
            errors.confirmPassword = "Confirm password must match password.";
        }
    }

    if (values.profilePhoto && !allowedImageTypes.includes(values.profilePhoto.type)) {
        errors.profilePhoto = "Only JPG, JPEG, and PNG images are allowed.";
    }

    return errors;
};

// const buildUserFormData = (values, isUpdate = false) => {
//     const payload = new FormData();
//     payload.append("name", values.name.trim());
//     payload.append("role", values.role);
//     payload.append("email", values.email.trim().toLowerCase());
//     payload.append("mobile", values.mobile.trim());

//     if (!isUpdate || values.password) payload.append("password", values.password);
//     if (!isUpdate || values.confirmPassword) {
//         payload.append("confirmPassword", values.confirmPassword);
//     }
//     if (values.profilePhoto) payload.append("profilePhoto", values.profilePhoto);

//     return payload;
// };



const buildUserFormData = (values, isUpdate = false) => {
    const payload = new FormData();

    payload.append("name", values.name.trim());
    payload.append("role", values.role);
    payload.append("email", values.email.trim().toLowerCase());
    payload.append("mobile", values.mobile.trim());

    // ✅ ADD THIS
    if (values.role === "karyakarta") {
        payload.append(
            "assignLocations",
            JSON.stringify((values.assignLocations || []).filter(Boolean))
        );
    }

    if (!isUpdate || values.password) payload.append("password", values.password);
    if (!isUpdate || values.confirmPassword) {
        payload.append("confirmPassword", values.confirmPassword);
    }

    if (values.profilePhoto) payload.append("profilePhoto", values.profilePhoto);

    return payload;
};



function UserList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [apiError, setApiError] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    const [formValues, setFormValues] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});

    const selectedUserName = useMemo(
        () => selectedUser?.name || "this user",
        [selectedUser]
    );

    const fetchUsers = async () => {
        try {
            setIsLoadingUsers(true);
            setApiError("");

            const response = await fetch(`${API}/api/user/list`);
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data?.message || "Failed to fetch users.");

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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, users.length]);

    const resetForm = () => {
        setFormValues(initialFormState);
        setFormErrors({});
        setApiError("");
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

    const openAddModal = () => {
        resetForm();
        setSelectedUser(null);
        setIsAddModalOpen(true);
    };

    const openUpdateModal = (user) => {
        setApiError("");
        setFormErrors({});
        setSelectedUser(user);
        setFormValues({
            name: user.name || "",
            role: String(user.role || "staff").toLowerCase(),
            assignLocations: user.assign_locations || [""],
            email: user.email || "",
            mobile: user.mobile || "",
            password: "",
            confirmPassword: "",
            profilePhoto: null,
        });
        setIsUpdateModalOpen(true);
    };

    const openDeleteModal = (user) => {
        setApiError("");
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        resetForm();
    };

    const closeUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedUser(null);
        resetForm();
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        setApiError("");
    };

    const createUser = async (e) => {
        e.preventDefault();
        setApiError("");

        const errors = validateUserForm(formValues, "create");
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = buildUserFormData(formValues, false);

            const response = await fetch(`${API}/api/user/create`, {
                method: "POST",
                body: payload,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || data?.success === false) {
                throw new Error(data?.message || "Failed to create user.");
            }

            await fetchUsers();
            closeAddModal();
        } catch (error) {
            setApiError(error.message || "Something went wrong while creating user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateUser = async (e) => {
        e.preventDefault();
        if (!selectedUser?.id) return;

        setApiError("");
        const errors = validateUserForm(formValues, "update");
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = buildUserFormData(formValues, true);
            payload.append("id", selectedUser.id);

            const endpoints = [
                { url: `${API}/api/user/update/${selectedUser.id}`, method: "PUT" },
                { url: `${API}/api/user/update/${selectedUser.id}`, method: "POST" },
                { url: `${API}/api/user/update`, method: "PUT" },
                { url: `${API}/api/user/update`, method: "POST" },
            ];

            let success = false;
            let lastError = "Failed to update user.";

            for (const endpoint of endpoints) {
                const response = await fetch(endpoint.url, {
                    method: endpoint.method,
                    body: payload,
                });
                const data = await response.json().catch(() => ({}));
                if (response.ok && data?.success !== false) {
                    success = true;
                    break;
                }
                lastError = data?.message || lastError;
            }

            if (!success) throw new Error(lastError);

            await fetchUsers();
            closeUpdateModal();
        } catch (error) {
            setApiError(error.message || "Something went wrong while updating user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteUser = async () => {
        if (!selectedUser?.id) return;

        try {
            setIsDeleting(true);
            setApiError("");

            const deleteEndpoints = [
                { url: `${API}/api/user/delete/${selectedUser.id}`, method: "DELETE" },
                { url: `${API}/api/user/delete/${selectedUser.id}`, method: "POST" },
                { url: `${API}/api/user/delete?id=${selectedUser.id}`, method: "DELETE" },
                { url: `${API}/api/user/delete`, method: "POST" },
            ];

            let success = false;
            let lastError = "Failed to delete user.";

            for (const endpoint of deleteEndpoints) {
                const options =
                    endpoint.url.endsWith("/api/user/delete") && endpoint.method === "POST"
                        ? {
                            method: endpoint.method,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: selectedUser.id }),
                        }
                        : { method: endpoint.method };

                const response = await fetch(endpoint.url, options);
                const data = await response.json().catch(() => ({}));
                if (response.ok && data?.success !== false) {
                    success = true;
                    break;
                }
                lastError = data?.message || lastError;
            }

            if (!success) throw new Error(lastError);

            await fetchUsers();
            closeDeleteModal();
        } catch (error) {
            setApiError(error.message || "Something went wrong while deleting user.");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return true;

        return [user.name, user.email, user.mobile, user.role]
            .map((value) => String(value || "").toLowerCase())
            .some((value) => value.includes(search));
    });

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-700">User Management</h1>
                <button
                    onClick={openAddModal}
                    className="bg-[#d94452] hover:bg-[#c13946] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add User
                </button>
            </div>

            {apiError && !isAddModalOpen && !isUpdateModalOpen && !isDeleteModalOpen && (
                <p className="text-sm text-red-600 mb-4">{apiError}</p>
            )}

            <UserFormModal
                title="Add New User"
                submitLabel="Create User"
                mode="create"
                isOpen={isAddModalOpen}
                values={formValues}
                errors={formErrors}
                isSubmitting={isSubmitting}
                apiError={apiError}
                onClose={closeAddModal}
                onChange={handleInputChange}
                onPhotoChange={handlePhotoChange}
                onSubmit={createUser}
            />

            <UserFormModal
                title="Update User"
                submitLabel="Update User"
                mode="update"
                isOpen={isUpdateModalOpen}
                values={formValues}
                errors={formErrors}
                isSubmitting={isSubmitting}
                apiError={apiError}
                onClose={closeUpdateModal}
                onChange={handleInputChange}
                onPhotoChange={handlePhotoChange}
                onSubmit={updateUser}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                userName={selectedUserName}
                isDeleting={isDeleting}
                apiError={apiError}
                onClose={closeDeleteModal}
                onConfirm={deleteUser}
            />

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <Search size={16} />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, email, mobile, role"
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <p className="text-sm text-gray-600">
                        Showing {filteredUsers.length} result(s)
                    </p>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Sr no</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Photo</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Role</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Mobile No</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoadingUsers ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                    Loading users...
                                </td>
                            </tr>
                        ) : paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user, index) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        <img
                                            src={resolvePhotoUrl(user.profilePhoto)}
                                            alt={user.name}
                                            onError={(e) => {
                                                e.currentTarget.src = photoPlaceholder;
                                            }}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "admin"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-blue-100 text-blue-700"
                                                }`}
                                        >
                                            {roleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.mobile}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => openUpdateModal(user)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openDeleteModal(user)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            {/* 👉 DETAILS BUTTON (ONLY for karyakarta) */}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                            }
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserList;
