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
  EllipsisVertical
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import { useAuth } from "../context/AuthContext";

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

const normalizeWorkflowValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/_/g, " ")
    .replace(/-/g, " ");

const STATUS_LABELS = {
  pending: "Pending11",
  approve: "Approve",
  rejected: "Rejected",
  queries: "Queries",
  send_to_committee_member: "Send to Committee Member",
  send_to_expert_panel: "Send to Expert Panel",
};

const getStatusToneClass = (status) => {
  const normalizedStatus = normalizeWorkflowValue(status);

  if (normalizedStatus === "approve") return "text-green-600";
  if (normalizedStatus === "rejected") return "text-red-600";
  if (normalizedStatus === "queries") return "text-amber-600";
  if (
    normalizedStatus === "send to committee member" ||
    normalizedStatus === "send to expert panel"
  ) {
    return "text-blue-600";
  }

  return "text-yellow-600";
};

// const getAllowedActions = ({ role, status }) => {
//   const normalizedRole = normalizeWorkflowValue(role);
//   const normalizedStatus = normalizeWorkflowValue(status || STATUS_LABELS.pending);

//   console.log(normalizedStatus)

//   if (normalizedRole === "case coordinator") {
//     if (normalizedStatus === "pending" || normalizedStatus === "queries") {
//       return ["approve", "queries", "send-to-committee-member", "rejected"];
//     }

//     if (normalizedStatus === "Committee Member") {
//       return ["send-to-expert-panel", "rejected"];
//     }
//   }

//   if (normalizedRole === "committee member") {
//     if (normalizedStatus === "Committee Member") {
//       return ["approve", "send-to-expert-panel", "rejected"];
//     }
//   }

//   if (normalizedRole === "expert panel") {
//     if (normalizedStatus === "send to expert panel") {
//       return ["approve", "rejected"];
//     }
//   }

//   return [];
// };

const getAllowedActions = ({ role, status }) => {
  const normalizedRole = normalizeWorkflowValue(role);
  const normalizedStatus = normalizeWorkflowValue(status);

  // ✅ CASE COORDINATOR
  if (normalizedRole === "case coordinator") {
    if (normalizedStatus === "pending" || normalizedStatus === "queries") {
      return ["approve", "queries", "send-to-committee-member", "rejected","queries"];
    }

    if (normalizedStatus === "committee member") {
      return ["send-to-expert-panel", "rejected","queries"];
    }
  }

  // ✅ COMMITTEE MEMBER
  if (normalizedRole === "committee member") {
    if (normalizedStatus === "committee member") {
      return ["approve", "send-to-expert-panel", "rejected","queries"];
    }
  }

  // ✅ EXPERT PANEL
  if (normalizedRole === "expert panel") {
    if (normalizedStatus === "expert panel") {
      return ["approve", "rejected","queries"];
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
  const [queryFile, setQueryFile] = useState(null);
  const [actionError, setActionError] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [viewQueryRow, setViewQueryRow] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownContainerRef = useRef(null);

  const role = String(user?.role || "").toLowerCase();
  const isKaryakarta = role === "karyakarta";
  const isCaseCoordinator = role === "case-coordinator";
  const isExpertPanel = role === "expert-panel";
  const isCommitteeMember = role === "committee-member";
  const canAccessAssistance = isKaryakarta || isCaseCoordinator || isExpertPanel || isCommitteeMember;
  const queryEditorConfig = {
    readonly: false,
    minHeight: 220,
    toolbarAdaptive: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    buttons: [
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "font",
      "fontsize",
      "paragraph",
      "|",
      "align",
      "|",
      "link",
      "table",
      "|",
      "undo",
      "redo",
    ],
  };

  const fetchFamilyAccounting = async () => {
    try {
      const res = await axios.get(`${API}/api/familyAccounting-details`);
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
    try {
      const res = await axios.get(
        `${API}/api/search-diksharthi`,
        {
          params: {
            name: value,
            type: searchType,
          },
        },
      );
      setResults(asArray(res?.data?.data));
    } catch (error) {
      console.error(error);
      setResults([]);
    }
  };

  const handleSelectSadhu = async (item) => {
    setSelectedSadhu(item);
    setResults([]);
    setSearchText(
      searchType === "family" && item.head_of_family
        ? `${item.head_of_family} - ${item.sadhu_sadhvi_name}`
        : item.sadhu_sadhvi_name,
    );
    try {
      const res = await axios.get(
        `${API}/api/family-details/${item.id}`,
      );
      setFamilyDetails(asArray(res?.data?.data));
    } catch (error) {
      console.error(error);
      setFamilyDetails([]);
    }
  };

  const handleEdit = (member, relation, family) => {
    console.log("FULL FAMILY", family);

    const assistanceData = family?.assistance_data?.[relation] || {};

    console.log("ASSISTANCE DATA", assistanceData);

    navigate("/assistance-details", {
      state: {
        memberData: member,
        relation: relation,
        selectedSadhu: selectedSadhu?.id,
        familyId: family?.id,
        sadhuName: selectedSadhu?.sadhu_sadhvi_name,
        assistanceData: assistanceData,
      },
    });
  };
  const handleOpenActionModal = (row, type) => {
    setActiveRow(row);
    setActionType(type);
    setQueriesReason("");
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



  // const handleStatusAction = async () => {
  //   if (!activeRow || !actionType) return;

  //   if (actionType === "queries" && !queriesReason.trim()) {
  //     setActionError("Queries reason is required for queries.");
  //     return;
  //   }

  //   try {
  //     setIsActionLoading(true);
  //     setActionError("");

  //     if (actionType === "queries") {
  //       const payload = new FormData();
  //       payload.append("id", activeRow?.id || "");
  //       payload.append("assistance_id", activeRow?.id || "");
  //       payload.append("diksharthi_id", activeRow?.diksharthi_id || "");
  //       payload.append("relation", activeRow?.relation || "");
  //       payload.append("type", activeRow?.type || "");
  //       payload.append("actorRole", role);
  //       payload.append("queriesReason", queriesReason.trim());
  //       // payload.append("remark", queriesReason.trim());

  //       if (queryFile) {
  //         payload.append("file", queryFile);
  //         // payload.append("attachment", queryFile);
  //       }

  //       await axios.put(`${API}/api/assistance-status/${actionType}`, payload, {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       });
  //     } else {
  //       const payload = {
  //         id: activeRow?.id,
  //         assistance_id: activeRow?.id,
  //         diksharthi_id: activeRow?.diksharthi_id,
  //         relation: activeRow?.relation,
  //         type: activeRow?.type,
  //         actorRole: role,
  //       };

  //       await axios.put(`${API}/api/assistance-status/${actionType}`, payload);
  //     }

  //     await fetchFamilyAccounting();
  //     handleCloseActionModal();
  //   } catch (error) {
  //     setActionError(
  //       error?.response?.data?.message || "Failed to update assistance status.",
  //     );
  //   } finally {
  //     setIsActionLoading(false);
  //   }
  // };

  // const actionTypeMap = {
  //   "send-to-committee-member": "committee-member",
  //   "send-to-expert-panel": "expert-panel",
  // };

  // const handleStatusAction = async () => {
  //   if (!activeRow || !actionType) return;

  //   const finalActionType = actionTypeMap[actionType] || actionType;

  //   try {
  //     setIsActionLoading(true);

  //     const payload = {
  //       id: activeRow?.id,
  //       assistance_id: activeRow?.id,
  //       diksharthi_id: activeRow?.diksharthi_id,
  //       relation: activeRow?.relation,
  //       type: activeRow?.type,
  //       actorRole: role,
  //     };

  //     await axios.put(`${API}/api/assistance-status/${finalActionType}`, payload);

  //     await fetchFamilyAccounting();
  //     handleCloseActionModal();
  //   } catch (error) {
  //     setActionError("Failed to update assistance status.");
  //   } finally {
  //     setIsActionLoading(false);
  //   }
  // };

  // const actionTypeMap = {
  //   "send-to-committee-member": "SEND_TO_COMMITTEE_MEMBER",
  //   "send-to-expert-panel": "SEND_TO_EXPERT_PANEL",
  //   approve: "APPROVE",
  //   rejected: "REJECTED",
  //   queries: "QUERIES",
  // };

  const handleStatusAction = async () => {
    if (!activeRow || !actionType) return;

    const actionTypeMap = {
      "send-to-committee-member": "committee-member",
      "send-to-expert-panel": "expert-panel",
      approve: "approve",
      rejected: "rejected",
      queries: "queries",
    };

    const finalActionType = actionTypeMap[actionType] || actionType;

    try {
      setIsActionLoading(true);

      const payload = {
        id: activeRow?.id,
        assistance_id: activeRow?.id,
        diksharthi_id: activeRow?.diksharthi_id,
        relation: activeRow?.relation,
        type: activeRow?.type,
        actorRole: role.replaceAll("-", " "), // 🔥 FIX
      };

      await axios.put(
        `${API}/api/assistance-status/${finalActionType}`,
        payload
      );

      await fetchFamilyAccounting();
      handleCloseActionModal();
    } catch (error) {
      console.log(error?.response?.data); // 🔥 debug
      setActionError(
        error?.response?.data?.message || "Failed to update assistance status."
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const getFilteredData = () => {
    const normalizedRole = role.toLowerCase();

    return tableData.filter((row) => {
      const status = normalizeWorkflowValue(row.status);

      if (normalizedRole === "karyakarta") {
        return status === "pending";
      }

      if (normalizedRole === "case-coordinator") {
        return true; // sab dikhana hai
      }

      if (normalizedRole === "committee-member") {
        return status === "Committee Member";
      }

      if (normalizedRole === "expert-panel") {
        return status === "send to expert panel";
      }

      return false;
    });
  };

  const actionTitleMap = {
    approve: "Approve Request",
    rejected: "Reject Request",
    queries: "Raise Query",
    "send-to-committee-member": "Send To Committee Member",
    "send-to-expert-panel": "Send To Expert Panel",
  };

  const actionButtonLabelMap = {
    approve: "Approve",
    rejected: "Reject",
    queries: "Submit Query",
    "send-to-committee-member": "Send",
    "send-to-expert-panel": "Send",
  };

  const actionDescMap = {
    approve: "Are you sure you want to approve this request?",
    rejected: "Are you sure you want to reject this request?",
    queries: "Please provide queriesReason for the query.",
    "send-to-committee-member":
      "Are you sure you want to send this request to the committee member?",
    "send-to-expert-panel":
      "Are you sure you want to send this request to the expert panel?",
  };

  const getQueryText = (row) =>
    asDisplayText(
      row?.queriesReason || row?.query_reason || row?.remark || row?.remarks,
      "",
    );

  const getRowActionKey = (row, index) =>
    [
      row?.id,
      row?.diksharthi_id,
      row?.relation,
      row?.type,
      row?.case_id,
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
              <th className="p-4 font-semibold text-slate-700 border-b">Diksharthi Name</th>
              <th className="p-4 font-semibold text-slate-700 border-b">Family Member</th>
              <th className="p-4 font-semibold text-slate-700 border-b">Family Head Name</th>
              <th className="p-4 font-semibold text-slate-700 border-b">Assistance</th>
              <th className="p-4 font-semibold text-slate-700 border-b">Case ID</th>
              <th className="p-4 font-semibold text-slate-700 border-b">Status</th>
              <th className="p-4 font-semibold text-slate-700 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableData.map((row, index) => {
              const hasQuery = Boolean(getQueryText(row));
              const rowActionKey = getRowActionKey(row, index);
              const isOpen = openDropdownId === rowActionKey;
              const allowedActions = getAllowedActions({ role, status: row.status });
              const canTakeAction = allowedActions.length > 0;

              return (
                <tr key={rowActionKey} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-600">{asDisplayText(row.diksharthi)}</td>
                  <td className="p-4 text-slate-600">{asDisplayText(row.member_name)}</td>
                  <td className="p-4 text-slate-600">{asDisplayText(row.head)}</td>
                  <td className="p-4 text-slate-600">{asDisplayText(row.type)}</td>
                  <td className="p-4 text-slate-600">{asDisplayText(row.case_id)}</td>
                  <td className={`p-4 font-semibold ${getStatusToneClass(row.status)}`}>
                    {asDisplayText(row.status)}
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
                        <div className="absolute right-4 top-12 z-[120] w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="py-1">
                            <button
                              onClick={() => { navigate("/request-details", { state: row }); setOpenDropdownId(null); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Eye size={16} className="text-yellow-500" /> View Details
                            </button>

                            {hasQuery && (
                              <button
                                onClick={() => { setViewQueryRow(row); setOpenDropdownId(null); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <FileText size={16} className="text-blue-600" /> View Query
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
                Family Head Details
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
                  : "Search Family Head..."
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
                      {searchType === "family" && item.head_of_family
                        ? `Head: ${item.head_of_family}`
                        : item.diksharthi_code}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {selectedSadhu
          ? familyDetails.map((family) => (
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
          ))
          : renderDefaultTable()}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
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
                  {/* <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mx-auto">
                    <FileText size={32} />
                  </div> */}

                  <div className="text-center">
                    <h4 className="font-semibold text-lg text-slate-700">
                      {asDisplayText(
                        activeRow?.member_name || activeRow?.member,
                        "Request",
                      )}
                    </h4>
                    <p className="text-slate-500 text-sm">
                      Case ID: #{activeRow?.id || "-"}
                    </p>
                  </div>

                  <p className="text-sm text-slate-600 text-center">
                    {actionDescMap[actionType]}
                  </p>

                  {actionType === "queries" && (
                    <div className="space-y-3 text-left">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Reasons | Remark
                      </label>
                      <JoditEditor
                        value={queriesReason}
                        config={queryEditorConfig}
                        onBlur={(newValue) => setQueriesReason(newValue)}
                        onChange={() => { }}
                      />
                      <div>
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
                      </div>
                    </div>
                  )}

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

        {viewQueryRow && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-xl font-bold text-slate-800">View Query</h3>
                <button
                  type="button"
                  onClick={() => setViewQueryRow(null)}
                  className="rounded-full p-1 hover:bg-slate-100"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>
              <div className="space-y-4 px-6 py-5">
                <div>
                  <p className="text-sm text-slate-500">Member</p>
                  <p className="font-semibold text-slate-700">
                    {asDisplayText(
                      viewQueryRow?.member_name || viewQueryRow?.member,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Remark</p>
                  <div
                    className="min-h-32 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                    dangerouslySetInnerHTML={{
                      __html: getQueryText(viewQueryRow) || "<p>-</p>",
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setViewQueryRow(null)}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AssistancePage;
