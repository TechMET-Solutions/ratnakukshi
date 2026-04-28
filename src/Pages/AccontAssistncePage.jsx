import { useEffect, useMemo, useState } from "react";
import { API } from "../api/BaseURL";
import { ClipboardList, Loader2, AlertCircle, Eye, Search, Download, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

const initialBankForm = {
    account_type: "self",
    bank_name: "",
    account_holder_name: "",
    branch_name: "",
    account_no: "",
    ifsc_code: "",
};

const BankDetailsModal = ({ isOpen, onClose, selectedItem, onSaved }) => {
    const [formData, setFormData] = useState(initialBankForm);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        if (!isOpen || !selectedItem?.id) return;

        const fetchBankDetails = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch(`${API}/api/assistance/bank-details/${selectedItem.id}`);
                const data = await res.json().catch(() => ({}));

                if (!res.ok || data?.success === false) {
                    throw new Error(data?.message || "Failed to fetch bank details");
                }

                const details = data?.data;
                if (details) {
                    setFormData({
                        account_type: details.account_type || "self",
                        bank_name: details.bank_name || "",
                        account_holder_name: details.account_holder_name || "",
                        branch_name: details.branch_name || "",
                        account_no: details.account_no || "",
                        ifsc_code: details.ifsc_code || "",
                    });
                } else {
                    setFormData(initialBankForm);
                }
            } catch (err) {
                console.error("Error loading bank details:", err);
                setError(err?.message || "Failed to fetch bank details");
                setFormData(initialBankForm);
            } finally {
                setLoading(false);
            }
        };

        fetchBankDetails();
    }, [isOpen, selectedItem?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "ifsc_code" ? value.toUpperCase() : value,
        }));
    };



    const handleSave = async () => {
        if (!selectedItem?.id) return;
        try {
            setSaving(true);
            setError("");

            const payload = {
                diksharthi_id: selectedItem?.diksharthi_id || null,
                family_id: selectedItem?.family_member_id || selectedItem?.family_id || null,
                account_type: formData.account_type,
                bank_name: String(formData.bank_name || "").trim(),
                account_holder_name: String(formData.account_holder_name || "").trim(),
                branch_name: String(formData.branch_name || "").trim(),
                account_no: String(formData.account_no || "").trim(),
                ifsc_code: String(formData.ifsc_code || "").trim().toUpperCase(),
            };

            if (!payload.bank_name || !payload.account_holder_name || !payload.account_no) {
                throw new Error("Bank Name, Account Holder Name and Account Number are required");
            }

            const res = await fetch(`${API}/api/assistance/bank-details/${selectedItem.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok || data?.success === false) {
                throw new Error(data?.message || "Failed to save bank details");
            }

            onSaved?.();
            onClose();
        } catch (err) {
            console.error("Error saving bank details:", err);
            setError(err?.message || "Failed to save bank details");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl bg-white rounded-xl shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="border-b px-6 py-4">
                    <h2 className="text-lg font-semibold">Bank Details</h2>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-4">
                    {loading ? (
                        <div className="py-8 text-center text-sm text-slate-500">Loading bank details...</div>
                    ) : (
                        <>
                            {/* RADIO BUTTON */}
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="account_type"
                                        value="self"
                                        checked={formData.account_type === "self"}
                                        onChange={handleChange}
                                    />
                                    Self Account
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="account_type"
                                        value="third"
                                        checked={formData.account_type === "third"}
                                        onChange={handleChange}
                                    />
                                    Third Party
                                </label>
                            </div>

                            {/* FORM */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Bank Name</label>
                                    <input
                                        name="bank_name"
                                        value={formData.bank_name}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Account Holder Name</label>
                                    <input
                                        name="account_holder_name"
                                        value={formData.account_holder_name}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Branch Name</label>
                                    <input
                                        name="branch_name"
                                        value={formData.branch_name}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Account Number</label>
                                    <input
                                        name="account_no"
                                        value={formData.account_no}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">IFSC Code</label>
                                    <input
                                        name="ifsc_code"
                                        value={formData.ifsc_code}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-600">{error}</p>}
                        </>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 p-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || saving}
                        className="px-4 py-2 bg-[#d94452] text-white rounded text-sm disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

function AccontAssistncePage() {

    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchText, setSearchText] = useState("");

    // back model
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        const fetchAssistance = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(
                    `${API}/api/assistance/allAssistance?page=1&limit=10&status=approve`
                );

                const data = await res.json().catch(() => ({}));

                if (!res.ok || data?.success === false) {
                    throw new Error(data?.message || "Failed to fetch assistance list");
                }

                setRows(Array.isArray(data?.data) ? data.data : []);
            } catch (err) {
                console.error("Assistance fetch error:", err);
                setError(err?.message || "Failed to fetch assistance list");
                setRows([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAssistance();
    }, []);

    const filteredRows = useMemo(() => {
        const q = searchText.trim().toLowerCase();

        return rows
            .filter((item) => {
                if (!q) return true;

                const familyFullName =
                    `${item?.family_member_firstName || ""} ${item?.family_member_lastName || ""}`.trim();

                return [
                    item?.sadhu_sadhvi_name,
                    item?.diksharthi_id,
                    familyFullName,
                    item?.relation,
                    item?.assistance_type,
                    item?.case_id,
                ]
                    .map((v) => String(v || "").toLowerCase())
                    .some((v) => v.includes(q));
            });
    }, [rows, searchText]);

    const capitalizeFirst = (text) => {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };


    const handleDownload = async (id) => {
        try {
            const response = await fetch(
                `${API}/api/report/sanction-letters/${id}`
            );

            if (!response.ok) {
                throw new Error("Failed to download file");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `sanction-letter-${id}.pdf`; // file name
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
            alert("Failed to download sanction letter");
        }
    };


    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Account Assistance</h1>
                <p className="text-sm text-slate-500">View and manage member assistance applications and their statuses.</p>
            </div>

            {/* Main Container */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3">
                    <div className="relative w-full max-w-md">
                        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search by Diksharthi or Family details..."
                            className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-200"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-[#fdf2d7]">
                                <th className="p-4 font-semibold text-slate-700 border-b">M.S. ID</th>
                                <th className="p-4 font-semibold text-slate-700 border-b">M.S. Name</th>
                                <th className="p-4 font-semibold text-slate-700 border-b">Family Member</th>
                                <th className="p-4 font-semibold text-slate-700 border-b">Relation</th>
                                <th className="p-4 font-semibold text-slate-700 border-b">Assistance</th>
                                <th className="p-4 font-semibold text-slate-700 border-b">F.A.N ID</th>
                                <th className="p-4 font-semibold text-slate-700 border-b">Status</th>
                                <th className="p-4 font-semibold text-slate-700 border-b text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                                            <p className="text-sm text-slate-500 font-medium">Fetching records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-red-500">
                                            <AlertCircle className="h-8 w-8" />
                                            <p className="text-sm font-semibold">{error}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <ClipboardList className="h-10 w-10 opacity-20" />
                                            <p className="text-sm">No assistance records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((item) => (
                                    <tr key={item.id} className="group transition-colors hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-slate-700">{item?.diksharthi_id || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-slate-700">{item?.diksharthi_name || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-slate-700">{item?.family_member_name || "-"}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {item?.relation_key || item?.relation || "Relation N/A"}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {item?.assistance_type || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-700">
                                                {item?.fan_id || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-700">
                                                {capitalizeFirst(item?.status || "-")}
                                            </span>
                                        </td>
                                        {/* <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    navigate("/request-details", {
                                                        state: {
                                                            id: item?.id,
                                                            ...item,
                                                        },
                                                    });
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <Eye size={16} className="text-yellow-500" /> View Details
                                            </button>
                                            <button
                                                onClick={() => handleDownload(item?.id)}
                                                className="flex items-center gap-2 px-3 py-2 mt-2 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100"
                                            >
                                                <Download size={16} />
                                                Download
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setIsBankModalOpen(true);
                                                }}
                                                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                            >
                                                Bank Details
                                            </button>
                                        </td> */}

                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={() =>
                                                    setOpenMenuId(openMenuId === item.id ? null : item.id)
                                                }
                                                className="p-2 rounded hover:bg-gray-100"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {openMenuId === item.id && (
                                                <div className="absolute right-6 mt-2 w-44 bg-white border rounded-lg shadow-lg z-50">

                                                    <button
                                                        onClick={() => {
                                                            navigate("/request-details", {
                                                                state: {
                                                                    id: item?.id,
                                                                    ...item,
                                                                },
                                                            });
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Eye size={16} />
                                                        View Details
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            handleDownload(item?.id);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Download size={16} />
                                                        Download
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setIsBankModalOpen(true);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        Bank Details
                                                    </button>

                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <BankDetailsModal
                isOpen={isBankModalOpen}
                selectedItem={selectedItem}
                onClose={() => setIsBankModalOpen(false)}
                onSaved={() => {}}
            />
        </div>
    );
}

export default AccontAssistncePage;
