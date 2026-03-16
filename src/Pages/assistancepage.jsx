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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import { useAuth } from "../context/AuthContext";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
};

const generateUniqueCaseId = () => {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const timePart = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `CASE-${datePart}-${timePart}-${randomPart}`;
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
  const role = String(user?.role || "").toLowerCase();
  const isKaryakarta = role === "karyakarta";
  const isCaseCoordinator = role === "case-coordinator";
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
  const navigate = useNavigate();
  const handleSearch = async (value) => {
    setSearchText(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    try {
      // Tuza actual API endpoint vapar
      const res = await axios.get(
        `${API}/api/search-diksharthi?name=${value}`,
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
    setSearchText(item.sadhu_sadhvi_name);
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

  const handleStatusAction = async () => {
    if (!activeRow || !actionType) return;

    if (actionType === "queries" && !queriesReason.trim()) {
      setActionError("Queries reason is required for queries.");
      return;
    }

    try {
      setIsActionLoading(true);
      setActionError("");

      if (actionType === "queries") {
        const payload = new FormData();
        payload.append("id", activeRow?.id || "");
        payload.append("assistance_id", activeRow?.id || "");
        payload.append("diksharthi_id", activeRow?.diksharthi_id || "");
        payload.append("relation", activeRow?.relation || "");
        payload.append("type", activeRow?.type || "");
        payload.append("queriesReason", queriesReason.trim());
        // payload.append("remark", queriesReason.trim());

        if (queryFile) {
          payload.append("file", queryFile);
          // payload.append("attachment", queryFile);
        }

        await axios.put(`${API}/api/assistance-status/${actionType}`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        const payload = {
          id: activeRow?.id,
          assistance_id: activeRow?.id,
          diksharthi_id: activeRow?.diksharthi_id,
          relation: activeRow?.relation,
          type: activeRow?.type,
        };

        if (actionType === "approve") {
          const caseId = generateUniqueCaseId();
          payload.case_id = caseId;
          payload.caseId = caseId;
        }

        await axios.put(`${API}/api/assistance-status/${actionType}`, payload);
      }

      await fetchFamilyAccounting();
      handleCloseActionModal();
    } catch (error) {
      setActionError(
        error?.response?.data?.message || "Failed to update assistance status.",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const actionTitleMap = {
    approve: "Approve Request",
    rejected: "Reject Request",
    queries: "Raise Query",
  };

  const actionButtonLabelMap = {
    approve: "Approve",
    rejected: "Reject",
    queries: "Submit Query",
  };

  const actionDescMap = {
    approve: "Are you sure you want to approve this request?",
    rejected: "Are you sure you want to reject this request?",
    queries: "Please provide queriesReason for the query.",
  };

  const getQueryText = (row) =>
    row?.queriesReason || row?.query_reason || row?.remark || row?.remarks || "";

  const renderDefaultTable = () => (
    <div className="mt-8 overflow-hidden border border-blue-400 rounded-lg shadow-sm">
      <table className="w-full text-left border-collapse bg-white">
        <thead>
          <tr className="bg-[#fdf2d7]">
            <th className="p-4 font-semibold text-slate-700 border-b">
              Diksharthi Name
            </th>
            <th className="p-4 font-semibold text-slate-700 border-b">
              Family Member
            </th>
            <th className="p-4 font-semibold text-slate-700 border-b">
              Family Head Name
            </th>

            <th className="p-4 font-semibold text-slate-700 border-b">
              Assistance
            </th>
            <th className="p-4 font-semibold text-slate-700 border-b">
              Status
            </th>
            <th className="p-4 font-semibold text-slate-700 border-b">
              Renewal
            </th>
            <th className="p-4 font-semibold text-slate-700 border-b text-center">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tableData.map((row, index) => (
            (() => {
              const normalizedStatus = String(row.status || "").toLowerCase();
              const hasQuery = Boolean(getQueryText(row));

              return (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-600">{row.diksharthi}</td>
                  <td className="p-4 text-slate-600">{row.member_name}</td>
                  <td className="p-4 text-slate-600">{row.head}</td>

                  <td className="p-4 text-slate-600">{row.type}</td>
                  <td
                    className={`p-4 font-semibold ${row.status === "Pending"
                        ? "text-yellow-600"
                        : row.status === "Approve"
                          ? "text-green-600"
                          : row.status === "Rejected"
                            ? "text-red-600"
                            : "text-blue-600"
                      }`}
                  >
                    {row.status}
                  </td>
                  <td className="p-4 text-slate-600">{row.renewal}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {(isKaryakarta || isCaseCoordinator) && (
                        <>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white"
                            onClick={() => navigate("/request-details", { state: row })}
                          >
                            <Eye size={15} />
                            View
                          </button>

                          {isKaryakarta && hasQuery && (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
                              onClick={() => setViewQueryRow(row)}
                            >
                              <FileText size={15} />
                              View Query
                            </button>
                          )}

                          {isCaseCoordinator && (
                            <>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white"
                                onClick={() => handleOpenActionModal(row, "approve")}
                              >
                                <CheckCircle size={15} />
                                Approve
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white"
                                onClick={() => handleOpenActionModal(row, "rejected")}
                              >
                                <XCircle size={15} />
                                Rejected
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
                                onClick={() => handleOpenActionModal(row, "queries")}
                              >
                                <FileText size={15} />
                                Query Set
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })()
          ))}
        </tbody>
      </table>
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
                onChange={() => setSearchType("sadhu")}
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
                onChange={() => setSearchType("family")}
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
          </div>

          {results.length > 0 && (
            <div className="w-full max-w-2xl mt-4 border rounded-lg shadow bg-white absolute z-10 top-[320px]">
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
                    {item.diksharthi_code}
                  </p>
                </div>
              ))}
            </div>
          )}
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
                      {activeRow?.member_name || activeRow?.member || "Request"}
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
                        onChange={() => {}}
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
                    {viewQueryRow?.member_name || viewQueryRow?.member || "-"}
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
