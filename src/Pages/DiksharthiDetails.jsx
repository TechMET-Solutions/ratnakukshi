import { Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";


const DetailItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight">{label}</span>
    <span className="text-sm font-medium text-gray-800">{value || "-"}</span>
  </div>
);

const normalizeRole = (value) => {
  const rawRole = String(value || "").trim().toLowerCase();

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

const DiksharthiListing = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  let loggedInUser = null;
  try {
    loggedInUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    loggedInUser = null;
  }

  const role = normalizeRole(
    loggedInUser?.role || localStorage.getItem("role") || ""
  );
  const loggedInUserId = loggedInUser?.id ?? null;

  const [sendingId, setSendingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [queryModalData, setQueryModalData] = useState(null);
  const [viewModalData, setViewModalData] = useState(null);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [assignModalData, setAssignModalData] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [isAssigningAdmin, setIsAssigningAdmin] = useState(false);
  const [isAdminListLoading, setIsAdminListLoading] = useState(false);
  const itemsPerPage = 10;

  const [diksharthiList, setDiksharthiList] = useState([]);
  const [userDirectory, setUserDirectory] = useState([]);

  const fetchDiksharthiList = async () => {
    try {
      const res = await fetch(`${API}/api/get-diksharthi`);
      const data = await res.json();
      const allRecords = Array.isArray(data?.data) ? data.data : [];

      // let filteredRecords = [];

      // if (role === "staff") {
      //   // Staff: only own records + pending
      //   filteredRecords = allRecords.filter(
      //     (item) =>
      //       String(item?.user_id ?? "") === String(loggedInUserId ?? "")
      //       // &&
      //       // String(item?.status ?? "").toLowerCase() === "pending"
      //   );
      // } else if (role === "admin") {
      //   // Admin: only send records
      //   filteredRecords = allRecords.filter(
      //     (item) => String(item?.admin_id ?? "").toLowerCase() === "1"
      //   );
      // } else if (role === "operations-manager") {
      //   // Operations manager: see all staff/admin assigned records
      //   filteredRecords = allRecords;
      // } else {
      //   // fallback
      //   filteredRecords = allRecords;
      // }


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

      } else if (role === "admin") {
        // Admin sees only assigned records
        filteredRecords = allRecords.filter(
          (item) => String(item?.admin_id) === String(loggedInUserId)
        );

      } else {
        filteredRecords = allRecords;
      }

      setDiksharthiList(filteredRecords);

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

  const handleSendToAdmin = async (id) => {
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

      if (!res.ok) {
        throw new Error("Failed to update diksharthi status");
      }

      await fetchDiksharthiList();
    } catch (error) {
      console.error(error);
      alert("Failed to send to admin");
    } finally {
      setSendingId(null);
    }
  };

  const filteredDiksharthiList = diksharthiList.filter((diksharthi) => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;

    return [
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

  const formatDate = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString();
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

  const fetchAdminUsers = async () => {
    try {
      setIsAdminListLoading(true);
      const response = await fetch(`${API}/api/user/list`);
      const result = await response.json();
      const rows = Array.isArray(result?.data) ? result.data : [];
      const normalizedUsers = rows.map(normalizeUser);
      setUserDirectory(normalizedUsers);
      const admins = normalizedUsers.filter(
        (user) => String(user?.role || "").toLowerCase() === "admin"
      );
      setAdminUsers(admins);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch admin list");
    } finally {
      setIsAdminListLoading(false);
    }
  };

  const openAssignAdminModal = async (diksharthi) => {
    setAssignModalData(diksharthi);
    setSelectedAdminId("");
    await fetchAdminUsers();
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
        throw new Error("Failed to assign admin");
      }

      alert("Admin assigned successfully");
      setAssignModalData(null);
      setSelectedAdminId("");
      await fetchDiksharthiList();
    } catch (error) {
      console.error(error);
      alert("Failed to assign admin");
    } finally {
      setIsAssigningAdmin(false);
    }
  };

  return (
    <div className="p-8 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-700">
          Diksharthi Details
        </h1>
        {role === "staff" && (
          <Link
            to="/diksharthi-details-add"
            className="bg-[#d94452] hover:bg-[#c13946] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add New Diksharthi
          </Link>
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
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Photo
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Diksharthi ID
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Sadhu/Sadhvi Name
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Pad
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Sect
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Alive Status
              </th>
              {role === "operations-manager" && (
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Staff Name
                </th>
              )}
              {role === "operations-manager" && (
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Admin Name
                </th>
              )}
              {role === "admin" && (
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
              )}
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
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
                      ? "9"
                      : role === "admin"
                        ? "8"
                        : "7"
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
                    <td className="px-6 py-3">
                      <img
                        src={diksharthi.photo || "/user.png"}
                        alt="diksharthi"
                        onError={(e) => {
                          e.currentTarget.src = "/user.png";
                        }}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>

                    {/* ID */}
                    <td className="px-6 py-3">{diksharthi.diksharthi_code}</td>

                    {/* Name */}
                    <td className="px-6 py-3">{diksharthi.sadhu_sadhvi_name}</td>

                    {/* Pad */}
                    <td className="px-6 py-3">{diksharthi.pad}</td>

                    {/* Sect */}
                    <td className="px-6 py-3">{diksharthi.samudaay}</td>

                    {/* Alive */}
                    <td className="px-6 py-3">{diksharthi.is_alive}</td>

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
                    <td className="px-6 py-3 flex gap-3">
                      {role === "staff" ? (
                        getDiksharthiStatus(diksharthi) === "send" ? (
                          <>
                            <button
                              type="button"
                              className="rounded-lg bg-gray-500 text-sm px-2 py-1 text-white cursor-default"
                              disabled
                            >
                              Sent
                            </button>
                            <button
                              type="button"
                              className="rounded-lg bg-blue-600 text-sm px-2 py-1 text-white"
                              onClick={() => openViewModal(diksharthi)}
                            >
                              View
                            </button>
                          </>
                        ) : (
                          <button
                            className="rounded-lg bg-blue-600 text-sm px-2 py-1 text-white"
                            onClick={() => handleSendToAdmin(diksharthi.id)}
                            disabled={sendingId === diksharthi.id}
                          >
                            {sendingId === diksharthi.id
                              ? "Sending..."
                              : "Send to Operations Manager"}
                          </button>
                        )
                      ) : null}
                      {role === "admin" && (
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
                          Add Family Details
                        </button>
                      )}
                      {role === "operations-manager" && (
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
                                state: {
                                  mode: "edit",
                                  diksharthiData: diksharthi,
                                },
                              })
                            }
                          >
                            Edit
                          </button>
                          {isAdminUnassigned(diksharthi) && (
                            <button
                              className="rounded-lg bg-purple-600 text-sm px-2 py-1 text-white"
                              onClick={() => openAssignAdminModal(diksharthi)}
                            >
                              Assign Admin
                            </button>
                          )}
                        </>
                      )}
                      {role === "admin" && queryItem && (
                        <button
                          className="rounded-lg bg-blue-600 text-sm px-2 py-1 text-white"
                          onClick={() => setQueryModalData(queryItem)}
                        >
                          View
                        </button>
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

      {role === "admin" && queryModalData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Query Details</h3>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => setQueryModalData(null)}
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <p>
                <span className="font-semibold">Relation:</span>{" "}
                {queryModalData?.relation || "-"}
              </p>
              <p>
                <span className="font-semibold">Type:</span>{" "}
                {queryModalData?.type || "-"}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                {queryModalData?.status || "-"}
              </p>
              <p>
                <span className="font-semibold">queriesReason:</span>{" "}
                {queryModalData?.queriesReason || queryModalData?.remark || "-"}
              </p>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-blue-600 text-sm px-4 py-2 text-white"
                onClick={() => setQueryModalData(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {isViewLoading ? (
                  <div className="flex justify-center py-10">
                    <p className="text-gray-500 animate-pulse">Loading profile data...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Top Section: Info + Image */}
                    <div className="flex flex-col-reverse sm:flex-row gap-6 pb-2 border-b border-gray-100">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">Diksharthi Name</label>
                          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                            {viewModalData?.sadhu_sadhvi_name || "N/A"}
                          </h2>
                        </div>
                        <div className="inline-block bg-gray-100 px-3 py-1 rounded-full">
                          <span className="text-sm font-medium text-gray-600">ID: {viewModalData?.diksharthi_code || "-"}</span>
                        </div>
                      </div>

                      {/* Image on the Top Right */}
                      <div className="flex-shrink-0 flex justify-center sm:justify-end">
                        <div className="relative">
                          <img
                            src={viewModalData?.photo || "/user.png"}
                            alt="profile"
                            onError={(e) => { e.currentTarget.src = "/user.png"; }}
                            className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-md"
                          />
                          <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded text-[10px] font-bold uppercase text-white shadow-sm ${viewModalData?.is_alive === 'No' ? 'bg-red-500' : 'bg-green-500'}`}>
                            {viewModalData?.is_alive || "Status N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Data Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      {/* <DetailItem label="Staff ID" value={viewModalData?.user_id} /> */}
                      {/* <DetailItem label="Admin ID" value={viewModalData?.admin_id} /> */}
                      <DetailItem label="Date of Birth" value={formatDate(viewModalData?.dob)} />
                      <DetailItem label="Gender" value={viewModalData?.gender} />
                      <DetailItem label="Pad" value={viewModalData?.pad} />
                      <DetailItem label="Samudaay" value={viewModalData?.samudaay} />
                      <DetailItem label="Guru Name" value={viewModalData?.guru_name || viewModalData?.guruName} />
                      <DetailItem label="Acharya" value={viewModalData?.acharya} />
                      <DetailItem label="Gaachh" value={viewModalData?.gaachh} />
                      <DetailItem label="Gadipati" value={viewModalData?.gadipati} />

                      <DetailItem label="Current Vihar Location" value={viewModalData?.vihar_location || viewModalData?.viharLocation} />

                      {/* Conditional Samadhi Info */}
                      {getAliveStatus(viewModalData) === "no" && (
                        <>
                          <DetailItem label="Samadhi Date" value={formatDate(viewModalData?.samadhi_date || viewModalData?.samadhiDate)} />
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
              <h3 className="text-lg font-semibold text-gray-800">Assign Admin</h3>
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
                <span className="font-semibold">Admin</span>
                <select
                  value={selectedAdminId}
                  onChange={(e) => setSelectedAdminId(e.target.value)}
                  className="mt-2 w-full p-2 border border-slate-300 rounded-md outline-none"
                  disabled={isAdminListLoading}
                >
                  <option value="">Select Admin</option>
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
    </div>
  );
};

export default DiksharthiListing;
