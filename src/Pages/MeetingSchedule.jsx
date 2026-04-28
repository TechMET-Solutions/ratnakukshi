import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import { formatIndianDate } from "../utils/formatIndianDate";
import { useAuth } from "../context/AuthContext";

function MeetingSchedule() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const role = String(user?.role || "").trim().toLowerCase();
    const isCaseCoordinator = role === "case-coordinator";

    const [meetings, setMeetings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    const [formData, setFormData] = useState({
        meetingDate: "",
        status: "Schedule",
    });

    const fetchMeetings = async () => {
        try {
            const res = await axios.get(`${API}/api/all-meeting`);
            const rows = res?.data?.data || [];

            setMeetings(
                rows.map((item) => ({
                    id: item.id,
                    meetingNo: item.meeting_no,
                    meetingDate: item.meeting_date,
                    presentedCase: item.presented_case,
                    status: item.status,
                }))
            );
        } catch (error) {
            console.error(error);
            setMeetings([]);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const filteredMeetings = useMemo(() => {
        return meetings.filter((item) =>
            String(item.meetingNo || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
    }, [meetings, searchTerm]);

    const openAddModal = () => {
        setIsEditMode(false);
        setSelectedMeeting(null);
        setFormData({
            meetingDate: "",
            status: "Schedule",
        });
        setIsMeetingModalOpen(true);
    };

    const handleCreateMeeting = async () => {
        try {
            if (!formData.meetingDate) {
                alert("Select meeting date");
                return;
            }

            await axios.post(`${API}/api/create-meeting`, {
                meetingDate: formData.meetingDate,
                status: formData.status,
            });

            setIsMeetingModalOpen(false);
            fetchMeetings();
        } catch (error) {
            console.error(error);
            alert("Create failed");
        }
    };

    const handleViewMeeting = (row) => {
        navigate(`/meeting-schedule/${row.id}`);
    };

    const handleEditMeeting = async (row) => {
        try {
            const res = await axios.get(`${API}/api/meeting/${row.id}`);
            const data = res?.data?.data || {};

            setSelectedMeeting(data);
            setIsEditMode(true);
            setFormData({
                meetingDate: data.meeting_date
                    ? data.meeting_date.split("T")[0]
                    : "",
                status: data.status || "Schedule",
            });
            setIsMeetingModalOpen(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateMeeting = async () => {
        try {
            await axios.put(`${API}/api/meeting/${selectedMeeting.id}`, {
                meetingDate: formData.meetingDate,
                status: formData.status,
            });

            setIsMeetingModalOpen(false);
            fetchMeetings();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteMeeting = async () => {
        try {
            await axios.delete(`${API}/api/meeting/${selectedMeeting.id}`);
            setIsDeleteModalOpen(false);
            setSelectedMeeting(null);
            fetchMeetings();
        } catch (error) {
            console.error(error);
            alert("Delete failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-700">
                    Meeting Schedule
                </h1>

                {isCaseCoordinator && (
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 rounded-md bg-[#d94452] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#c13946]"
                    >
                        <Plus size={18} />
                        Create Meeting
                    </button>
                )}
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-4">
                    <div className="relative w-full max-w-sm">
                        <span className="absolute left-3 top-2.5 text-gray-400">
                            <Search size={16} />
                        </span>

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Meeting No..."
                            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm"
                        />
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-6 py-4 text-sm font-semibold">Meeting No</th>
                            <th className="px-6 py-4 text-sm font-semibold">Meeting Date</th>
                            <th className="px-6 py-4 text-sm font-semibold">Presented Case</th>
                            <th className="px-6 py-4 text-sm font-semibold">Status</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredMeetings.map((item) => (
                            <tr key={item.id} className="border-b">
                                <td className="px-6 py-4">{item.meetingNo}</td>
                                <td className="px-6 py-4">{formatIndianDate(item.meetingDate)}</td>
                                <td className="px-6 py-4">{item.presentedCase}</td>
                                <td className="px-6 py-4">{item.status}</td>

                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => handleViewMeeting(item)}
                                            className="text-blue-500"
                                        >
                                            <Eye size={18} />
                                        </button>

                                        {isCaseCoordinator && (
                                            <button
                                                onClick={() => handleEditMeeting(item)}
                                                className="text-green-500"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        )}

                                        {isCaseCoordinator && (
                                            <button
                                                onClick={() => {
                                                    setSelectedMeeting(item);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="text-red-500"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredMeetings.length === 0 && (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">
                                    No Meeting Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isMeetingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2">
                    <div className="mx-4 flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-xl md:mx-6">
                        <div className="flex items-center justify-between border-b p-5">
                            <h2 className="text-lg font-bold">
                                {isEditMode ? "Edit Meeting" : "Create Meeting"}
                            </h2>

                            <button onClick={() => setIsMeetingModalOpen(false)}>
                                <X />
                            </button>
                        </div>

                        <div className="flex-1 space-y-5 overflow-y-auto p-6">
                            <div>
                                <label className="text-sm font-medium">
                                    Meeting Date
                                </label>

                                <input
                                    type="date"
                                    value={formData.meetingDate}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            meetingDate: e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded border p-2"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    Status
                                </label>

                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            status: e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded border p-2"
                                >
                                    <option value="Schedule">Schedule</option>
                                    <option value="Reschedule">Reschedule</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t p-5">
                            <button
                                onClick={() => setIsMeetingModalOpen(false)}
                                className="rounded border px-4 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={isEditMode ? handleUpdateMeeting : handleCreateMeeting}
                                className={`rounded px-4 py-2 text-white ${isEditMode ? "bg-green-600" : "bg-[#d94452]"
                                    }`}
                            >
                                {isEditMode ? "Update" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="mb-3 text-lg font-bold">Delete Meeting</h3>

                        <p className="mb-6 text-sm text-gray-600">
                            Are you sure want to delete this meeting?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="rounded border px-4 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDeleteMeeting}
                                className="rounded bg-red-500 px-4 py-2 text-white"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MeetingSchedule;
