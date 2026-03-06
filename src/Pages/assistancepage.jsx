import axios from "axios";
import {
    CheckCircle,
    Eye,
    FileText,
    Search,
    User,
    XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AssistancePage = () => {
  const [searchType, setSearchType] = useState("sadhu");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [selectedSadhu, setSelectedSadhu] = useState(null);
  const [familyDetails, setFamilyDetails] = useState([]);
    const defaultTableData = [
      {
        member: "Prakash Shah",
        head: "Ravi Shah",
        karyakarta: "Suresh Jain",
        type: "Medical",
        amount: "50,000",
        renewal: "Onetime",
      },
      {
        member: "Nitin Jain",
        head: "Kunal Jain",
        karyakarta: "Anil Mehta",
        type: "Education",
        amount: "40,000",
        renewal: "4 renewals",
      },
      {
        member: "Manish Desai",
        head: "Anuj Desai",
        karyakarta: "Ramesh Shah",
        type: "Business",
        amount: "50,000",
        renewal: "Onetime",
      },
      // Add more rows as needed...
    ];

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/familyAccounting-details")
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
        `http://localhost:5000/api/search-diksharthi?name=${value}`,
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
        `http://localhost:5000/api/family-details/${item.id}`,
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
            {/* <th className="p-4 font-semibold text-slate-700 border-b">
              Requested Amount
            </th> */}
            <th className="p-4 font-semibold text-slate-700 border-b">
              Renewal
            </th>
            <th className="p-4 font-semibold text-slate-700 border-b text-center">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {defaultTableData.map((row, index) => (
            <tr key={index} className="hover:bg-slate-50 transition-colors">
              <td className="p-4 text-slate-600">{row.diksharthi}</td>
              <td className="p-4 text-slate-600">{row.member}</td>
              <td className="p-4 text-slate-600">{row.head}</td>

              <td className="p-4 text-slate-600">{row.type}</td>
              {/* <td className="p-4 text-slate-600">₹ {row.amount}</td> */}
              <td className="p-4 text-slate-600">{row.renewal}</td>
              <td className="p-4">
                <div className="flex justify-center gap-2">
                  <Eye
                    onClick={navigate("/request-details")}
                    size={18} className="text-yellow-500 cursor-pointer" />
                  <CheckCircle
                    size={18}
                    className="text-green-500 cursor-pointer"
                  />
                  <XCircle size={18} className="text-red-500 cursor-pointer" />
                  <FileText
                    size={18}
                    className="text-blue-500 cursor-pointer"
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
      </main>
    </div>
  );
};

export default AssistancePage;
