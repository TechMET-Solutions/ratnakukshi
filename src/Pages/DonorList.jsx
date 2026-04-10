import {
  Award,
  CreditCard,
  Edit,
  FileText,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import { useAuth } from "../context/AuthContext";

function DonorList() {
  const navigate = useNavigate();



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


  const { user: loggedInUser } = useAuth();
  const role = normalizeRole(loggedInUser?.role || "");
  const loggedInUserId = loggedInUser?.id ?? null;


  const [donors, setDonors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchDonors = async () => {
    try {
      const response = await fetch(`${API}/api/donor/list`);
      const data = await response.json();

      console.log(response, "DAta")

      if (data.success) {
        setDonors(data.data);
      }
    } catch (error) {
      console.log("Error fetching donors:", error);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);



  const filteredDonors = donors.filter((donor) => {
    const name = donor.personalDetails?.name?.toLowerCase() || "";
    const mobile = donor.personalDetails?.mobileNumber || donor.personalDetails?.mobile || "";

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      mobile.includes(searchTerm);

    if (filterStatus === "Due") return matchesSearch && donor.dueAmount > 0;
    if (filterStatus === "Paid") return matchesSearch && donor.dueAmount === 0;

    return matchesSearch;
  });
  return (
    <div className="p-8 min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-700">Members and Contributions</h1>
        {role === "staff" && (
          <Link
            to="/donor/add"
            className="bg-[#C62026] hover:bg-[#c13946] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add Members & Contributions
          </Link>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* Search and Filter Dropdown */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by name or contact..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-100"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Donors</option>
              <option value="Due">Due Amount</option>
              <option value="Paid">Fully Paid</option>
            </select>
          </div> */}
        </div>

        {/* Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Sr. No.
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Donor Name
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Contact No.
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Total Donation
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Due Amount
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Actions
              </th>
              {/* <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">
                Receipt
              </th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredDonors.length > 0 ? (
              filteredDonors.map((donor, index) => (
                <tr key={donor.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    <div className="flex items-center gap-3">
                      {donor.personalDetails?.photo ? (
                        <img
                          src={donor.personalDetails.photo}
                          alt={donor.personalDetails?.name || "Donor"}
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                          {(donor.personalDetails?.name || "D").charAt(0)}
                        </div>
                      )}
                      <span>
                        {donor.personalDetails?.firstName} {donor.personalDetails?.lastName}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {donor.personalDetails?.mobileNumber}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {donor.personalDetails?.email}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                    ₹{donor.paymentDetails?.totalInstallmentsAmount?.toLocaleString() || 0}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${donor.dueAmount > 0
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-600"
                        }`}
                    >
                      ₹{donor.dueAmount?.toLocaleString() || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-3 text-gray-400">
                        <button
                          onClick={() =>
                            navigate("/donor/add", {
                              state: { id: donor.id },
                            })
                          }
                          className="hover:text-blue-600 transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                      {role === "account" && (
                      <button
                        onClick={() =>
                          navigate("/donor/payment-history", {
                            state: {
                              id: donor.id,
                              donorName: donor.personalDetails?.name || "",
                            },
                          })
                        }
                        className="hover:text-green-600 transition-colors"
                      >
                        <CreditCard size={18} />
                        </button>
                      )}
                      {/* <button className="hover:text-red-600 transition-colors">
                     <Award size={18} />
                   </button> */}
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 text-sm text-center">
                 <button className="text-yellow-600 hover:text-yellow-700 inline-flex items-center gap-1 font-medium">
                   <FileText size={16} />
                   View
                 </button>
               </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="px-6 py-10 text-center text-gray-400"
                >
                  No donors found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DonorList;
