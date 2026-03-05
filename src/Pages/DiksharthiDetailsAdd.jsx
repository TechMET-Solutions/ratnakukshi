// import React from 'react'

// const DiksharthiDetailsAdd = () => {
//   return (
//     <div>

//     </div>
//   )
// }

// export default DiksharthiDetailsAdd
import {
    Calendar,
    ChevronDown,
    FileText
} from "lucide-react";

const DiksharthiDetailsAdd = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Main Content */}
      <div className="flex-1">
        <div className="h-32 bg-gray-200 w-full"></div> {/* Header space */}
        <div className="p-8 -mt-16">
          <div className="bg-white rounded-lg shadow-lg border border-blue-400 overflow-hidden">
            {/* Form Header */}
            <div className="p-4 border-b flex items-center gap-2">
              <div className="border border-black p-0.5">
                <FileText size={14} />
              </div>
              <h2 className="font-bold text-gray-800">Diksharthi Details</h2>
            </div>

            {/* Form Body */}
            <div className="p-6 grid grid-cols-3 gap-6">
              <InputGroup label="Name of P. Pujya. Sadhu/ Sadhvi Ji" required />
              <InputGroup
                label="Date of Birth of Maharaj saheb"
                required
                type="date"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Monastic Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="gender" /> Sadhu
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="gender" /> Sadhvi
                  </label>
                </div>
              </div>

              <SelectGroup label="Pad" required />
              <InputGroup label="Samudaay" required />
              <InputGroup label="Name of respected Guru / Guruni" required />

              <InputGroup label="Under which Acharya ji" />
              <InputGroup label="Name of Gaachh" required />
              <InputGroup label="Name of Gachadhipati / Gadipati" required />

              <SelectGroup label="Is he/she currently alive" required />
              <InputGroup label="Current Vihar Location" required />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Photo of P. Pujya. Sadhu/ Sadhvi Ji
                </label>
                <div className="flex items-center gap-2">
                  <button className="border border-gray-400 px-4 py-1 rounded text-sm bg-gray-50">
                    Choose File
                  </button>
                  <span className="text-xs text-gray-500">No File Chosen</span>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="p-6 flex justify-between items-center bg-white">
              <button className="bg-[#fbc02d] text-white px-10 py-2 rounded font-bold shadow-md uppercase text-sm">
                Cancel
              </button>
              <button className="bg-[#fbc02d] text-white px-10 py-2 rounded font-bold shadow-md uppercase text-sm">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }) => (
  <div
    className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors ${active ? "bg-[#fbc02d] text-white" : "hover:bg-blue-500"}`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </div>
);

const InputGroup = ({ label, required, type = "text" }) => (
  <div className="space-y-1">
    <label className="block text-[13px] font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {type === "date" && (
        <Calendar
          size={16}
          className="absolute right-3 top-2.5 text-gray-400"
        />
      )}
    </div>
  </div>
);

const SelectGroup = ({ label, required }) => (
  <div className="space-y-1">
    <label className="block text-[13px] font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-400">
        <option>Select</option>
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
      />
    </div>
  </div>
);

export default DiksharthiDetailsAdd;
