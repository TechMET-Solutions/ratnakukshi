import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../api/BaseURL";
import { formatIndianDate } from "../utils/formatIndianDate";
import { useAuth } from "../context/AuthContext";

const asArray = (value) => (Array.isArray(value) ? value : []);

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

    const caseDetails = asArray(meeting?.case_details);
    const isDone = String(meeting?.status || "").toLowerCase() === "done";

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/meeting-schedule")}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Meeting Details
                            </h1>
                            <p className="text-sm text-slate-500">
                                View meeting info and selected assistance cases.
                            </p>
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {caseDetails.length > 0 ? (
                                            caseDetails.map((item) => (
                                                <tr key={item.id} className="border-t border-slate-100">
                                                    <td className="px-6 py-4 text-sm text-slate-600">{item.case_id || item.id}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{item.diksharthi_id || "-"}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-700">{item.diksharthi_name || "-"}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{item.family_member_name || "-"}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{item.relation_key || "-"}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{item.assistance_type || "-"}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.status || "-"}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-10 text-center text-sm text-slate-500">
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
        </div>
    );
}

export default MeetingScheduleDetails;
