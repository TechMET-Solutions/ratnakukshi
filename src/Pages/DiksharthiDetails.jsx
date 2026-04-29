import { Eye, Plus, Search, SquaresExclude, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { API } from "../api/BaseURL";
import { useAuth } from "../context/AuthContext";
import { formatIndianDate, formatTo12Hour } from "../utils/formatIndianDate";
import JoditEditor from "jodit-react";
import { queryEditorConfig } from "../utils/joditconfig";


// ======================= SMALL BUTTON LOADER =======================
const ButtonLoader = () => (
  <span className="inline-flex items-center justify-center">
    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
  </span>
);

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

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
      {title}
    </h4>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {children}
  </div>
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

// const normalizeUser = (item) => ({
//   id: item?.id || item?.userId || item?._id || "",
//   name: item?.name || item?.fullName || item?.full_name || "",
//   email: item?.email || "",
//   role: String(item?.role || "").toLowerCase(),
// });


const normalizeUser = (item) => ({
  id: item?.id,
  name: item?.name,
  role: item?.role,
  email: item?.email,

  // ✅ IMPORTANT
  assign_locations: item?.assign_locations || [],
});

const getProfileImageUrl = (photoValue) => {
  if (!photoValue) return "/user.png";
  if (String(photoValue).startsWith("http")) return photoValue;
  return `${API}/upload/diksharthiImages/${photoValue}`;
};

const emptyScheduleForm = {
  mobile: "",
  date: "",
  time: "",
};

const emptyFeedbackForm = {
  feedback: "",
};

const getLocalVisitDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
};

const DiksharthiListing = () => {
  const navigate = useNavigate();


  const editor = useRef(null);

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
  console.log(adminUsers, "adminUsers")
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [isAssigningAdmin, setIsAssigningAdmin] = useState(false);
  const [isAdminListLoading, setIsAdminListLoading] = useState(false);
  const [scheduleVisitModalData, setScheduleVisitModalData] = useState(null);
  const [viewScheduleModalData, setViewScheduleModalData] = useState(null);
  const [familyDetailsModalData, setFamilyDetailsModalData] = useState(null);
  const [isFamilyDetailsLoading, setIsFamilyDetailsLoading] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm);
  const [isSchedulingVisit, setIsSchedulingVisit] = useState(false);
  const [isViewScheduleLoading, setIsViewScheduleLoading] = useState(false);
  const [updatingVisitStatusId, setUpdatingVisitStatusId] = useState(null);

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

  const [searchAdmin, setSearchAdmin] = useState("");

  const filteredAdmins = adminUsers.filter((admin) =>
    (admin.name || admin.email || "")
      .toLowerCase()
      .includes(searchAdmin.toLowerCase())
  );

  // ======================= STATES =======================
  const [omFeedbackModalData, setOmFeedbackModalData] = useState(null);
  const [omFeedback, setOmFeedback] = useState("");
  const [isSubmittingOmFeedback, setIsSubmittingOmFeedback] = useState(false);

  const [viewOMFeedbackModal, setViewOMFeedbackModal] = useState(null);
  const [omFeedbackList, setOmFeedbackList] = useState([]);
  const [isLoadingOMFeedback, setIsLoadingOMFeedback] = useState(false);

  // ======================= OPEN MODAL =======================
  const openOMFeedbackModal = (diksharthi) => {
    setOmFeedbackModalData(diksharthi);
    setOmFeedback("");
  };


  // ======================= API SUBMIT =======================
  const handleSubmitOMFeedback = async () => {
    if (!omFeedbackModalData?.id) return;

    if (!omFeedback.trim()) {
      alert("Please enter feedback");
      return;
    }

    try {
      setIsSubmittingOmFeedback(true);

      const payload = {
        diksharthi_id: omFeedbackModalData.id,
        feedback: omFeedback.trim(),
        submitted_by: loggedInUserId,
      };

      const response = await fetch(
        `${API}/api/feedback/createfeedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit feedback");
      }

      // ✅ after feedback send to coordinator
      await handleSendToCaseCO(omFeedbackModalData.id);

      alert("Feedback submitted successfully");

      setOmFeedbackModalData(null);
      setOmFeedback("");

    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to submit feedback");
    } finally {
      setIsSubmittingOmFeedback(false);
    }
  };

  // const openViewOMFeedbackModal = async (diksharthi) => {
  //   try {
  //     setIsLoadingOMFeedback(true);
  //     setViewOMFeedbackModal(diksharthi);

  //     const response = await fetch(
  //       `${API}/api/feedback//all-feedback/${diksharthi.id}`
  //     );

  //     const result = await response.json();

  //     setOmFeedbackList(result.data || []);

  //   } catch (error) {
  //     console.error(error);
  //     alert("Failed to load feedback");
  //   } finally {
  //     setIsLoadingOMFeedback(false);
  //   }
  // };

  // ======================= OPEN VIEW MODAL =======================
  const openViewOMFeedbackModal = async (diksharthi) => {
    try {
      setIsLoadingOMFeedback(true);
      setViewOMFeedbackModal(diksharthi);

      const response = await fetch(
        `${API}/api/feedback/all-feedback/${diksharthi.id}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load feedback");
      }

      // ✅ API returns object, not array
      setOmFeedbackList({
        diksharthi_feedback: result?.data?.diksharthi_feedback || [],
        operation_manager_feedback:
          result?.data?.operation_manager_feedback || [],
      });

    } catch (error) {
      console.error(error);
      alert("Failed to load feedback");
    } finally {
      setIsLoadingOMFeedback(false);
    }
  };

  const fetchFeedbackStatus = async (records) => {
    try {
      const ids = records.map((item) => item.id);

      const res = await fetch(`${API}/api/feedback/view/${item.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });

      const data = await res.json();
      setFeedbackStatus(data || {});
    } catch (err) {
      console.error(err);
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
        // Operations manager sees only records
        // sent by staff AND not pending
        filteredRecords = allRecords.filter((item) => {
          const status = String(item?.status || "")
            .trim()
            .toLowerCase();

          return status === "send" || status === "manager" || status === "coordinator";
        });
      } else if (role === "karyakarta") {
        // Karyakarta sees only assigned records
        filteredRecords = allRecords.filter(
          (item) =>
            String(item?.karykarata_id || item?.admin_id || "") === String(loggedInUserId)
        );

      } else if (
        role === "case-coordinator" ||
        role === "committee-member" ||
        role === "export-panel" ||
        role === "expert-panel-livelihoodexpenses" ||
        role === "expert-panel-job" ||
        role === "expert-panel-medical" ||
        role === "expert-panel-food" ||
        role === "expert-panel-rent" ||
        role === "expert-panel-educations" ||
        role === "expert-panel-housing" ||
        role === "expert-panel-vaiyavacch" ||
        role === "account"
      ) {
        filteredRecords = allRecords.filter((item) => {
          const status = String(item?.status || "")
            .trim()
            .toLowerCase();

          return status === "coordinator";
        });
      }
      else {
        filteredRecords = allRecords;
      }

      setDiksharthiList(filteredRecords);
      await fetchFeedbackStatus(filteredRecords);

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

  const handleSendToOM = async (id) => {
    debugger
    try {
      setSendingId(id);
      const res = await fetch(`${API}/api/update-diksharthi-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "manager",
        }),
      });

      // coordinator

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
  const handleSendToCaseCO = async (id) => {
    debugger
    try {
      setSendingId(id);
      const res = await fetch(`${API}/api/update-diksharthi-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "coordinator",
        }),
      });

      // coordinator

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
      diksharthi?.fan_id,
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
    const assignedId = diksharthi?.karykarata_id || diksharthi?.admin_id;
    return assignedId === null || assignedId === undefined || String(assignedId).trim() === "" || String(assignedId) === "0";
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

  const getVisitScheduleObject = (diksharthi) => {
    const raw = diksharthi?.visit_schedule_json;
    if (!raw) return { cycles: [] };
    if (typeof raw === "object") {
      return { cycles: Array.isArray(raw?.cycles) ? raw.cycles : [] };
    }
    try {
      const parsed = JSON.parse(raw);
      return { cycles: Array.isArray(parsed?.cycles) ? parsed.cycles : [] };
    } catch (_error) {
      return { cycles: [] };
    }
  };

  const getLatestVisitCycle = (diksharthi) => {
    const schedule = getVisitScheduleObject(diksharthi);
    return schedule.cycles[schedule.cycles.length - 1] || null;
  };

  const getCurrentSchedule = (diksharthi) => {
    const latest = getLatestVisitCycle(diksharthi);
    const rescheduled = latest?.rescheduled || null;
    const scheduled = latest?.scheduled || null;
    return rescheduled || scheduled || null;
  };

  const hasVisitDateTime = (diksharthi) => {
    const current = getCurrentSchedule(diksharthi);
    return Boolean(current?.date && current?.time);
  };

  const hasRescheduledVisit = (diksharthi) => {
    const latest = getLatestVisitCycle(diksharthi);
    return Boolean(latest?.rescheduled?.date && latest?.rescheduled?.time);
  };

  const hasAnyVisitSchedule = (diksharthi) =>
    hasVisitDateTime(diksharthi) || hasRescheduledVisit(diksharthi);

  const isVisitMarkedYes = (diksharthi) =>
    String(diksharthi?.current_visit_status || "").trim().toLowerCase() === "yes";

  const shouldUseRescheduleFlow = (diksharthi) =>
    hasAnyVisitSchedule(diksharthi) && !isVisitMarkedYes(diksharthi);

  const fetchAdminUsers = async () => {
    const response = await fetch(`${API}/api/user/list`);
    const result = await response.json();
    const rows = Array.isArray(result?.data) ? result.data : [];

    const normalizedUsers = rows.map(normalizeUser);

    const karyakarta = normalizedUsers.filter(
      (user) => String(user?.role || "").toLowerCase() === "karyakarta"
    );

    setUserDirectory(normalizedUsers);
    setAdminUsers(karyakarta);

    return karyakarta; // ✅ RETURN
  };

  const familyDetails = (() => {
    try {
      if (!viewModalData?.family_relation_details_json) return {};
      return typeof viewModalData.family_relation_details_json === "string"
        ? JSON.parse(viewModalData.family_relation_details_json)
        : viewModalData.family_relation_details_json;
    } catch (e) {
      return {};
    }
  })();

  // const fetchAdminUsers = async () => {
  //   debugger
  //   try {
  //     setIsAdminListLoading(true);
  //     const response = await fetch(`${API}/api/user/list`);
  //     const result = await response.json();
  //     const rows = Array.isArray(result?.data) ? result.data : [];
  //     const normalizedUsers = rows.map(normalizeUser);
  //     setUserDirectory(normalizedUsers);
  //     const Karyakarta = normalizedUsers.filter(
  //       (user) => String(user?.role || "").toLowerCase() === "karyakarta"
  //     );
  //     setAdminUsers(Karyakarta);
  //     console.log(Karyakarta, "Karyakarta")
  //   } catch (error) {
  //     console.error(error);
  //     alert("Failed to fetch Karyakarta list");
  //   } finally {
  //     setIsAdminListLoading(false);
  //   }
  // };

  // const openAssignAdminModal = async (diksharthi) => {
  //   setAssignModalData(diksharthi);
  //   setSelectedAdminId("");
  //   await fetchAdminUsers();

  //   console.log(fetchAdminUsers)
  // };

  const openAssignAdminModal = async (diksharthi) => {
    setAssignModalData(diksharthi);
    setSelectedAdminId("");
    setSearchAdmin(""); // ✅ ADD THIS
    await fetchAdminUsers();
  };


  const openScheduleVisitModal = (diksharthi) => {
    const current = getCurrentSchedule(diksharthi);
    const openForFreshSchedule = !shouldUseRescheduleFlow(diksharthi);
    setScheduleVisitModalData(diksharthi);
    setScheduleForm({
      ...emptyScheduleForm,
      date: openForFreshSchedule
        ? ""
        : String(current?.date || "").slice(0, 10),
      time: openForFreshSchedule
        ? ""
        : String(current?.time || "").slice(0, 5),
      mobile: diksharthi?.mobile_no || "",
    });
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

    if (!scheduleForm.date || !scheduleForm.time) {
      alert("Please set visit date and time");
      return;
    }

    try {
      setIsSchedulingVisit(true);

      const isReschedule = shouldUseRescheduleFlow(scheduleVisitModalData);
      const endpoint = isReschedule
        ? `${API}/api/reschedule/${scheduleVisitModalData.id}`
        : `${API}/api/schedule-visit/${scheduleVisitModalData.id}`;
      const payload = { date: scheduleForm.date, time: scheduleForm.time };

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Failed to schedule visit");
      }

      setScheduleVisitModalData(null);
      setScheduleForm(emptyScheduleForm);
      alert(result?.message || (isReschedule ? "Visit rescheduled successfully" : "Visit schedule saved successfully"));
      await fetchDiksharthiList();
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to schedule visit");
    } finally {
      setIsSchedulingVisit(false);
    }
  };


  const handleVisitStatusChange = async (diksharthi, nextStatus) => {
    if (!diksharthi?.id || !nextStatus) return;

    try {
      setUpdatingVisitStatusId(diksharthi.id);

      const currentSchedule = getCurrentSchedule(diksharthi);

      // ✅ Indian Date & Time
      const now = new Date();

      const indianDate = now.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      }); // YYYY-MM-DD

      const indianTime = now.toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata",
        hour12: false,
      }); // HH:mm:ss

      const shouldStoreVisitDateTime =
        String(nextStatus).trim().toLowerCase() === "yes";

      const payload = {
        is_visited: nextStatus,

        ...(shouldStoreVisitDateTime
          ? {
            visit_date: currentSchedule?.date || indianDate,
            visit_time: currentSchedule?.time || indianTime,
          }
          : {}),
      };

      const response = await fetch(
        `${API}/api/visit-status/${diksharthi.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to update visit status"
        );
      }

      await fetchDiksharthiList();
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to update visit status");
    } finally {
      setUpdatingVisitStatusId(null);
    }
  };

  // const handleVisitStatusChange = async (diksharthi, nextStatus) => {
  //   if (!diksharthi?.id || !nextStatus) return;

  //   try {
  //     setUpdatingVisitStatusId(diksharthi.id);
  //     const currentSchedule = getCurrentSchedule(diksharthi);
  //     const localVisitDateTime = getLocalVisitDateTime();
  //     const shouldStoreVisitDateTime = String(nextStatus).trim().toLowerCase() === "yes";
  //     const payload = {
  //       is_visited: nextStatus,
  //       ...(shouldStoreVisitDateTime
  //         ? {
  //             visit_date: currentSchedule?.date || localVisitDateTime.date,
  //             visit_time: currentSchedule?.time || localVisitDateTime.time,
  //           }
  //         : {}),
  //     };

  //     const response = await fetch(`${API}/api/visit-status/${diksharthi.id}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     const result = await response.json().catch(() => ({}));
  //     if (!response.ok) {
  //       throw new Error(result?.message || "Failed to update visit status");
  //     }

  //     await fetchDiksharthiList();
  //   } catch (error) {
  //     console.error(error);
  //     alert(error?.message || "Failed to update visit status");
  //   } finally {
  //     setUpdatingVisitStatusId(null);
  //   }
  // };

  const openViewScheduleModal = async (diksharthi) => {
    setIsViewScheduleLoading(true);
    try {
      setViewScheduleModalData({
        diksharthi,
        schedule: getCurrentSchedule(diksharthi) || { date: "", time: "" },
        originalSchedule: {
          date: getLatestVisitCycle(diksharthi)?.scheduled?.date || "",
          time: getLatestVisitCycle(diksharthi)?.scheduled?.time || "",
        },
        rescheduled: hasRescheduledVisit(diksharthi),
        reschedule: {
          date: getLatestVisitCycle(diksharthi)?.rescheduled?.date || "",
          time: getLatestVisitCycle(diksharthi)?.rescheduled?.time || "",
        }
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

      const profileData = result?.data || result;
      if (!response.ok || !profileData || typeof profileData !== "object") {
        throw new Error(result?.message || "Failed to fetch diksharthi details");
      }

      setViewModalData({ ...diksharthi, ...profileData });
    } catch (error) {
      console.error(error);
      alert("Failed to fetch diksharthi details");
    } finally {
      setIsViewLoading(false);
    }
  };

  // const handleAssignAdmin = async () => {
  //   if (!assignModalData?.id || !selectedAdminId) {
  //     alert("Please select an admin");
  //     return;
  //   }

  //   try {
  //     setIsAssigningAdmin(true);
  //     const payload = {
  //       id: assignModalData.id,
  //       karykarata_id: selectedAdminId,
  //     };

  //     const response = await fetch(`${API}/api/assign-karyakarta`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to assign Karyakarta");
  //     }

  //     alert("Karyakarta assigned successfully");
  //     setAssignModalData(null);
  //     setSelectedAdminId("");
  //     await fetchDiksharthiList();
  //   } catch (error) {
  //     console.error(error);
  //     alert("Failed to assign Karyakarta");
  //   } finally {
  //     setIsAssigningAdmin(false);
  //   }
  // };


  const handleAssignAdmin = async () => {
    if (!assignModalData?.id || !selectedAdminId) {
      alert("Please select an admin");
      return;
    }

    try {
      setIsAssigningAdmin(true);

      const payload = {
        id: assignModalData.id,
        karykarata_id: selectedAdminId,
      };

      const response = await fetch(`${API}/api/assign-karyakarta`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to assign Karyakarta");
      }

      alert(result.message || "Karyakarta assigned successfully");

      // update UI state
      setAssignModalData(null);
      setSelectedAdminId("");

      // refresh latest data (with assign date)
      await fetchDiksharthiList();

    } catch (error) {
      console.error("Assign Error:", error);
      alert(error.message || "Failed to assign Karyakarta");
    } finally {
      setIsAssigningAdmin(false);
    }
  };

  const openFeedbackModal = (diksharthi) => {
    // ❌ remove this check
    // if (feedbackStatus[diksharthi?.id]) {
    //   openViewFeedbackModal(diksharthi);
    //   return;
    // }

    // ✅ always open add feedback
    setFeedbackModalData(diksharthi);
    setFeedbackForm(emptyFeedbackForm);
  };

  //  const openFamilyDetailsModal = async (diksharthi) => {
  //   if (!diksharthi?.id) return;

  //   setIsFamilyDetailsLoading(true);
  //   setFamilyDetailsModalData({ diksharthi, details: null });

  //   try {
  //     const response = await fetch(`${API}/api/family-details/${diksharthi.id}`);
  //     const result = await response.json().catch(() => ({}));

  //     console.log("result", result);

  //     if (response.ok && result?.success && result?.data?.length > 0) {

  //       // ✅ FIX: take first object
  //       const apiData = result.data[0];

  //       // ✅ TRANSFORM DATA
  //       const transformed = {
  //         permanent_address: apiData.formData?.permanentAddress,
  //         current_address: apiData.formData?.currentAddress,
  //         village: apiData.formData?.village,
  //         taluka: apiData.formData?.taluka,
  //         district: apiData.formData?.district,
  //         states: apiData.formData?.state,
  //         pin_code: apiData.formData?.pinCode,
  //         house_details: apiData.formData?.houseDetails,
  //         type_of_house: apiData.formData?.typeOfHouse,
  //         maintenance_cost: apiData.formData?.maintenanceCost,
  //         light_bill_cost: apiData.formData?.lightBillCost,
  //         rent_cost: apiData.formData?.rentCost,
  //         mediclaim: apiData.formData?.mediclaim === "Yes" ? "1" : "0",
  //         family_mediclaim_amount: apiData.formData?.Family_mediclaim_amount,
  //         mediclaim_premium_amount: apiData.formData?.mediclaimPremiumAmount,
  //         ngo_assistance: apiData.formData?.ngoAssistance,
  //         ngo_sangh_name: apiData.formData?.sanghName,
  //         ngo_amount: apiData.formData?.ngoAmount,
  //         ngo_frequency: apiData.formData?.ngoFrequency || apiData.formData?.ngo_frequency,
  //         ngo_remark: apiData.formData?.ngoRemark,

  //         // ✅ relation mapping
  //         relation_details: Object.fromEntries(
  //           Object.entries(apiData.relationDetails || {}).map(([key, val]) => [
  //             key,
  //             {
  //               firstName: val.firstName,
  //               lastName: val.lastName,
  //               aadharNumber: val.aadharNumber,
  //               panNumber: val.panNumber,
  //               ayushman: val.ayushman === "Yes",
  //               mediclaim: val.mediclaim === "Yes",
  //               mediclaim_amount: val.mediclaimAmount,
  //               needAssistance: val.needAssistance === "Yes",
  //               family_head: val.family_head,
  //               assistanceCategories: val.assistanceCategories || [],
  //               photo: val.photo,
  //             },
  //           ])
  //         ),
  //       };

  //       setFamilyDetailsModalData({ diksharthi, details: transformed });

  //     } else {
  //       setFamilyDetailsModalData({ diksharthi, details: null });
  //     }

  //   } catch (error) {
  //     console.error("Failed to fetch family details", error);
  //     setFamilyDetailsModalData({ diksharthi, details: null });
  //   } finally {
  //     setIsFamilyDetailsLoading(false);
  //   }
  // };

  const openFamilyDetailsModal = async (diksharthi) => {
    if (!diksharthi?.id) return;

    setIsFamilyDetailsLoading(true);
    setFamilyDetailsModalData({ diksharthi, details: null });

    try {
      // ✅ NEW API
      const response = await fetch(
        `${API}/api/viewfamilydetails/${diksharthi.id}`
      );

      const result = await response.json();

      console.log("NEW API RESULT =>", result);

      if (response.ok && result?.success && result?.data) {
        const apiData = result.data;

        // ✅ family_members array ko relation_details format me convert
        const relationDetails = {};

        if (
          apiData.family_members &&
          Array.isArray(apiData.family_members)
        ) {
          apiData.family_members.forEach((member) => {
            relationDetails[member.relation_key || "Member"] = {
              firstName: member.first_name,
              lastName: member.last_name,
              aadharNumber: member.aadhar_number,
              panNumber: member.pan_number,
              ayushman:
                member.ayushman_coverage === "Yes" ? true : false,
              mediclaim:
                member.has_mediclaim_policy === "Yes" ? true : false,
              mediclaim_amount: member.mediclaim_amount,
              needAssistance:
                member.need_assistance === "Yes" ? true : false,
              family_head: member.is_primary === 1,
              assistanceCategories: [],
              photo: member.photo,
            };
          });
        }

        // ✅ modal old structure maintain
        const transformed = {
          permanent_address: apiData.permanent_address,
          current_address: apiData.current_address,
          village: apiData.village,
          taluka: apiData.taluka,
          district: apiData.district,
          states: apiData.state,
          pin_code: apiData.pin_code,
          house_details: apiData.house_details,
          type_of_house: apiData.type_of_house,
          maintenance_cost: apiData.maintenance_cost,
          light_bill_cost: apiData.light_bill_cost,
          rent_cost: apiData.rent_cost,
          mediclaim: apiData.mediclaim === "Yes" ? "1" : "0",
          family_mediclaim_amount:
            apiData.family_mediclaim_amount,
          mediclaim_premium_amount:
            apiData.mediclaim_premium_amount,
          ngo_assistance: apiData.ngo_assistance,
          ngo_sangh_name: apiData.ngo_sangh_name,
          ngo_amount: apiData.ngo_amount,
          ngo_frequency: apiData.ngo_frequency,
          ngo_remark: apiData.ngo_remark,

          relation_details: relationDetails,
        };

        setFamilyDetailsModalData({
          diksharthi,
          details: transformed,
        });
      } else {
        setFamilyDetailsModalData({
          diksharthi,
          details: null,
        });
      }
    } catch (error) {
      console.error("Failed to fetch family details", error);

      setFamilyDetailsModalData({
        diksharthi,
        details: null,
      });
    } finally {
      setIsFamilyDetailsLoading(false);
    }
  };


  const canDownloadApplication =
    role === "admin" || role === "case-coordinator" || role === "operations-manager";

  // const handleDownloadApplicationExcel = async (diksharthi) => {
  //   if (!diksharthi?.id) return;

  //   try {
  //     setDownloadingApplicationId(diksharthi.id);

  //     const response = await fetch(
  //       `${API}/api/generateDiksharthiExcel/?id=${diksharthi.id}`
  //     );

  //     if (!response.ok) {
  //       const result = await response.json().catch(() => ({}));
  //       throw new Error(result?.message || "Failed to download application Excel");
  //     }

  //     const blob = await response.blob();
  //     const downloadUrl = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");

  //     link.href = downloadUrl;
  //     link.download = `Diksharthi_Application_${diksharthi.id}.xlsx`;
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //     window.URL.revokeObjectURL(downloadUrl);
  //   } catch (error) {
  //     console.error(error);
  //     alert(error?.message || "Failed to download application Excel");
  //   } finally {
  //     setDownloadingApplicationId(null);
  //   }
  // };


  const handleDownloadApplicationExcel = async (diksharthi) => {
    if (!diksharthi?.id) return;

    try {
      setDownloadingApplicationId(diksharthi.id);

      // ✅ FIXED URL (use params, not query)
      const response = await fetch(
        `${API}/api/diksharthi/excel/${diksharthi.id}`
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.message || "Failed to download application Excel");
      }

      const blob = await response.blob();

      // ✅ Excel MIME type safety
      const file = new Blob([blob], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const downloadUrl = window.URL.createObjectURL(file);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `Diksharthi_Application_${diksharthi.id}.xlsx`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
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
        `${API}/api/generateDikshartiReport/${diksharthi.id}`
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.message || "Failed to download application PDF");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `Form No ${diksharthi.id}.pdf`;
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

  // const handleOpenDiksharthiPdf = (id) => {
  //   if (!id) return;
  //   window.open(
  //     `${API}/api/diksharthi/pdf/${id}`,
  //     "_blank",
  //     "noopener,noreferrer"
  //   );
  // };

  const handleFeedbackFormChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSubmitFeedback = async () => {
  //   if (!feedbackModalData?.id) return;
  //   if (!feedbackForm.feedback.trim()) {
  //     alert("Please enter feedback");
  //     return;
  //   }
  //   try {
  //     setIsSubmittingFeedback(true);
  //     const payload = {
  //       diksharthi_id: feedbackModalData.id,
  //       diksharthi_code: feedbackModalData.diksharthi_code || "",
  //       diksharthi_name: feedbackModalData.sadhu_sadhvi_name || "",
  //       feedback: feedbackForm.feedback.trim(),
  //       submitted_by: loggedInUserId,
  //     };
  //     const response = await fetch(`${API}/api/feedback/create`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });
  //     const result = await response.json().catch(() => ({}));
  //     if (!response.ok) {
  //       throw new Error(result?.message || "Failed to submit feedback");
  //     }
  //     alert(result?.message || "Feedback submitted successfully");
  //     setFeedbackStatus((prev) => ({
  //       ...prev,
  //       [feedbackModalData.id]: true,
  //     }));
  //     setFeedbackModalData(null);
  //     setFeedbackForm(emptyFeedbackForm);
  //   } catch (error) {
  //     console.error(error);
  //     alert(error?.message || "Failed to submit feedback");
  //   } finally {
  //     setIsSubmittingFeedback(false);
  //   }
  // };


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
        diksharthi_name: feedbackModalData.sadhu_sadhvi_name || "",
        feedback: feedbackForm.feedback.trim(),
        submitted_by: loggedInUserId,

        // ✅ NEW FIELD
        status: feedbackModalData.current_visit_status || "",
      };

      const response = await fetch(`${API}/api/feedback/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit feedback");
      }

      alert("Feedback submitted successfully");

      setFeedbackModalData(null);
      setFeedbackForm(emptyFeedbackForm);

    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to submit feedback");
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

  const [selectedRows, setSelectedRows] = useState([]);

  const getSelectedData = () => {
    const selectedIdSet = new Set(selectedRows.map((id) => String(id)));
    return diksharthiList.filter((item) => selectedIdSet.has(String(item.id)));
  };

  const flattenObject = (obj, prefix = "") => {
    let result = {};

    for (let key in obj) {
      if (!obj.hasOwnProperty(key)) continue;

      const newKey = prefix ? `${prefix}_${key}` : key;

      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        Object.assign(result, flattenObject(obj[key], newKey));
      } else if (Array.isArray(obj[key])) {
        result[newKey] = obj[key]
          .map((item) =>
            typeof item === "object" ? JSON.stringify(item) : item
          )
          .join(", ");
      } else {
        result[newKey] = obj[key];
      }
    }

    return result;
  };


  // const formatExcelData = (data) => {
  //   return data.map((item) => {
  //     const family = item.family_details || {};
  //     const relations = family.relation_details || {};

  //     return {
  //       // ================= BASIC =================
  //       Date: formatIndianDate(item.created_at),
  //       ID: item.id,
  //       Name: item.sadhu_sadhvi_name,
  //       Gender: item.gender,
  //       Age: item.age,
  //       DOB: item.dob ? formatIndianDate(item.dob) : "",

  //       // ================= RELIGIOUS =================
  //       Pad: item.pad,
  //       Samudaay: item.samudaay,
  //       Guru_Name: item.guru_name,
  //       Acharya: item.acharya,
  //       Gadipati: item.gadipati,

  //       // ================= STATUS =================
  //       Vidhyaman: item.is_alive,
  //       Vihar_Location: item.vihar_location,
  //       Samadhi_Date: item.samadhi_date
  //         ? formatIndianDate(item.samadhi_date)
  //         : "",
  //       Samadhi_Place: item.samadhi_place,

  //       // ================= RBF =================
  //       RBF_Criteria: item.rbf_criteria,
  //       Relation: item.relation,
  //       Family_Relations: item.family_relation,
  //       Assistance_Received: item.assistance_received,

  //       // ================= FAMILY MEMBER =================
  //       Family_First_Name: item.family_member_firstName,
  //       Family_Last_Name: item.family_member_lastName,

  //       // ================= CONTACT =================
  //       Mobile: item.mobile_no,

  //       // ================= ADDRESS =================
  //       Permanent_Address: item.permanent_address,
  //       Current_Address: item.current_address,
  //       Village: item.village,
  //       Taluka: item.taluka,
  //       District: item.district,
  //       State: item.state,
  //       PinCode: item.pin_code,

  //       // ================= FAMILY DETAILS =================
       
  //       // ================= RELATION DETAILS =================
  //       Father_Name:
  //         (relations?.father?.firstName || "") +
  //         " " +
  //         (relations?.father?.lastName || ""),
  //       Father_Aadhar: relations?.father?.aadharNumber || "",

  //       // ================= EXTRA =================
  //       Summary: item.summary
  //         ? item.summary.replace(/<[^>]+>/g, "") // HTML remove
  //         : "",
  //     };
  //   });
  // };

  const formatExcelData = (data) => {
    return data.map((item) => {
      const relationDetails = item.family_relation_details_json || {};

      const dynamicRelations = {};

      Object.keys(relationDetails).forEach((relation) => {
        const rel = relationDetails[relation];

        dynamicRelations[`${relation}_Name`] =
          `${rel?.firstName || ""} ${rel?.lastName || ""}`.trim();

        dynamicRelations[`${relation}_Age`] = rel?.age || "";
        dynamicRelations[`${relation}_DOB`] = rel?.dob
          ? formatIndianDate(rel.dob)
          : "";

        dynamicRelations[`${relation}_Mobile`] = rel?.mobileNumber || "";
        dynamicRelations[`${relation}_Aadhar`] = rel?.aadharNumber || "";
        dynamicRelations[`${relation}_PAN`] = rel?.panNumber || "";

        dynamicRelations[`${relation}_MedicalPolicy`] =
          rel?.medicalPolicy || "";

        dynamicRelations[`${relation}_MediclaimType`] =
          rel?.mediclaimType || "";

        dynamicRelations[`${relation}_MediclaimAmount`] =
          rel?.mediclaimAmount || "";

        dynamicRelations[`${relation}_MediclaimCompany`] =
          rel?.mediclaimCompanyName || "";

        dynamicRelations[`${relation}_PremiumAmount`] =
          rel?.mediclaimPremiumAmount || "";

        dynamicRelations[`${relation}_AyushmanCoverage`] =
          rel?.ayushmanCoverage || "";

        dynamicRelations[`${relation}_AyushmanAmount`] =
          rel?.ayushmanAmount || "";

        dynamicRelations[`${relation}_NeedAssistance`] =
          rel?.needAssistance || "";

        dynamicRelations[`${relation}_FamilyHead`] =
          rel?.family_head ? "Yes" : "No";
      });

      return {
        // ================= BASIC =================
        Date: formatIndianDate(item.created_at),
        ID: item.id,
        Name: item.sadhu_sadhvi_name,
        Gender: item.gender,
        Age: item.age,
        DOB: item.dob ? formatIndianDate(item.dob) : "",

        // ================= RELIGIOUS =================
        Pad: item.pad,
        Samudaay: item.samudaay,
        Guru_Name: item.guru_name,
        Acharya: item.acharya,
        Gadipati: item.gadipati,

        // ================= STATUS =================
        Vidhyaman: item.is_alive,
        Vihar_Location: item.vihar_location,
        Samadhi_Date: item.samadhi_date
          ? formatIndianDate(item.samadhi_date)
          : "",
        Samadhi_Place: item.samadhi_place,

        // ================= RBF =================
        RBF_Criteria: item.rbf_criteria,
        Relation: item.relation,
        Family_Relations: item.family_relation,
        Assistance_Received: item.assistance_received,

        // ================= FAMILY MEMBER =================
        Family_First_Name: item.family_member_firstName,
        Family_Last_Name: item.family_member_lastName,

        // ================= CONTACT =================
        Mobile: item.mobile_no,

        // ================= ADDRESS =================
        Permanent_Address: item.permanent_address,
        Current_Address: item.current_address,
        Village: item.village,
        Taluka: item.taluka,
        District: item.district,
        State: item.state,
        PinCode: item.pin_code,

        // ================= ALL RELATIONS AUTO =================
        ...dynamicRelations,

        // ================= EXTRA =================
        Summary: item.summary
          ? item.summary.replace(/<[^>]+>/g, "")
          : "",
      };
    });
  };
  
  const downloadFormattedExcel = () => {
    if (!selectedRows.length) {
      alert("Please select at least one record to export");
      return;
    }

    const selectedData = getSelectedData();
    if (!selectedData.length) {
      alert("Selected records not found");
      return;
    }

    const formattedData = formatExcelData(selectedData);

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Diksharthi");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, "Master Data.xlsx");
  };


  return (
    <div className="p-8 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-700">
          {role === "staff" ? "Ratnakukshi Family Basic Info" : "Ratnakukshi Family Basic Info"}
        </h1>
        {role === "staff" && (
          <div className="flex gap-6">

            <button
              onClick={downloadFormattedExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-md"
            >
              Export Data
            </button>

            <Link
              to="/diksharthi-details-add"
              className="bg-[#C62026] hover:bg-[#c13946] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              Add New M.S.
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
              placeholder="Search by M.S. ID, M.S. Name, F.A.N ID."
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
              {role === "staff" && (
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={
                      paginatedList.length > 0 &&
                      paginatedList.every((item) => selectedRows.includes(item.id))
                    }
                    onChange={(e) => {
                      const pageIds = paginatedList.map((item) => item.id);
                      setSelectedRows((prev) => {
                        if (e.target.checked) {
                          return [...new Set([...prev, ...pageIds])];
                        }
                        return prev.filter((id) => !pageIds.includes(id));
                      });
                    }}
                  />
                </th>
              )}
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Date
              </th>
              {/* <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
              F.A.N ID
              </th> */}
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                M.S. ID
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                M.S. Name
              </th>
              {/* <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                RBF Criteria
              </th> */}
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Spoken To Relation
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Spoken To Name
              </th>


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
              {role === "operations-manager" && (
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Is Visited ?
                </th>
              )}
              {role === "admin" && (
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
              )}

              {role === "karyakarta" && (

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  is Visted ?
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
                    {role === "staff" && (
                      <td className="px-6 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(diksharthi.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows((prev) => [...new Set([...prev, diksharthi.id])]);
                            } else {
                              setSelectedRows((prev) => prev.filter((id) => id !== diksharthi.id));
                            }
                          }}
                        />
                      </td>
                    )}

                    <td className="px-6 py-3">{formatIndianDate(diksharthi.created_at)}</td>


                    {/* <td className="px-6 py-3">{diksharthi.fan_id}</td> */}
                    <td className="px-6 py-3">{diksharthi.id}</td>


                    <td className="px-6 py-3">{diksharthi.sadhu_sadhvi_name}</td>


                    {/* <td className="px-6 py-3">{diksharthi.rbf_criteria}</td> */}

                    <td className="px-6 py-3">{diksharthi.spoken_to_relation || "-"}</td>
                    <td className="px-6 py-3">{diksharthi.spoken_to || "-"}</td>


                    {role === "operations-manager" && (
                      <td className="px-6 py-3">
                        {getUserNameById(diksharthi.user_id)}
                      </td>
                    )}

                    {role === "operations-manager" && (
                      <td className="px-6 py-3">
                        <div>
                          <div>
                            {getUserNameById(
                              diksharthi.karykarata_id || diksharthi.admin_id
                            )}
                          </div>

                          <div className="text-sm text-gray-500">
                            {formatIndianDate(diksharthi.assign_karyakarta_date)}
                          </div>
                        </div>
                      </td>
                    )}
                    {/* {role === "operations-manager" && (
                      <td className="px-6 py-3">
                        <div>
                          {diksharthi.current_visit_status || "-"}
                        </div>

                        {diksharthi.visited_history?.length > 0 && (() => {
                          const lastVisit = diksharthi.visited_history[diksharthi.visited_history.length - 1];
                          return (
                            <div className="mt-1 text-sm">
                              {formatIndianDate(lastVisit.date)} {formatTo12Hour(lastVisit.time)}
                            </div>
                          );
                        })()}
                      </td> 
                    )}*/}

                    {role === "operations-manager" && (
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span>{diksharthi.current_visit_status || "-"}</span>

                          {/* 👁️ Show only if value exists */}
                          {/* {diksharthi.current_visit_status && (
                          <button
                            onClick={() => openViewFeedbackModal(diksharthi)}
                            className="text-blue-500 hover:text-blue-700"
                            title="View Visit Details"
                          >
                            <Eye size={16} />
                          </button>
                        )} */}
                        </div>


                        {diksharthi.visited_history?.length > 0 && (() => {
                          const lastVisit =
                            diksharthi.visited_history[
                            diksharthi.visited_history.length - 1
                            ];

                          return (
                            <div className="mt-1 text-sm text-gray-500">
                              {formatIndianDate(lastVisit.date)}{" "}
                              {formatTo12Hour(lastVisit.time)}
                            </div>
                          );
                        })()}
                      </td>



                    )}

                    {role === "karyakarta" && (
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            className="rounded-lg border border-gray-300 text-sm px-2 py-1"
                            value={diksharthi?.current_visit_status || ""}
                            disabled={
                              updatingVisitStatusId === diksharthi.id ||
                              diksharthi?.current_visit_status === "Yes"
                            }
                            onChange={(e) => {
                              const value = e.target.value;

                              handleVisitStatusChange(diksharthi, value);

                              if (value === "Yes" || value === "No") {
                                openFeedbackModal({
                                  ...diksharthi,
                                  current_visit_status: value
                                });
                              }
                            }}
                          >
                            <option value="">Is Visited?</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                      </td>
                    )}

                    {role === "admin" && (
                      <td className="px-6 py-3">{status}</td>
                    )}

                    <td className="px-6 py-3 flex gap-3 flex-wrap">


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

                          <button
                            className="rounded-lg bg-red-600 text-sm px-2 py-1 text-white"
                            onClick={() => handleDownloadApplicationPdf(diksharthi)}
                            disabled={downloadingPdfId === diksharthi.id}
                          >
                            {downloadingPdfId === diksharthi.id ? "Downloading..." : "PDF"}
                          </button>



                          {getDiksharthiStatus(diksharthi) == "pending" && (
                            <button
                              className="rounded-lg bg-blue-600 text-sm px-2 py-1 text-white"
                              onClick={() => handleSendToOpManager(diksharthi.id)}
                            >
                              Send to Operation Manager
                            </button>
                          )}
                        </>
                      )}

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
                                {downloadingPdfId === diksharthi.id ? (
                                  <ButtonLoader />
                                ) : ("Application PDF")}
                              </button>
                              {/* <button
                                className="rounded-lg bg-emerald-600 text-sm px-2 py-1 text-white disabled:opacity-60"
                                onClick={() => handleDownloadApplicationExcel(diksharthi)}
                                disabled={downloadingApplicationId === diksharthi.id}
                              >
                                {downloadingApplicationId === diksharthi.id ? "Downloading..." : "Application Excel"}
                              </button> */}
                            </div>
                          )}

                          {/* ✅ Only show when status = send */}
                          {getDiksharthiStatus(diksharthi) === "send" &&
                            isAdminUnassigned(diksharthi) && (
                              <button
                                className="rounded-lg bg-purple-600 text-sm px-2 py-1 text-white"
                                onClick={() => openAssignAdminModal(diksharthi)}
                              >
                                Assign Karyakarta
                              </button>
                            )}

                          {/* {getDiksharthiStatus(diksharthi) !== "send" &&
                            getDiksharthiStatus(diksharthi) !== "manager" && (
                              <button
                                className="rounded-lg bg-indigo-600 text-sm px-2 py-1 text-white"
                                onClick={() => openOMFeedbackModal(diksharthi)}
                              >
                              Send to Case Coordinator
                              </button>
                            )} */}

                          {/* ✅ Send to Case Coordinator only when NOT coordinator */}
                          {
                            getDiksharthiStatus(diksharthi) == "manager" && (
                              <button
                                className="rounded-lg bg-indigo-600 text-sm px-2 py-1 text-white"
                                onClick={() => openOMFeedbackModal(diksharthi)}
                              >
                                Send to Case Coordinator
                              </button>
                            )}

                          {/* ✅ Hide View Feedback when Assign Karyakarta button visible */}
                          {!(getDiksharthiStatus(diksharthi) === "send" &&
                            isAdminUnassigned(diksharthi)) && (
                              <button
                                className="rounded-lg bg-orange-500 text-sm px-2 py-1 text-white"
                                onClick={() => openViewOMFeedbackModal(diksharthi)}
                              >
                                View Feedback
                              </button>
                            )}



                          {/* {feedbackStatus[diksharthi.id] && (
                            <button
                              className="rounded-lg bg-orange-500 text-sm px-2 py-1 text-white"
                              onClick={() => openViewFeedbackModal(diksharthi)}
                            >
                              View Feedback
                            </button>
                          )} */}
                        </>
                      )}

                      {role === "karyakarta" && (
                        <>
                          {canDownloadApplication && (
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded-lg bg-rose-600 text-sm px-2 py-1 text-white disabled:opacity-60"
                                onClick={() => handleDownloadApplicationPdf(diksharthi)}
                                disabled={downloadingPdfId === diksharthi.id}
                              >
                                {downloadingPdfId === diksharthi.id ? (
                                  <ButtonLoader />
                                ) : ("Application PDF")}
                              </button>
                              {/* <button
                                className="rounded-lg bg-emerald-600 text-sm px-2 py-1 text-white disabled:opacity-60"
                                onClick={() => handleDownloadApplicationExcel(diksharthi)}
                                disabled={downloadingApplicationId === diksharthi.id}
                              >
                                {downloadingApplicationId === diksharthi.id ? "Downloading..." : "Application Excel"}
                              </button> */}
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

                          {getDiksharthiStatus(diksharthi) === "send" && (
                            <button
                              className="rounded-lg bg-indigo-600 text-sm px-2 py-1 text-white"
                              onClick={() => handleSendToOM(diksharthi.id)}
                              disabled={sendingId === diksharthi.id}
                            >
                              {sendingId === diksharthi.id
                                ? "Sending..."
                                : "Send to Operations Manager"}
                            </button>
                          )}

                          {/* ✅ Show only when Is Visited = Yes / No */}
                          {(String(diksharthi?.current_visit_status || "")
                            .trim()
                            .toLowerCase() === "yes" ||
                            String(diksharthi?.current_visit_status || "")
                              .trim()
                              .toLowerCase() === "no") && (
                              <button
                                className="rounded-lg bg-orange-500 text-sm px-2 py-1 text-white"
                                onClick={() => openViewOMFeedbackModal(diksharthi)}
                              >
                                View Feedback
                              </button>
                            )}
                        </>
                      )}

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
                              {/* <button
                                className="rounded-lg bg-emerald-600 text-sm px-2 py-1 text-white disabled:opacity-60"
                                onClick={() => handleDownloadApplicationExcel(diksharthi)}
                                disabled={downloadingApplicationId === diksharthi.id}
                              >
                                {downloadingApplicationId === diksharthi.id ? "Downloading..." : "Application Excel"}
                              </button> */}
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
                              {/* <button
                                className="rounded-lg bg-emerald-600 text-sm px-2 py-1 text-white disabled:opacity-60"
                                onClick={() => handleDownloadApplicationExcel(diksharthi)}
                                disabled={downloadingApplicationId === diksharthi.id}
                              >
                                {downloadingApplicationId === diksharthi.id ? "Downloading..." : "Application Excel"}
                              </button> */}
                            </div>
                          )}

                          {/* ✅ Hide View Feedback when Assign Karyakarta button visible */}
                          {!(getDiksharthiStatus(diksharthi) === "send" &&
                            isAdminUnassigned(diksharthi)) && (
                              <button
                                className="rounded-lg bg-orange-500 text-sm px-2 py-1 text-white"
                                onClick={() => openViewOMFeedbackModal(diksharthi)}
                              >
                                View Feedback
                              </button>
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-xl font-bold text-gray-800">M.S. Name :
                  {viewModalData?.sadhu_sadhvi_name || "N/A"} -  {viewModalData?.id || "-"}
                </h3>
                <button
                  onClick={() => {
                    setViewModalData(null);
                    setIsViewLoading(false);
                  }}
                  className="p-2 rounded-full hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">

                {isViewLoading ? (
                  <div className="flex justify-center py-10">
                    <p className="text-gray-500 animate-pulse">
                      Loading profile data...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">

                    {(viewModalData?.rbf_criteria === "Yes" ||
                      viewModalData?.rbfCriteria === "Yes") && (
                        <Section title="Ratnakukshi Family Basic Info">
                          <Grid>
                            <DetailItem label="Relation" value={viewModalData?.relation} />
                            <DetailItem
                              label="Relation Name"
                              value={
                                viewModalData?.family_member_name ||
                                `${viewModalData?.family_member_firstName || "N/A"} ${viewModalData?.family_member_lastName || ""}`.trim()
                              }
                            />
                            {/* <DetailItem label="Assistance" value={viewModalData?.assistance_received} /> */}
                            <DetailItem label="Mobile No" value={viewModalData?.mobile_no || "N/A"} />
                            {/* <DetailItem label="Alt Mobile No" value={viewModalData?.alt_mobile_no} /> */}
                          </Grid>
                        </Section>
                      )}

                    {/*  */}
                    <Section title="RBF Criteria">
                      <Grid>
                        <DetailItem label="RBF Criteria" value={viewModalData?.rbf_criteria || "N/A"} />
                        <DetailItem label="Relation Name " value={viewModalData?.relation_name || "N/A"} />
                      </Grid>
                    </Section>
                    <Section title="Spoken To">
                      <Grid>
                        <DetailItem label="Name" value={viewModalData?.spoken_to || "N/A"} />
                        <DetailItem label="Relation " value={viewModalData?.spoken_to_relation || "N/A"} />
                      </Grid>
                    </Section>
                    {/* ADDRESS */}
                    {viewModalData?.rbf_criteria === "Yes" && (
                      <Section title="Address Details">
                        <Grid>
                          <DetailItem
                            label="Permanent Address"
                            value={viewModalData?.permanent_address || "N/A"}
                          />

                          <DetailItem
                            label="Current Address"
                            value={viewModalData?.current_address || "N/A"}
                          />

                          <DetailItem
                            label="Village"
                            value={viewModalData?.village || "N/A"}
                          />

                          <DetailItem
                            label="Taluka"
                            value={viewModalData?.taluka || "N/A"}
                          />

                          <DetailItem
                            label="District"
                            value={viewModalData?.district || "N/A"}
                          />

                          <DetailItem
                            label="State"
                            value={viewModalData?.state || "N/A"}
                          />

                          <DetailItem
                            label="Pin Code"
                            value={viewModalData?.pin_code || "N/A"}
                          />
                        </Grid>
                      </Section>
                    )}
                    {/* TOP SECTION */}
                    <div className="flex flex-col md:flex-row gap-6 border-t  py-6">
                      {/* LEFT */}
                      <div className="flex-1 space-y-3">

                        {/* BASIC INFO */}
                        <Section title="MS Details">
                          <Grid>
                            <DetailItem
                              label="DOB / Age"
                              value={
                                viewModalData?.age
                                  ? `${viewModalData.age} yrs${viewModalData?.dob
                                    ? ` (${formatIndianDate(viewModalData.dob)})`
                                    : ""
                                  }`
                                  : viewModalData?.dob
                                    ? `${formatIndianDate(viewModalData.dob)}`
                                    : "N/A"
                              }
                            />
                            <DetailItem
                              label="Gender"
                              value={
                                String(viewModalData?.gender || "").trim().toLowerCase() === "sadhu"
                                  ? "Male"
                                  : String(viewModalData?.gender || "").trim().toLowerCase() === "sadhvi"
                                    ? "Female"
                                    : viewModalData?.gender
                              }
                            />
                            <DetailItem label="Pad" value={viewModalData?.pad} />
                            <DetailItem label="Samudaay" value={viewModalData?.samudaay} />
                            <DetailItem label="Guru" value={viewModalData?.guru_name || viewModalData?.guruName} />
                            <DetailItem label="Acharya" value={viewModalData?.acharya} />
                            <DetailItem label="Gachadhipati" value={viewModalData?.gadipati} />
                          </Grid>
                        </Section>
                      </div>

                      {/* RIGHT IMAGE */}
                      <div className="flex justify-center md:justify-end">
                        <div className="relative">
                          <img
                            src={getProfileImageUrl(viewModalData?.photo)}
                            onError={(e) => (e.currentTarget.src = "/user.png")}
                            className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-md"
                          />
                          <span
                            className={`absolute bottom-25 -right-2 px-2 py-1 text-xs text-white rounded ${(viewModalData?.is_alive || viewModalData?.isAlive) === "No"
                              ? "bg-red-500"
                              : "bg-green-500"
                              }`}
                          >
                            {(viewModalData?.is_alive || viewModalData?.isAlive) === "Yes"
                              ? "Vidyamaan"
                              : "Kaaldharma"}
                          </span>
                        </div>
                      </div>
                    </div>




                    {/* RBF SECTION */}


                    {/* STATUS BASED */}
                    {(viewModalData?.is_alive || viewModalData?.isAlive) === "Yes" && (
                      <Section title="Current Status">
                        <DetailItem
                          label="Vihar Location"
                          value={viewModalData?.vihar_location}
                        />
                      </Section>
                    )}

                    {(viewModalData?.is_alive === "No" || viewModalData?.isAlive === "No") &&
                      (viewModalData?.samadhi_date || viewModalData?.samadhi_place) && (
                        <Section title="Samadhi Details">
                          <Grid>
                            {viewModalData?.samadhi_date && (
                              <DetailItem
                                label="Date"
                                value={formatIndianDate(viewModalData?.samadhi_date)}
                              />
                            )}

                            {viewModalData?.samadhi_place && (
                              <DetailItem
                                label="Place"
                                value={viewModalData?.samadhi_place}
                              />
                            )}
                          </Grid>
                        </Section>
                      )}

                    {Object.keys(familyDetails).length > 0 && (
                      <Section title="Family Details">
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-200 text-sm">
                            <thead className="bg-gray-100 text-gray-700">
                              <tr>
                                <th className="p-2 border">Sr No</th>
                                <th className="p-2 border">Full Name</th>
                                <th className="p-2 border">Relation</th>
                                <th className="p-2 border">Mobile</th>
                                <th className="p-2 border">Aadhar</th>
                                <th className="p-2 border">PAN</th>
                                <th className="p-2 border">Mediclaim</th>
                                <th className="p-2 border">Ayushman</th>
                                <th className="p-2 border">Need Assistance</th>
                              </tr>
                            </thead>

                            <tbody>
                              {Object.entries(familyDetails).map(([relation, member], index) => (
                                <tr key={relation} className="text-center">
                                  <td className="p-2 border">{index + 1}</td>

                                  <td className="p-2 border">
                                    {`${member.firstName || ""} ${member.lastName || ""}`.trim() || "N/A"}
                                  </td>

                                  <td className="p-2 border">{relation}</td>

                                  <td className="p-2 border">{member.mobileNumber || "N/A"}</td>

                                  <td className="p-2 border">{member.aadharNumber || "N/A"}</td>

                                  <td className="p-2 border">{member.panNumber || "N/A"}</td>

                                  <td className="p-2 border">
                                    {member.medicalPolicy === "Yes"
                                      ? `Yes `
                                      : "No"}
                                  </td>

                                  <td className="p-2 border">
                                    {member.ayushmanCoverage === "Yes"
                                      ? `Yes`
                                      : "No"}
                                  </td>

                                  <td className="p-2 border">
                                    {member.needAssistance || "No"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Section>
                    )}

                    {/* SUMMARY */}
                    {viewModalData?.summary && (
                      <Section title="Summary">
                        <div
                          className="text-sm text-gray-700 prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: viewModalData.summary }}
                        />
                      </Section>
                    )}
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
              {/* Data Display Section */}
              <p><span className="font-semibold">M.S. ID:</span> {assignModalData?.id || "-"}</p>
              <p><span className="font-semibold">M.S. Name:</span> {assignModalData?.sadhu_sadhvi_name || "-"}</p>
              <p><span className="font-semibold">Contact No:</span> {assignModalData?.mobile_no || "-"}</p>
              <p>
                <span className="font-semibold">Address:</span>{" "}
                {assignModalData?.district}, {assignModalData?.state}
              </p>

              {/* Search & Selection Section */}
              <div className="mt-4">
                <label className="block font-semibold mb-1">Search Karyakarta :</label>

                <input
                  type="text"
                  placeholder="Type name to search..."
                  value={searchAdmin}
                  onChange={(e) => setSearchAdmin(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded-md"
                />

                {searchAdmin.trim().length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                    {filteredAdmins.length === 0 ? (
                      <p className="p-2 text-sm text-gray-500">No result found</p>
                    ) : (
                      filteredAdmins.map((admin) => (
                        <div
                          key={admin.id}
                          onClick={() => setSelectedAdminId(admin.id)}
                          className={`p-2 cursor-pointer hover:bg-gray-100 ${String(selectedAdminId) === String(admin.id)
                            ? "bg-purple-100"
                            : ""
                            }`}
                        >
                          {admin.name || admin.email || `Admin #${admin.id}`}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Selected */}
                {selectedAdminId && (
                  <p className="mt-2 text-green-600 text-sm">
                    Selected:{" "}
                    {
                      adminUsers.find(
                        (a) => String(a.id) === String(selectedAdminId)
                      )?.name
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex gap-2 justify-end">
              <button
                type="button"
                className="rounded-lg bg-gray-200 text-sm px-4 py-2 text-gray-800 hover:bg-gray-300"
                onClick={() => setAssignModalData(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-purple-600 text-sm px-4 py-2 text-white disabled:opacity-60 hover:bg-purple-700"
                onClick={handleAssignAdmin}
                disabled={isAssigningAdmin || !selectedAdminId}
              >
                {isAssigningAdmin ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {(role === "operations-manager" || role === "case-coordinator") && scheduleVisitModalData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {shouldUseRescheduleFlow(scheduleVisitModalData) ? "Reschedule Visit" : "Schedule Visit"}
              </h3>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => {
                  setScheduleVisitModalData(null);
                  setScheduleForm(emptyScheduleForm);
                }}
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            {shouldUseRescheduleFlow(scheduleVisitModalData) && (
              <div className=" px-6 rounded-lg overflow-hidden text-sm">
                <div className="py-2 font-medium text-gray-900">
                  Current Scheduled Visit
                </div>

                <table className="w-full border-collapse text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 border">Sr No</th>
                      <th className="px-3 py-2 border">Visit Date</th>
                      <th className="px-3 py-2 border">Visit Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border">1</td>
                      <td className="px-3 py-2 border">
                        {getLatestVisitCycle(scheduleVisitModalData)?.scheduled?.date
                          ? new Date(getLatestVisitCycle(scheduleVisitModalData).scheduled.date).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                      <td className="px-3 py-2 border">
                        {getLatestVisitCycle(scheduleVisitModalData)?.scheduled?.time || "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-5 py-4 grid grid-cols-1 gap-4 text-sm">
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
                    min={new Date().toISOString().split("T")[0]} // 🔥 important
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
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2 justify-end">
              <button
                type="button"
                className="rounded-lg bg-gray-200 text-sm px-4 py-2 text-gray-800"
                onClick={() => {
                  setScheduleVisitModalData(null);
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
                  : shouldUseRescheduleFlow(scheduleVisitModalData)
                    ? "Save Reschedule"
                    : "Save Visit Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {role === "karyakarta" && viewScheduleModalData && (
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
                    <span className="font-semibold">Diksharthi Name:</span>{" "}
                    {viewScheduleModalData.diksharthi?.sadhu_sadhvi_name ||
                      viewScheduleModalData.diksharthi?.sadhu_sadhvi_name ||
                      "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Family Head Name:</span>{" "}
                    {viewScheduleModalData.diksharthi?.family_member_firstName ||
                      viewScheduleModalData.diksharthi?.family_member_firstName ||
                      "-"} {" "}
                    {viewScheduleModalData.diksharthi?.family_member_lastName ||
                      viewScheduleModalData.diksharthi?.family_member_lastName ||
                      "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Contact No:</span>{" "}
                    {viewScheduleModalData.diksharthi?.mobile_no ||
                      viewScheduleModalData.diksharthi?.mobile_no ||
                      "-"} {" | "}
                    {viewScheduleModalData.diksharthi?.alt_mobile_no ||
                      viewScheduleModalData.diksharthi?.alt_mobile_no ||
                      "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Address:</span>{" "}
                    {viewScheduleModalData.diksharthi?.current_address ||
                      viewScheduleModalData.diksharthi?.current_address ||
                      "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {formatIndianDate(viewScheduleModalData.schedule.date)}
                  </p>
                  <p>
                    <span className="font-semibold">Time:</span>{" "}
                    {viewScheduleModalData.schedule.time || "-"}
                  </p>
                  {viewScheduleModalData?.rescheduled && (
                    <>
                      <p>
                        <span className="font-semibold">Original Date:</span>{" "}
                        {formatIndianDate(viewScheduleModalData?.originalSchedule?.date)}
                      </p>
                      <p>
                        <span className="font-semibold">Original Time:</span>{" "}
                        {viewScheduleModalData?.originalSchedule?.time || "-"}
                      </p>
                      <p>
                        <span className="font-semibold">Rescheduled Date:</span>{" "}
                        {formatIndianDate(viewScheduleModalData?.reschedule?.date)}
                      </p>
                      <p>
                        <span className="font-semibold">Rescheduled Time:</span>{" "}
                        {viewScheduleModalData?.reschedule?.time || "-"}
                      </p>
                    </>
                  )}
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
      )} */}


      {role === "karyakarta" && viewScheduleModalData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Visit Details</h3>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                onClick={() => setViewScheduleModalData(null)}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-6">
              {isViewScheduleLoading ? (
                <div className="flex flex-col items-center py-10 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-gray-500 font-medium">Loading visit schedule...</p>
                </div>
              ) : viewScheduleModalData?.schedule ? (
                <div className="space-y-6">
                  {/* Contact Information Table */}
                  <div className="overflow-hidden ">
                    <table className="w-full text-sm text-left">
                      <tbody className="divide-y divide-gray-100">
                        <tr className="bg-white">
                          <td className="px-1 py-1 font-semibold text-gray-600 w-1/3">M.S. Name</td>
                          <td className="px-4 py-1 text-gray-900">{viewScheduleModalData.diksharthi?.sadhu_sadhvi_name || "-"}</td>
                        </tr>
                        <tr className="bg-gray-50/50">
                          <td className="px-1 py-1 font-semibold text-gray-600">Family Head</td>
                          <td className="px-4 py-1 text-gray-900">
                            {`${viewScheduleModalData.diksharthi?.family_member_firstName || "-"} ${viewScheduleModalData.diksharthi?.family_member_lastName || ""}`}
                          </td>
                        </tr>
                        <tr className="bg-white">
                          <td className="px-1 py-1 font-semibold text-gray-600">Contact</td>
                          <td className="px-4 py-1 text-gray-900">
                            <div className="flex flex-col">
                              <span>{viewScheduleModalData.diksharthi?.mobile_no || "-"}</span>
                              {viewScheduleModalData.diksharthi?.alt_mobile_no && (
                                <span className="text-gray-400 text-xs italic">{viewScheduleModalData.diksharthi.alt_mobile_no}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                        <tr className="bg-gray-50/50">
                          <td className="px-1 py-1 font-semibold text-gray-600">Address</td>
                          <td className="px-4 py-1 text-gray-900 leading-relaxed">
                            {viewScheduleModalData.diksharthi?.current_address || "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Schedule Highlights */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                      <p className="text-xs uppercase tracking-wider font-bold text-indigo-600 mb-1">Scheduled Date</p>
                      <p className="text-lg font-semibold text-indigo-900">
                        {formatIndianDate(viewScheduleModalData.schedule.date)}
                      </p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <p className="text-xs uppercase tracking-wider font-bold text-emerald-600 mb-1">Scheduled Time</p>
                      <p className="text-lg font-semibold text-emerald-900">
                        {viewScheduleModalData.schedule.time || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Rescheduling History (If Applicable) */}
                  {viewScheduleModalData?.rescheduled && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
                        Scheduling Details
                      </h4>
                      <div className="grid grid-cols-2 gap-y-2 text-xs">
                        <span className="text-amber-700">Schedule:</span>
                        <span className="font-medium text-amber-900 text-right">
                          {formatIndianDate(viewScheduleModalData?.originalSchedule?.date)} @ {viewScheduleModalData?.originalSchedule?.time}
                        </span>
                        <span className="text-amber-700">Re-Schedule:</span>
                        <span className="font-medium text-amber-900 text-right">
                          {formatIndianDate(viewScheduleModalData?.reschedule?.date)} @ {viewScheduleModalData?.reschedule?.time}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3">
                    <Calendar size={24} />
                  </div>
                  <p className="text-gray-500">No visit schedule has been set for this diksharthi yet.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-gray-800 hover:bg-black transition-colors text-sm font-medium px-6 py-2.5 text-white shadow-sm"
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Add Karyakarta Feedback</h3>
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
                <span className="font-semibold">M.S. ID:</span>{" "}
                {feedbackModalData?.id || "-"}
              </p>
              <p>
                <span className="font-semibold">M.S. Name:</span>{" "}
                {feedbackModalData?.sadhu_sadhvi_name || "-"}
              </p>
              {/* <div>
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
              </div> */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Feedback
                </label>

                <JoditEditor
                  ref={editor}
                  value={feedbackForm.feedback}
                  config={queryEditorConfig}
                  onBlur={(newContent) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      feedback: newContent,
                    })
                  }
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

      {/* 
      {(role === "operations-manager" || role === "karyakarta") && viewFeedbackModalData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Feedback</h3>
                <p className="text-lg text-gray-900 font-bold">
                  M.S. : {viewFeedbackModalData.diksharthi?.id || "-"}  {viewFeedbackModalData.diksharthi?.sadhu_sadhvi_name || "-"}
                </p>
              </div>

              <button
                onClick={() => setViewFeedbackModalData(null)}
                className="p-2 rounded-full hover:bg-gray-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

              {isFeedbackLoading ? (
                <p className="text-center text-gray-500 animate-pulse">
                  Loading feedback...
                </p>
              ) : viewFeedbackModalData.feedbacks.length === 0 ? (
                <p className="text-center text-gray-400">
                  No feedback available
                </p>
              ) : (
                viewFeedbackModalData.feedbacks.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                  >
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {item.feedback || "-"}
                    </p>

                    <div className="mt-3 flex justify-between items-center text-xs text-gray-500">

                      <span>
                        🕒 {formatIndianDate(item.created_at)}{" "}
                        {item.feedback_time
                          ? `• ${item.feedback_time}`
                          : ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )} */}


      {(role === "operations-manager" || role === "karyakarta") && viewFeedbackModalData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">

            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-blue-50">
              <div>
                <h3 className="text-sm uppercase tracking-wider font-bold text-blue-600">Feedback History</h3>
                <p className="text-xl text-gray-900 font-extrabold mt-1">
                  {viewFeedbackModalData.diksharthi?.sadhu_sadhvi_name || "-"}
                  <span className="ml-2 text-sm font-medium text-gray-500">(ID: {viewFeedbackModalData.diksharthi?.id || "-"})</span>
                </p>
              </div>

              <button
                onClick={() => setViewFeedbackModalData(null)}
                className="p-2 rounded-full hover:bg-white hover:shadow-md transition-all text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* BODY - TABLE LAYOUT */}
            <div className="flex-1 overflow-y-auto">
              {isFeedbackLoading ? (
                <div className="p-20 text-center">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-500">Loading feedback records...</p>
                </div>
              ) : viewFeedbackModalData.feedbacks.length === 0 ? (
                <div className="p-20 text-center text-gray-400">
                  <p className="text-lg italic">No feedback entries found for this record.</p>
                </div>
              ) : (
                <table className="w-full px-16 text-left ">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Feedback</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {viewFeedbackModalData.feedbacks.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-blue-50/30 transition-colors">
                        {/* STATUS COLUMN */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${item.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700'
                            : item.status === 'No'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                            }`}>
                            {item.status || "N/A"}
                          </span>
                        </td>

                        {/* FEEDBACK COLUMN */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700 max-w-md line-clamp-2 hover:line-clamp-none transition-all cursor-default">
                            {item.feedback || "-"}
                          </p>
                        </td>

                        {/* DATE & TIME COLUMN */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatIndianDate(item.created_at)}
                          </div>
                          <div className="text-xs text-gray-400 font-mono italic">
                            {item.feedback_time || "-"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      )}


      {omFeedbackModalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Operations Manager Feedback
              </h2>

              <button
                onClick={() => setOmFeedbackModalData(null)}
                className="text-gray-500 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              M.S. ID: {omFeedbackModalData.id} - {omFeedbackModalData.sadhu_sadhvi_name}
            </p>

            {/* <textarea
              rows="5"
              value={omFeedback}
              onChange={(e) => setOmFeedback(e.target.value)}
              placeholder="Enter feedback..."
              className="w-full border rounded-lg p-3 text-sm resize-none"
            /> */}

            <JoditEditor
              ref={editor}
              value={omFeedback}
              config={queryEditorConfig}
              onBlur={(newContent) => setOmFeedback(newContent)}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setOmFeedbackModalData(null)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitOMFeedback}
                disabled={isSubmittingOmFeedback}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
              >
                {isSubmittingOmFeedback ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewOMFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <div>
                <h2 className="text-lg font-semibold">
                  Feedback History
                </h2>

                <p className="text-sm text-gray-500">
                  M.S. ID: {viewOMFeedbackModal.id}
                </p>
              </div>

              <button
                onClick={() => setViewOMFeedbackModal(null)}
                className="text-gray-500 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-auto flex-1 space-y-8">

              {isLoadingOMFeedback ? (
                <p className="text-center text-gray-500">
                  Loading...
                </p>
              ) : (
                <>
                  {/* ================= Karyakarta   FEEDBACK TABLE ================= */}
                  <div>
                    <h3 className="font-semibold text-blue-700 mb-3">
                      Karyakarta  Feedback
                    </h3>

                    {omFeedbackList?.diksharthi_feedback?.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        No feedback found
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {omFeedbackList.diksharthi_feedback.map((item, index) => (
                          <div
                            key={index}
                            className="border rounded-xl p-4 shadow-sm bg-white w-full overflow-hidden"
                          >
                            {/* Top Row */}
                            <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
                              <div className="text-sm font-semibold text-slate-700">
                                <span
                                  className={`px-3 py-1 rounded-md text-xs font-semibold ${item.status === "Yes"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                                >
                                  Is Visted : {item.status || "-"}
                                </span>
                              </div>

                              <div className="text-sm text-gray-500 break-words">
                                {formatIndianDate(item.feedback_date?.slice(0, 10))} |{" "}
                                {item.feedback_time}
                              </div>
                            </div>

                            {/* Feedback Text Fix */}

                            <div
                              className="text-sm text-gray-700 mb-3 leading-relaxed break-words whitespace-pre-wrap overflow-hidden prose max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: item.feedback || "-",
                              }}
                            />


                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ================= OM FEEDBACK ================= */}
                  {omFeedbackList?.operation_manager_feedback?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-green-700 mb-3">
                        Operation Manager Feedback
                      </h3>

                      <div className="space-y-3">
                        {omFeedbackList.operation_manager_feedback.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="border rounded-xl p-4 bg-green-50"
                            >
                              <div className="text-sm text-gray-500 break-words flex justify-end">

                                <span>
                                  {formatIndianDate(item.feedback_date?.slice(0, 10))}{" "}
                                  {item.feedback_time}
                                </span>
                              </div>
                              <div
                                className="text-sm text-gray-700 mb-3 leading-relaxed break-words whitespace-pre-wrap overflow-hidden prose max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: item.feedback || "-",
                                }}
                              />


                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-3 flex justify-end">
              <button
                onClick={() => setViewOMFeedbackModal(null)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg"
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
                      <DetailItem label="NGO Frequency" value={familyDetailsModalData.details.ngo_frequency} />
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



