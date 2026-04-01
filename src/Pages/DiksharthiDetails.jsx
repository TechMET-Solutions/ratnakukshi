import { Plus, Search, SquaresExclude, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import { useAuth } from "../context/AuthContext";
import { formatIndianDate } from "../utils/formatIndianDate";

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight">{label}</span>
    <span className="text-sm font-medium text-gray-800">{value || "-"}</span>
  </div>
);

const MenuItem = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
  >
    {children}
  </button>
);

const normalizeRole = (value) => {
  const rawRole = String(value || "").trim().toLowerCase();

  if (
    ["case coordinator", "case cordinator", "case-coordinator"].includes(rawRole)
  ) {
    return "case-coordinator";
  }

  if (
    [
      "operations-manager",
      "operations manager",
      "operation manage",
      "opration manage",
      "opration manager",
    ].includes(rawRole)
  ) {
    return "operations-manager";
  }

  return rawRole;
};

const normalizeUser = (item) => ({
  id: item?.id || item?.userId || item?._id || "",
  name: item?.name || item?.fullName || item?.full_name || "",
  email: item?.email || "",
  role: String(item?.role || "").toLowerCase(),
});

const emptyScheduleForm = {
  name: "",
  address: "",
  mobile: "",
  date: "",
  time: "",
};

const emptyFeedbackForm = {
  feedback: "",
};

const DiksharthiListing = () => {
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuth();

  const [openMenuId, setOpenMenuId] = useState(null);

  const role = normalizeRole(loggedInUser?.role || "");
  const loggedInUserId = loggedInUser?.id ?? null;

  const [sendingId, setSendingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewModalData, setViewModalData] = useState(null);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [assignModalData, setAssignModalData] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [isAssigningAdmin, setIsAssigningAdmin] = useState(false);
  const [isAdminListLoading, setIsAdminListLoading] = useState(false);
  const [visitSchedules, setVisitSchedules] = useState({});
  const [scheduleVisitModalData, setScheduleVisitModalData] = useState(null);
  const [scheduleVisitModalMode, setScheduleVisitModalMode] = useState("contact");
  const [viewScheduleModalData, setViewScheduleModalData] = useState(null);
  const [familyDetailsModalData, setFamilyDetailsModalData] = useState(null);
  const [isFamilyDetailsLoading, setIsFamilyDetailsLoading] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm);
  const [isSchedulingVisit, setIsSchedulingVisit] = useState(false);
  const [isViewScheduleLoading, setIsViewScheduleLoading] = useState(false);

  // Feedback states
  const [feedbackModalData, setFeedbackModalData] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState(emptyFeedbackForm);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [viewFeedbackModalData, setViewFeedbackModalData] = useState(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isAddingFeedbackToDiksharthi, setIsAddingFeedbackToDiksharthi] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);
  const [downloadingApplicationId, setDownloadingApplicationId] = useState(null);

  const itemsPerPage = 10;

  const [diksharthiList, setDiksharthiList] = useState([]);
  const [userDirectory, setUserDirectory] = useState([]);
  const [feedbackStatus, setFeedbackStatus] = useState({});

  const fetchFeedbackStatus = async (records) => {
    try {
      if (!Array.isArray(records) || records.length === 0) {
        setFeedbackStatus({});
        return;
      }

      const results = await Promise.all(
        records.map(async (item) => {

          const res = await fetch(`${API}/api/feedback/view/${item.id}`);
          const data = await res.json();

          const hasFeedback =
            Array.isArray(data?.data) && data.data.length > 0;

          return [item.id, hasFeedback];
        })
      );

      const statusMap = results.reduce((acc, [id, value]) => {
        acc[id] = value;
        return acc;
      }, {});

      setFeedbackStatus(statusMap);

    } catch (error) {
      console.error("Feedback status fetch failed", error);
    }
  };

  const fetchDiksharthiList = async () => {
    try {
      const res = await fetch(`${API}/api/get-diksharthi`);
      const data = await res.json();
      const allRecords = Array.isArray(data?.data) ? data.data : [];




      let filteredRecords = [];

      if (role === "staff") {
        // Staff sees only their own records
        filteredRecords = allRecords.filter(
          (item) => String(item?.user_id) === String(loggedInUserId)
        );

      } else if (role === "operations-manager") {
        // Operations manager sees all records sent by staff
        filteredRecords = allRecords.filter(
          (item) => String(item?.status).toLowerCase() === "send"
        );

      } else if (role === "karyakarta") {
        // Admin sees only assigned records
        filteredRecords = allRecords.filter(
          (item) => String(item?.admin_id) === String(loggedInUserId)
        );

      } else {
        filteredRecords = allRecords;
      }

      setDiksharthiList(filteredRecords);
      await fetchFeedbackStatus(filteredRecords);
      if (role === "operations-manager" || role === "karyakarta") {
        await fetchVisitSchedulesForList(filteredRecords);
      } else {
        setVisitSchedules({});
      }

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDiksharthiList();
  }, [role, loggedInUserId]);

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, diksharthiList.length]);

  const handleSendToOpManager = async (id) => {
    debugger
    try {
      setSendingId(id);
      const res = await fetch(`${API}/api/update-diksharthi-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "send",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update diksharthi status");
      }

      await fetchDiksharthiList();
    } catch (error) {
      console.error(error);
      alert("Failed to send to Operations Manager");
    } finally {
      setSendingId(null);
    }
  };

  const filteredDiksharthiList = diksharthiList.filter((diksharthi) => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;

    return [
      diksharthi?.id,
      diksharthi?.diksharthi_code,
      diksharthi?.sadhu_sadhvi_name,
      diksharthi?.pad,
      diksharthi?.samudaay,
      diksharthi?.is_alive,
      diksharthi?.photo,
    ]
      .map((value) => String(value || "").toLowerCase())
      .some((value) => value.includes(search));
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDiksharthiList.length / itemsPerPage)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredDiksharthiList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getAssistanceSummary = (diksharthi) => {
    const assistanceItems = Array.isArray(diksharthi?.family_details?.assistanceData)
      ? diksharthi.family_details.assistanceData
      : [];
    const queryItem = assistanceItems.find(
      (item) => String(item?.status || "").toLowerCase() === "queries"
    );
    return {
      status: queryItem?.status || assistanceItems[0]?.status || "Pending",
      queryItem,
    };
  };

  const getDiksharthiStatus = (diksharthi) =>
    String(diksharthi?.status || "").trim().toLowerCase();

  const getAliveStatus = (diksharthi) =>
    String(diksharthi?.is_alive || diksharthi?.isAlive || "")
      .trim()
      .toLowerCase();

  const isAdminUnassigned = (diksharthi) => {
    const adminId = diksharthi?.admin_id;
    return adminId === null || adminId === undefined || String(adminId).trim() === "" || String(adminId) === "0";
  };

  const getUserNameById = (userId) => {
    if (userId === null || userId === undefined || String(userId).trim() === "" || String(userId) === "0") {
      return "-";
    }

    const matchedUser = userDirectory.find(
      (user) => String(user?.id) === String(userId)
    );

    return matchedUser?.name || matchedUser?.email || String(userId);
  };

  const getVisitSchedule = (diksharthi) => {
    if (!diksharthi?.id) return null;
    return visitSchedules[String(diksharthi.id)] || null;
  };

  const hasVisitContactInfo = (diksharthi) => {
    const schedule = getVisitSchedule(diksharthi);
    return Boolean(
      schedule?.name?.trim() &&
      schedule?.address?.trim() &&
      schedule?.mobile?.trim()
    );
  };

  const hasVisitDateTime = (diksharthi) => {
    const schedule = getVisitSchedule(diksharthi);
    return Boolean(schedule?.date && schedule?.time);
  };

  const normalizeVisitSchedule = (schedule) => {
    if (!schedule) return null;

    return {
      diksharthi_id: schedule?.diksharthi_id || "",
      diksharthi_name:
        schedule?.diksharthi_name ||
        schedule?.sadhu_sadhvi_name ||
        schedule?.name ||
        "",
      name: schedule?.name || schedule?.person_name || "",
      address: schedule?.address || schedule?.visit_address || "",
      mobile: schedule?.mobile || schedule?.mobile_no || schedule?.phone || "",
      date: schedule?.date || schedule?.visit_date || schedule?.scheduled_date || "",
      time: schedule?.time || schedule?.visit_time || schedule?.scheduled_time || "",
      diksharthi_code: schedule?.diksharthi_code || schedule?.diksharthi_id || "",
      scheduled_by: schedule?.scheduled_by || schedule?.user_id || "",
    };
  };

  const fetchVisitScheduleById = async (diksharthiId) => {
    if (!diksharthiId) return null;

    try {
      const response = await fetch(`${API}/api/visit-schedule/list/${diksharthiId}`);
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        return null;
      }

      const rawSchedule = Array.isArray(result?.data)
        ? result.data[0]
        : result?.data || result?.schedule || result;
      return normalizeVisitSchedule(rawSchedule);
    } catch (error) {
      console.error("Failed to fetch visit schedule", error);
      return null;
    }
  };

  const fetchVisitSchedulesForList = async (records) => {
    try {
      const entries = await Promise.all(
        records.map(async (item) => {
          const schedule = await fetchVisitScheduleById(item?.id);
          return [String(item?.id), schedule];
        })
      );

      const nextSchedules = entries.reduce((acc, [id, schedule]) => {
        if (id && schedule) {
          acc[id] = schedule;
        }
        return acc;
      }, {});

      setVisitSchedules(nextSchedules);
    } catch (error) {
      console.error("Failed to fetch visit schedules for list", error);
      setVisitSchedules({});
    }
  };

  const fetchAdminUsers = async () => {
    try {
      setIsAdminListLoading(true);
      const response = await fetch(`${API}/api/user/list`);
      const result = await response.json();
      const rows = Array.isArray(result?.data) ? result.data : [];
      const normalizedUsers = rows.map(normalizeUser);
      setUserDirectory(normalizedUsers);
      const Karyakarta = normalizedUsers.filter(
        (user) => String(user?.role || "").toLowerCase() === "karyakarta"
      );
      setAdminUsers(Karyakarta);
      console.log(Karyakarta, "Karyakarta")
    } catch (error) {
      console.error(error);
      alert("Failed to fetch Karyakarta list");
    } finally {
      setIsAdminListLoading(false);
    }
  };

  const openAssignAdminModal = async (diksharthi) => {
    setAssignModalData(diksharthi);
    setSelectedAdminId("");
    await fetchAdminUsers();

    console.log(fetchAdminUsers)
  };

  const openContactInfoModal = (diksharthi) => {
    const existingSchedule = getVisitSchedule(diksharthi);
    setScheduleVisitModalMode("contact");
    setScheduleVisitModalData(diksharthi);
    setScheduleForm(
      existingSchedule || {
        ...emptyScheduleForm,
        name: diksharthi?.relation_name || "",
      }
    );
  };

  const openDateTimeModal = (diksharthi) => {
    const existingSchedule = getVisitSchedule(diksharthi);
    setScheduleVisitModalMode("datetime");
    setScheduleVisitModalData(diksharthi);
    setScheduleForm(
      existingSchedule || {
        ...emptyScheduleForm,
        name: diksharthi?.relation_name || "",
      }
    );
  };

  const handleScheduleFormChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveVisitSchedule = async () => {
    if (!scheduleVisitModalData?.id) return;

    if (!scheduleForm.name.trim() || !scheduleForm.address.trim() || !scheduleForm.mobile.trim()) {
      alert("Please fill name, address and mobile number");
      return;
    }

    if (scheduleVisitModalMode === "datetime" && (!scheduleForm.date || !scheduleForm.time)) {
      alert("Please set visit date and time");
      return;
    }

    const payload = {
      diksharthi_id: scheduleVisitModalData.id,
      diksharthi_code: String(scheduleVisitModalData.id || ""),
      diksharthi_name: scheduleVisitModalData.sadhu_sadhvi_name || "",
      name: scheduleForm.name.trim(),
      address: scheduleForm.address.trim(),
      mobile: scheduleForm.mobile.trim(),
      date: scheduleForm.date || null,
      time: scheduleForm.time || null,
      scheduled_by: loggedInUserId,
    };

    try {
      setIsSchedulingVisit(true);

      const response = await fetch(`${API}/api/visit-schedule/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Failed to schedule visit");
      }

      const savedSchedule = result?.data || payload;
      const normalizedSchedule = {
        diksharthi_id:
          savedSchedule?.diksharthi_id || payload.diksharthi_id,
        diksharthi_name:
          savedSchedule?.diksharthi_name || payload.diksharthi_name,
        name: savedSchedule?.name || payload.name,
        address: savedSchedule?.address || payload.address,
        mobile: savedSchedule?.mobile || payload.mobile,
        date: savedSchedule?.date || payload.date,
        time: savedSchedule?.time || payload.time,
        diksharthi_code:
          savedSchedule?.diksharthi_code || payload.diksharthi_code,
        scheduled_by:
          savedSchedule?.scheduled_by || payload.scheduled_by,
      };

      const updatedSchedules = {
        ...visitSchedules,
        [String(scheduleVisitModalData.id)]: normalizedSchedule,
      };

      setVisitSchedules(updatedSchedules);
      setScheduleVisitModalData(null);
      setScheduleVisitModalMode("contact");
      setScheduleForm(emptyScheduleForm);
      alert(
        scheduleVisitModalMode === "contact"
          ? "Contact info saved successfully"
          : (result?.message || "Visit schedule saved successfully")
      );
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to schedule visit");
    } finally {
      setIsSchedulingVisit(false);
    }
  };

  const openFamilyDetailsModal = async (diksharthi) => {
    if (!diksharthi?.id) return;
    setIsFamilyDetailsLoading(true);
    setFamilyDetailsModalData({ diksharthi, details: null });
    try {
      const response = await fetch(`${API}/api/family-details/${diksharthi.id}`);
      const result = await response.json().catch(() => ({}));
      if (response.ok && result?.success) {
        setFamilyDetailsModalData({ diksharthi, details: result?.data });
      } else {
        setFamilyDetailsModalData({ diksharthi, details: null });
      }
    } catch (error) {
      console.error("Failed to fetch family details", error);
      setFamilyDetailsModalData({ diksharthi, details: null });
    } finally {
      setIsFamilyDetailsLoading(false);
    }
  };

  const openViewScheduleModal = async (diksharthi) => {
    setIsViewScheduleLoading(true);
    setViewScheduleModalData({
      diksharthi,
      schedule: getVisitSchedule(diksharthi),
    });

    try {
      const schedule = await fetchVisitScheduleById(diksharthi?.id);
      setViewScheduleModalData({
        diksharthi,
        schedule,
      });
    } finally {
      setIsViewScheduleLoading(false);
    }
  };

  const openViewModal = async (diksharthi) => {
    if (!diksharthi?.id) return;

    try {
      setIsViewLoading(true);
      setViewModalData(null);

      const response = await fetch(`${API}/api/diksharthi/${diksharthi.id}`);
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Failed to fetch diksharthi details");
      }

      setViewModalData(result?.data || diksharthi);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch diksharthi details");
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleAssignAdmin = async () => {
    if (!assignModalData?.id || !selectedAdminId) {
      alert("Please select an admin");
      return;
    }

    try {
      setIsAssigningAdmin(true);
      const payload = {
        id: assignModalData.id,
        admin_id: selectedAdminId,
      };

      const response = await fetch(`${API}/api/assign-karyakarta`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to assign Karyakarta");
      }

      alert("Karyakarta assigned successfully");
      setAssignModalData(null);
      setSelectedAdminId("");
      await fetchDiksharthiList();
    } catch (error) {
      console.error(error);
      alert("Failed to assign Karyakarta");
    } finally {
      setIsAssigningAdmin(false);
    }
  };

  // Feedback handlers
  const openFeedbackModal = (diksharthi) => {
    if (feedbackStatus[diksharthi?.id]) {
      openViewFeedbackModal(diksharthi);
      return;
    }
    setFeedbackModalData(diksharthi);
    setFeedbackForm(emptyFeedbackForm);
  };

  const canDownloadApplication =
    role === "admin" || role === "case-coordinator" || role === "operations-manager";

  const handleDownloadApplicationExcel = async (diksharthi) => {
    if (!diksharthi?.id) return;

    try {
      setDownloadingApplicationId(diksharthi.id);

      const response = await fetch(
        `${API}/api/report/generateDiksharthiExcel?id=${diksharthi.id}`
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.message || "Failed to download application Excel");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `Diksharthi_Application_${diksharthi.id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to download application Excel");
    } finally {
      setDownloadingApplicationId(null);
    }
  };

  const handleDownloadApplicationPdf = async (diksharthi) => {
    if (!diksharthi?.id) return;

    try {
      setDownloadingPdfId(diksharthi.id);

      const response = await fetch(
        `${API}/api/report/generateDikshartiReport/${diksharthi.id}`
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.message || "Failed to download application PDF");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `Diksharthi_Application_${diksharthi.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to download application PDF");
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const handleFeedbackFormChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackModalData?.id) return;
    if (!feedbackForm.feedback.trim()) {
      alert("Please enter feedback");
      return;
    }
    try {
      setIsSubmittingFeedback(true);
      const payload = {
        diksharthi_id: feedbackModalData.id,
        diksharthi_code: feedbackModalData.diksharthi_code || "",
        diksharthi_name: feedbackModalData.sadhu_sadhvi_name || "",
        feedback: feedbackForm.feedback.trim(),
        submitted_by: loggedInUserId,
      };
      const response = await fetch(`${API}/api/feedback/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.message || "Failed to submit feedback");
      }
      alert(result?.message || "Feedback submitted successfully");
      setFeedbackStatus((prev) => ({
        ...prev,
        [feedbackModalData.id]: true,
      }));
      setFeedbackModalData(null);
      setFeedbackForm(emptyFeedbackForm);
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const openViewFeedbackModal = async (diksharthi) => {
    if (!diksharthi?.id) return;
    setIsFeedbackLoading(true);
    setViewFeedbackModalData({ diksharthi, feedbacks: [] });
    try {
      const response = await fetch(`${API}/api/feedback/view/${diksharthi.id}`);
      const result = await response.json().catch(() => ({}));
      const feedbacks = Array.isArray(result?.data) ? result.data : result?.data ? [result.data] : [];
      setViewFeedbackModalData({ diksharthi, feedbacks });
    } catch (error) {
      console.error("Failed to fetch feedback", error);
      setViewFeedbackModalData({ diksharthi, feedbacks: [] });
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleAddFeedbackToDiksharthi = async (feedbackItem) => {
    if (!viewFeedbackModalData?.diksharthi?.id || !feedbackItem) return;
    try {
      setIsAddingFeedbackToDiksharthi(true);
      const response = await fetch(
        `${API}/api/diksharthi-feedback/approve/${feedbackItem.id || feedbackItem.feedback_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            diksharthi_id: viewFeedbackModalData.diksharthi.id,
            feedback: feedbackItem.feedback,
            approved_by: loggedInUserId,
          }),
        }
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.message || "Failed to add feedback to diksharthi");
      }
      alert(result?.message || "Feedback added to diksharthi details successfully");
      setViewFeedbackModalData(null);
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to add feedback to diksharthi");
    } finally {
      setIsAddingFeedbackToDiksharthi(false);
    }
  };

  const downloadExcel = () => {
    window.open(`${API}/api/diksharthi/export`, "_blank");
  };

  return (
    <div className="p-8 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-700">
          {role === "staff" ? "Diksharthi Details" : "Family Details"}
        </h1>
        {role === "staff" && (
          <div className="flex gap-6">
          
          <button
            onClick={downloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
          >
            Export Diksharthi Details
            </button>

            <Link
              to="/diksharthi-details-add"
              className="bg-[#d94452] hover:bg-[#c13946] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              Add New Diksharthi
            </Link>
          </div>
        )}
      </div>

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
              placeholder="Search by ID, name, pad, sect, alive status"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <p className="text-sm text-gray-600">
            Showing {filteredDiksharthiList.length} result(s)
          </p>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 ">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Diksharthi ID
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Diksharthi Name
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                RBF Criteria
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                RBF Relation
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                RBF Family Member Name
              </th>
              {/* <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Alive Status
              </th> */}

              {role === "operations-manager" && (
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Staff Name
                </th>
              )}
              {role === "operations-manager" && (
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Karyakarta Name
                </th>
              )}
              {role === "admin" && (
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
              )}
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedList.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    role === "operations-manager"
                      ? "10"
                      : role === "admin"
                        ? "9"
                        : "8"
                  }
                  className="px-6 py-20 text-center text-gray-500 text-sm italic"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              paginatedList.map((diksharthi) => {
                const { status, queryItem } = getAssistanceSummary(diksharthi);

                return (
                  <tr key={diksharthi.id} className="border-b border-gray-100">
                    {/* Photo */}
                    {/* <td className="px-6 py-3">
                      <img
                        src={diksharthi.photo || "/user.png"}
                        alt="diksharthi"
                        onError={(e) => {
                          e.currentTarget.src = "/user.png";
                        }}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td> */}

                    {/* Date */}
                    <td className="px-6 py-3">{formatIndianDate(diksharthi.created_at)}</td>


                    {/* ID */}
                    <td className="px-6 py-3">{diksharthi.id}</td>


                    {/* Name */}
                    <td className="px-6 py-3">{diksharthi.sadhu_sadhvi_name}</td>


                    {/* Alive */}
                    <td className="px-6 py-3">{diksharthi.rbf_criteria}</td>

                    {/* Pad */}
                    <td className="px-6 py-3">{diksharthi.relation || "-"}</td>
                    <td className="px-6 py-3">{diksharthi.family_member_firstName || "-"} {diksharthi.family_member_lastName || "-"}</td>


                    {role === "operations-manager" && (
                      <td className="px-6 py-3">
                        {getUserNameById(diksharthi.user_id)}
                      </td>
                    )}

                    {role === "operations-manager" && (
                      <td className="px-6 py-3">
                        {getUserNameById(diksharthi.admin_id)}
                      </td>
                    )}

                    {role === "admin" && (
                      <td className="px-6 py-3">{status}</td>
                    )}

                    {/* Actions */}
                    <td className="px-6 py-3 flex gap-3 flex-wrap">

                      {/* ================= STAFF ================= */}
                      {role === "staff" && (
                        <>
                          <button
                            className="rounded-lg bg-blue-600 text-sm px-2 py-1 text-white"
                            onClick={() => openViewModal(diksharthi)}
                          >
                            View
                          </button>

                          <button
                            className="rounded-lg bg-green-600 text-sm px-2 py-1 text-white"
                            onClick={() =>
                              navigate("/diksharthi-details-add", {
                                state: { mode: "edit", diksharthiData: diksharthi },
                              })
                            }
                          >
                            Edit
                          </button>

                          {getDiksharthiStatus(diksharthi) !== "send" && (
                            <button
                              className="rounded-lg bg-blue-600 text-sm px-2 py-1 text-white"
                              onClick={() => handleSendToOpManager(diksharthi.id)}
                            >
                              Send to Operations Manager
                            </button>
                          )}
                        </>
                      )}

                      {/* ================= OPERATIONS MANAGER ================= */}
                      {role === "operations-manager" && (
                        <>
                          <button
                            className="rounded-lg bg-blue-600 text-sm px-2 py-1 text-white"
                            onClick={() => openViewModal(diksharthi)}
                          >
                            View
                          </button>

                          {canDownloadApplication && diksharthi.family_details && (
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded-lg bg-rose-600 text-sm px-2 py-1 text-white disabled:opacity-60"
                                onClick={() => handleDownloadApplicationPdf(diksharthi)}
                                disabled={downloadingPdfId === diksharthi.id}
                              >
                                {downloadingPdfId === diksharthi.id ? "Downloading..." : "Application PDF"}
                              </button>
                              <button
                                className="rounded-lg bg-emerald-600 text-sm px-2 py-1 text-white disabled:opacity-60"
                                onClick={() => handleDownloadApplicationExcel(diksharthi)}
                                disabled={downloadingApplicationId === diksharthi.id}
                              >
                                {downloadingApplicationId === diksharthi.id ? "Downloading..." : "Application Excel"}
                              </button>
                            </div>
                          )}

                          {!hasVisitContactInfo(diksharthi) && (
                            <button
                              className="rounded-lg bg-emerald-600 text-sm px-2 py-1 text-white"
                              onClick={() => openContactInfoModal(diksharthi)}
                            >
                              Set Contact Info
                            </button>
                          )}

                          {hasVisitContactInfo(diksharthi) && isAdminUnassigned(diksharthi) && (
                            <button
                              className="rounded-lg bg-purple-600 text-sm px-2 py-1 text-white"
                              onClick={() => openAssignAdminModal(diksharthi)}
                            >
                              Assign Karyakarta
                            </button>
                          )}

                          {!isAdminUnassigned(diksharthi) && hasVisitContactInfo(diksharthi) && !hasVisitDateTime(diksharthi) && (
                            <button
                              className="rounded-lg bg-emerald-600 text-sm px-2 py-1 text-white"
                              onClick={() => openDateTimeModal(diksharthi)}
                            >
                              Set Date & Time
                            </button>
                          )}

                          {feedbackStatus[diksharthi.id] && (
                            <button
                              className="rounded-lg bg-orange-500 text-sm px-2 py-1 text-white"
                              onClick={() => openViewFeedbackModal(diksharthi)}
                            >
                              View Feedback
                            </button>
                          )}
                        </>
                      )}

                      {/* ================= KARYAKARTA ================= */}
                      {role === "karyakarta" && (
                        <>
                          {canDownloadApplication && (
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded-lg bg-rose-600 text-sm px-2 py-1 text-white disabled:opacity-60"
                                onClick={() => handleDownloadApplicationPdf(diksharthi)}
                                disabled={downloadingPdfId === diksharthi.id}
                              >
                                {downloadingPdfId === diksharthi.id ? "Downloading..." : "Application PDF"}
                              </button>
                              <button
                                className="rounded-lg bg-emerald-600 text-sm px-2 py-1 text-white disabled:opacity-60"
                                onClick={() => handleDownloadApplicationExcel(diksharthi)}
                                disabled={downloadingApplicationId === diksharthi.id}
                              >
                                {downloadingApplicationId === diksharthi.id ? "Downloading..." : "Application Excel"}
                              </button>
                            </div>
                          )}

                          <button
                            className="rounded-lg bg-yellow-500 text-sm px-2 py-1 text-white"
                            onClick={() =>
                              navigate("/family-details", {
                                state: {
                                  id: diksharthi.id,
                                  diksharthi_code: diksharthi.diksharthi_code,
                                  sadhu_sadhvi_name: diksharthi.sadhu_sadhvi_name,
                                  gender: diksharthi.gender,
                                },
                              })
                            }
                          >
                            {diksharthi.family_details
                              ? "Update Family Details"
                              : "Add Family Details"}
                          </button>

                          {diksharthi.family_details && (
                            <button
                              className="rounded-lg bg-teal-600 text-sm px-2 py-1 text-white"
                              onClick={() => openFamilyDetailsModal(diksharthi)}
                            >
                              View Family Details
                            </button>
                          )}

                          {hasVisitDateTime(diksharthi) && (
                            <button
                              className="rounded-lg bg-indigo-600 text-sm px-2 py-1 text-white"
                              onClick={() => openViewScheduleModal(diksharthi)}
                            >
                              View Schedule
                            </button>
                          )}

                          {!feedbackStatus[diksharthi.id] && (
                            <button
                              className="rounded-lg bg-orange-500 text-sm px-2 py-1 text-white"
                              onClick={() => openFeedbackModal(diksharthi)}
                            >
                              Add Feedback
                            </button>
                          )}

                          {feedbackStatus[diksharthi.id] && (
                            <button
                              className="rounded-lg bg-orange-500 text-sm px-2 py-1 text-white"
                              onClick={() => openViewFeedbackModal(diksharthi)}
                            >
                              View Feedback
                            </button>
                          )}
                        </>
                      )}

                      {/* ================= ADMIN ================= */}
                      {role === "admin" && (
                        <>
                          {canDownloadApplication && (
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded-lg bg-rose-600 text-sm px-2 py-1 text-white disabled:opacity-60"
                                onClick={() => handleDownloadApplicationPdf(diksharthi)}
                                disabled={downloadingPdfId === diksharthi.id}
                              >
                                {downloadingPdfId === diksharthi.id ? "Downloading..." : "Application PDF"}
                              </button>
                              <button
                                className="rounded-lg bg-emerald-600 text-sm px-2 py-1 text-white disabled:opacity-60"
                                onClick={() => handleDownloadApplicationExcel(diksharthi)}
                                disabled={downloadingApplicationId === diksharthi.id}
                              >
                                {downloadingApplicationId === diksharthi.id ? "Downloading..." : "Application Excel"}
                              </button>
                            </div>
                          )}

                          <button
                            className="rounded-lg bg-blue-600 text-sm px-2 py-1 text-white"
                            onClick={() => openViewModal(diksharthi)}
                          >
                            View
                          </button>

                          {diksharthi.family_details && (
                            <button
                              className="rounded-lg bg-teal-600 text-sm px-2 py-1 text-white"
                              onClick={() => openFamilyDetailsModal(diksharthi)}
                            >
                              View Family Details
                            </button>
                          )}
                        </>
                      )}

                      {/* ================= CASE COORDINATOR ================= */}
                      {role === "case-coordinator" && (
                        <>
                          {canDownloadApplication && (
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded-lg bg-rose-600 text-sm px-2 py-1 text-white disabled:opacity-60"
                                onClick={() => handleDownloadApplicationPdf(diksharthi)}
                                disabled={downloadingPdfId === diksharthi.id}
                              >
                                {downloadingPdfId === diksharthi.id ? "Downloading..." : "Application PDF"}
                              </button>
                              <button
                                className="rounded-lg bg-emerald-600 text-sm px-2 py-1 text-white disabled:opacity-60"
                                onClick={() => handleDownloadApplicationExcel(diksharthi)}
                                disabled={downloadingApplicationId === diksharthi.id}
                              >
                                {downloadingApplicationId === diksharthi.id ? "Downloading..." : "Application Excel"}
                              </button>
                            </div>
                          )}
                        </>
                      )}

                    </td>
                  </tr>
                );
              })
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

      {(role === "operations-manager" || role === "staff") &&
        (viewModalData || isViewLoading) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 pt-6 ">
                <h3 className="text-xl font-bold text-gray-800">Diksharthi Profile</h3>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setViewModalData(null);
                    setIsViewLoading(false);
                  }}
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
                {isViewLoading ? (
                  <div className="flex justify-center py-10">
                    <p className="text-gray-500 animate-pulse">Loading profile data...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Top Section: Info + Image */}
                    <div className="flex flex-col-reverse sm:flex-row gap-6 pb-4 border-b border-gray-100">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">Diksharthi Name</label>
                          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                            {viewModalData?.sadhu_sadhvi_name || "N/A"}
                          </h2>
                        </div>
                        <div className="inline-block bg-gray-100 px-3 py-1 rounded-full">
                          <span className="text-sm font-medium text-gray-600">ID: {viewModalData?.id || "-"}</span>
                        </div>
                      </div>

                      {/* Image Section */}
                      <div className="flex-shrink-0 flex justify-center sm:justify-end">
                        <div className="relative">
                          <img
                            src={viewModalData?.photo || "/user.png"}
                            alt="profile"
                            onError={(e) => { e.currentTarget.src = "/user.png"; }}
                            className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-md"
                          />
                          <div
                            className={`absolute -bottom-2 -right-2 px-2 py-1 rounded text-[10px] font-bold uppercase text-white shadow-sm ${viewModalData?.is_alive === "No" ? "bg-red-500" : "bg-green-500"}`}
                          >
                            {viewModalData?.is_alive === "Yes" ? "Alive" : viewModalData?.is_alive === "No" ? "Dead" : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Data Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      <DetailItem label="Date of Birth" value={formatIndianDate(viewModalData?.dob)} />
                      {/* Fixed Age: Removed formatIndianDate wrap since age is a number/string */}
                      <DetailItem label="Age" value={viewModalData?.age || "N/A"} />

                      <DetailItem label="Gender" value={viewModalData?.gender} />
                      <DetailItem label="Pad" value={viewModalData?.pad} />
                      <DetailItem label="Samudaay" value={viewModalData?.samudaay} />
                      <DetailItem label="Guru Name" value={viewModalData?.guru_name || viewModalData?.guruName} />
                      <DetailItem label="Acharya" value={viewModalData?.acharya} />
                      <DetailItem label="Gadipati" value={viewModalData?.gadipati} />

                      {/* RBF Fields */}
                      <DetailItem label="RBF Criteria" value={viewModalData?.rbf_criteria || viewModalData?.rbfCriteria || "No"} />
                      {(viewModalData?.rbf_criteria === "Yes" || viewModalData?.rbfCriteria === "Yes") && (
                        <>
                          <DetailItem label="RBF Relation" value={viewModalData?.relation || "N/A"} />
                          <DetailItem label="Relation Name" value={viewModalData?.relation_name || viewModalData?.relationName || "N/A"} />
                        </>
                      )}

                      {/* Alive Specific Info */}
                      {viewModalData?.is_alive === "Yes" && (
                        <DetailItem label="Current Vihar Location" value={viewModalData?.vihar_location || viewModalData?.viharLocation} />
                      )}

                      {/* Dead Specific Info */}
                      {viewModalData?.is_alive === "No" && (
                        <>
                          <DetailItem label="Samadhi Date" value={formatIndianDate(viewModalData?.samadhi_date || viewModalData?.samadhiDate)} />
                          <DetailItem label="Samadhi Place" value={viewModalData?.samadhi_place || viewModalData?.samadhiPlace} />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {role === "operations-manager" && assignModalData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Assign Karyakarta</h3>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => setAssignModalData(null)}
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <p>
                <span className="font-semibold">Diksharthi:</span>{" "}
                {assignModalData?.sadhu_sadhvi_name || "-"}
              </p>
              <label className="block">
                <span className="font-semibold">Karyakarta :</span>
                <select
                  value={selectedAdminId}
                  onChange={(e) => setSelectedAdminId(e.target.value)}
                  className="mt-2 w-full p-2 border border-slate-300 rounded-md outline-none"
                  disabled={isAdminListLoading}
                >
                  <option value="">Select Karyakarta</option>
                  {adminUsers.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name || admin.email || `Admin #${admin.id}`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2 justify-end">
              <button
                type="button"
                className="rounded-lg bg-gray-200 text-sm px-4 py-2 text-gray-800"
                onClick={() => setAssignModalData(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-purple-600 text-sm px-4 py-2 text-white disabled:opacity-60"
                onClick={handleAssignAdmin}
                disabled={isAssigningAdmin || !selectedAdminId}
              >
                {isAssigningAdmin ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {role === "operations-manager" && scheduleVisitModalData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {scheduleVisitModalMode === "contact" ? "Set Contact Info" : "Set Visit Date & Time"}
              </h3>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => {
                  setScheduleVisitModalData(null);
                  setScheduleVisitModalMode("contact");
                  setScheduleForm(emptyScheduleForm);
                }}
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={scheduleForm.name}
                  onChange={handleScheduleFormChange}
                  className="w-full p-2 border border-slate-300 rounded-md outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={scheduleForm.address}
                  onChange={handleScheduleFormChange}
                  rows={3}
                  className="w-full p-2 border border-slate-300 rounded-md outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mobile No
                </label>
                <input
                  type="text"
                  name="mobile"
                  maxLength={10}
                  value={scheduleForm.mobile}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    handleScheduleFormChange({ target: { name: "mobile", value: onlyNumbers } });
                  }}
                  className="w-full p-2 border border-slate-300 rounded-md outline-none"
                />
              </div>
              {scheduleVisitModalMode === "datetime" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={scheduleForm.date}
                      onChange={handleScheduleFormChange}
                      className="w-full p-2 border border-slate-300 rounded-md outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={scheduleForm.time}
                      onChange={handleScheduleFormChange}
                      className="w-full p-2 border border-slate-300 rounded-md outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2 justify-end">
              <button
                type="button"
                className="rounded-lg bg-gray-200 text-sm px-4 py-2 text-gray-800"
                onClick={() => {
                  setScheduleVisitModalData(null);
                  setScheduleVisitModalMode("contact");
                  setScheduleForm(emptyScheduleForm);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-emerald-600 text-sm px-4 py-2 text-white disabled:opacity-60"
                onClick={handleSaveVisitSchedule}
                disabled={isSchedulingVisit}
              >
                {isSchedulingVisit
                  ? "Saving..."
                  : scheduleVisitModalMode === "contact"
                    ? "Save Contact Info"
                    : "Save Date & Time"}
              </button>
            </div>
          </div>
        </div>
      )}

      {role === "karyakarta" && viewScheduleModalData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Visit Schedule</h3>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => setViewScheduleModalData(null)}
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              {isViewScheduleLoading ? (
                <p className="text-gray-600">Loading visit schedule...</p>
              ) : viewScheduleModalData?.schedule ? (
                <>
                  <p>
                    <span className="font-semibold">Name:</span>{" "}
                    {viewScheduleModalData.schedule.diksharthi_name ||
                      viewScheduleModalData.diksharthi?.sadhu_sadhvi_name ||
                      "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Address:</span>{" "}
                    {viewScheduleModalData.schedule.address || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Mobile No:</span>{" "}
                    {viewScheduleModalData.schedule.mobile || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {formatIndianDate(viewScheduleModalData.schedule.date)}
                  </p>
                  <p>
                    <span className="font-semibold">Time:</span>{" "}
                    {viewScheduleModalData.schedule.time || "-"}
                  </p>
                </>
              ) : (
                <p className="text-gray-600">
                  No visit schedule has been set for this diksharthi yet.
                </p>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-indigo-600 text-sm px-4 py-2 text-white"
                onClick={() => setViewScheduleModalData(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {role === "karyakarta" && feedbackModalData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Add Feedback</h3>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => {
                  setFeedbackModalData(null);
                  setFeedbackForm(emptyFeedbackForm);
                }}
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <p>
                <span className="font-semibold">Diksharthi:</span>{" "}
                {feedbackModalData?.sadhu_sadhvi_name || "-"}
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Feedback
                </label>
                <textarea
                  name="feedback"
                  value={feedbackForm.feedback}
                  onChange={handleFeedbackFormChange}
                  rows={4}
                  placeholder="Write your feedback here..."
                  className="w-full p-2 border border-slate-300 rounded-md outline-none resize-none"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2 justify-end">
              <button
                type="button"
                className="rounded-lg bg-gray-200 text-sm px-4 py-2 text-gray-800"
                onClick={() => {
                  setFeedbackModalData(null);
                  setFeedbackForm(emptyFeedbackForm);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-orange-500 text-sm px-4 py-2 text-white disabled:opacity-60"
                onClick={handleSubmitFeedback}
                disabled={isSubmittingFeedback}
              >
                {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {(role === "operations-manager" || role === "karyakarta") && viewFeedbackModalData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Feedback</h3>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => setViewFeedbackModalData(null)}
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 text-sm">
              <p>
                <span className="font-semibold">Diksharthi:</span>{" "}
                {viewFeedbackModalData.diksharthi?.sadhu_sadhvi_name || "-"}
              </p>
              {isFeedbackLoading ? (
                <p className="text-gray-500 animate-pulse">Loading feedback...</p>
              ) : viewFeedbackModalData.feedbacks.length === 0 ? (
                <p className="text-gray-500 py-4 text-center">No feedback available for this diksharthi.</p>
              ) : (
                <div className="space-y-3">
                  {viewFeedbackModalData.feedbacks.map((item, index) => (
                    <div
                      key={item.id || item.feedback_id || index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2"
                    >
                      <p className="text-gray-800">{item.feedback || item.feedback_text || "-"}</p>
                      {(item.submitted_by_name || item.karyakarta_name) && (
                        <p className="text-xs text-gray-500">
                          By: {item.submitted_by_name || item.karyakarta_name}
                        </p>
                      )}
                      {item.created_at && (
                        <p className="text-xs text-gray-400">{formatIndianDate(item.created_at)}</p>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-gray-200 text-sm px-4 py-2 text-gray-800"
                onClick={() => setViewFeedbackModalData(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {familyDetailsModalData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Family Details</h3>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                onClick={() => setFamilyDetailsModalData(null)}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
              {isFamilyDetailsLoading ? (
                <div className="flex justify-center py-10">
                  <p className="text-gray-500 animate-pulse">Loading family details...</p>
                </div>
              ) : familyDetailsModalData?.details ? (
                <div className="space-y-5 text-sm">

                  {/* Basic Family Info */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                      Family Information
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <DetailItem label="Head of Family" value={familyDetailsModalData.details.head_of_family} />
                      <DetailItem label="Permanent Address" value={familyDetailsModalData.details.permanent_address} />
                      <DetailItem label="Current Address" value={familyDetailsModalData.details.current_address} />
                      <DetailItem label="Village" value={familyDetailsModalData.details.village} />
                      <DetailItem label="Taluka" value={familyDetailsModalData.details.taluka} />
                      <DetailItem label="District" value={familyDetailsModalData.details.district} />
                      <DetailItem label="State" value={familyDetailsModalData.details.states} />
                      <DetailItem label="Pin Code" value={familyDetailsModalData.details.pin_code} />
                      <DetailItem label="House Details" value={familyDetailsModalData.details.house_details} />
                      <DetailItem label="Type of House" value={familyDetailsModalData.details.type_of_house} />
                      <DetailItem label="Maintenance Cost" value={familyDetailsModalData.details.maintenance_cost} />
                      <DetailItem label="Light Bill Cost" value={familyDetailsModalData.details.light_bill_cost} />
                      <DetailItem label="Rent Cost" value={familyDetailsModalData.details.rent_cost} />
                      <DetailItem label="Mediclaim" value={familyDetailsModalData.details.mediclaim === "1" ? "Yes" : "No"} />
                      <DetailItem label="Family Mediclaim Amount" value={familyDetailsModalData.details.family_mediclaim_amount} />
                      <DetailItem label="Mediclaim Premium Amount" value={familyDetailsModalData.details.mediclaim_premium_amount} />
                      <DetailItem label="NGO Assistance" value={familyDetailsModalData.details.ngo_assistance} />
                      <DetailItem label="NGO Sangh Name" value={familyDetailsModalData.details.ngo_sangh_name} />
                      <DetailItem label="NGO Amount" value={familyDetailsModalData.details.ngo_amount} />
                      <DetailItem label="NGO Remark" value={familyDetailsModalData.details.ngo_remark} />
                    </div>
                  </div>


                  {/* Relation Details */}
                  {familyDetailsModalData.details.relation_details &&
                    Object.keys(familyDetailsModalData.details.relation_details).length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                          Relation Details
                        </h4>

                        <div className="space-y-4">
                          {Object.entries(familyDetailsModalData.details.relation_details).map(
                            ([relation, info]) => (
                              <div
                                key={relation}
                                className="border border-gray-100 rounded-lg p-4 bg-gray-50"
                              >
                                <p className="font-semibold text-gray-700 capitalize mb-3">
                                  {relation}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                                  <DetailItem label="First Name" value={info?.firstName} />
                                  <DetailItem label="Last Name" value={info?.lastName} />
                                  <DetailItem label="Aadhar Number" value={info?.aadharNumber} />
                                  <DetailItem label="PAN Number" value={info?.panNumber} />

                                  <DetailItem
                                    label="Ayushman Card"
                                    value={info?.ayushman ? "Yes" : "No"}
                                  />

                                  <DetailItem
                                    label="Mediclaim"
                                    value={info?.mediclaim ? "Yes" : "No"}
                                  />

                                  <DetailItem
                                    label="Mediclaim Amount"
                                    value={info?.mediclaim_amount}
                                  />

                                  {/* <DetailItem
                                    label="Yearly Premium"
                                    value={info?.mediclaim_yearly_premium}
                                  /> */}

                                  <DetailItem
                                    label="Need Assistance"
                                    value={info?.needAssistance ? "Yes" : "No"}
                                  />

                                  <DetailItem
                                    label="Family Head"
                                    value={info?.family_head ? "Yes" : "No"}
                                  />

                                  {info?.assistanceCategories && (
                                    <DetailItem
                                      label="Assistance Categories"
                                      value={info.assistanceCategories.join(", ")}
                                    />
                                  )}

                                </div>

                                {info?.photo && (
                                  <img
                                    src={info.photo}
                                    alt={relation}
                                    className="mt-3 w-20 h-20 rounded-lg object-cover border"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                </div>
              ) : (
                <p className="text-gray-500 py-6 text-center">No family details available.</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-teal-600 text-sm px-4 py-2 text-white"
                onClick={() => setFamilyDetailsModalData(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiksharthiListing;



