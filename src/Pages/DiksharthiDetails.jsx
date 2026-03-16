import { Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import { useAuth } from "../context/AuthContext";

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

const emptyScheduleForm = {
  name: "",
  address: "",
  mobile: "",
  date: "",
  time: "",
};

const DiksharthiListing = () => {
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuth();

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
  const [viewScheduleModalData, setViewScheduleModalData] = useState(null);
  const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm);
  const [isSchedulingVisit, setIsSchedulingVisit] = useState(false);
  const [isViewScheduleLoading, setIsViewScheduleLoading] = useState(false);
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

  const getVisitSchedule = (diksharthi) => {
    if (!diksharthi?.id) return null;
    return visitSchedules[String(diksharthi.id)] || null;
  };

  const normalizeVisitSchedule = (schedule) => {
    if (!schedule) return null;

    return {
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
      diksharthi_code: schedule?.diksharthi_code || "",
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

  const openScheduleVisitModal = (diksharthi) => {
    const existingSchedule = getVisitSchedule(diksharthi);
    setScheduleVisitModalData(diksharthi);
    setScheduleForm(
      existingSchedule || {
        ...emptyScheduleForm,
        name: diksharthi?.sadhu_sadhvi_name || "",
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

    if (
      !scheduleForm.name.trim() ||
      !scheduleForm.address.trim() ||
      !scheduleForm.mobile.trim() ||
      !scheduleForm.date ||
      !scheduleForm.time
    ) {
      alert("Please fill name, address, mobile number, date and time");
      return;
    }

    const payload = {
      diksharthi_id: scheduleVisitModalData.id,
      diksharthi_code: scheduleVisitModalData.diksharthi_code || "",
      diksharthi_name: scheduleVisitModalData.sadhu_sadhvi_name || "",
      name: scheduleForm.name.trim(),
      address: scheduleForm.address.trim(),
      mobile: scheduleForm.mobile.trim(),
      date: scheduleForm.date,
      time: scheduleForm.time,
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
        name: savedSchedule?.name || payload.name,
        address: savedSchedule?.address || payload.address,
        mobile: savedSchedule?.mobile || payload.mobile,
        date: savedSchedule?.date || payload.date,
        time: savedSchedule?.time || payload.time,
      };

      const updatedSchedules = {
        ...visitSchedules,
        [String(scheduleVisitModalData.id)]: normalizedSchedule,
      };

      setVisitSchedules(updatedSchedules);
      setScheduleVisitModalData(null);
      setScheduleForm(emptyScheduleForm);
      alert(result?.message || "Visit scheduled successfully");
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to schedule visit");
    } finally {
      setIsSchedulingVisit(false);
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
                Diksharthi Name
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
                              className="rounded-lg text-sm px-2 py-1 text-green-600 cursor-default"
                              disabled
                            >
                             Send
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
                      {(role === "admin" || role === "karyakarta") && (
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
                          {/* <button
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
                          </button> */}
                          {isAdminUnassigned(diksharthi) && (
                            <button
                              className="rounded-lg bg-purple-600 text-sm px-2 py-1 text-white"
                              onClick={() => openAssignAdminModal(diksharthi)}
                            >
                              Assign Karyakarta
                            </button>
                          )}
                          {!getVisitSchedule(diksharthi) && (
                            <button
                              className="rounded-lg bg-emerald-600 text-sm px-2 py-1 text-white"
                              onClick={() => openScheduleVisitModal(diksharthi)}
                            >
                              Schedule Visit
                            </button>
                          )}
                        </>
                      )}
                      {role === "staff" && (
                        <>
                          <button
                            type="button"
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

                          
                         
                        </>
                      )}
                      
                      {role === "karyakarta" && (
                        <button
                          className="rounded-lg bg-indigo-600 text-sm px-2 py-1 text-white"
                          onClick={() => openViewScheduleModal(diksharthi)}
                        >
                          View Schedule
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
                          <div
                            className={`absolute -bottom-2 -right-2 px-2 py-1 rounded text-[10px] font-bold uppercase text-white shadow-sm ${viewModalData?.is_alive === "No" ? "bg-red-500" : "bg-green-500"
                              }`}
                          >
                            {viewModalData?.is_alive === "Yes"
                              ? "Alive"
                              : viewModalData?.is_alive === "No"
                                ? "Dead"
                                : "Status N/A"}
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

                      {getAliveStatus(viewModalData) === "yes" && (
                        <DetailItem label="Current Vihar Location" value={viewModalData?.vihar_location || viewModalData?.viharLocation} />
                      )}

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
              <h3 className="text-lg font-semibold text-gray-800">Schedule Visit</h3>
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
                {isSchedulingVisit ? "Saving..." : "Save Schedule"}
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
                    {formatDate(viewScheduleModalData.schedule.date)}
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
    </div>
  );
};

export default DiksharthiListing;
