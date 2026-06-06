// import React from 'react'

// const QueriesAssistant = () => {
//   return (
//     <div>
      
//     </div>
//   )
// }

// export default QueriesAssistant
import axios from "axios";
import JoditEditor from "jodit-react";
import {
  CheckCircle,
  Clock,
  Download,
  EllipsisVertical,
  Eye,
  FileText,
  Search,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import { useAuth } from "../context/AuthContext";
import { queryEditorConfig } from "../utils/joditconfig";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
};

const asDisplayText = (value, fallback = "-") => {
  if (value == null || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
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

const getExpertPanelAssistanceType = (roleValue) => {
  const normalizedRole = String(roleValue || "")
    .trim()
    .toLowerCase();
  if (!normalizedRole.startsWith("expert-panel-")) return null;

  const subRole = normalizedRole.replace("expert-panel-", "").trim();
  const map = {
    medical: "medical",
    job: "job",
    educations: "education",
    education: "education",
    food: "food",
    rent: "rent",
    housing: "housing",
    vaiyavacch: "vaiyavacch",
    livelihoodexpenses: "livelihoodexpenses",
    livelihood: "livelihoodexpenses",
  };

  return map[subRole] || null;
};

const capitalizeFirst = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  queries: "Queries",
  send_to_committee_member: "Send to Committee Member",
  send_to_expert_panel: "Send to Expert Panel",
};

// const getStatusToneClass = (status) => {
//   const normalizedStatus = normalizeWorkflowValue(status);

//   if (normalizedStatus === "approve") return "text-green-600";
//   if (normalizedStatus === "rejected") return "text-red-600";
//   if (normalizedStatus === "queries") return "text-amber-600";
//   if (
//     normalizedStatus === "send to committee member" ||
//     normalizedStatus === "send to expert panel" ||
//     normalizedStatus === "case coordinator"
//   ) {
//     return "text-blue-600";
//   }

//   return "text-yellow-600";
// };

const getStatusToneClass = (status) => {
  const normalizedStatus = normalizeWorkflowValue(status);

  if (normalizedStatus === "approve" || normalizedStatus === "approved")
    return "text-green-600";
  if (normalizedStatus === "rejected") return "text-red-600";
  if (normalizedStatus === "queries") return "text-amber-600";

  if (
    normalizedStatus === "send to committee member" ||
    normalizedStatus === "send to expert panel" ||
    normalizedStatus === "case coordinator"
  ) {
    return "text-blue-600";
  }

  return "text-yellow-600";
};

// const getStatusLabel = (status) => {
//   const normalizedStatus = normalizeWorkflowValue(status);

//   if (normalizedStatus === "case coordinator") {
//     return "Approve by Expert Panel";
//   }

//   return capitalizeFirst(status);
// };

// const getStatusLabel = (status) => {
//   const normalizedStatus = normalizeWorkflowValue(status);

//   if (normalizedStatus === "case coordinator") {
//     return "Received form Expert Panel";
//   }

//   if (normalizedStatus === "send_to_case_coordinator") {
//     return "Received form Committee Member";
//   }

//   if (
//     normalizedStatus === "approve" ||
//     normalizedStatus === "approved"
//   ) {
//     return "Approved";
//   }

//   return capitalizeFirst(status);
// };

const getStatusLabel = (status) => {
  const normalizedStatus = normalizeWorkflowValue(status);

  if (normalizedStatus === "case coordinator") {
    return "Received from Expert Panel";
  }

  if (normalizedStatus === "send to case coordinator") {
    return "Received from Committee Member";
  }

  if (normalizedStatus === "approve" || normalizedStatus === "approved") {
    return "Approved";
  }

  if (normalizedStatus === "committee member") {
    return "Received by Committee Member";
  }

  if (normalizedStatus === "expert panel") {
    return "Received by Expert Panel";
  }

  return capitalizeFirst(asDisplayText(status));
};

const getAllowedActions = ({ role, status }) => {
  const normalizedRole = normalizeWorkflowValue(role);
  const normalizedStatus = normalizeWorkflowValue(status);

  // ✅ CASE COORDINATOR
  if (normalizedRole === "case coordinator") {
    if (normalizedStatus === "pending" || normalizedStatus === "queries") {
      return [
        "approve",
        "queries",
        "send-to-committee-member",
        "rejected",
        "queries",
      ];
    }

    if (normalizedStatus === "committee member") {
      return ["send-to-expert-panel", "rejected", "queries"];
    }
    if (normalizedStatus === "case coordinator") {
      return ["approve", "send-to-committee-member", "rejected", "queries"];
    }
    if (normalizedStatus === "send to case coordinator") {
      return ["approve", "send-to-committee-member", "rejected", "queries"];
    }
  }

  // ✅ COMMITTEE MEMBER
  if (normalizedRole === "committee member") {
    if (normalizedStatus === "committee member") {
      return ["approve", "rejected", "queries", "send-to-expert-panel"];
    }
  }

  // ✅ EXPERT PANEL
  if (isExpertPanelRole(normalizedRole)) {
    if (normalizedStatus === "expert panel") {
      return ["approve", "rejected", "queries", "send-to-case-coordinator"];
    }
  }

  return [];
};

const QueriesAssistant = () => {
  const { user } = useAuth();
  console.log(user, "user");
  const [searchType, setSearchType] = useState("sadhu");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [selectedSadhu, setSelectedSadhu] = useState(null);
  console.log("Selected Sadhu:", selectedSadhu);
  const [familyDetails, setFamilyDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [activeRow, setActiveRow] = useState(null);
  const [actionType, setActionType] = useState("");
  const [queriesReason, setQueriesReason] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [actionError, setActionError] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [viewQueryRow, setViewQueryRow] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [actionRows, setActionRows] = useState([]);
  const [meetingOptions, setMeetingOptions] = useState([]);
  // const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const dropdownContainerRef = useRef(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");

  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");

  const [monthlyPayments, setMonthlyPayments] = useState({});
  console.log(monthlyPayments, "monthlyPayments");

  const [selectedMember, setSelectedMember] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);

  const [showFamilyDetailsPage, setShowFamilyDetailsPage] = useState(false);

  const [approvalModal, setApprovalModal] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState("");
  const [selectedAssistanceId, setSelectedAssistanceId] = useState(null);
  const [approvedAmount, setApprovedAmount] = useState("");
  const handleOpenApprovalModal = (assistanceId) => {
    setSelectedAssistanceId(assistanceId);
    setApprovalStatus("");
    setApprovalModal(true);
  };

  const [selectedCases, setSelectedCases] = useState([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [meetingList, setMeetingList] = useState([]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [selectedPayments, setSelectedPayments] = useState([]);
  useEffect(() => {
    if (!approveAmount || monthYearList.length === 0) return;

    const totalAmount = Number(approveAmount);
    const totalMonths = monthYearList.length;

    const perMonthAmount = Math.floor(totalAmount / totalMonths);

    let payments = {};
    let runningTotal = 0;

    monthYearList.forEach((item, index) => {
      let amount = perMonthAmount;

      // add remaining amount in last month
      if (index === totalMonths - 1) {
        amount = totalAmount - runningTotal;
      }

      payments[item.key] = amount;
      runningTotal += amount;
    });

    setMonthlyPayments(payments);
  }, [approveAmount, fromYear, fromMonth, toYear, toMonth]);
  // CHECKBOX HANDLE
  const handleSelectPayment = (index) => {
    setSelectedPayments((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    );
  };

  // SELECT ALL
  const handleSelectAllPayments = () => {
    if (selectedPayments.length === selectedRow?.monthly_payments?.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(
        selectedRow?.monthly_payments?.map((_, index) => index),
      );
    }
  };

  // UPDATE BUTTON
  const handleUpdatePayments = async () => {
    try {
      const selectedData = selectedRow?.monthly_payments?.filter((_, index) =>
        selectedPayments.includes(index),
      );

      const selectedRowId = selectedRow?.id;

      console.log(selectedRowId, "selectedRowId");
      console.log("Selected Payments :", selectedData);

      if (!selectedData.length) {
        alert("Please select payments");
        return;
      }

      const response = await axios.put(
        `${API}/api/assistance/update-monthly-payment-status/${selectedRowId}`,
        {
          selectedPayments: selectedData,
          status: "Sanction",
        },
      );

      console.log(response.data);

      if (response.data.success) {
        alert("Payment status updated successfully");

        // UPDATE LOCAL STATE
        setSelectedRow((prev) => ({
          ...prev,
          monthly_payments: response.data.data,
        }));

        // CLEAR CHECKBOX
        setSelectedPayments([]);
      }
    } catch (error) {
      console.log(error);

      alert(error?.response?.data?.message || "Something went wrong");
    }
  };
  const currentYear = new Date().getFullYear();

  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear + i);

  // GENERATE MONTH + YEAR RANGE
  const generateMonthYearList = () => {
    if (!fromYear || !toYear || !fromMonth || !toMonth) return [];

    const startYear = Number(fromYear);
    const endYear = Number(toYear);

    const startMonthIndex = months.indexOf(fromMonth);
    const endMonthIndex = months.indexOf(toMonth);

    let data = [];

    for (let year = startYear; year <= endYear; year++) {
      let start = 0;
      let end = 11;

      if (year === startYear) {
        start = startMonthIndex;
      }

      if (year === endYear) {
        end = endMonthIndex;
      }

      for (let i = start; i <= end; i++) {
        data.push({
          key: `${months[i]}-${year}`,
          month: months[i],
          year,
        });
      }
    }

    return data;
  };

  const monthYearList = generateMonthYearList();

  // const handleMonthlyAmountChange = (key, value) => {
  //   setMonthlyPayments((prev) => ({
  //     ...prev,
  //     [key]: value,
  //   }));
  // };
  const handleMonthlyAmountChange = (key, value) => {
    const amount = Number(value);

    // Only first month editable
    if (key !== monthYearList[0]?.key) return;

    const totalAmount = Number(approveAmount);
    const totalMonths = monthYearList.length;

    if (totalMonths === 0) return;

    let updatedPayments = {};

    updatedPayments[key] = amount;

    const remainingAmount = totalAmount - amount;
    const remainingMonths = totalMonths - 1;

    const perMonth =
      remainingMonths > 0 ? Math.floor(remainingAmount / remainingMonths) : 0;

    let distributedTotal = amount;

    monthYearList.slice(1).forEach((item, index) => {
      let monthAmount = perMonth;

      // Last month adjustment
      if (index === remainingMonths - 1) {
        monthAmount = totalAmount - distributedTotal;
      }

      updatedPayments[item.key] = monthAmount;
      distributedTotal += monthAmount;
    });

    setMonthlyPayments(updatedPayments);
  };
  const totalMonthlyAmount = Object.values(monthlyPayments).reduce(
    (sum, amount) => sum + Number(amount || 0),
    0,
  );

  const getDefaultStatusFilterForRole = (roleValue) => {
    const normalizedRole = String(roleValue || "")
      .trim()
      .toLowerCase();

    if (normalizedRole === "staff") return "queries";
    if (normalizedRole === "committee-member") return "committee-member";
    // Case coordinator should be able to see all assistance cases (including Expert Panel status).
    if (normalizedRole === "case-coordinator") return "all";
    if (normalizedRole === "karyakarta") return "pending,queries";
    if (
      normalizedRole === "expert-panel" ||
      normalizedRole.startsWith("expert-panel-")
    ) {
      return "expert-panel";
    }

    return "all";
  };

  const [statusFilter, setStatusFilter] = useState(() =>
    getDefaultStatusFilterForRole(user?.role),
  );

  const role = String(user?.role || "").toLowerCase();
  const isStaff = role === "staff";
  const isCaseCoordinator = role === "case-coordinator";
  const getBankList = async () => {
    try {
      const response = await fetch("https://uat.ratnakukshi.org/api/banks");

      const data = await response.json();

      setBankList(data || []);
    } catch (error) {
      console.log("BANK LIST ERROR =>", error);
    }
  };

  const handleSubmitAssignBank = async () => {
    try {
      const response = await fetch(
        `${API}/api/assistance/assign-bank-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assistance_id: selectedRow.id,
            bank_id: selectedBank,
          }),
        },
      );

      const data = await response.json();

      console.log(data);

      if (data.success) {
        alert(data.message);

        setIsAssignModalOpen(false);
      }
    } catch (error) {
      console.log("ASSIGN ERROR =>", error);
    }
  };
  const handleAssignBank = async (row) => {
    try {
      setSelectedRow(row);

      // GET ALL BANKS
      await getBankList();

      // GET ASSIGNED BANK
      const response = await fetch(
        `${API}/api/assistance/assigned-bank/${row.id}`,
      );

      const data = await response.json();

      console.log("ASSIGNED BANK =>", data);

      // AUTO SELECT BANK
      if (data.success && data.data) {
        setSelectedBank(data.data.bank_id);
      } else {
        setSelectedBank("");
      }

      // OPEN MODAL
      setIsAssignModalOpen(true);
    } catch (error) {
      console.log("GET ASSIGNED BANK ERROR =>", error);
    }
  };
  const fetchFamilyAccounting = async (
    currentPage = page,
    currentStatus = statusFilter,
  ) => {
    try {
      const res = await axios.get(`${API}/api/assistance/allAssistance`, {
        params: {
          page: currentPage,
          limit,
          status: currentStatus === "all" ? "" : currentStatus,
        },
      });

      setTableData(asArray(res?.data?.data));
      setTotalPages(res?.data?.pagination?.totalPages || 1);
      setPage(res?.data?.pagination?.page || 1);
    } catch {
      setTableData([]);
    }
  };

  useEffect(() => {
    fetchFamilyAccounting(page, statusFilter);
  }, [page, statusFilter]);
  const handleCommitteeApproval = async () => {
    try {
      const payload = {
        assistanceId: selectedAssistanceId,
        status: approvalStatus,
        amount: approvalStatus === "approved" ? Number(approvedAmount) : null,
      };

      console.log("Payload:", payload);

      const response = await axios.put(
        `${API}/api/assistance/committee-approval`,
        payload,
      );

      console.log(response.data);

      setApprovalModal(false);
      setApprovalStatus("");
      setApprovedAmount("");
      setSelectedAssistanceId(null);

      fetchFamilyAccounting(); // refresh list
    } catch (error) {
      console.error(error?.response?.data || error.message);
    }
  };
  useEffect(() => {
    setStatusFilter((current) => {
      if (current !== "all") return current;
      return getDefaultStatusFilterForRole(user?.role);
    });
    setPage(1);
  }, [user?.role]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await axios.get(`${API}/api/all-meeting?page=1&limit=1000`);
        setMeetingOptions(asArray(res?.data?.data));
      } catch (error) {
        console.error("Failed to fetch meeting schedule:", error);
        setMeetingOptions([]);
      }
    };

    fetchMeetings();
  }, []);

  useEffect(() => {
    setSelectedRowIds([]);
  }, [tableData, page, statusFilter]);

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
  const navigate = useNavigate();

  // const handleSearch = async (value) => {
  //   setSearchText(value);
  //   if (value.length < 2) {
  //     setResults([]);
  //     setSelectedSadhu(null);
  //     setFamilyDetails([]);
  //     return;
  //   }

  //   const normalizedSearch = value.trim().toLowerCase();
  //   const rows = asArray(tableData);

  //   if (searchType === "sadhu") {
  //     const uniqueByDiksharthi = new Map();
  //     rows.forEach((row) => {
  //       const diksharthiId = row?.diksharthi_id;
  //       const sadhuName = String(row?.sadhu_sadhvi_name || "").toLowerCase();
  //       if (!diksharthiId || !sadhuName.includes(normalizedSearch)) return;

  //       if (!uniqueByDiksharthi.has(diksharthiId)) {
  //         uniqueByDiksharthi.set(diksharthiId, {
  //           id: diksharthiId,
  //           diksharthi_id: diksharthiId,
  //           sadhu_sadhvi_name: row?.sadhu_sadhvi_name || "",
  //           family_member_firstName: row?.family_member_firstName || "",
  //           family_member_lastName: row?.family_member_lastName || "",
  //           relation: row?.relation || "",
  //         });
  //       }
  //     });

  //     setResults(Array.from(uniqueByDiksharthi.values()));
  //     return;
  //   }

  //   const uniqueByMember = new Map();
  //   rows.forEach((row) => {
  //     const firstName = String(row?.family_member_firstName || "").trim();
  //     const lastName = String(row?.family_member_lastName || "").trim();
  //     const memberName = `${firstName} ${lastName}`.trim().toLowerCase();
  //     if (!memberName.includes(normalizedSearch)) return;

  //     const key = `${row?.diksharthi_id || ""}__${row?.relation || ""}`;
  //     if (!uniqueByMember.has(key)) {
  //       uniqueByMember.set(key, {
  //         id: row?.diksharthi_id,
  //         diksharthi_id: row?.diksharthi_id,
  //         sadhu_sadhvi_name: row?.sadhu_sadhvi_name || "",
  //         family_member_firstName: firstName,
  //         family_member_lastName: lastName,
  //         relation: row?.relation || "",
  //       });
  //     }
  //   });

  //   setResults(Array.from(uniqueByMember.values()));
  // };
  const handleSearch = async (value) => {
    setSearchText(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    try {
      const res = await axios.get(`${API}/api/assistance/allAssistance`, {
        params: {
          search: value,
          searchType,
        },
      });

      setResults(res?.data?.data || []);
    } catch (error) {
      console.log(error);

      setResults([]);
    }
  };
  const asArray = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    return [];
  };

  // =====================================
  // SELECT SADHU
  // =====================================

  const handleSelectSadhu = async (item) => {
    try {
      setSelectedSadhu(item);

      setResults([]);

      // =====================================
      // SEARCH TEXT
      // =====================================

      const displayFamilyName = `
      ${item?.family_member_firstName || ""}
      ${item?.family_member_lastName || ""}
      `.trim();

      setSearchText(
        searchType === "family" && displayFamilyName
          ? `${displayFamilyName} (${item?.relation || "-"})`
          : item?.sadhu_sadhvi_name || "",
      );

      // =====================================
      // GET DIKSHARTHI ID
      // =====================================

      const diksharthiId = item?.diksharthi_id || item?.id;

      // =====================================
      // API CALL
      // =====================================

      const res = await axios.get(
        `${API}/api/assistance/all-assistance/${diksharthiId}`,
      );

      console.log("API RESPONSE", res?.data);

      // =====================================
      // FAMILY MEMBERS
      // =====================================

      const familyMembers = res?.data?.data?.family_members;

      setFamilyDetails(asArray(familyMembers));
    } catch (error) {
      console.error("Fetch Error", error);

      setFamilyDetails([]);
    }
  };

  const handleEdit = (row) => {
    navigate("/assistance-details", {
      state: {
        memberData: {
          fullName:
            `${row?.family_member_firstName || ""} ${row?.family_member_lastName || ""}`.trim(),
        },
        relation: row?.relation,
        selectedSadhu:
          row?.diksharthi_id ||
          selectedSadhu?.diksharthi_id ||
          selectedSadhu?.id,
        familyMemberId: row?.family_member_id || row?.family_id,
        familyId: row?.family_member_id || row?.family_id,
        sadhuName: row?.sadhu_sadhvi_name || selectedSadhu?.sadhu_sadhvi_name,
        assistanceData: row?.assistance_data || {},
      },
    });
  };
  const handleDownloadApplicationPdf = async (diksharthi) => {
    if (!diksharthi) {
      alert("Invalid Diksharthi ID");
      return;
    }

    try {
      setDownloadingPdfId(diksharthi);

      const response = await fetch(
        `${API}/api/generateDikshartiReport/${diksharthi}`,
        {
          method: "GET",
          headers: {
            Accept: "application/pdf",
          },
        },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));

        throw new Error(
          result?.message || "Failed to download application PDF",
        );
      }

      const blob = await response.blob();

      const fileURL = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = fileURL;

      link.download = `Application_Form_${diksharthi}.pdf`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("PDF Download Error:", error);

      alert(error?.message || "Something went wrong");
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const handleOpenActionModal = (row, type) => {
    setActiveRow(row);
    setActionRows(row ? [row] : []);
    setActionType(type);
    setQueriesReason("");
    setApproveAmount("");
    setApproveAmount(
      row?.approve_amount !== null && row?.approve_amount !== undefined
        ? row.approve_amount
        : "",
    );
    setSelectedMeetingId(String(row?.meeting_id || ""));
    setActionError("");
    setIsModalOpen(true);
  };

  const handleCloseActionModal = () => {
    setIsModalOpen(false);
    setActionType("");
    setQueriesReason("");
    setApproveAmount("");
    setSelectedMeetingId("");
    setActionError("");
    setActiveRow(null);
    setActionRows([]);
  };

  const isPendingRow = (row) =>
    normalizeWorkflowValue(row?.status) === "pending";

  const isBulkSelectableRow = (row) => isCaseCoordinator && isPendingRow(row);

  // const handleToggleRowSelection = (rowId) => {
  //   setSelectedRowIds((prev) =>
  //     prev.includes(rowId)
  //       ? prev.filter((id) => id !== rowId)
  //       : [...prev, rowId],
  //   );
  // };

  const getMeetingList = async () => {
    try {
      const res = await axios.get(
        "https://uat.ratnakukshi.org/api/all-meeting",
      );

      if (res.data.success) {
        // Only Schedule meetings
        const meetings = res.data.data.filter(
          (item) => item.status === "Schedule" || item.status === "Reschedule",
        );

        setMeetingList(meetings);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // const handleSendToMeeting = async () => {
  //   try {
  //     const payload = {
  //       meeting_id: selectedMeetingId,
  //       selected_cases: selectedCases,
  //               presented: false, // default

  //     };

  //     console.log("Payload", payload);

  //     // await axios.post("/api/send-to-meeting", payload);

  //     setShowMeetingModal(false);
  //     setSelectedCases([]);
  //     setSelectedMeetingId("");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const handleSendToMeeting = async () => {
    try {
      const payload = {
        meeting_id: selectedMeetingId, // meeting date
        selected_cases: selectedCases.map((id) => ({
          case_id: id,
          presented: false,
        })),
        status: "Schedule",
      };

      console.log("Payload:", payload);

      const response = await axios.post(
        `${API}/api/add-cases-to-meeting`,
        payload,
      );

      if (response.data.success) {
        alert("Meeting created successfully");

        setShowMeetingModal(false);
        setSelectedCases([]);
        setSelectedMeetingId("");
      }
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Something went wrong");
    }
  };
  useEffect(() => {
    getMeetingList();
  }, []);
  const handleToggleRowSelection = (caseId) => {
    setSelectedCases((prev) => {
      if (prev.includes(caseId)) {
        return prev.filter((id) => id !== caseId);
      }
      return [...prev, caseId];
    });
  };
  const handleOpenBulkActionModal = () => {
    const selectedRows = getFilteredData().filter(
      (row) => selectedRowIds.includes(row.id) && isBulkSelectableRow(row),
    );

    if (selectedRows.length === 0) return;

    setActiveRow(selectedRows[0]);
    setActionRows(selectedRows);
    setActionType("send-to-committee-member");
    setQueriesReason("");
    setApproveAmount("");
    setSelectedMeetingId("");
    setActionError("");
    setIsModalOpen(true);
  };

  //   const handleStatusAction = async () => {
  //     if (!actionRows.length || !actionType) return;

  //     if (actionType === "send-to-committee-member" && !selectedMeetingId) {
  //       setActionError("Please select meeting ID");
  //       return;
  //     }

  //     try {
  //       setIsActionLoading(true);

  //       const actionTypeMap = {
  //         "send-to-committee-member": "committee-member",
  //         "send-to-expert-panel": "expert-panel",
  //         "send-to-case-coordinator": "case-coordinator",
  //         approve: "approve",
  //         rejected: "rejected",
  //         queries: "queries",
  //       };

  //       const finalActionType = actionTypeMap[actionType] || actionType;

  //       // const payload = {
  //       //   feedback: queriesReason,     // editor text
  //       //   loginId: user?.id,           // logged user id
  //       //   loginRole: user?.role,           // logged user id
  //       // };
  // const filteredMonthlyPayments = Object.fromEntries(
  //       Object.entries(monthlyPayments).filter(
  //         ([_, value]) =>
  //           value !== "" &&
  //           value !== null &&
  //           value !== undefined &&
  //           Number(value) > 0
  //       )
  //     );

  //       const payload = {
  //         feedback: queriesReason,
  //         loginId: user?.id,
  //         loginRole: user?.role,
  //         ...(actionType === "send-to-committee-member" && {
  //           meeting_id: selectedMeetingId,
  //         }),
  //         ...(actionType === "approve" && {
  //           approve_amount: approveAmount,
  //         }),
  //          monthly_payments: filteredMonthlyPayments,

  //       // OPTIONAL
  //       total_monthly_amount: totalMonthlyAmount,
  //       };

  //       await Promise.all(
  //         actionRows.map((row) =>
  //           axios.put(
  //             `${API}/api/assistance/status/${finalActionType}/${row.id}`,
  //             payload,
  //           ),
  //         ),
  //       );

  //       await fetchFamilyAccounting();
  //       setMonthlyPayments({});
  //       setSelectedRowIds([]);
  //       handleCloseActionModal();
  //     } catch (error) {
  //       setActionError(
  //         error?.response?.data?.message || "Failed to update status",
  //       );
  //     } finally {
  //       setIsActionLoading(false);
  //     }
  //   };

  // const getFilteredData = () => {
  //   const normalizedRole = role.toLowerCase();
  //   const expertPanelType = getExpertPanelAssistanceType(normalizedRole);

  //   return tableData.filter((row) => {
  //     const status = normalizeWorkflowValue(row.status);
  //     const rowType = normalizeWorkflowValue(row.assistance_type);

  //     if (normalizedRole === "staff") {
  //       return status === "queries";
  //     }

  //     if (normalizedRole === "karyakarta") {
  //       return status === "pending" || status === "queries";
  //     }

  //     // if (normalizedRole === "case-coordinator") {
  //     //   return true; // sab dikhana hai
  //     // }

  //     if (normalizedRole === "committee-member") {
  //       return status === "committee member";
  //     }

  //     if (
  //       normalizedRole === "expert-panel" ||
  //       normalizedRole.startsWith("expert-panel-")
  //     ) {
  //       const isInExpertPanelStatus = status === "expert panel";
  //       if (!isInExpertPanelStatus) return false;
  //       if (!expertPanelType) return true;

  //       if (expertPanelType === "education") {
  //         return rowType === "education" || rowType === "educations";
  //       }
  //       return rowType === expertPanelType;
  //     }

  //     // return false;

  //     return true;
  //   });
  // };
  // const handleStatusAction = async () => {
  //   if (!actionRows.length || !actionType) return;

  //   if (actionType === "send-to-committee-member" && !selectedMeetingId) {
  //     setActionError("Please select meeting ID");
  //     return;
  //   }

  //   try {
  //     setIsActionLoading(true);

  //     const actionTypeMap = {
  //       "send-to-committee-member": "committee-member",
  //       "send-to-expert-panel": "expert-panel",
  //       "send-to-case-coordinator": "case-coordinator",
  //       approve: "approve",
  //       rejected: "rejected",
  //       queries: "queries",
  //     };

  //     const finalActionType = actionTypeMap[actionType] || actionType;

  //     // FILTER ONLY VALID MONTHLY PAYMENTS
  //     const filteredMonthlyPayments = Object.fromEntries(
  //       Object.entries(monthlyPayments).filter(
  //         ([_, value]) =>
  //           value !== "" &&
  //           value !== null &&
  //           value !== undefined &&
  //           Number(value) > 0,
  //       ),
  //     );

  //     // MANAGE MONTHLY PAYMENT FIELDS
  //     // EACH PAYMENT DEFAULT STATUS = "pending"
  //     const formattedMonthlyPayments = Object.entries(
  //       filteredMonthlyPayments,
  //     ).map(([month, amount]) => ({
  //       month,
  //       amount: Number(amount),
  //       status: "pending",
  //     }));

  //     // TOTAL MONTHLY AMOUNT
  //     const totalMonthlyAmount = formattedMonthlyPayments.reduce(
  //       (sum, item) => sum + Number(item.amount || 0),
  //       0,
  //     );

  //     const payload = {
  //       feedback: queriesReason,
  //       loginId: user?.id,
  //       loginRole: user?.role,

  //       ...(actionType === "send-to-committee-member" && {
  //         meeting_id: selectedMeetingId,
  //       }),

  //       ...(actionType === "approve" && {
  //         approve_amount: approveAmount,
  //       }),

  //       // MONTHLY PAYMENTS ARRAY
  //       monthly_payments: formattedMonthlyPayments,

  //       // TOTAL
  //       total_monthly_amount: totalMonthlyAmount,
  //     };

  //     await Promise.all(
  //       actionRows.map((row) =>
  //         axios.put(
  //           `${API}/api/assistance/status/${finalActionType}/${row.id}`,
  //           payload,
  //         ),
  //       ),
  //     );

  //     await fetchFamilyAccounting();

  //     // RESET STATES
  //     setMonthlyPayments({});
  //     setSelectedRowIds([]);
  //     handleCloseActionModal();
  //   } catch (error) {
  //     setActionError(
  //       error?.response?.data?.message || "Failed to update status",
  //     );
  //   } finally {
  //     setIsActionLoading(false);
  //   }
  // };

  const handleStatusAction = async () => {
    if (!actionRows.length || !actionType) return;

    try {
      setIsActionLoading(true);

      const actionTypeMap = {
        "send-to-committee-member": "committee-member",

        "send-to-expert-panel": "expert-panel",

        "send-to-case-coordinator": "case-coordinator",

        approve: "approve",
        rejected: "rejected",
        queries: "queries",
      };

      const finalActionType = actionTypeMap[actionType] || actionType;

      // ==========================================
      // FILTER MONTHLY PAYMENTS
      // ==========================================
      const filteredMonthlyPayments = Object.fromEntries(
        Object.entries(monthlyPayments).filter(
          ([_, value]) =>
            value !== "" &&
            value !== null &&
            value !== undefined &&
            Number(value) > 0,
        ),
      );

      // ==========================================
      // FORMAT PAYMENTS
      // ==========================================
      const formattedMonthlyPayments = Object.entries(
        filteredMonthlyPayments,
      ).map(([month, amount]) => ({
        month,
        amount: Number(amount),
        status: "pending",
      }));

      // ==========================================
      // TOTAL
      // ==========================================
      const totalMonthlyAmount = formattedMonthlyPayments.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      );

      const payload = {
        feedback: queriesReason,
        loginId: user?.id,
        loginRole: user?.role,

        ...(actionType === "send-to-committee-member" && {
          meeting_id: selectedMeetingId,
        }),

        ...(actionType === "approve" && {
          approve_amount: approveAmount,
        }),

        monthly_payments: formattedMonthlyPayments,

        total_monthly_amount: totalMonthlyAmount,
      };

      const responses = await Promise.all(
        actionRows.map((row) =>
          axios.put(
            `${API}/api/assistance/status/${finalActionType}/${row.id}`,
            payload,
            {
              responseType: "blob", // IMPORTANT
            },
          ),
        ),
      );

      // ==========================================
      // AUTO DOWNLOAD PDF
      // ==========================================
      if (actionType === "approve") {
        responses.forEach((response, index) => {
          // CREATE FILE URL
          const fileURL = window.URL.createObjectURL(
            new Blob([response.data], {
              type: "application/pdf",
            }),
          );

          // CREATE DOWNLOAD LINK
          const link = document.createElement("a");

          link.href = fileURL;

          link.setAttribute(
            "download",
            `Sanction_Letter_${actionRows[index].id}.pdf`,
          );

          document.body.appendChild(link);

          link.click();

          link.remove();

          // CLEAN URL
          window.URL.revokeObjectURL(fileURL);
        });
      }

      await fetchFamilyAccounting();

      // ==========================================
      // RESET
      // ==========================================
      setMonthlyPayments({});
      setSelectedRowIds([]);
      handleCloseActionModal();
    } catch (error) {
      console.log(error);

      setActionError(
        error?.response?.data?.message || "Failed to update status",
      );
    } finally {
      setIsActionLoading(false);
    }
  };
  const getFilteredData = () => {
    const normalizedRole = role.toLowerCase();
    const expertPanelType = getExpertPanelAssistanceType(normalizedRole);

    return tableData.filter((row) => {
      const status = normalizeWorkflowValue(row.status);
      const rowType = normalizeWorkflowValue(row.assistance_type);

      if (normalizedRole === "staff") {
        return status === "queries";
      }

      if (normalizedRole === "karyakarta") {
        return status === "pending" || status === "queries";
      }

      // if (normalizedRole === "case-coordinator") {
      //   return true;
      //   // return status === "pending" || status === "case coordinator";
      // }

      if (normalizedRole === "committee-member") {
        return status === "committee member";
      }

      if (
        normalizedRole === "expert-panel" ||
        normalizedRole.startsWith("expert-panel-")
      ) {
        if (status !== "expert panel") return false;

        if (!expertPanelType) return true;

        if (expertPanelType === "education") {
          return rowType === "education" || rowType === "educations";
        }

        return rowType === expertPanelType;
      }

      return true;
    });
  };

  const actionTitleMap = {
    approve: "Approved Request",
    rejected: "Rejected Request",
    queries: "Raise Query",
    "send-to-committee-member": "Send To Committee Member",
    "send-to-expert-panel": "Send To Expert Panel",
    "send-to-case-coordinator": "Send To Case Coordinator",
  };

  const actionButtonLabelMap = {
    approve: "Approve",
    rejected: "Reject",
    queries: "Submit Query",
    "send-to-committee-member": "Send",
    "send-to-expert-panel": "Send",
    "send-to-case-coordinator": "Send",
  };

  const getFeedbackHistory = (row) => parseFeedbackHistory(row?.feedback);

  const getQueryText = (row) => {
    const feedbackHistory = getFeedbackHistory(row);
    const latestFeedback = feedbackHistory[feedbackHistory.length - 1];
    return asDisplayText(
      latestFeedback?.feedback ||
        row?.queriesReason ||
        row?.query_reason ||
        row?.remark ||
        row?.remarks,
      "",
    );
  };

  const getRowActionKey = (row, index) =>
    [
      row?.id,
      row?.diksharthi_id,
      row?.relation,
      row?.assistance_type,
      row?.case_id,
      row?.sl_id,
      index,
    ]
      .map((value) => String(value ?? ""))
      .join("__");

  const filteredData = getFilteredData();
  console.log(filteredData, "filteredData");
  // const filteredData = tableData;

  const selectedPendingCount = filteredData.filter(
    (row) => selectedRowIds.includes(row.id) && isBulkSelectableRow(row),
  ).length;

  const renderDefaultTable = () => (
    <div className="mt-8 overflow-visible rounded-lg border border-blue-400 shadow-sm">
      {/* {isCaseCoordinator && selectedPendingCount > 0 && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">
            {selectedPendingCount} pending case
            {selectedPendingCount > 1 ? "s" : ""} selected
          </p>
          <button
            type="button"
            onClick={handleOpenBulkActionModal}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Send to Committee Member
          </button>

         
        </div>
      )} */}

    {selectedCases?.length > 0 && (
  <button
    onClick={() => setShowMeetingModal(true)}
    className="px-4 py-2 bg-blue-600 text-white rounded"
  >
    Send To Meeting ({selectedCases.length})
  </button>
)}
      <div className=" overflow-y-visible">
        <table className="w-full h-9xl text-left border-collapse bg-white">
          <thead>
            <tr className="bg-[#fdf2d7]">
              {isCaseCoordinator && (
                <th className="p-4 font-semibold text-slate-700 border-b text-center">
                  Select
                </th>
              )}
              <th className="p-4 font-semibold text-slate-700 border-b">
                Assistant Id
              </th>
              {/* <th className="p-4 font-semibold text-slate-700 border-b">S.L. ID</th> */}
              <th className="p-4 font-semibold text-slate-700 border-b">
                M.S. Name
              </th>
              <th className="p-4 font-semibold text-slate-700 border-b">
                Family Member
              </th>
              <th className="p-4 font-semibold text-slate-700 border-b">
                Relation
              </th>
              <th className="p-4 font-semibold text-slate-700 border-b">
                Assistance
              </th>
              <th className="p-4 font-semibold text-slate-700 border-b">
                F.A.N ID
              </th>
              <th className="p-4 font-semibold text-slate-700 border-b">
                Status
              </th>
              <th className="p-4 font-semibold text-slate-700 border-b text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((row, index) => {
              const hasQuery =
                getFeedbackHistory(row).length > 0 ||
                Boolean(getQueryText(row));
              const rowActionKey = getRowActionKey(row, index);
              const isOpen = openDropdownId === rowActionKey;
              const allowedActions = getAllowedActions({
                role,
                status: row.status,
              });

              const canTakeAction = allowedActions.length > 0;
              const isSelectable = isBulkSelectableRow(row);
              const isChecked = selectedRowIds.includes(row.id);

              return (
                <tr
                  key={rowActionKey}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {isCaseCoordinator && (
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedCases.includes(row.id)}
                        disabled={!isSelectable}
                        onChange={() => handleToggleRowSelection(row.id)}
                        className="h-4 w-4 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </td>
                  )}
                  <td className="p-4 text-slate-600">
                    {asDisplayText(row.assistance_code)}
                  </td>
                  {/* <td className="p-4 text-slate-600">{asDisplayText(row.sl_id)}</td> */}
                  <td className="p-4 text-slate-600">
                    {asDisplayText(row.diksharthi_name)} (M.S. ID :-
                    {asDisplayText(row.diksharthi_id)})
                  </td>
                  <td className="p-4 text-slate-600">
                    {asDisplayText(row.family_member_name)}
                  </td>
                  <td className="p-4 text-slate-600">
                    {asDisplayText(row.relation_key)}
                  </td>
                  <td className="p-4 text-slate-600">
                    {asDisplayText(row.assistance_type)}
                  </td>
                  <td className="p-4 text-slate-600">
                    {asDisplayText(row.fan_id)}
                  </td>
                  <td
                    className={`p-4 font-semibold ${getStatusToneClass(row.status)}`}
                  >
                    {/* {capitalizeFirst(asDisplayText(row.status))} */}
                    {getStatusLabel(asDisplayText(row.status))}
                  </td>

                  <td className="relative p-4 text-center">
                    <div
                      ref={isOpen ? dropdownContainerRef : null}
                      className="inline-block"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(isOpen ? null : rowActionKey);
                        }}
                        className="inline-block rounded-full p-2 transition-colors hover:bg-slate-100"
                      >
                        <EllipsisVertical
                          size={20}
                          className="text-slate-600"
                        />
                      </button>

                      {isOpen && (
                        <div className="absolute right-4 top-12 z-[120] w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                navigate("/request-details", {
                                  state: {
                                    assistanceId: row.id,
                                  },
                                });

                                setOpenDropdownId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Eye size={16} className="text-yellow-500" />
                              View Details
                            </button>
                            <button
                              onClick={() =>
                                handleDownloadApplicationPdf(row.diksharthi_id)
                              }
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Download size={16} />
                              Download PDF
                            </button>

                            {user?.role !== "committee-member" &&
                              user?.role !== "karyakarta" && (
                                <button
                                  onClick={() => {
                                    handleAssignBank(row);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  <Eye size={16} className="text-yellow-500" />
                                  Assign Bank Account
                                </button>
                              )}

                            {(hasQuery || !isStaff) && (
                              <button
                                onClick={() => {
                                  setViewQueryRow(row);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <FileText size={16} className="text-blue-600" />{" "}
                                View Feedback
                              </button>
                            )}

                            {row?.status === "expert-panel" && (
                              <button
                                onClick={() => {
                                  handleOpenActionModal(row, "approve");
                                  setOpenDropdownId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition-colors"
                              >
                                <CheckCircle size={16} /> Approved
                              </button>
                            )}

                            {row?.status === "Received by Expert Panel" && (
                              <button
                                onClick={() => {
                                  handleOpenActionModal(row, "queries");
                                  setOpenDropdownId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <FileText size={16} /> Query
                              </button>
                            )}

                            {row?.status === "expert-panel" && (
                              <button
                                onClick={() => {
                                  handleOpenActionModal(row, "queries");
                                  setOpenDropdownId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <FileText size={16} /> Query
                              </button>
                            )}

                            {row?.status === "expert-panel" && (
                              <button
                                onClick={() => {
                                  handleOpenActionModal(row, "rejected");
                                  setOpenDropdownId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <XCircle size={16} /> Reject Request
                              </button>
                            )}
                            {user?.role !== "committee-member" &&
                              row?.status === "committee-member" &&
                              row?.committee_status === "approved" && (
                                <button
                                  onClick={() => {
                                    handleOpenActionModal(row, "approve");
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition-colors"
                                >
                                  <CheckCircle size={16} /> Approved
                                </button>
                              )}

                            {user?.role !== "committee-member" &&
                              canTakeAction && (
                                <>
                                  <hr className="my-1 border-slate-100" />
                                  {allowedActions.includes("approve") && (
                                    <button
                                      onClick={() => {
                                        handleOpenActionModal(row, "approve");
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition-colors"
                                    >
                                      <CheckCircle size={16} /> Approved
                                    </button>
                                  )}
                                  {allowedActions.includes("queries") && (
                                    <button
                                      onClick={() => {
                                        handleOpenActionModal(row, "queries");
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                      <FileText size={16} /> Query
                                    </button>
                                  )}

                                  {allowedActions.includes(
                                    "send-to-committee-member",
                                  ) && (
                                    <button
                                      onClick={() => {
                                        handleOpenActionModal(
                                          row,
                                          "send-to-committee-member",
                                        );
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    >
                                      <FileText size={16} /> Send to Committee
                                    </button>
                                  )}
                                  {allowedActions.includes(
                                    "send-to-expert-panel",
                                  ) && (
                                    <button
                                      onClick={() => {
                                        handleOpenActionModal(
                                          row,
                                          "send-to-expert-panel",
                                        );
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-violet-600 hover:bg-violet-50 transition-colors"
                                    >
                                      <FileText size={16} /> Send to Expert
                                    </button>
                                  )}

                                  {allowedActions.includes(
                                    "send-to-case-coordinator",
                                  ) && (
                                    <button
                                      onClick={() => {
                                        handleOpenActionModal(
                                          row,
                                          "send-to-case-coordinator",
                                        );
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    >
                                      <FileText size={16} /> Send to Case
                                      Coordinator
                                    </button>
                                  )}

                                  {!allowedActions.includes(
                                    "send-to-expert-panel",
                                  ) && (
                                    <button
                                      onClick={() => {
                                        handleOpenActionModal(
                                          row,
                                          "send-to-expert-panel",
                                        );
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-violet-600 hover:bg-violet-50 transition-colors"
                                    >
                                      <FileText size={16} /> Send to Expert
                                    </button>
                                  )}

                                  {allowedActions.includes("rejected") && (
                                    <button
                                      onClick={() => {
                                        handleOpenActionModal(row, "rejected");
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <XCircle size={16} /> Reject Request
                                    </button>
                                  )}
                                </>
                              )}

                            {role === "committee-member" && (
                              <button
                                className={`rounded-lg text-sm px-2 py-1 text-white w-full ${
                                  row?.committee_status === "pending"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gray-400 cursor-not-allowed"
                                }`}
                                disabled={row?.committee_status !== "pending"}
                                onClick={() => handleOpenApprovalModal(row.id)}
                              >
                                {row?.committee_status === "pending"
                                  ? "Approval"
                                  : row?.committee_status === "approved"
                                    ? "Approved"
                                    : "Rejected"}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 py-1.5 border-t bg-slate-50">
        <p className="text-sm text-slate-600">
          Page <span className="font-semibold">{page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  const groupByRelation = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const relation = item.relation || "unknown";

      if (!grouped[relation]) {
        grouped[relation] = {
          relation,
          memberName:
            `${item.family_member_firstName || ""} ${item.family_member_lastName || ""}`.trim(),
          diksharthiName: item?.sadhu_sadhvi_name || "",
          rows: [],
          assistanceTypes: new Set(),
        };
      }

      grouped[relation].rows.push(item);
      grouped[relation].assistanceTypes.add(item?.assistance_type || "General");
    });

    return Object.values(grouped).map((entry) => ({
      ...entry,
      assistanceTypes: Array.from(entry.assistanceTypes),
    }));
  };

  // =====================================
  // VIEW MEMBER
  // =====================================

  const handleViewMember = (member) => {
    navigate("/family-Assistance-details", {
      state: {
        selectedMember: member,

        isEditMode: false,
      },
    });
  };

  // =====================================
  // EDIT MEMBER
  // =====================================

  const handleEditMember = (member) => {
    navigate("/family-Assistance-details", {
      state: {
        selectedMember: member,

        isEditMode: true,
      },
    });
  };
  return (
    <div className="flex h-screen bg-white">
      <main className="flex-1 p-12 overflow-y-auto">
        {/* Search Card Section */}
        <div className="  flex flex-col items-center mb-10">
          <div className="flex gap-8 mb-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="searchType"
                className="w-4 h-4 accent-blue-600"
                checked={searchType === "sadhu"}
                onChange={() => {
                  setSearchType("sadhu");
                  setSearchText("");
                  setResults([]);
                  setSelectedSadhu(null);
                  setFamilyDetails([]);
                }}
              />
              <span className="font-medium text-slate-700">
                Sadhu/Sadhvi Name
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="searchType"
                className="w-4 h-4 accent-blue-600"
                checked={searchType === "family"}
                onChange={() => {
                  setSearchType("family");
                  setSearchText("");
                  setResults([]);
                  setSelectedSadhu(null);
                  setFamilyDetails([]);
                }}
              />
              <span className="font-medium text-slate-700">
                Family Member Name
              </span>
            </label>
          </div>

          <div className="relative w-full max-w-2xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={24}
            />
            <input
              type="text"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={
                searchType === "sadhu"
                  ? "Start typing Sadhu/Sadhvi Name..."
                  : "Search Family Member..."
              }
              className="w-full pl-14 pr-6 py-4 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-lg"
            />

            {/* {results.length > 0 && (
              <div className="w-full max-w-2xl mt-4 border rounded-lg shadow bg-white absolute z-10 top-[50px]">
                {results.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSadhu(item)}
                    className="p-4 border-b cursor-pointer hover:bg-slate-50"
                  >
                    <p className="font-medium text-slate-700">
                      {item.sadhu_sadhvi_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {searchType === "family"
                        ? `${asDisplayText(item.family_member_firstName)} ${asDisplayText(item.family_member_lastName, "")}`.trim() +
                          ` (${asDisplayText(item.relation)})`
                        : asDisplayText(item.diksharthi_code)}
                    </p>
                  </div>
                ))}
              </div>
            )} */}

            {results.length > 0 && (
              <div className="absolute top-[60px] z-20 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="max-h-[400px] overflow-y-auto">
                  {results.map((item, index) => {
                    // =========================================
                    // FAMILY MEMBER NAME
                    // =========================================

                    const familyName = `
          ${item?.family_member_details?.first_name || ""}
          ${item?.family_member_details?.last_name || ""}
        `.trim();

                    // =========================================
                    // RELATION
                    // =========================================

                    const relation = item?.relation_key || "-";

                    // =========================================
                    // PHOTO
                    // =========================================

                    const photo = item?.family_member_details?.photo_url;

                    return (
                      <div
                        key={item?.id || index}
                        onClick={() => handleSelectSadhu(item)}
                        className="
              flex items-start gap-4
              border-b border-slate-100
              p-4 cursor-pointer
              transition-all duration-200
              hover:bg-blue-50
            "
                      >
                        {/* =====================================
                IMAGE
            ===================================== */}

                        <div
                          className="
                h-14 w-14
                rounded-full
                overflow-hidden
                border border-slate-200
                bg-slate-100
                flex items-center justify-center
                shrink-0
              "
                        >
                          {photo ? (
                            <img
                              src={photo}
                              alt="profile"
                              className="
                    h-full
                    w-full
                    object-cover
                  "
                            />
                          ) : (
                            <div
                              className="
                    text-lg font-semibold
                    text-slate-500
                  "
                            >
                              {item?.diksharthi_name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* =====================================
                CONTENT
            ===================================== */}

                        <div className="flex-1 min-w-0">
                          {/* ===================================
                  SADHU NAME
              =================================== */}

                          <h3
                            className="
                  text-[15px]
                  font-semibold
                  text-slate-800
                  truncate
                "
                          >
                            {item?.diksharthi_name || "-"}
                          </h3>

                          {/* ===================================
                  FAN ID
              =================================== */}

                          <p
                            className="
                  mt-0.5
                  text-xs
                  font-medium
                  text-blue-600
                "
                          >
                            {item?.fan_id || "-"}
                          </p>

                          {/* ===================================
                  FAMILY SEARCH
              =================================== */}

                          {searchType === "family" && (
                            <div className="mt-2">
                              <p
                                className="
                      text-sm
                      text-slate-700
                    "
                              >
                                <span className="font-medium">Family :</span>{" "}
                                {familyName || "-"}
                              </p>

                              <p
                                className="
                      text-xs
                      text-slate-500
                    "
                              >
                                Relation : {relation}
                              </p>
                            </div>
                          )}

                          {/* ===================================
                  SADHU SEARCH
              =================================== */}

                          {searchType === "sadhu" && (
                            <div className="mt-2">
                              <p
                                className="
                      text-sm
                      text-slate-600
                    "
                              >
                                Assistance :{" "}
                                <span className="font-medium">
                                  {item?.assistance_type || "-"}
                                </span>
                              </p>

                              <p
                                className="
                      text-xs
                      text-slate-500
                    "
                              >
                                SL ID : {item?.sl_id || "-"}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* =====================================
                STATUS
            ===================================== */}

                        <div className="shrink-0">
                          <span
                            className={`
                  inline-flex
                  items-center
                  rounded-full
                  px-3 py-1
                  text-xs font-semibold
                  capitalize

                  ${
                    item?.status?.toLowerCase() === "approve"
                      ? "bg-green-100 text-green-700"
                      : item?.status?.toLowerCase() === "reject"
                        ? "bg-red-100 text-red-700"
                        : item?.status?.toLowerCase() === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-700"
                  }
                `}
                          >
                            {item?.status || "-"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedSadhu && (
          <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex gap-5">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedSadhu.sadhu_sadhvi_name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Diksharthi ID:{" "}
                    {asDisplayText(
                      selectedSadhu?.diksharthi_id || selectedSadhu?.id,
                    )}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Diksharthi sadhu sadhvi name:{" "}
                    {selectedSadhu?.diksharthi_name}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  {/* VIEW */}

                  <button
                    onClick={() => handleViewMember(familyDetails?.[0])}
                    className="
      px-4 py-2.5
      rounded-xl
      bg-blue-600
      hover:bg-blue-700
      text-white
      text-sm
      font-medium
      transition-all
    "
                  >
                    View
                  </button>

                  {/* EDIT */}

                  <button
                    onClick={() => handleEditMember(familyDetails?.[0])}
                    className="
      px-4 py-2.5
      rounded-xl
      bg-amber-500
      hover:bg-amber-600
      text-white
      text-sm
      font-medium
      transition-all
    "
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Family Members
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    View and manage family member assistance
                  </p>
                </div>

                <div
                  className="
        px-3 py-1.5
        rounded-full
        bg-blue-50
        text-blue-700
        text-sm
        font-semibold
      "
                >
                  {familyDetails?.length || 0} Members
                </div>
              </div>

              {familyDetails.length === 0 ? (
                <div
                  className="
        flex flex-col items-center justify-center
        py-14
      "
                >
                  <div
                    className="
          w-16 h-16
          rounded-full
          bg-slate-100
          flex items-center justify-center
          text-slate-400
          text-2xl
          mb-4
        "
                  >
                    👨‍👩‍👦
                  </div>

                  <p className="text-slate-600 font-medium">
                    No Family Members Found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {familyDetails?.map((member, index) => {
                    const relation = member?.relation_key || "-";

                    const photo = member?.photo;

                    const fullName = `
        ${member?.first_name || ""}
        ${member?.last_name || ""}
        `.trim();

                    const mediclaim = member?.has_mediclaim_policy || "No";

                    const assistance = member?.need_assistance || "No";

                    return (
                      <div
                        key={member?.id || index}
                        className="
            group
            border border-slate-200
            rounded-2xl
            p-5
            hover:shadow-md
            hover:border-blue-200
            transition-all duration-200
            bg-white
          "
                      >
                        <div className="flex items-center justify-between gap-4">
                          {/* ================================= */}
                          {/* LEFT */}
                          {/* ================================= */}

                          <div className="flex items-center gap-4">
                            {/* IMAGE */}

                            <div
                              className="
                  h-14 w-14
                  rounded-full
                  overflow-hidden
                  bg-slate-100
                  border
                  flex items-center justify-center
                  shrink-0
                "
                            >
                              {photo ? (
                                <img
                                  src={photo}
                                  alt="member"
                                  className="
                      h-full w-full
                      object-cover
                    "
                                />
                              ) : (
                                <span
                                  className="
                      text-lg
                      font-bold
                      text-slate-500
                    "
                                >
                                  {fullName?.charAt(0)?.toUpperCase() || "F"}
                                </span>
                              )}
                            </div>

                            {/* DETAILS */}

                            <div>
                              <h4
                                className="
                    text-[16px]
                    font-semibold
                    text-slate-800
                  "
                              >
                                {fullName || "N/A"}
                              </h4>

                              <div
                                className="
                    flex flex-wrap
                    items-center
                    gap-2
                    mt-2
                  "
                              >
                                {/* RELATION */}

                                <span
                                  className="
                      text-xs
                      px-2.5 py-1
                      rounded-full
                      bg-slate-100
                      text-slate-700
                      font-medium
                    "
                                >
                                  {relation}
                                </span>

                                {/* ASSISTANCE */}

                                <span
                                  className={`
                      text-xs
                      px-2.5 py-1
                      rounded-full
                      font-medium

                      ${
                        assistance === "Yes"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }
                    `}
                                >
                                  Assistance :{assistance}
                                </span>

                                {member?.is_primary === 1 && (
                                  <span
                                    className="
                        text-xs
                        px-2.5 py-1
                        rounded-full
                        bg-green-100
                        text-green-700
                        font-medium
                      "
                                  >
                                    Head Of The Family
                                  </span>
                                )}
                              </div>

                              {/* EXTRA DETAILS */}

                              <div className="mt-3 space-y-1">
                                <p className="text-sm text-slate-600">
                                  <span className="font-medium">Aadhaar :</span>{" "}
                                  {member?.aadhar_number || "N/A"}
                                </p>

                                <p className="text-sm text-slate-600">
                                  <span className="font-medium">Mobile :</span>{" "}
                                  {member?.mobile_number || "N/A"}
                                </p>

                                <p className="text-sm text-slate-600">
                                  <span className="font-medium">Age :</span>{" "}
                                  {member?.age || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {renderDefaultTable()}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              {/* HEADER */}
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h3 className="text-xl font-bold text-slate-800">
                  {actionTitleMap[actionType] || "Confirm Action"}
                </h3>

                <button
                  onClick={handleCloseActionModal}
                  className="rounded-full p-1 hover:bg-slate-100"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              {/* BODY */}
              <div className="space-y-6 px-8 py-6">
                {/* FAMILY MEMBER */}
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-slate-700">
                    {asDisplayText(activeRow?.family_member_name)}
                  </h4>
                </div>

                {/* APPROVE AMOUNT */}
                {actionType === "approve" && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Approve Amount
                      </label>

                      <input
                        type="number"
                        value={approveAmount}
                        onChange={(e) => setApproveAmount(e.target.value)}
                        placeholder="Enter approve amount"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          From Year
                        </label>

                        <select
                          value={fromYear}
                          onChange={(e) => {
                            setFromYear(e.target.value);
                            setFromMonth("");
                          }}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                        >
                          <option value="">Select Year</option>

                          {yearOptions.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* FROM MONTH */}
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          From Month
                        </label>

                        <select
                          value={fromMonth}
                          onChange={(e) => setFromMonth(e.target.value)}
                          disabled={!fromYear}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
                        >
                          <option value="">Select Month</option>

                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* TO YEAR */}
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          To Year
                        </label>

                        <select
                          value={toYear}
                          onChange={(e) => {
                            setToYear(e.target.value);
                            setToMonth("");
                          }}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                        >
                          <option value="">Select Year</option>

                          {yearOptions.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* TO MONTH */}
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          To Month
                        </label>

                        <select
                          value={toMonth}
                          onChange={(e) => setToMonth(e.target.value)}
                          disabled={!toYear}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
                        >
                          <option value="">Select Month</option>

                          {months.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {monthYearList.length > 0 && (
                      <div className="overflow-hidden rounded-2xl border border-slate-200">
                        {/* TABLE HEADER */}
                        <div className="grid grid-cols-3 bg-slate-100 px-4 py-3 font-semibold text-slate-700">
                          <div>Month</div>
                          <div>Year</div>
                          <div>Monthly Payment Amount</div>
                        </div>

                        {/* TABLE BODY */}
                        <div className="max-h-[400px] overflow-y-auto">
                          {monthYearList.map((item, index) => (
                            <div
                              key={item.key}
                              className={`grid grid-cols-3 items-center gap-4 border-t px-4 py-3 ${
                                index % 2 === 0 ? "bg-white" : "bg-slate-50"
                              }`}
                            >
                              {/* MONTH */}
                              <div className="font-medium text-slate-700">
                                {item.month}
                              </div>

                              {/* YEAR */}
                              <div className="text-slate-600">{item.year}</div>

                              {/* AMOUNT */}
                              <div>
                                <input
                                  type="number"
                                  value={monthlyPayments[item.key] || ""}
                                  disabled={index !== 0}
                                  onChange={(e) =>
                                    handleMonthlyAmountChange(
                                      item.key,
                                      e.target.value,
                                    )
                                  }
                                  className={`w-full rounded-lg border px-3 py-2 outline-none ${
                                    index !== 0
                                      ? "bg-slate-100 cursor-not-allowed"
                                      : "border-slate-300 focus:border-blue-500"
                                  }`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* TOTAL */}
                        <div className="flex items-center justify-between border-t bg-blue-50 px-5 py-4">
                          <span className="text-lg font-bold text-slate-700">
                            Total Monthly Amount
                          </span>

                          <span className="text-2xl font-bold text-blue-700">
                            ₹ {totalMonthlyAmount}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Feedback
                  </label>

                  <JoditEditor
                    value={queriesReason}
                    config={queryEditorConfig}
                    onBlur={(newValue) => setQueriesReason(newValue)}
                    onChange={() => {}}
                  />
                </div>

                {/* ERROR */}
                {actionError && (
                  <p className="text-center text-sm text-red-600">
                    {actionError}
                  </p>
                )}
              </div>

              {/* FOOTER */}
              <div className="flex gap-3 border-t p-6">
                <button
                  onClick={handleCloseActionModal}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleStatusAction}
                  disabled={isActionLoading}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                >
                  {isActionLoading
                    ? "Processing..."
                    : actionButtonLabelMap[actionType] || "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
        {showMeetingModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[500px]">
              <h2 className="text-lg font-semibold mb-4">
                Send Cases To Meeting
              </h2>

              {/* Selected Cases */}
              <div className="mb-4">
                <label className="font-medium block mb-2">Selected Cases</label>

                <div className="border rounded p-2 max-h-40 overflow-auto">
                  {selectedCases.map((id) => (
                    <div key={id}>Case ID : {id}</div>
                  ))}
                </div>
              </div>

              {/* Meeting Dropdown */}
              <div className="mb-4">
                <label className="font-medium block mb-2">Select Meeting</label>

                <select
                  value={selectedMeetingId}
                  onChange={(e) => setSelectedMeetingId(e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="">Select Meeting</option>

                  {meetingList.map((meeting) => (
                    <option key={meeting.id} value={meeting.id}>
                      Meeting #{meeting.meeting_no} -{" "}
                      {new Date(meeting.meeting_date).toLocaleDateString(
                        "en-GB",
                      )}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowMeetingModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSendToMeeting}
                  disabled={!selectedMeetingId}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
        {approvalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              {/* Heading */}
              <div className="mb-5 border-b pb-3">
                <h2 className="text-xl font-bold text-gray-800">
                  Committee Member Approval
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Please select application status.
                </p>
              </div>

              {/* Status Dropdown */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select Status
                </label>

                <select
                  value={approvalStatus}
                  onChange={(e) => setApprovalStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                >
                  <option value="">-- Select Status --</option>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              {approvalStatus === "approved" && (
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Approved Amount
                  </label>

                  <input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    placeholder="Enter approved amount"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              )}
              {/* Assistance ID Preview */}
              <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                Assistance ID: <strong>{selectedAssistanceId}</strong>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
                  onClick={() => {
                    setApprovalModal(false);
                    setApprovalStatus("");
                    setSelectedAssistanceId(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleCommitteeApproval}
                  disabled={
                    !approvalStatus ||
                    (approvalStatus === "approved" && !approvedAmount)
                  }
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Assign Bank Account
                  </h2>

                  {selectedRow?.approve_amount && (
                    <p className="mt-1 text-sm text-slate-500">
                      Approved Amount :
                      <span className="ml-1 font-semibold text-green-600">
                        ₹{selectedRow?.approve_amount}
                      </span>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="text-slate-500 hover:text-red-500 text-xl"
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="max-h-[80vh] overflow-y-auto p-6">
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Approved Amount
                    </h3>

                    <span className="rounded-full bg-green-600 px-4 py-1 text-sm font-semibold text-white">
                      ₹{selectedRow?.approve_amount || 0}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    Total Monthly Amount :
                    <span className="ml-1 font-semibold">
                      ₹{selectedRow?.total_monthly_amount || 0}
                    </span>
                  </p>
                </div>

                {selectedRow?.monthly_payments?.length > 0 && (
                  <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                    {/* HEADER */}
                    <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
                      <h3 className="text-lg font-semibold text-slate-800">
                        Monthly Payment Plan
                      </h3>

                      <button
                        onClick={handleUpdatePayments}
                        disabled={!selectedPayments.length}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition
          ${
            selectedPayments.length
              ? "bg-blue-600 hover:bg-blue-700"
              : "cursor-not-allowed bg-gray-400"
          }
        `}
                      >
                        Update Selected
                      </button>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-100">
                          <tr>
                            {/* CHECKBOX */}
                            <th className="px-4 py-3">
                              {/* <input
                                type="checkbox"
                                checked={
                                  selectedPayments.length ===
                                    selectedRow?.monthly_payments?.length &&
                                  selectedRow?.monthly_payments?.length > 0
                                }
                                onChange={handleSelectAllPayments}
                                className="h-4 w-4 cursor-pointer"
                              /> */}
                            </th>

                            {/* MONTH */}
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                              Month
                            </th>

                            {/* AMOUNT */}
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                              Amount
                            </th>

                            {/* STATUS */}
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {selectedRow?.monthly_payments?.map(
                            (payment, index) => (
                              <tr
                                key={index}
                                className={`border-t transition hover:bg-slate-50
                ${selectedPayments.includes(index) ? "bg-blue-50" : ""}
              `}
                              >
                                {/* CHECKBOX */}
                                {/* CHECKBOX */}
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    disabled={payment?.status !== "pending"}
                                    checked={selectedPayments.includes(index)}
                                    onChange={() => handleSelectPayment(index)}
                                    className={`h-4 w-4
      ${
        payment?.status !== "pending"
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer"
      }
    `}
                                  />
                                </td>

                                {/* MONTH */}
                                <td className="px-4 py-3 text-sm text-slate-700">
                                  {payment?.month}
                                </td>

                                {/* AMOUNT */}
                                <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                  ₹{payment?.amount}
                                </td>

                                {/* STATUS */}
                                <td className="px-4 py-3">
                                  <div className="flex flex-col gap-1">
                                    <span
                                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize w-fit
        ${
          payment?.status === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : payment?.status === "Sanction"
              ? "bg-blue-100 text-blue-700"
              : payment?.status === "Disbursed"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
        }
      `}
                                    >
                                      {payment?.status || "pending"}
                                    </span>

                                    {/* SHOW DISBURSED DATE */}
                                    {payment?.status === "Disbursed" &&
                                      payment?.disbursed_date && (
                                        <span className="text-[11px] text-slate-500 font-medium">
                                          {new Date(
                                            payment.disbursed_date,
                                          ).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          })}{" "}
                                          |{" "}
                                          {new Date(
                                            payment.disbursed_date,
                                          ).toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      )}
                                  </div>
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ===================================== */}
                {/* BANK SELECTION */}
                {/* ===================================== */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Select Bank Account
                  </label>

                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">Select Bank</option>

                    {bankList.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.bank_name} {bank.account_no} {bank.branch_name}
                      </option>
                    ))}
                  </select>

                  {/* ===================================== */}
                  {/* BANK DETAILS */}
                  {/* ===================================== */}
                  {selectedBank && (
                    <div className="mt-5 rounded-lg border bg-slate-50 p-4">
                      {bankList
                        .filter((bank) => bank.id == selectedBank)
                        .map((bank) => (
                          <div key={bank.id} className="space-y-2 text-sm">
                            <p>
                              <span className="font-semibold">Bank :</span>{" "}
                              {bank.bank_name}
                            </p>

                            <p>
                              <span className="font-semibold">
                                Account Holder :
                              </span>{" "}
                              {bank.account_holder_name}
                            </p>

                            <p>
                              <span className="font-semibold">
                                Account No :
                              </span>{" "}
                              {bank.account_no}
                            </p>

                            <p>
                              <span className="font-semibold">IFSC :</span>{" "}
                              {bank.ifsc_code}
                            </p>

                            <p>
                              <span className="font-semibold">Branch :</span>{" "}
                              {bank.branch_name}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="rounded-lg border px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmitAssignBank}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Assign Bank
                </button>
              </div>
            </div>
          </div>
        )}
        {viewQueryRow &&
          (() => {
            const feedbackHistory = getFeedbackHistory(viewQueryRow);

            return (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
                  {/* MODAL HEADER */}
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        Feedback Details
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Member:{" "}
                        <span className="font-semibold text-blue-600">
                          {asDisplayText(
                            viewQueryRow?.family_member_name ||
                              `${viewQueryRow?.family_member_firstName || ""} ${viewQueryRow?.family_member_lastName || ""}`.trim(),
                          )}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewQueryRow(null)}
                      className="rounded-full p-2 hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* MODAL BODY */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[70vh]">
                    {/* SECTION 1: FEEDBACK HISTORY (Structured) */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Feedback History
                        </h4>
                      </div>

                      {feedbackHistory.length > 0 ? (
                        <div className="space-y-3">
                          {feedbackHistory.map((item, index) => (
                            <div
                              key={`${item?.date || "date"}-${item?.time || "time"}-${index}`}
                              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                            >
                              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                                    item?.status?.toLowerCase() === "pending"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {item?.status?.toLowerCase() ===
                                  "committee-member"
                                    ? "Case Co-ordinator Summary"
                                    : ["approve", "approved"].includes(
                                          item?.status?.toLowerCase(),
                                        )
                                      ? "Approved"
                                      : capitalizeFirst(
                                          asDisplayText(item?.status, "Status"),
                                        )}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                  <Clock size={12} />
                                  {asDisplayText(item?.date, "")}{" "}
                                  {asDisplayText(item?.time, "")}
                                </span>
                              </div>
                              <div
                                className="text-sm text-slate-600 leading-relaxed pl-1 border-l-2 border-slate-100"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    item?.feedback ||
                                    "<p className='italic text-slate-400'>No comments provided.</p>",
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 rounded-xl border border-dashed border-slate-200">
                          <p className="text-sm text-slate-400 italic">
                            No structured history records found.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MODAL FOOTER */}
                  <div className="flex justify-end border-t border-slate-100 px-6 py-4 bg-slate-50/30">
                    <button
                      type="button"
                      onClick={() => setViewQueryRow(null)}
                      className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-6 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
      </main>
    </div>
  );
};

export default QueriesAssistant;
