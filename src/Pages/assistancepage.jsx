import axios from "axios";
import JoditEditor from "jodit-react";
import {
  CheckCircle,
  Eye,
  FileText,
  Search,
  User,
  X,
  XCircle,
  EllipsisVertical,
  Clock
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
  } catch (error) {
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
  const normalizedRole = String(roleValue || "").trim().toLowerCase();
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
  pending: "Pending11",
  approve: "Approve",
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

  if (normalizedStatus === "approve") return "text-green-600";
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

const getStatusLabel = (status) => {
  const normalizedStatus = normalizeWorkflowValue(status);

  if (normalizedStatus === "case coordinator") {
    return "Approve by Expert Panel";
  }

  return capitalizeFirst(status);
};


const getAllowedActions = ({ role, status }) => {
  const normalizedRole = normalizeWorkflowValue(role);
  const normalizedStatus = normalizeWorkflowValue(status);

  // ✅ CASE COORDINATOR
  if (normalizedRole === "case coordinator") {
    if (normalizedStatus === "pending" || normalizedStatus === "queries") {
      return ["approve", "queries", "send-to-committee-member", "rejected", "queries"];
    }

    if (normalizedStatus === "committee member" ) {
      return ["send-to-expert-panel", "rejected", "queries"];
    }
    if ( normalizedStatus === "case coordinator") {
      return ["approve", "rejected", "queries"];
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
      return ["send-to-case-coordinator", "queries"];
    }
  }

  return [];
};

const AssistancePage = () => {
  const { user } = useAuth();
  const [searchType, setSearchType] = useState("sadhu");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [selectedSadhu, setSelectedSadhu] = useState(null);
  const [familyDetails, setFamilyDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [activeRow, setActiveRow] = useState(null);
  const [actionType, setActionType] = useState("");
  const [queriesReason, setQueriesReason] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [queryFile, setQueryFile] = useState(null);
  const [actionError, setActionError] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [viewQueryRow, setViewQueryRow] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownContainerRef = useRef(null);

  const role = String(user?.role || "").toLowerCase();
  const isStaff = role === "staff";
  const isKaryakarta = role === "karyakarta";
  const isCaseCoordinator = role === "case-coordinator";
  const isExpertPanel = role === "expert-panel" || role.startsWith("expert-panel-");
  const isCommitteeMember = role === "committee-member";
  const canAccessAssistance = isKaryakarta || isCaseCoordinator || isExpertPanel || isCommitteeMember;

  const fetchFamilyAccounting = async () => {
    try {
      const res = await axios.get(`${API}/api/assistance/allAssistance`);
      setTableData(asArray(res?.data?.data));
    } catch (error) {
      console.error("Failed to fetch family accounting details:", error);
      setTableData([]);
    }
  };

  useEffect(() => {
    fetchFamilyAccounting();
  }, []);

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


  const handleSearch = async (value) => {
    setSearchText(value);
    if (value.length < 2) {
      setResults([]);
      setSelectedSadhu(null);
      setFamilyDetails([]);
      return;
    }

    const normalizedSearch = value.trim().toLowerCase();
    const rows = asArray(tableData);

    if (searchType === "sadhu") {
      const uniqueByDiksharthi = new Map();
      rows.forEach((row) => {
        const diksharthiId = row?.diksharthi_id;
        const sadhuName = String(row?.sadhu_sadhvi_name || "").toLowerCase();
        if (!diksharthiId || !sadhuName.includes(normalizedSearch)) return;

        if (!uniqueByDiksharthi.has(diksharthiId)) {
          uniqueByDiksharthi.set(diksharthiId, {
            id: diksharthiId,
            diksharthi_id: diksharthiId,
            sadhu_sadhvi_name: row?.sadhu_sadhvi_name || "",
            family_member_firstName: row?.family_member_firstName || "",
            family_member_lastName: row?.family_member_lastName || "",
            relation: row?.relation || "",
          });
        }
      });

      setResults(Array.from(uniqueByDiksharthi.values()));
      return;
    }

    const uniqueByMember = new Map();
    rows.forEach((row) => {
      const firstName = String(row?.family_member_firstName || "").trim();
      const lastName = String(row?.family_member_lastName || "").trim();
      const memberName = `${firstName} ${lastName}`.trim().toLowerCase();
      if (!memberName.includes(normalizedSearch)) return;

      const key = `${row?.diksharthi_id || ""}__${row?.relation || ""}`;
      if (!uniqueByMember.has(key)) {
        uniqueByMember.set(key, {
          id: row?.diksharthi_id,
          diksharthi_id: row?.diksharthi_id,
          sadhu_sadhvi_name: row?.sadhu_sadhvi_name || "",
          family_member_firstName: firstName,
          family_member_lastName: lastName,
          relation: row?.relation || "",
        });
      }
    });

    setResults(Array.from(uniqueByMember.values()));
  };

  const handleSelectSadhu = async (item) => {
    setSelectedSadhu(item);
    setResults([]);

    const displayFamilyName = `${item?.family_member_firstName || ""} ${item?.family_member_lastName || ""}`.trim();

    setSearchText(
      searchType === "family" && displayFamilyName
        ? `${displayFamilyName} (${item?.relation || "-"})`
        : item?.sadhu_sadhvi_name || "",
    );

    try {
      const diksharthiId = item?.diksharthi_id || item?.id;
      const res = await axios.get(
        `${API}/api/assistance/all-assistance/${diksharthiId}`,
      );
      setFamilyDetails(asArray(res?.data?.data));
    } catch (error) {
      console.error(error);
      setFamilyDetails([]);
    }
  };

  const handleEdit = (row) => {
    navigate("/assistance-details", {
      state: {
        memberData: {
          fullName: `${row?.family_member_firstName || ""} ${row?.family_member_lastName || ""}`.trim(),
        },
        relation: row?.relation,
        selectedSadhu: row?.diksharthi_id || selectedSadhu?.diksharthi_id || selectedSadhu?.id,
        familyMemberId: row?.family_member_id || row?.family_id,
        familyId: row?.family_member_id || row?.family_id,
        sadhuName: row?.sadhu_sadhvi_name || selectedSadhu?.sadhu_sadhvi_name,
        assistanceData: row?.assistance_data || {},
      },
    });
  };
  // const handleOpenActionModal = (row, type) => {
  //   setActiveRow(row);
  //   setActionType(type);
  //   setQueriesReason("");
  //   setQueryFile(null);
  //   setActionError("");
  //   setIsModalOpen(true);
  // };

  const handleOpenActionModal = (row, type) => {
    setActiveRow(row);
    setActionType(type);
    setQueriesReason("");
    setApproveAmount("");
    setQueryFile(null);
    setActionError("");
    setIsModalOpen(true);
  };

  const handleCloseActionModal = () => {
    setIsModalOpen(false);
    setActionType("");
    setQueriesReason("");
    setQueryFile(null);
    setActionError("");
    setActiveRow(null);
  };

  const handleStatusAction = async () => {
    if (!activeRow || !actionType) return;

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

      // const payload = {
      //   feedback: queriesReason,     // editor text
      //   loginId: user?.id,           // logged user id
      //   loginRole: user?.role,           // logged user id
      // };

      const payload = {
        feedback: queriesReason,
        loginId: user?.id,
        loginRole: user?.role,
        ...(actionType === "approve" && {
          approve_amount: approveAmount
        })
      };

      await axios.put(
        `${API}/api/assistance/status/${finalActionType}/${activeRow.id}`,
        payload
      );

      await fetchFamilyAccounting();
      handleCloseActionModal();

    } catch (error) {
      setActionError(
        error?.response?.data?.message || "Failed to update status"
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
      //   return true; // sab dikhana hai
      // }

      if (normalizedRole === "committee-member") {
        return status === "committee member";
      }

      if (
        normalizedRole === "expert-panel" ||
        normalizedRole.startsWith("expert-panel-")
      ) {
        const isInExpertPanelStatus = status === "expert panel";
        if (!isInExpertPanelStatus) return false;
        if (!expertPanelType) return true;

        if (expertPanelType === "education") {
          return rowType === "education" || rowType === "educations";
        }
        return rowType === expertPanelType;
      }

      // return false;

      return true;
    });
  };

  const actionTitleMap = {
    approve: "Approve Request",
    rejected: "Reject Request",
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
      latestFeedback?.feedback || row?.queriesReason || row?.query_reason || row?.remark || row?.remarks,
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

  const renderDefaultTable = () => (
    <div className="mt-8 overflow-visible rounded-lg border border-blue-400 shadow-sm">
      <div className=" overflow-y-visible">
        <table className="w-full h-9xl text-left border-collapse bg-white">
          <thead>
            <tr className="bg-[#fdf2d7]">
              <th className="p-4 font-semibold text-slate-700 border-b">M.S. ID</th>
              {/* <th className="p-4 font-semibold text-slate-700 border-b">S.L. ID</th> */}
              <th className="p-4 font-semibold text-slate-700 border-b">M.S. Name</th>
              <th className="p-4 font-semibold text-slate-700 border-b">Family Member</th>
              <th className="p-4 font-semibold text-slate-700 border-b">Relation</th>
              <th className="p-4 font-semibold text-slate-700 border-b">Assistance</th>
              <th className="p-4 font-semibold text-slate-700 border-b">F.A.N ID</th>
              <th className="p-4 font-semibold text-slate-700 border-b">Status</th>
              <th className="p-4 font-semibold text-slate-700 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {getFilteredData().map((row, index) => {
              const hasQuery = getFeedbackHistory(row).length > 0 || Boolean(getQueryText(row));
              const rowActionKey = getRowActionKey(row, index);
              const isOpen = openDropdownId === rowActionKey;
              const allowedActions = getAllowedActions({ role, status: row.status });
              const canTakeAction = allowedActions.length > 0;

              return (
                <tr key={rowActionKey} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-600">{asDisplayText(row.diksharthi_id)}</td>
                  {/* <td className="p-4 text-slate-600">{asDisplayText(row.sl_id)}</td> */}
                  <td className="p-4 text-slate-600">{asDisplayText(row.diksharthi_name)}</td>
                  <td className="p-4 text-slate-600">{asDisplayText(row.family_member_name)}</td>
                  <td className="p-4 text-slate-600">{asDisplayText(row.relation_key)}</td>
                  <td className="p-4 text-slate-600">{asDisplayText(row.assistance_type)}</td>
                  <td className="p-4 text-slate-600">{asDisplayText(row.fan_id)}</td>
                  <td className={`p-4 font-semibold ${getStatusToneClass(row.status)}`}>
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
                        <EllipsisVertical size={20} className="text-slate-600" />
                      </button>

                      {isOpen && (
                        <div className="absolute right-4 top-12 z-[120] w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="py-1">
                            <button
                              onClick={() => { navigate("/request-details", { state: row }); setOpenDropdownId(null); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Eye size={16} className="text-yellow-500" /> View Details
                            </button>
                            {(hasQuery || !isStaff ) && (
                              <button
                                onClick={() => {
                                  setViewQueryRow(row);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <FileText size={16} className="text-blue-600" /> View Feedback
                              </button>
                            )}

                            {canTakeAction && (
                              <>
                                <hr className="my-1 border-slate-100" />
                                {allowedActions.includes("approve") && (
                                  <button
                                    onClick={() => { handleOpenActionModal(row, "approve"); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition-colors"
                                  >
                                    <CheckCircle size={16} /> Approve
                                  </button>
                                )}
                                {allowedActions.includes("queries") && (
                                  <button
                                    onClick={() => { handleOpenActionModal(row, "queries"); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                                  >
                                    <FileText size={16} /> Query
                                  </button>
                                )}
                                {allowedActions.includes("send-to-committee-member") && (
                                  <button
                                    onClick={() => { handleOpenActionModal(row, "send-to-committee-member"); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  >
                                    <FileText size={16} /> Send to Committee
                                  </button>
                                )}
                                {allowedActions.includes("send-to-expert-panel") && (
                                  <button
                                    onClick={() => { handleOpenActionModal(row, "send-to-expert-panel"); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-violet-600 hover:bg-violet-50 transition-colors"
                                  >
                                    <FileText size={16} /> Send to Expert
                                  </button>
                                )}
                                {allowedActions.includes("send-to-case-coordinator") && (
                                  <button
                                    onClick={() => { handleOpenActionModal(row, "send-to-case-coordinator"); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  >
                                    <FileText size={16} /> Send to Case Coordinator
                                  </button>
                                )}
                                {allowedActions.includes("rejected") && (
                                  <button
                                    onClick={() => { handleOpenActionModal(row, "rejected"); setOpenDropdownId(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
            })}
          </tbody>
        </table>
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
          memberName: `${item.family_member_firstName || ""} ${item.family_member_lastName || ""}`.trim(),
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

            {results.length > 0 && (
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
            )}
          </div>

        </div>

        {/* {selectedSadhu &&
          familyDetails.map((family) => (
            <div key={family.id} className="space-y-6">
              <div className="flex items-center gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {selectedSadhu.sadhu_sadhvi_name}
                  </h2>
                  <p className="text-slate-500">
                    Created At:{" "}
                    {new Date(family.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-700 mb-6">
                  Family Members
                </h3>

                <div className="space-y-4">
                  {Object.keys(family?.relation_details || {}).map((relation) => {
                    const member = family?.relation_details?.[relation];

                    return (
                      <div
                        key={relation}
                        className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-100 p-2 rounded-full text-slate-500">
                            <User size={24} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">
                              {member.fullName || "N/A"} ({relation})
                            </p>
                            <p className="text-sm text-slate-500">
                              Category:{" "}
                              {family.assistance_data?.[relation]
                                ? Object.keys(
                                  family.assistance_data[relation],
                                ).join(", ")
                                : "General"}{" "}
                              Assistance
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              handleEdit(member, relation, family)
                            }
                            className="bg-[#f2a12a] hover:bg-[#d98d1f] text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
                          >
                            Apply for Assistance
                          </button>
                          <button
                            onClick={() =>
                              handleEdit(member, relation, family)
                            }
                            className="bg-[#f2a12a] hover:bg-[#d98d1f] text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
                          >
                            Edit Assistance
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {Object.keys(family?.relation_details || {}).length === 0 && (
                  <p className="text-sm text-slate-500">No family members found.</p>
                )}
              </div>
            </div>
          ))} */}

        {selectedSadhu && (
          <div className="space-y-6">

            {/* HEADER */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedSadhu.sadhu_sadhvi_name}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Diksharthi ID: {asDisplayText(selectedSadhu?.diksharthi_id || selectedSadhu?.id)}
                </p>
              </div>
            </div>

            {/* FAMILY MEMBERS */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="text-lg font-bold mb-6">Family Members</h3>

              {familyDetails.length === 0 ? (
                <p>No data found</p>
              ) : (
                <div className="space-y-4">

                  {groupByRelation(familyDetails).map((memberGroup) => {
                    const primaryRow = memberGroup.rows[0] || {};
                    return (
                      <div
                        key={`${memberGroup.relation}-${primaryRow?.family_id || primaryRow?.id || "row"}`}
                        className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-semibold">
                            {asDisplayText(memberGroup.memberName, "N/A")} ({asDisplayText(memberGroup.relation)})
                          </p>
                          <p className="text-sm text-gray-500">
                            Category: {memberGroup.assistanceTypes.join(", ")}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(primaryRow)}
                            className="bg-[#f2a12a] text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Apply
                          </button>

                          <button
                            onClick={() => handleEdit(primaryRow)}
                            className="bg-[#f2a12a] text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Edit
                          </button>
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between px-6 py-4">
                <h3 className="text-xl font-bold text-slate-800">
                  {actionTitleMap[actionType] || "Confirm Action"}
                </h3>
                <button
                  onClick={handleCloseActionModal}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>
              <div className="px-8">
                <div className="space-y-4">

                  <div className="text-center">
                    <h4 className="font-semibold text-lg text-slate-700">
                      {asDisplayText(
                        `${activeRow?.family_member_name || ""} `

                      )}
                    </h4>
                  </div>

                  {actionType === "approve" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Feedback
                    </label>
                    <JoditEditor
                      value={queriesReason}
                      config={queryEditorConfig}
                      onBlur={(newValue) => setQueriesReason(newValue)}
                      onChange={() => { }}
                    />
                    {/* <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Upload File
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setQueryFile(e.target.files?.[0] || null)}
                          className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          {queryFile?.name || "No file chosen"}
                        </p>
                      </div> */}
                  </div>


                  {actionError && (
                    <p className="text-sm text-red-600 text-center">{actionError}</p>
                  )}
                </div>
              </div>
              <div className="p-6 flex gap-3">
                <button
                  onClick={handleCloseActionModal}
                  className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusAction}
                  disabled={isActionLoading}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
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
          const legacyFeedback = getQueryText(viewQueryRow);

          return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
              <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden">

                {/* MODAL HEADER */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Feedback Details</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Member: <span className="font-semibold text-blue-600">
                        {asDisplayText(
                          viewQueryRow?.family_member_name ||
                          `${viewQueryRow?.family_member_firstName || ""} ${viewQueryRow?.family_member_lastName || ""}`.trim()
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
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Feedback History</h4>
                    </div>

                    {feedbackHistory.length > 0 ? (
                      <div className="space-y-3">
                        {feedbackHistory.map((item, index) => (
                          <div key={`${item?.date || "date"}-${item?.time || "time"}-${index}`} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase ${item?.status?.toLowerCase() === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                                  }`}
                              >
                                {item?.status?.toLowerCase() === "committee-member"
                                  ? "Case Co-ordinator Summary"
                                  : item?.status?.toLowerCase() === "approve"
                                    ? "Approve"
                                    : capitalizeFirst(asDisplayText(item?.status, "Status"))}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                <Clock size={12} />
                                {asDisplayText(item?.date, "")} {asDisplayText(item?.time, "")}
                              </span>
                            </div>
                            <div
                              className="text-sm text-slate-600 leading-relaxed pl-1 border-l-2 border-slate-100"
                              dangerouslySetInnerHTML={{
                                __html: item?.feedback || "<p className='italic text-slate-400'>No comments provided.</p>",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 rounded-xl border border-dashed border-slate-200">
                        <p className="text-sm text-slate-400 italic">No structured history records found.</p>
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

export default AssistancePage;










