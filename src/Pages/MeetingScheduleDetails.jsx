import { useEffect, useRef, useState } from "react";
import axios from "axios";
import JoditEditor from "jodit-react";
import {
    ArrowLeft,
    CheckCircle,
    CheckCircle2,
    Clock,
    EllipsisVertical,
    Eye,
    FileText,
    Loader2,
    X,
    XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../api/BaseURL";
import { formatIndianDate } from "../utils/formatIndianDate";
import { useAuth } from "../context/AuthContext";
import { queryEditorConfig } from "../utils/joditconfig";

const asArray = (value) => (Array.isArray(value) ? value : []);

const asDisplayText = (value, fallback = "-") => {
    if (value == null || value === "") return fallback;
    if (typeof value === "string" || typeof value === "number") return String(value);
    return fallback;
};

const parseFeedbackHistory = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "object") return [value];

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === "object") return [parsed];
    } catch {
        return [];
    }

    return [];
};

const normalizeWorkflowValue = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/_/g, " ")
        .replace(/-/g, " ");

const isExpertPanelRole = (value) =>
    normalizeWorkflowValue(value).startsWith("expert panel");

const capitalizeFirst = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const getAllowedActions = ({ role, status }) => {
    const normalizedRole = normalizeWorkflowValue(role);
    const normalizedStatus = normalizeWorkflowValue(status);

    if (normalizedRole === "case coordinator") {
        if (normalizedStatus === "pending" || normalizedStatus === "queries") {
            return ["approve", "queries", "rejected"];
        }

        if (normalizedStatus === "case coordinator") {
            return ["approve", "rejected", "queries"];
        }
    }

    if (normalizedRole === "committee member") {
        if (normalizedStatus === "committee member") {
            return ["approve", "rejected", "queries", "send_to_case_coordinator"];
        }
    }

    if (isExpertPanelRole(normalizedRole)) {
        if (normalizedStatus === "expert panel") {
            return ["send_to_case_coordinator", "queries"];
        }
    }

    return [];
};

const getStatusToneClass = (status) => {
    const normalizedStatus = normalizeWorkflowValue(status);

    if (normalizedStatus === "approve") return "text-green-600";
    if (normalizedStatus === "rejected") return "text-red-600";
    if (normalizedStatus === "queries") return "text-amber-600";
    if (normalizedStatus === "committee member" || normalizedStatus === "case coordinator") {
        return "text-blue-600";
    }

    return "text-yellow-600";
};

const getStatusLabel = (status) => {
    const normalizedStatus = normalizeWorkflowValue(status);

    if (normalizedStatus === "case coordinator") {
        return "Approve by Expert Panel";
    }

    return capitalizeFirst(asDisplayText(status, "Status"));
};

function MeetingScheduleDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const role = String(user?.role || "").trim().toLowerCase();
    const canMarkDone =
        role === "committee-member" || role === "case-coordinator";

    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState(null);
    const [actionType, setActionType] = useState("");
    const [queriesReason, setQueriesReason] = useState("");
    const [approveAmount, setApproveAmount] = useState("");
    const [actionError, setActionError] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [viewQueryRow, setViewQueryRow] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownContainerRef = useRef(null);

    const fetchMeetingDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await axios.get(`${API}/api/meeting/${id}`);
            setMeeting(res?.data?.data || null);
        } catch (err) {
            console.error(err);
            setError(
                err?.response?.data?.message || "Failed to load meeting details"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetingDetails();
    }, [id]);

    useEffect(() => {
        if (!openDropdownId) return undefined;

        const handleOutsideClick = (event) => {
            if (!dropdownContainerRef.current?.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [openDropdownId]);

    const handleMarkDone = async () => {
        if (!meeting?.id) return;

        try {
            setIsUpdating(true);
            setError("");

            await axios.put(`${API}/api/meeting/${meeting.id}`, {
                status: "Done",
            });

            await fetchMeetingDetails();
        } catch (err) {
            console.error(err);
            setError(
                err?.response?.data?.message || "Failed to update meeting status"
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOpenActionModal = (row, type) => {
        setActiveRow(row);
        setActionType(type);
        setQueriesReason("");
        setApproveAmount("");
        setActionError("");
        setIsModalOpen(true);
    };

    const handleCloseActionModal = () => {
        setIsModalOpen(false);
        setActiveRow(null);
        setActionType("");
        setQueriesReason("");
        setApproveAmount("");
        setActionError("");
    };

    const handleStatusAction = async () => {
        if (!activeRow || !actionType) return;

        try {
            setIsActionLoading(true);

            const payload = {
                feedback: queriesReason,
                loginId: user?.id,
                loginRole: user?.role,
                ...(actionType === "approve" && {
                    approve_amount: approveAmount,
                }),
            };

            await axios.put(
                `${API}/api/assistance/status/${actionType}/${activeRow.id}`,
                payload
            );

            await fetchMeetingDetails();
            handleCloseActionModal();
        } catch (err) {
            console.error(err);
            setActionError(
                err?.response?.data?.message || "Failed to update status"
            );
        } finally {
            setIsActionLoading(false);
        }
    };

    const caseDetails = asArray(meeting?.case_details);
    const isDone = String(meeting?.status || "").toLowerCase() === "done";

    const getFeedbackHistory = (row) => parseFeedbackHistory(row?.feedback);

    const getQueryText = (row) => {
        const feedbackHistory = getFeedbackHistory(row);
        const latestFeedback = feedbackHistory[feedbackHistory.length - 1];
        return asDisplayText(
            latestFeedback?.feedback || row?.query_reason || row?.remark || row?.remarks,
            ""
        );
    };

    const getRowActionKey = (row, index) =>
        [
            row?.id,
            row?.diksharthi_id,
            row?.relation_key,
            row?.assistance_type,
            row?.case_id,
            row?.sl_id,
            index,
        ]
            .map((value) => String(value ?? ""))
            .join("__");

    const actionTitleMap = {
        approve: "Approve Request",
        rejected: "Reject Request",
        queries: "Raise Query",
        send_to_case_coordinator: "Send to Case Coordinator",
    };

    const actionButtonLabelMap = {
        approve: "Approve",
        rejected: "Reject",
        queries: "Submit Query",
        send_to_case_coordinator: "Send",
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/meeting-schedule")}
                            className="items-center px-4 py-2 text-sm font-medium text-slate-700"
                        >
                            <ArrowLeft size={16} />
                        </button>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Meeting Details
                            </h1>
                        </div>
                    </div>

                    {canMarkDone && !isDone && (
                        <button
                            type="button"
                            onClick={handleMarkDone}
                            disabled={isUpdating || loading}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                        >
                            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            Change Status to Done
                        </button>
                    )}
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                        Loading meeting details...
                    </div>
                ) : !meeting ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                        Meeting not found.
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Meeting ID
                                </p>
                                <p className="mt-2 text-lg font-bold text-slate-800">
                                    {meeting.meeting_no || meeting.id}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Meeting Date
                                </p>
                                <p className="mt-2 text-lg font-bold text-slate-800">
                                    {formatIndianDate(meeting.meeting_date)}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Presented Cases
                                </p>
                                <p className="mt-2 text-lg font-bold text-slate-800">
                                    {meeting.presented_case || caseDetails.length}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Status
                                </p>
                                <p className="mt-2 text-lg font-bold text-slate-800">
                                    {meeting.status || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-4">
                                <h2 className="text-lg font-semibold text-slate-800">
                                    Meeting Cases
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Case ID</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">M.S. ID</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">M.S. Name</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Family Member</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Relation</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Assistance</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {caseDetails.length > 0 ? (
                                            caseDetails.map((item, index) => {
                                                const hasQuery =
                                                    getFeedbackHistory(item).length > 0 || Boolean(getQueryText(item));
                                                const rowActionKey = getRowActionKey(item, index);
                                                const isOpen = openDropdownId === rowActionKey;
                                                const allowedActions = getAllowedActions({ role, status: item.status });
                                                const canTakeAction = allowedActions.length > 0;

                                                return (
                                                    <tr key={item.id} className="border-t border-slate-100">
                                                        <td className="px-6 py-4 text-sm text-slate-600">{item.case_id || item.id}</td>
                                                        <td className="px-6 py-4 text-sm text-slate-600">{item.diksharthi_id || "-"}</td>
                                                        <td className="px-6 py-4 text-sm text-slate-700">{item.diksharthi_name || "-"}</td>
                                                        <td className="px-6 py-4 text-sm text-slate-600">{item.family_member_name || "-"}</td>
                                                        <td className="px-6 py-4 text-sm text-slate-600">{item.relation_key || "-"}</td>
                                                        <td className="px-6 py-4 text-sm text-slate-600">{item.assistance_type || "-"}</td>
                                                        <td className={`px-6 py-4 text-sm font-medium ${getStatusToneClass(item.status)}`}>
                                                            {getStatusLabel(item.status)}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div
                                                                ref={isOpen ? dropdownContainerRef : null}
                                                                className="inline-block"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenDropdownId(isOpen ? null : rowActionKey);
                                                                    }}
                                                                    className="inline-block rounded-full p-2 transition-colors hover:bg-slate-100"
                                                                >
                                                                    <EllipsisVertical size={18} className="text-slate-600" />
                                                                </button>

                                                                {isOpen && (
                                                                    <div className="fixed right-10 mt-2 z-[9999] w-60 rounded-xl border border-slate-200 bg-white shadow-xl">
                                                                        <div className="py-1">
                                                                            <button
                                                                                onClick={() => {
                                                                                    navigate("/request-details", { state: item });
                                                                                    setOpenDropdownId(null);
                                                                                }}
                                                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                                                            >
                                                                                <Eye size={16} className="text-yellow-500" /> View Details
                                                                            </button>
                                                                            {(hasQuery || role !== "staff") && (
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setViewQueryRow(item);
                                                                                        setOpenDropdownId(null);
                                                                                    }}
                                                                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                                                                >
                                                                                    <FileText size={16} className="text-blue-600" /> View Feedback
                                                                                </button>
                                                                            )}

                                                                            {canTakeAction && (
                                                                                <>
                                                                                    <hr className="my-1 border-slate-100" />
                                                                                    {allowedActions.includes("approve") && (
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                handleOpenActionModal(item, "approve");
                                                                                                setOpenDropdownId(null);
                                                                                            }}
                                                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50"
                                                                                        >
                                                                                            <CheckCircle size={16} /> Approve
                                                                                        </button>
                                                                                    )}
                                                                                    {allowedActions.includes("send_to_case_coordinator") && (
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                handleOpenActionModal(item, "send_to_case_coordinator");
                                                                                                setOpenDropdownId(null);
                                                                                            }}
                                                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50"
                                                                                        >
                                                                                            <CheckCircle size={16} />
                                                                                            Send to Case Coordinator
                                                                                        </button>
                                                                                    )}
                                                                                    {allowedActions.includes("queries") && (
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                handleOpenActionModal(item, "queries");
                                                                                                setOpenDropdownId(null);
                                                                                            }}
                                                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50"
                                                                                        >
                                                                                            <FileText size={16} /> Query
                                                                                        </button>
                                                                                    )}
                                                                                    {allowedActions.includes("rejected") && (
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                handleOpenActionModal(item, "rejected");
                                                                                                setOpenDropdownId(null);
                                                                                            }}
                                                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                                                                        >
                                                                                            <XCircle size={16} /> Reject Request
                                                                                        </button>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-10 text-center text-sm text-slate-500">
                                                    No cases found for this meeting.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4">
                            <h3 className="text-xl font-bold text-slate-800">
                                {actionTitleMap[actionType] || "Confirm Action"}
                            </h3>
                            <button
                                onClick={handleCloseActionModal}
                                className="rounded-full p-1 transition-colors hover:bg-slate-100"
                            >
                                <X size={24} className="text-slate-500" />
                            </button>
                        </div>
                        <div className="px-8">
                            <div className="space-y-4">
                                <div className="text-center">
                                    <h4 className="text-lg font-semibold text-slate-700">
                                        {asDisplayText(activeRow?.family_member_name)}
                                    </h4>
                                </div>

                                {actionType === "approve" && (
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">
                                            Approve Amount
                                        </label>
                                        <input
                                            type="number"
                                            value={approveAmount}
                                            onChange={(e) => setApproveAmount(e.target.value)}
                                            placeholder="Enter approve amount"
                                            className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                                        />
                                    </div>
                                )}

                                <div className="space-y-3 text-left">
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Feedback
                                    </label>
                                    <JoditEditor
                                        value={queriesReason}
                                        config={queryEditorConfig}
                                        onBlur={(newValue) => setQueriesReason(newValue)}
                                        onChange={() => { }}
                                    />
                                </div>

                                {actionError && (
                                    <p className="text-center text-sm text-red-600">{actionError}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 p-6">
                            <button
                                onClick={handleCloseActionModal}
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusAction}
                                disabled={isActionLoading}
                                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
                            >
                                {isActionLoading
                                    ? "Processing..."
                                    : actionButtonLabelMap[actionType] || "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewQueryRow && (() => {
                const feedbackHistory = getFeedbackHistory(viewQueryRow);

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                        <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Feedback Details</h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Member: <span className="font-semibold text-blue-600">
                                            {asDisplayText(viewQueryRow?.family_member_name)}
                                        </span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setViewQueryRow(null)}
                                    className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="max-h-[70vh] flex-1 space-y-6 overflow-y-auto p-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">Feedback History</h4>
                                    </div>

                                    {feedbackHistory.length > 0 ? (
                                        <div className="space-y-3">
                                            {feedbackHistory.map((item, index) => (
                                                <div key={`${item?.date || "date"}-${item?.time || "time"}-${index}`} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                        <span className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase ${item?.status?.toLowerCase() === "pending"
                                                            ? "bg-amber-100 text-amber-700"
                                                            : "bg-blue-100 text-blue-700"
                                                            }`}>
                                                            {item?.status?.toLowerCase() === "committee-member"
                                                                ? "Case Co-ordinator Summary"
                                                                : item?.status?.toLowerCase() === "approve"
                                                                    ? "Approve"
                                                                    : capitalizeFirst(asDisplayText(item?.status, "Status"))}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                                            <Clock size={12} />
                                                            {asDisplayText(item?.date, "")} {asDisplayText(item?.time, "")}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="border-l-2 border-slate-100 pl-1 text-sm leading-relaxed text-slate-600"
                                                        dangerouslySetInnerHTML={{
                                                            __html: item?.feedback || "<p className='italic text-slate-400'>No comments provided.</p>",
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-200 py-4 text-center">
                                            <p className="text-sm italic text-slate-400">No structured history records found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

export default MeetingScheduleDetails;
