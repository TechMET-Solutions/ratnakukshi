import axios from "axios";
import { Search, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AssistancePage = () => {
  const [searchType, setSearchType] = useState("sadhu");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [selectedSadhu, setSelectedSadhu] = useState(null);
  const [familyDetails, setFamilyDetails] = useState([]);
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
      familyId: family?.id,
      sadhuName: selectedSadhu?.sadhu_sadhvi_name,
      assistanceData: assistanceData,
    },
  });
};
  return (
    <div className="flex h-screen bg-[#f8fafc]">
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-700">
            Assistance Search
          </h1>
          <p className="text-slate-500 mt-2">
            Search for Diksharthies or Family Heads to provide assistance.
          </p>
        </header>

        {/* Search Card Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center mb-10">
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

        {/* Selected Sadhu & Family Members List */}
        {selectedSadhu &&
          familyDetails.map((family) => (
            <div key={family.id} className="space-y-6">
              {/* Main Header with Sadhu Name */}
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

              {/* Family Members Section (As per your drawing) */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-700 mb-6">
                  Family Members
                </h3>

                <div className="space-y-4">
                  {Object.keys(family.relation_details).map((relation) => {
                    const member = family.relation_details[relation];
                    // Fakt assistance garaj aslele members dakhvayche astil tar he condition vapar:
                    // if (!member.needAssistance) return null;

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
                              {member.assistanceCategories?.join(", ") ||
                                "General"}{" "}
                              Assistance
                            </p>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                         <button
  onClick={() => handleEdit(member, relation, family)}
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
          ))}
      </main>
    </div>
  );
};

export default AssistancePage;
