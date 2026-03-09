import axios from "axios";
import { ChevronDown, FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import { useAuth } from "../context/AuthContext";

const DiksharthiDetailsAdd = () => {

  const {user} = useAuth();

  const [photo, setPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false); // New state for Modal
  const [savedId, setSavedId] = useState("");
  const [formData, setFormData] = useState({
    sadhu_sadhvi_name: "",
    dob: "",
    gender: "",
    pad: "",
    samudaay: "",
    guruName: "",
    acharya: "",
    gaachh: "",
    gadipati: "",
    isAlive: "",
    viharLocation: "",
    samadhiDate: "",
    samadhiPlace: "",
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.sadhu_sadhvi_name)
      newErrors.sadhu_sadhvi_name =
        "Name of P. Pujya. Sadhu/ Sadhvi Ji Required";
    if (!formData.dob) newErrors.dob = "Required";
    if (!formData.gender) newErrors.gender = "Required";
    if (!formData.pad) newErrors.pad = "Required";
    if (!formData.samudaay) newErrors.samudaay = "Required";
    if (!formData.guruName) newErrors.guruName = "Required";
    if (!formData.gaachh) newErrors.gaachh = "Required";
    if (!formData.gadipati) newErrors.gadipati = "Required";
    if (!formData.isAlive) newErrors.isAlive = "Required";
    if (!formData.viharLocation) newErrors.viharLocation = "Required";

    if (formData.isAlive === "No") {
      if (!formData.samadhiDate) newErrors.samadhiDate = "Required";
      if (!formData.samadhiPlace) newErrors.samadhiPlace = "Required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const storedUser = localStorage.getItem("user");
      let parsedUser = null;
      try {
        parsedUser = storedUser ? JSON.parse(storedUser) : null;
      } catch {
        parsedUser = null;
      }
      const loggedInUserId = parsedUser?.id || null;

      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (photo) data.append("photo", photo);
      if (loggedInUserId) {
        data.append("user_id", loggedInUserId);
      }

      const response = await axios.post(`${API}/api/create-diksharthi`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const diksharthi = response.data.data;

      // Get role
      const role = localStorage.getItem("role");

      // 1. Set the ID and show modal
      setSavedId(diksharthi.diksharthi_code || diksharthi.id);
      setShowModal(true);

      // 2. Clear form
      setFormData({
        sadhu_sadhvi_name: "",
        dob: "",
        gender: "",
        pad: "",
        samudaay: "",
        guruName: "",
        acharya: "",
        gaachh: "",
        gadipati: "",
        isAlive: "",
        viharLocation: "",
        samadhiDate: "",
        samadhiPlace: "",
      });

      setPhoto(null);
      setErrors({});

      // 3. Navigate based on role
      setTimeout(() => {

        if (role === "admin") {
          navigate("/family-details", {
            state: {
              id: diksharthi.id,
              diksharthi_code: diksharthi.diksharthi_code,
              sadhu_sadhvi_name: diksharthi.sadhu_sadhvi_name,
              gender: diksharthi.gender,
            },
          });
        } else {
          navigate("/diksharthi-details");
        }

      }, 5000);

    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  
  return (
    <div className="min-h-full bg-gray-50 flex p-6 justify-center">
      <div className="w-full max-w-6xl bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8 text-slate-800">
          <FileText size={20} />
          <h2 className="text-xl font-bold"> Diksharthi Details</h2>
        </div>

        {/* Form */}
        <div className="grid grid-cols-3 gap-6 mt-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name of P. Pujya. Sadhu/ Sadhvi Ji
              <span className="text-red-500">*</span>
            </label>

            <input
              name="sadhu_sadhvi_name"
              value={formData.sadhu_sadhvi_name}
              onChange={handleChange}
              type="text"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
            />

            {errors.sadhu_sadhvi_name && (
              <p className="text-red-500 text-xs">{errors.sadhu_sadhvi_name}</p>
            )}
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date of Birth of Maharaj saheb
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                type="date"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {errors.dob && <p className="text-red-500 text-xs">{errors.dob}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Monastic Gender <span className="text-red-500">*</span>
            </label>

            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="Sadhu"
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                Sadhu
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="Sadhvi"
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                Sadhvi
              </label>
            </div>

            {errors.gender && (
              <p className="text-red-500 text-xs">{errors.gender}</p>
            )}
          </div>

          {/* Pad */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Pad<span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <select
                name="pad"
                value={formData.pad}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="">Select</option>
                <option>Acharya</option>
                <option>Upadyay</option>
                <option>Gani</option>
                <option>Muni</option>
                <option>Other</option>
              </select>

              <ChevronDown
                size={16}
                className="absolute right-3 top-3 text-gray-400"
              />
            </div>

            {errors.pad && <p className="text-red-500 text-xs">{errors.pad}</p>}
          </div>

          {/* Samudaay */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Samudaay<span className="text-red-500">*</span>
            </label>

            <input
              name="samudaay"
              value={formData.samudaay}
              onChange={handleChange}
              type="text"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
            />

            {errors.samudaay && (
              <p className="text-red-500 text-xs">{errors.samudaay}</p>
            )}
          </div>

          {/* Guru */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name of respected Guru / Guruni
              <span className="text-red-500">*</span>
            </label>

            <input
              name="guruName"
              value={formData.guruName}
              onChange={handleChange}
              type="text"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
            />

            {errors.guruName && (
              <p className="text-red-500 text-xs">{errors.guruName}</p>
            )}
          </div>

          {/* Acharya */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Under which Acharya ji<span className="text-red-500">*</span>
            </label>

            <input
              name="acharya"
              value={formData.acharya}
              onChange={handleChange}
              type="text"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          {/* Gaachh */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name of Gaachh<span className="text-red-500">*</span>
            </label>

            <input
              name="gaachh"
              value={formData.gaachh}
              onChange={handleChange}
              type="text"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
            />

            {errors.gaachh && (
              <p className="text-red-500 text-xs">{errors.gaachh}</p>
            )}
          </div>

          {/* Gadipati */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name of Gachadhipati / Gadipati
              <span className="text-red-500">*</span>
            </label>
            <input
              name="gadipati"
              value={formData.gadipati}
              onChange={handleChange}
              type="text"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
            />

            {errors.gadipati && (
              <p className="text-red-500 text-xs">{errors.gadipati}</p>
            )}
          </div>

          {/* Alive */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Is he/she currently alive<span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <select
                name="isAlive"
                value={formData.isAlive}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="">Select</option>
                <option>Yes</option>
                <option>No</option>
              </select>

              <ChevronDown
                size={16}
                className="absolute right-3 top-3 text-gray-400"
              />
            </div>

            {errors.isAlive && (
              <p className="text-red-500 text-xs">{errors.isAlive}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Current Vihar Location<span className="text-red-500">*</span>
            </label>

            <input
              name="viharLocation"
              value={formData.viharLocation}
              onChange={handleChange}
              type="text"
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
            />

            {errors.viharLocation && (
              <p className="text-red-500 text-xs">{errors.viharLocation}</p>
            )}
          </div>

          {/* Photo of P. Pujya. Sadhu/ Sadhvi Ji */}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Photo of P. Pujya. Sadhu/ Sadhvi Ji
              <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>

        {/* Conditional Samadhi */}
        {formData.isAlive === "No" && (
          <div className="flex gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Samadhi Prapti Date<span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                name="samadhiDate"
                value={formData.samadhiDate}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />

              {errors.samadhiDate && (
                <p className="text-red-500 text-xs">{errors.samadhiDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Samadhi Place (City / Sangh / Tirth)
                <span className="text-red-500">*</span>
              </label>

              <input
                name="samadhiPlace"
                value={formData.samadhiPlace}
                onChange={handleChange}
                type="text"
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />

              {errors.samadhiPlace && (
                <p className="text-red-500 text-xs">{errors.samadhiPlace}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 flex justify-between items-center bg-white">
          <button
            onClick={()=> navigate(-1)}
            className="bg-[#fbc02d] text-white px-10 py-2 rounded font-bold shadow-md uppercase text-sm">
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="bg-[#fbc02d] text-white px-10 py-2 rounded font-bold shadow-md uppercase text-sm"
          >
            Save
          </button>
        </div>
      </div>

      {/* --- SUCCESS MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Diksharthi Details Saved Successfully
            </h2>
            <p className="text-gray-600 mb-6">
              Diksharthi details have been saved successfully.
            </p>

            <div className="mb-8">
              <span className="text-xl text-gray-800">
                Diksharthi ID : <span className="font-bold">{savedId}</span>
              </span>
              <p className="text-sm text-gray-500 mt-1">
                (Please note this ID for future reference.)
              </p>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-[#fbc02d] hover:bg-yellow-500 text-white py-3 rounded-lg font-bold text-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiksharthiDetailsAdd;
