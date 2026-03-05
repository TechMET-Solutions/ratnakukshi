import axios from "axios";
import { Calendar, ChevronDown, FileText } from "lucide-react";
import { useState } from "react";

const DiksharthiDetailsAdd = () => {
 const [photo, setPhoto] = useState(null);
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

    if (!formData.sadhu_sadhvi_name) newErrors.sadhu_sadhvi_name = "Name of P. Pujya. Sadhu/ Sadhvi Ji Required";
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

    const data = new FormData();

    data.append("sadhu_sadhvi_name", formData.sadhu_sadhvi_name);
    data.append("dob", formData.dob);
    data.append("gender", formData.gender);
    data.append("pad", formData.pad);
    data.append("samudaay", formData.samudaay);
    data.append("guruName", formData.guruName);
    data.append("acharya", formData.acharya);
    data.append("gaachh", formData.gaachh);
    data.append("gadipati", formData.gadipati);
    data.append("isAlive", formData.isAlive);
    data.append("viharLocation", formData.viharLocation);
    data.append("samadhiDate", formData.samadhiDate);
    data.append("samadhiPlace", formData.samadhiPlace);

    if (photo) {
      data.append("photo", photo);
    }

    const response = await axios.post(
      "http://localhost:5000/api/create-diksharthi",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert(response.data.message);

    console.log(response.data);

    // ✅ RESET STATE AFTER SUCCESS
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

  } catch (error) {

    console.error(error);
    alert("Something went wrong");

  }
};

  return (
    <div className="flex min-h-screen font-sans">

      <div className="flex-1">

        <div className="h-32 w-full"></div>

        <div className="p-8 -mt-16">

          <div className="bg-white overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-2">

              <div className="border border-black p-0.5">
                <FileText size={20} />
              </div>

              <h2 className="font-inter font-semibold text-2xl text-gray-800">
                Diksharthi Details
              </h2>

            </div>

            {/* Form */}
            <div className="grid grid-cols-3 gap-6 mt-5">

              {/* Name */}
              <div>

                <label className="text-[20px] text-gray-700">
                  Name of P. Pujya. Sadhu/ Sadhvi Ji
                  <span className="text-red-500">*</span>
                </label>

                <input
                  name="sadhu_sadhvi_name"
                  value={formData.sadhu_sadhvi_name}
                  onChange={handleChange}
                  type="text"
                  className="w-full text-[20px] border border-gray-300 rounded px-3 py-2 text-sm mt-1"
                />

                {errors.sadhu_sadhvi_name && <p className="text-red-500 text-xs">{errors.sadhu_sadhvi_name}</p>}

              </div>


              {/* DOB */}
              <div>

                <label className="text-[20px] text-gray-700">
                  Date of Birth of Maharaj saheb
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">

                  <input
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    type="date"
                    className="w-full text-[20px] border border-gray-300 rounded px-3 py-2 text-sm mt-1"
                  />
                </div>

                {errors.dob && <p className="text-red-500 text-xs">{errors.dob}</p>}

              </div>


              {/* Gender */}
              <div>

                <label className="text-[20px] text-gray-700">
                  Monastic Gender <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-4 mt-2">

                  <label className="flex  text-[20px] items-center gap-2 text-[20px]">

                    <input
                      type="radio"
                      name="gender"
                      value="Sadhu"
                      onChange={handleChange}
                    />

                    Sadhu

                  </label>

                  <label className="flex items-center gap-2 text-[20px]">

                    <input
                      type="radio"
                      name="gender"
                      value="Sadhvi"
                      onChange={handleChange}
                    />

                    Sadhvi

                  </label>

                </div>

                {errors.gender && <p className="text-red-500 text-xs">{errors.gender}</p>}

              </div>


              {/* Pad */}
              <div>

                <label className="text-[20px] text-gray-700">
                  Pad <span className="text-red-500">*</span>
                </label>

                <div className="relative">

                  <select
                    name="pad"
                    value={formData.pad}
                    onChange={handleChange}
                    className="w-full border text-[20px] border-gray-300 rounded px-3 py-1 text-sm mt-1 appearance-none text-[20px]"
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

                <label className="text-[20px] text-gray-700">
                  Samudaay <span className="text-red-500">*</span>
                </label>

                <input
                  name="samudaay"
                  value={formData.samudaay}
                  onChange={handleChange}
                  type="text"
                  className="w-full text-[20px] border border-gray-300 rounded px-3 py-2 text-sm mt-1"
                />

                {errors.samudaay && <p className="text-red-500 text-xs">{errors.samudaay}</p>}

              </div>


              {/* Guru */}
              <div>

                <label className="text-[20px] text-gray-700">
                  Name of respected Guru / Guruni
                  <span className="text-red-500">*</span>
                </label>

                <input
                  name="guruName"
                  value={formData.guruName}
                  onChange={handleChange}
                  type="text"
                  className="w-full text-[20px] border border-gray-300 rounded px-3 py-2 text-sm mt-1"
                />

                {errors.guruName && <p className="text-red-500 text-xs">{errors.guruName}</p>}

              </div>


              {/* Acharya */}
              <div>

                <label className="text-[20px] text-gray-700">
                  Under which Acharya ji
                </label>

                <input
                  name="acharya"
                  value={formData.acharya}
                  onChange={handleChange}
                  type="text"
                  className="w-full text-[20px] border border-gray-300 rounded px-3 py-2 text-sm mt-1"
                />

              </div>


              {/* Gaachh */}
              <div>

                <label className="text-[20px] text-gray-700">
                  Name of Gaachh <span className="text-red-500">*</span>
                </label>

                <input
                  name="gaachh"
                  value={formData.gaachh}
                  onChange={handleChange}
                  type="text"
                  className="w-full text-[20px] border border-gray-300 rounded px-3 py-2 text-sm mt-1"
                />

                {errors.gaachh && <p className="text-red-500 text-xs">{errors.gaachh}</p>}

              </div>


              {/* Gadipati */}
              <div>

                <label className="text-[20px] text-gray-700">
                  Name of Gachadhipati / Gadipati
                  <span className="text-red-500">*</span>
                </label>

                <input
                  name="gadipati"
                  value={formData.gadipati}
                  onChange={handleChange}
                  type="text"
                  className="w-full text-[20px] border border-gray-300 rounded px-3 py-2 text-sm mt-1"
                />

                {errors.gadipati && <p className="text-red-500 text-xs">{errors.gadipati}</p>}

              </div>


              {/* Alive */}
              <div>

                <label className="text-[20px] text-gray-700">
                  Is he/she currently alive
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">

                  <select
                    name="isAlive"
                    value={formData.isAlive}
                    onChange={handleChange}
                    className="w-full text-[20px] border border-gray-300 rounded px-3 py-1 text-sm mt-1 appearance-none text-[20px]"
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

                {errors.isAlive && <p className="text-red-500 text-xs">{errors.isAlive}</p>}

              </div>


              {/* Location */}
              <div>

                <label className="text-[20px] text-gray-700">
                  Current Vihar Location
                  <span className="text-red-500">*</span>
                </label>

                <input
                  name="viharLocation"
                  value={formData.viharLocation}
                  onChange={handleChange}
                  type="text"
                  className="w-full text-[20px] border border-gray-300 rounded px-3 py-2 text-sm mt-1"
                />

                {errors.viharLocation && <p className="text-red-500 text-xs">{errors.viharLocation}</p>}

                          </div>
                        <input
  type="file"
  onChange={(e) => setPhoto(e.target.files[0])}
  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm cursor-pointer bg-gray-50
  file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
  file:text-sm file:font-medium
  file:bg-gray-200 file:text-gray-700
  hover:file:bg-gray-300"
/>
            </div>


            {/* Conditional Samadhi */}
            {formData.isAlive === "No" && (

              <div className="flex gap-6 mt-4">

                <div>

                  <label className="text-[20px] text-gray-700">
                    Samadhi Prapti Date <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="date"
                    name="samadhiDate"
                    value={formData.samadhiDate}
                    onChange={handleChange}
                    className="w-full text-[20px] border border-gray-300 rounded px-3 py-1 mt-1"
                  />

                  {errors.samadhiDate && <p className="text-red-500 text-xs">{errors.samadhiDate}</p>}

                </div>

                <div>

                  <label className="text-[20px] text-gray-700">
                    Samadhi Place (City / Sangh / Tirth)
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    name="samadhiPlace"
                    value={formData.samadhiPlace}
                    onChange={handleChange}
                    type="text"
                    className="w-full text-[20px] border border-gray-300 rounded px-3 py-1 mt-1"
                  />

                  {errors.samadhiPlace && <p className="text-red-500 text-xs">{errors.samadhiPlace}</p>}

                </div>

              </div>

            )}

            {/* Footer */}
            <div className="p-6 flex justify-between items-center bg-white">

              <button className="bg-[#fbc02d] text-white px-10 py-2 rounded font-bold shadow-md uppercase text-sm">
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

        </div>

      </div>

    </div>
  );
};

export default DiksharthiDetailsAdd;