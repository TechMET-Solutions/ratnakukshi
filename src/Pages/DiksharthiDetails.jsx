import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";

const DiksharthiListing = () => {
const navigate = useNavigate();
const role = localStorage.getItem("role");
const [sendingId, setSendingId] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

const [diksharthiList, setDiksharthiList] = useState([]);

const expectedStatus = role === "admin" ? "send" : "pending";

const fetchDiksharthiList = async () => {
  try {
    const res = await fetch(`${API}/api/get-diksharthi`);
    const data = await res.json();
    const allRecords = Array.isArray(data?.data) ? data.data : [];

    const filteredRecords = allRecords.filter(
      (item) => String(item?.status || "pending").toLowerCase() === expectedStatus
    );

    setDiksharthiList(filteredRecords);
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  fetchDiksharthiList();
}, [expectedStatus]);

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
    
    
  return (
    <div className="p-8 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-700">
          Diksharthi Details
        </h1>
        <Link
          to="/diksharthi-details-add"
          className="bg-[#d94452] hover:bg-[#c13946] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add New Diksharthi
        </Link>
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
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
  {paginatedList.length === 0 ? (
    <tr>
      <td
        colSpan="7"
        className="px-6 py-20 text-center text-gray-500 text-sm italic"
      >
        No records found.
      </td>
    </tr>
  ) : (
    paginatedList.map((diksharthi) => (
      <tr key={diksharthi.id} className="border-b border-gray-100">
        {/* Photo */}
        <td className="px-6 py-3">
          <img
            src={`${API}/uploads/${diksharthi.photo}`}
            alt=""
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

        {/* Actions */}
        <td className="px-6 py-3 flex gap-3">
          {role === "staff" ? (
            <button
              className="rounded-lg bg-blue-600 text-sm px-2 py-1 text-white"
              onClick={() => handleSendToAdmin(diksharthi.id)}
              disabled={sendingId === diksharthi.id}
            >
              {sendingId === diksharthi.id ? "Sending..." : "Send to Karyakarta"}
            </button>
          ) : (
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
        </td>
      </tr>
    ))
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
    </div>
  );
};

export default DiksharthiListing;
