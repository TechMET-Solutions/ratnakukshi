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
      return ["approve", "rejected", "queries"];
    }
  }

  // ✅ EXPERT PANEL
  if (isExpertPanelRole(normalizedRole)) {
    if (normalizedStatus === "expert panel") {
      return ["queries"];
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
  const isExpertPanel =
    role === "expert-panel" || role.startsWith("expert-panel-");
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

  const handleStatusAction = async () => {
    if (!activeRow || !actionType) return;
    if (actionType === "queries" && !String(queriesReason || "").trim()) {
      setActionError("Please provide query reason before submitting.");
      return;
    }

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

      const formData = new FormData();
      formData.append("id", activeRow?.id ?? "");
      formData.append("assistance_id", activeRow?.id ?? "");
      formData.append("diksharthi_id", activeRow?.diksharthi_id ?? "");
      formData.append("relation", activeRow?.relation ?? "");
      formData.append("assistance_type", activeRow?.assistance_type ?? "");
      formData.append("actorRole", role.replaceAll("-", " "));

      if (actionType === "queries") {
        formData.append("query_reason", queriesReason || "");
        if (queryFile) formData.append("query_image", queryFile);
      }

      await axios.put(
        `${API}/api/assistance/status/${finalActionType}`,
        formData
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
    const expertPanelType = getExpertPanelAssistanceType(normalizedRole);

    return tableData.filter((row) => {
      const status = normalizeWorkflowValue(row.status);
      const rowType = normalizeWorkflowValue(row.assistance_type);

      if (normalizedRole === "karyakarta") {
        return status === "pending" || status === "queries";
      }

      if (normalizedRole === "case-coordinator") {
        return true; // sab dikhana hai
      }

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
      row?.assistance_type,
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
              const hasQuery = Boolean(getQueryText(row));
              const rowActionKey = getRowActionKey(row, index);
              const isOpen = openDropdownId === rowActionKey;
              const allowedActions = getAllowedActions({ role, status: row.status });
              const canTakeAction = allowedActions.length > 0;

              return (
                <tr key={rowActionKey} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-600">{asDisplayText(row.sadhu_sadhvi_name)}</td>
                  <td className="p-4 text-slate-600">
                    {asDisplayText(
                      `${row?.first_name || ""} ${row?.last_name || ""}`.trim()
                    )}
                  </td>
                  <td className="p-4 text-slate-600">{asDisplayText(row.relation_key)}</td>
                  <td className="p-4 text-slate-600">{asDisplayText(row.assistance_type)}</td>
                  <td className="p-4 text-slate-600">{asDisplayText(row.fan_id)}</td>
                  <td className={`p-4 font-semibold ${getStatusToneClass(row.status)}`}>
                    {capitalizeFirst(asDisplayText(row.status))}
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

                  <div className="text-center">
                    <h4 className="font-semibold text-lg text-slate-700">
                      {asDisplayText(
                        `${activeRow?.family_member_firstName || ""} ${activeRow?.family_member_lastName || ""}`.trim(),
                        "Request"
                      )}
                    </h4>
                    {/* <p className="text-slate-500 text-sm">
                      Case ID: #{activeRow?.id || "-"}
                    </p> */}
                  </div>

                  <p className="text-sm text-slate-600 text-center">
                    {actionDescMap[actionType]}
                  </p>

                  {actionType === "queries" && (
                    <div className="space-y-3 text-left">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Remark
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
                  <p className="text-sm text-slate-500">Member Name</p>
                  <p className="font-semibold text-slate-700">
                    {asDisplayText(
                      `${viewQueryRow?.family_member_firstName || ""} ${viewQueryRow?.family_member_lastName || ""}`.trim()
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










