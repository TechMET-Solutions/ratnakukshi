import { Plus, RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";

const DiksharthiListing = () => {
const navigate = useNavigate();

const [diksharthiList, setDiksharthiList] = useState([]);



    
   useEffect(() => {
  fetch(`${API}/api/get-diksharthi`)
    .then((res) => res.json())
    .then((data) => {
      setDiksharthiList(data.data);
    })
    .catch((error) => {
      console.error(error);
    });
}, []);
    
    
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
  {diksharthiList.length === 0 ? (
    <tr>
      <td
        colSpan="7"
        className="px-6 py-20 text-center text-gray-500 text-sm italic"
      >
        No records found. Click 'Add New' to begin.
      </td>
    </tr>
  ) : (
    diksharthiList.map((diksharthi) => (
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
          {/* <button className="rounded-lg bg-blue-600 text-sm px-1 py-1 text-white">View</button> */}
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
        </td>
      </tr>
    ))
  )}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default DiksharthiListing;
