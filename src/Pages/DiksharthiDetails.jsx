import { Plus, RotateCcw, Search } from "lucide-react";
import { Link } from "react-router-dom";

const DiksharthiListing = () => {
  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
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

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4 items-center mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by Name or ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
          />
        </div>

        <select className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 focus:outline-none min-w-[150px]">
          <option>All Sects</option>
        </select>

        <select className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 focus:outline-none min-w-[150px]">
          <option>All Pads</option>
        </select>

        <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500 transition-colors">
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Table Section */}
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
            {/* Empty State as shown in your image */}
            <tr>
              <td
                colSpan="7"
                className="px-6 py-20 text-center text-gray-500 text-sm italic"
              >
                No records found. Click 'Add New' to begin.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiksharthiListing;
