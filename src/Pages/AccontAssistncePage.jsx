import { useEffect, useMemo, useState } from "react";
import { API } from "../api/BaseURL";
import { ClipboardList, Loader2, AlertCircle, Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BankDetailsModal = ({ isOpen, onClose }) => {
    const [accountType, setAccountType] = useState("self");

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

                    {/* RADIO BUTTON */}
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                value="self"
                                checked={accountType === "self"}
                                onChange={(e) => setAccountType(e.target.value)}
                            />
                            Self Account
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                value="third"
                                checked={accountType === "third"}
                                onChange={(e) => setAccountType(e.target.value)}
                            />
                            Third Party
                        </label>
                    </div>

                    {/* FORM */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <label className="text-sm font-medium">Bank Name</label>
                            <input className="w-full border rounded px-3 py-2" />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Account Holder Name</label>
                            <input className="w-full border rounded px-3 py-2" />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Branch Name</label>
                            <input className="w-full border rounded px-3 py-2" />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Account Number</label>
                            <input className="w-full border rounded px-3 py-2" />
                        </div>

                        <div>
                            <label className="text-sm font-medium">IFSC Code</label>
                            <input className="w-full border rounded px-3 py-2" />
                        </div>

                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 p-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded text-sm"
                    >
                        Cancel
                    </button>
                    <button className="px-4 py-2 bg-[#d94452] text-white rounded text-sm">
                        Save
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

    useEffect(() => {
        const fetchAssistance = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`${API}/api/assistance/allAssistance`);
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
            .filter((item) => String(item?.status).toLowerCase() === "approve") // ✅ only approved
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
                                                <span className="text-sm font-semibold text-slate-700">{item?.sadhu_sadhvi_name || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-slate-700">  {`${item?.family_member_firstName || ""} ${item?.family_member_lastName || ""}`.trim() || "-"}</span>
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
                                                {item?.case_id || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-700">
                                                {capitalizeFirst(item?.status || "-")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
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
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setIsBankModalOpen(true);
                                                }}
                                                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                            >
                                                Bank Details
                                            </button>
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
                onClose={() => setIsBankModalOpen(false)}
            />
        </div>
    );
}

export default AccontAssistncePage;
