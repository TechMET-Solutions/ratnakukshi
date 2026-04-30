import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { API } from "../api/BaseURL";

const normalizeStatusForForm = (value) => {
    if (value === 1 || value === "1" || value === true) return "active";
    if (value === 0 || value === "0" || value === false) return "inactive";

    const normalized = String(value || "").trim().toLowerCase();

    if (normalized === "active") return "active";
    if (normalized === "inactive") return "inactive";

    return "active";
};

const normalizeStatusForApi = (value) =>
    normalizeStatusForForm(value) === "active" ? 1 : 0;

const getStatusBadge = (value) => {
    const status = normalizeStatusForForm(value);

    return {
        label: status === "active" ? "Active" : "Inactive",
        className:
            status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700",
    };
};

const EMPTY_FORM = {
    broker_name: "",
    account_holder_name: "",
    client_id: "",
    status: "active",
};

const DeleteModal = ({ isOpen, onClose, onConfirm, brokerName, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-3 text-xl font-bold text-gray-800">
                    Delete Demat Account
                </h2>

                <p className="text-sm text-gray-600">
                    Are you sure you want to delete{" "}
                    <strong>{brokerName || "this account"}</strong>?
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded border px-4 py-2 text-sm"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="rounded bg-red-500 px-4 py-2 text-sm text-white"
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DematModal = ({ isOpen, onClose, onSave, initialData, loading }) => {
    const [formData, setFormData] = useState(EMPTY_FORM);

    useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            setFormData({
                broker_name: initialData.broker_name || "",
                account_holder_name: initialData.account_holder_name || "",
                client_id: initialData.client_id || "",
                status: normalizeStatusForForm(initialData.status),
            });
            return;
        }

        setFormData(EMPTY_FORM);
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const saved = await onSave(formData);
        if (saved) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
                <div className="border-b p-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? "Edit Demat Account" : "Add Demat Account"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <input
                        required
                        placeholder="Broker Name"
                        value={formData.broker_name}
                        onChange={(e) =>
                            setFormData({ ...formData, broker_name: e.target.value })
                        }
                        className="w-full rounded-md border px-3 py-2"
                    />

                    <input
                        required
                        placeholder="Account Holder Name"
                        value={formData.account_holder_name}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                account_holder_name: e.target.value,
                            })
                        }
                        className="w-full rounded-md border px-3 py-2"
                    />

                    {/* <input
                        placeholder="DP ID"
                        value={formData.dp_id}
                        onChange={(e) =>
                            setFormData({ ...formData, dp_id: e.target.value })
                        }
                        className="w-full rounded-md border px-3 py-2"
                    /> */}

                    <input
                        placeholder="Client ID"
                        value={formData.client_id}
                        onChange={(e) =>
                            setFormData({ ...formData, client_id: e.target.value })
                        }
                        className="w-full rounded-md border px-3 py-2"
                    />

                    {/* <input
                        required
                        placeholder="Demat Number"
                        value={formData.demat_no}
                        onChange={(e) =>
                            setFormData({ ...formData, demat_no: e.target.value })
                        }
                        className="w-full rounded-md border px-3 py-2"
                    /> */}

                    <select
                        value={formData.status}
                        onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full rounded-md border px-3 py-2"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded px-4 py-2 text-sm"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded bg-[#d94452] px-4 py-2 text-sm text-white"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

function RBFDematDetails() {
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAccount, setSelectedAccount] = useState(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchAccounts = async () => {
        try {
            setIsLoading(true);

            const res = await fetch(`${API}/api/demat`);
            const data = await res.json();

            if (Array.isArray(data)) setAccounts(data);
            else if (Array.isArray(data?.data)) setAccounts(data.data);
            else setAccounts([]);
        } catch (error) {
            console.error(error);
            setAccounts([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleSave = async (formData) => {
        try {
            setIsSaving(true);

            const payload = {
                broker_name: formData.broker_name.trim(),
                account_holder_name: formData.account_holder_name.trim(),
                client_id: formData.client_id.trim(),
                status: normalizeStatusForApi(formData.status),
            };

            const endpoint = selectedAccount
                ? `${API}/api/demat/${selectedAccount.id}`
                : `${API}/api/demat/create`;

            const method = selectedAccount ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save");

            await fetchAccounts();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);

            await fetch(`${API}/api/demat/${selectedAccount.id}`, {
                method: "DELETE",
            });

            await fetchAccounts();
            setIsDeleteModalOpen(false);
            setSelectedAccount(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredAccounts = useMemo(() => {
        const q = searchTerm.toLowerCase();

        return accounts.filter((item) =>
            `${item.broker_name} ${item.account_holder_name} ${item.demat_no}`
                .toLowerCase()
                .includes(q)
        );
    }, [accounts, searchTerm]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-700">
                    Demat Account Details
                </h1>

                <button
                    onClick={() => {
                        setSelectedAccount(null);
                        setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-md bg-[#d94452] px-4 py-2 text-sm text-white"
                >
                    <Plus size={18} /> Add Demat
                </button>
            </div>

            <div className="rounded-lg bg-white shadow">
                <div className="flex justify-between border-b p-4">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full rounded-md border py-2 pl-9 pr-3"
                        />
                    </div>

                    <p className="text-sm text-gray-500">
                        Showing {filteredAccounts.length} result(s)
                    </p>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4">Broker Name</th>
                            <th className="px-6 py-4">Holder Name</th>
                            <th className="px-6 py-4">Client ID</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredAccounts.map((item) => {
                            const badge = getStatusBadge(item.status);

                            return (
                                <tr key={item.id} className="border-t">
                                    <td className="px-6 py-4">{item.broker_name}</td>
                                    <td className="px-6 py-4">{item.account_holder_name}</td>
                                    <td className="px-6 py-4">{item.client_id}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${badge.className}`}
                                        >
                                            {badge.label}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedAccount(item);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="text-blue-500"
                                            >
                                                <Edit size={18} />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setSelectedAccount(item);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="text-red-500"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <DematModal
                isOpen={isAddModalOpen || isEditModalOpen}
                initialData={selectedAccount}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setSelectedAccount(null);
                }}
                onSave={handleSave}
                loading={isSaving}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                brokerName={selectedAccount?.broker_name}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={isDeleting}
            />
        </div>
    );
}

export default RBFDematDetails;