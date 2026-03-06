import axios from "axios";
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

const AssistancePage = () => {
  const [searchType, setSearchType] = useState("sadhu");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [selectedSadhu, setSelectedSadhu] = useState(null);
  const [familyDetails, setFamilyDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [activeRow, setActiveRow] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/api/familyAccounting-details`)
      .then((res) => {
        setTableData(res.data.data);
      });
  }, []);

  console.log(familyDetails, "familyDetails");

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
      setResults(res.data.data || []);
    } catch (error) {
      console.error(error);
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
      setFamilyDetails(res.data.data || []);
    } catch (error) {
      console.error(error);
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
  const handleOpenFileModal = (row) => {
    setActiveRow(row);
    setIsModalOpen(true);
  };
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
              Family Head
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
            <tr key={index} className="hover:bg-slate-50 transition-colors">
              <td className="p-4 text-slate-600">{row.diksharthi}</td>
              <td className="p-4 text-slate-600">{row.member_name}</td>
              <td className="p-4 text-slate-600">{row.head}</td>

              <td className="p-4 text-slate-600">{row.type}</td>
              <td
                className={`p-4 font-semibold ${
                  row.status === "Pending"
                    ? "text-yellow-600"
                    : row.status === "Approved"
                      ? "text-green-600"
                      : "text-red-600"
                }`}
              >
                {row.status}
              </td>
              <td className="p-4 text-slate-600">{row.renewal}</td>
              <td className="p-4">
                <div className="flex justify-center gap-2">
                  <Eye
                    size={18}
                    className="text-yellow-500 cursor-pointer"
                    onClick={() => navigate("/request-details", { state: row })}
                  />
                  <CheckCircle
                    size={18}
                    className="text-green-500 cursor-pointer"
                  />
                  <XCircle size={18} className="text-red-500 cursor-pointer" />
                  <FileText
                    size={18}
                    className="text-blue-500 cursor-pointer"
                    onClick={() => handleOpenFileModal(row)}
                  />
                </div>
              </td>
            </tr>
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
                    {Object.keys(family.relation_details).map((relation) => {
                      const member = family.relation_details[relation];

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
                              Edit Assistance
                            </button>
                            <button className="bg-[#cc4b00] hover:bg-[#a63d00] text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm">
                              Close assistance
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          : renderDefaultTable()}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-bold text-slate-800">
                  Staff Queries
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>
              <div className="p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-slate-700">
                      {activeRow?.member}
                    </h4>
                    <p className="text-slate-500 text-sm">
                      Case ID: #ASSIST-{activeRow?.id}024
                    </p>
                  </div>
                  <div className="w-full p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500 italic text-sm">
                      No active queries found for this request.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  Understood
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
