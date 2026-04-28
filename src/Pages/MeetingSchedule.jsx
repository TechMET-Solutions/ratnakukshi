import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    X,
} from "lucide-react";
import { API } from "../api/BaseURL";
import { formatIndianDate } from "../utils/formatIndianDate";
import { useAuth } from "../context/AuthContext";
import JoditEditor from "jodit-react";
import { queryEditorConfig } from "../utils/joditconfig";

function MeetingSchedule() {
    const { user } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // ================= ADD NEW STATE =================
    const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [selectedMeeting, setSelectedMeeting] = useState(null);

    const [pendingCases, setPendingCases] = useState([]);
    const [loadingCases, setLoadingCases] = useState(false);
    const [committeeFeedback, setCommitteeFeedback] = useState("");
    const [isSendingToCommittee, setIsSendingToCommittee] = useState(false);
    const [committeeError, setCommitteeError] = useState("");

    // const [formData, setFormData] = useState({
    //     meetingNo: "",
    //     meetingDate: "",
    //     selectedCases: [],
    //     status: "Schedule",
    // });

    // ================= EXTRA SAFE INITIAL STATE =================
    const [formData, setFormData] = useState({
        meetingDate: "",
        selectedCases: [],
        status: "Schedule",
    });

    // ===========================
    // Fetch Pending Cases
    // ===========================
    const fetchPendingCases = async () => {
        try {
            setLoadingCases(true);

            const res = await axios.get(
                `${API}/api/assistance/allAssistance?page=1&limit=10&status=pending`
            );

            setPendingCases(res?.data?.data || []);
        } catch (error) {
            console.error(error);
            setPendingCases([]);
        } finally {
            setLoadingCases(false);
        }
    };

    // ===========================
    // Open Add Modal
    // ===========================
    // const openAddModal = async () => {
    //     setFormData({
    //         meetingNo: `M-${meetings.length + 1}`,
    //         meetingDate: "",
    //         selectedCases: [],
    //         status: "Schedule",
    //     });

    //     setIsAddModalOpen(true);
    //     await fetchPendingCases();
    // };

    // ================= REPLACE openAddModal =================
    const openAddModal = async () => {
        setIsEditMode(false);

        setSelectedMeeting(null);
        setCommitteeFeedback("");
        setCommitteeError("");

        setFormData({
            meetingDate: "",
            selectedCases: [],
            status: "Schedule",
        });

        await fetchPendingCases();

        setIsMeetingModalOpen(true);
    };

    // ===========================
    // Create Meeting
    // ===========================
    const fetchMeetings = async () => {
        try {
            const res = await axios.get(
                `${API}/api/all-meeting`
            );

            const rows = res?.data?.data || [];

            const formatted = rows.map((item) => ({
                id: item.id,
                meetingNo: item.meeting_no,
                meetingDate: item.meeting_date,
                presentedCase: item.presented_case,
                status: item.status,
                selectedCases: item.selected_cases || [],
            }));

            setMeetings(formatted);

        } catch (error) {
            console.error(error);
            setMeetings([]);
        }
    };


    // Create Meeting API
    const handleCreateMeeting = async () => {
        try {
            if (!formData.meetingDate) {
                alert("Select meeting date");
                return;
            }

            if (formData.selectedCases.length === 0) {
                alert("Select at least one case");
                return;
            }

            await axios.post(
                `${API}/api/create-meeting`,
                {
                    meetingDate: formData.meetingDate,
                    selectedCases: formData.selectedCases,
                    status: "Schedule",
                }
            );

            setIsAddModalOpen(false);
            fetchMeetings();
            setIsMeetingModalOpen(false);

        } catch (error) {
            console.error(error);
            alert("Create failed");
        }
    };

    // ===========================
    // Delete Meeting
    // ===========================
    const handleDeleteMeeting = async () => {
        try {
            await axios.delete(
                `${API}/api/meeting/${selectedMeeting.id}`
            );

            setIsDeleteModalOpen(false);
            setSelectedMeeting(null);

            fetchMeetings();

        } catch (error) {
            console.error(error);
            alert("Delete failed");
        }
    };


    // ================= USE EFFECT =================
    useEffect(() => {
        fetchMeetings();
    }, []);


    // ===========================
    // Search Filter
    // ===========================
    // const filteredMeetings = useMemo(() => {
    //     return meetings.filter((item) =>
    //         item.meetingNo
    //             .toLowerCase()
    //             .includes(searchTerm.toLowerCase())
    //     );
    // }, [meetings, searchTerm]);

    // ================= REPLACE SEARCH FILTER =================
    const filteredMeetings = useMemo(() => {
        return meetings.filter((item) =>
            String(item.meetingNo || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
    }, [meetings, searchTerm]);


    // ================= ADD FUNCTIONS =================

    // VIEW
    const handleViewMeeting = async (row) => {
        try {
            const res = await axios.get(
                `${API}/api/meeting/${row.id}`
            );

            setSelectedMeeting(res?.data?.data);
            setIsViewModalOpen(true);

        } catch (error) {
            console.error(error);
        }
    };


    // ================= FIX handleEditMeeting =================
    // const handleEditMeeting = async (row) => {
    //     try {
    //         await fetchPendingCases(); // ✅ first load cases

    //         const res = await axios.get(
    //             `${API}/api/meeting/${row.id}`
    //         );

    //         const data = res?.data?.data || {};

    //         let selectedCases = [];

    //         // ✅ parse previous selected ids
    //         if (Array.isArray(data.selected_cases)) {
    //             selectedCases = data.selected_cases.map(Number);
    //         } else if (typeof data.selected_cases === "string") {
    //             try {
    //                 selectedCases = JSON.parse(
    //                     data.selected_cases
    //                 ).map(Number);
    //             } catch {
    //                 selectedCases = [];
    //             }
    //         }

    //         setSelectedMeeting(data);
    //         setIsEditMode(true);

    //         // ✅ set previous values
    //         setFormData({
    //             meetingDate: data.meeting_date
    //                 ? data.meeting_date.split("T")[0]
    //                 : "",
    //             selectedCases,
    //             status: data.status || "Schedule",
    //         });

    //         setIsMeetingModalOpen(true);

    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    // ================= FIX handleEditMeeting =================
    const handleEditMeeting = async (row) => {
        try {
            await fetchPendingCases();

            const res = await axios.get(
                `${API}/api/meeting/${row.id}`
            );

            const data = res?.data?.data || {};

            let selectedCases = [];

            // ✅ convert all ids to STRING
            if (Array.isArray(data.selected_cases)) {
                selectedCases = data.selected_cases.map(String);
            } else if (typeof data.selected_cases === "string") {
                try {
                    selectedCases = JSON.parse(
                        data.selected_cases
                    ).map(String);
                } catch {
                    selectedCases = [];
                }
            }

            setSelectedMeeting(data);
            setIsEditMode(true);

            setFormData({
                meetingDate: data.meeting_date
                    ? data.meeting_date.split("T")[0]
                    : "",
                selectedCases,
                status: data.status || "Schedule",
            });

            setIsMeetingModalOpen(true);

        } catch (error) {
            console.error(error);
        }
    };


    // UPDATE
    const handleUpdateMeeting = async () => {
        try {
            await axios.put(
                `${API}/api/meeting/${selectedMeeting.id}`,
                {
                    meetingDate: formData.meetingDate,
                    selectedCases: formData.selectedCases,
                    status: formData.status,
                }
            );

            setIsEditModalOpen(false);
            setIsMeetingModalOpen(false);
            fetchMeetings();

        } catch (error) {
            console.error(error);
        }
    };

    const handleSendToCommitteeMember = async () => {
        try {
            if (formData.selectedCases.length === 0) {
                alert("Select at least one case");
                return;
            }

            setCommitteeError("");
            setIsSendingToCommittee(true);

            await Promise.all(
                formData.selectedCases.map((caseId) =>
                    axios.put(
                        `${API}/api/assistance/status/committee-member/${caseId}`,
                        {
                            feedback: committeeFeedback,
                            loginId: user?.id,
                            loginRole: user?.role,
                        }
                    )
                )
            );

            await fetchPendingCases();
            setFormData((prev) => ({
                ...prev,
                selectedCases: [],
            }));
            setCommitteeFeedback("");
            alert("Selected cases sent to committee member successfully");
        } catch (error) {
            console.error(error);
            setCommitteeError(
                error?.response?.data?.message || "Failed to send cases to committee member"
            );
        } finally {
            setIsSendingToCommittee(false);
        }
    };


    return (
        <div className="p-8 min-h-screen bg-gray-50">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-700">
                    Meeting Schedule
                </h1>

                <button
                    onClick={openAddModal}
                    className="bg-[#d94452] hover:bg-[#c13946] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium shadow-sm"
                >
                    <Plus size={18} />
                    Create Meeting
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative w-full max-w-sm">
                        <span className="absolute left-3 top-2.5 text-gray-400">
                            <Search size={16} />
                        </span>

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            placeholder="Search by Meeting No..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="px-6 py-4 text-sm font-semibold">
                                Meeting No
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold">
                                Meeting Date
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold">
                                Presented Case
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold">
                                Status
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredMeetings.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b"
                            >
                                <td className="px-6 py-4">
                                    {item.meetingNo}
                                </td>
                                <td className="px-6 py-4">
                                    {formatIndianDate(item.meetingDate)}
                                </td>
                                <td className="px-6 py-4">
                                    {item.presentedCase}
                                </td>
                                <td className="px-6 py-4">
                                    {item.status}
                                </td>


                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">

                                        <button
                                            onClick={() => handleViewMeeting(item)}
                                            className="text-blue-500"
                                        >
                                            <Search size={18} />
                                        </button>

                                        <button
                                            onClick={() => handleEditMeeting(item)}
                                            className="text-green-500"
                                        >
                                            <Edit size={18} />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setSelectedMeeting(item);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredMeetings.length === 0 && (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="text-center py-8 text-gray-500"
                                >
                                    No Meeting Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ================= ADD MODAL ================= */}

            {isMeetingModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl">

                        {/* Header */}
                        <div className="flex justify-between items-center p-5 border-b">
                            <h2 className="text-lg font-bold">
                                {isEditMode
                                    ? "Edit Meeting"
                                    : "Create Meeting"}
                            </h2>

                            <button
                                onClick={() =>
                                    setIsMeetingModalOpen(false)
                                }
                            >
                                <X />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">

                            <div>
                                <label className="text-sm font-medium">
                                    Meeting Date
                                </label>

                                <input
                                    type="date"
                                    value={formData.meetingDate}
                                    min={
                                        new Date()
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            meetingDate: e.target.value,
                                        })
                                    }
                                    className="w-full border p-2 rounded mt-1"
                                />
                            </div>

                            {/* Cases */}
                            <div>
                                <label className="text-sm font-medium">
                                    Select Cases
                                </label>

                                <div className="border rounded-lg mt-2 max-h-72 overflow-y-auto">

                                    {loadingCases ? (
                                        <p className="p-4">Loading...</p>
                                    ) : (
                                        pendingCases.map((item) => (
                                            <label
                                                key={item.id}
                                                className="flex items-center gap-3 px-4 py-3 border-b"
                                            ><input
                                                    type="checkbox"
                                                    checked={
                                                        Array.isArray(formData.selectedCases) &&
                                                        formData.selectedCases
                                                            .map(String)
                                                            .includes(String(item.id))
                                                    }
                                                    onChange={(e) => {
                                                        const currentId = String(item.id);

                                                        setFormData((prev) => {
                                                            const prevCases = Array.isArray(
                                                                prev.selectedCases
                                                            )
                                                                ? prev.selectedCases.map(String)
                                                                : [];

                                                            if (e.target.checked) {
                                                                // ✅ Add if not already exists
                                                                if (!prevCases.includes(currentId)) {
                                                                    return {
                                                                        ...prev,
                                                                        selectedCases: [
                                                                            ...prevCases,
                                                                            currentId,
                                                                        ],
                                                                    };
                                                                }

                                                                return prev;
                                                            } else {
                                                                // ✅ Remove
                                                                return {
                                                                    ...prev,
                                                                    selectedCases:
                                                                        prevCases.filter(
                                                                            (x) => x !== currentId
                                                                        ),
                                                                };
                                                            }
                                                        });
                                                    }}
                                                />

                                                <div>
                                                    <p className="font-medium text-sm">
                                                        MS ID :
                                                        {item.diksharthi_id}
                                                    </p>

                                                    <p className="text-sm">
                                                        {item.diksharthi_name}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {item.assistance_type}
                                                    </p>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            {!isEditMode && (
                                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700">
                                            Send to Committee Member
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">
                                            This action separately changes selected pending cases to committee member status and saves feedback.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700">
                                            Feedback
                                        </label>
                                        <div className="mt-2 rounded-lg overflow-hidden bg-white">
                                            <JoditEditor
                                                value={committeeFeedback}
                                                config={queryEditorConfig}
                                                onBlur={(newValue) => setCommitteeFeedback(newValue)}
                                                onChange={() => { }}
                                            />
                                        </div>
                                    </div>

                                    {committeeError && (
                                        <p className="text-sm text-red-600">{committeeError}</p>
                                    )}

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleSendToCommitteeMember}
                                            disabled={isSendingToCommittee}
                                            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
                                        >
                                            {isSendingToCommittee
                                                ? "Sending..."
                                                : "Send to Committee Member"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t flex justify-end gap-3">

                            <button
                                onClick={() =>
                                    setIsMeetingModalOpen(false)
                                }
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    isEditMode
                                        ? handleUpdateMeeting
                                        : handleCreateMeeting
                                }
                                className={`px-4 py-2 text-white rounded ${isEditMode
                                        ? "bg-green-600"
                                        : "bg-[#d94452]"
                                    }`}
                            >
                                {isEditMode
                                    ? "Update"
                                    : "Create"}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* ================= DELETE MODAL ================= */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-6">

                        <h3 className="text-lg font-bold mb-3">
                            Delete Meeting
                        </h3>

                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure want to delete this
                            meeting?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() =>
                                    setIsDeleteModalOpen(false)
                                }
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDeleteMeeting}
                                className="px-4 py-2 bg-red-500 text-white rounded"
                            >
                                Delete
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {isViewModalOpen && selectedMeeting && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">

                        {/* Header */}
                        <div className="p-5 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-700">
                                Meeting Details
                            </h2>

                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-slate-500 hover:text-red-500"
                            >
                                <X />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">

                            <div className="grid grid-cols-2 gap-4">

                                <div className="border rounded-lg p-4 bg-slate-50">
                                    <p className="text-sm text-slate-500">
                                        Meeting ID
                                    </p>
                                    <p className="font-semibold text-slate-700 mt-1">
                                        {selectedMeeting.meeting_no}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4 bg-slate-50">
                                    <p className="text-sm text-slate-500">
                                        Meeting Date
                                    </p>
                                    <p className="font-semibold text-slate-700 mt-1">
                                        {formatIndianDate(
                                            selectedMeeting.meeting_date
                                        )}
                                    </p>
                                </div>

                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-700 mb-3">
                                    Selected Cases
                                </p>

                                <div className="space-y-2 max-h-72 overflow-y-auto">

                                    {(() => {
                                        let caseList = [];

                                        try {
                                            if (
                                                Array.isArray(
                                                    selectedMeeting.selected_cases
                                                )
                                            ) {
                                                caseList =
                                                    selectedMeeting.selected_cases;
                                            } else if (
                                                typeof selectedMeeting.selected_cases ===
                                                "string"
                                            ) {
                                                caseList = JSON.parse(
                                                    selectedMeeting.selected_cases
                                                );
                                            } else if (
                                                selectedMeeting.selected_cases
                                            ) {
                                                caseList = [
                                                    selectedMeeting.selected_cases,
                                                ];
                                            }
                                        } catch {
                                            caseList = [];
                                        }

                                        return Array.isArray(caseList)
                                            ? caseList.map((id, index) => (
                                                <div
                                                    key={index}
                                                    className="px-4 py-3 border rounded-lg bg-white shadow-sm text-sm font-medium text-slate-700"
                                                >
                                                    Case ID : {id}
                                                </div>
                                            ))
                                            : null;
                                    })()}

                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t flex justify-end">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-4 py-2 rounded bg-slate-700 text-white"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
          
        </div>
    );
}

export default MeetingSchedule;
