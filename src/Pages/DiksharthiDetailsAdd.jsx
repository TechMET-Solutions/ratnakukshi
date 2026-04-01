import axios from "axios";
import { ChevronDown, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import { useAuth } from "../context/AuthContext";
import { getMaxDOB } from "../utils/validation";
import { RELATIONS } from "../utils/constants";

const initialFormData = {
  sadhu_sadhvi_name: "",
  dob: "",
  age: "",
  gender: "",
  pad: "",
  samudaay: "",
  guruName: "",
  acharya: "",
  gaachh: "",
  gadipati: "",
  isAlive: "",
  viharLocation: "",
  samadhiDate: "", // Optional
  samadhiPlace: "", // Optional
  rbfCriteria: "",
  relation: "",
  relationName: "",
  mobileNo: "",
  altMobileNo: "",
  permanentAddress: "",
  currentAddress: "",
  village: "",
  taluka: "",
  district: "",
  state: "",
  pinCode: "",
};

// Helper to calculate age from DOB
const calculateAge = (dob) => {
  if (!dob) return "";
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : "";
};


const toInputDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().split("T")[0];
};

const mapDiksharthiToFormData = (record) => ({
  sadhu_sadhvi_name: record?.sadhu_sadhvi_name || "",
  dob: toInputDate(record?.dob),
  age: record?.age || calculateAge(record?.dob),
  gender: record?.gender || "",
  pad: record?.pad || "",
  samudaay: record?.samudaay || "",
  guruName: record?.guruName || record?.guru_name || "",
  acharya: record?.acharya || "",
  gaachh: record?.gaachh || "",
  gadipati: record?.gadipati || "",
  isAlive: record?.isAlive || record?.is_alive || "",
  viharLocation: record?.viharLocation || record?.vihar_location || "",
  samadhiDate: toInputDate(record?.samadhiDate || record?.samadhi_date),
  samadhiPlace: record?.samadhiPlace || record?.samadhi_place || "",
  rbfCriteria: record?.rbfCriteria || record?.rbf_criteria || "",
  relation: record?.relation || "",
  relationName: record?.relationName || record?.family_member_name || "",
  mobileNo: record?.mobileNo || record?.mobile_no || "",
  altMobileNo: record?.altMobileNo || record?.alt_mobile_no || "",
  permanentAddress: record?.permanentAddress || record?.permanent_address || "",
  currentAddress: record?.currentAddress || record?.current_address || "",
  village: record?.village || "",
  taluka: record?.taluka || "",
  district: record?.district || "",
  state: record?.state || "",
  pinCode: record?.pinCode || record?.pin_code || "",
});

const mapFormDataToApiPayload = (formData, userId) => ({
  user_id: userId || "",
  sadhu_sadhvi_name: formData.sadhu_sadhvi_name,
  dob: formData.dob,
  age: formData.age,
  gender: formData.gender,
  pad: formData.pad,
  samudaay: formData.samudaay,
  guru_name: formData.guruName,
  acharya: formData.acharya,
  gaachh: formData.gaachh,
  gadipati: formData.gadipati,
  is_alive: formData.isAlive,
  vihar_location: formData.viharLocation,
  samadhi_date: formData.samadhiDate,
  samadhi_place: formData.samadhiPlace,
  rbf_criteria: formData.rbfCriteria,
  relation: formData.relation,
  family_member_name: formData.relationName,
  mobile_no: formData.mobileNo,
  alt_mobile_no: formData.altMobileNo,
  permanent_address: formData.permanentAddress,
  current_address: formData.currentAddress,
  village: formData.village,
  taluka: formData.taluka,
  district: formData.district,
  state: formData.state,
  pin_code: formData.pinCode,
});

const DiksharthiDetailsAdd = () => {
  const location = useLocation();
  const { user } = useAuth();
  const editRecord = location?.state?.mode === "edit" ? location?.state?.diksharthiData : null;
  const editId = editRecord?.id || location?.state?.id || null;
  const isEditMode = Boolean(editId);

  const [photo, setPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [savedId, setSavedId] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const [postOffices, setPostOffices] = useState([]);

  const fetchPincodeDetails = async (pincode) => {
    try {
      const res = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = res.data;

      if (data[0].Status === "Success") {
        setPostOffices(data[0].PostOffice); // 👈 all villages
      } else {
        setPostOffices([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // const fetchPincodeDetails = async (pincode) => {
  //   try {
  //     const res = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
  //     const data = res.data;

  //     if (data[0].Status === "Success") {
  //       const postOffice = data[0].PostOffice[0];

  //       setFormData((prev) => ({
  //         ...prev,
  //         state: postOffice.State,
  //         district: postOffice.District,
  //         taluka: postOffice.Block,   // Taluka
  //         village: postOffice.Name,   // Village/Post office
  //       }));
  //     }
  //   } catch (error) {
  //     console.error("Pincode fetch error", error);
  //   }
  // };

  useEffect(() => {
    if (!isEditMode) return;
    const fetchDiksharthiById = async () => {
      try {
        setIsEditLoading(true);
        const response = await fetch(`${API}/api/diksharthi/${editId}`);
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result?.data) throw new Error("Fetch failed");
        setFormData(mapDiksharthiToFormData(result?.data));
      } catch (error) {
        console.error(error);
      } finally {
        setIsEditLoading(false);
      }
    };
    fetchDiksharthiById();
  }, [isEditMode, editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let nextState = { ...prev, [name]: value };

      if (name === "pinCode") {
        if (value.length === 6) {
          fetchPincodeDetails(value);
        }
      }

      // Auto-calculate age when DOB changes
      if (name === "dob") {
        nextState.age = calculateAge(value);
      }

      if (name === "isAlive") {
        nextState.viharLocation = value === "Yes" ? prev.viharLocation : "";
        if (value === "Yes") {
          nextState.samadhiDate = "";
          nextState.samadhiPlace = "";
        }
      }
      if (name === "rbfCriteria" && value === "No") {
        nextState.relation = "";
        nextState.relationName = "";
      }
      return nextState;
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.sadhu_sadhvi_name) newErrors.sadhu_sadhvi_name = "Required";
    if (!formData.gender) newErrors.gender = "Required";
    if (!formData.pad) newErrors.pad = "Required";
    if (!formData.samudaay) newErrors.samudaay = "Required";
    if (!formData.guruName) newErrors.guruName = "Required";
    if (!formData.gadipati) newErrors.gadipati = "Required";
    if (!formData.isAlive) newErrors.isAlive = "Required";
    if (!formData.rbfCriteria) newErrors.rbfCriteria = "Required";

    if (formData.rbfCriteria === "Yes" && !formData.relation) {
      newErrors.relation = "Required for RBF";
    }
    if (formData.rbfCriteria === "Yes" && !formData.relationName) {
      newErrors.relationName = "Required for RBF";
    }

    if (formData.isAlive === "Yes" && !formData.viharLocation) {
      newErrors.viharLocation = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const data = new FormData();
      const payload = mapFormDataToApiPayload(formData, user?.id);
      Object.entries(payload).forEach(([key, value]) => {
        data.append(key, value ?? "");
      });
      if (photo) data.append("photo", photo);

      const response = isEditMode
        ? await axios.put(`${API}/api/update-diksharthi/${editId}`, data)
        : await axios.post(`${API}/api/create-diksharthi`, data);

      const diksharthi = response?.data?.data || editRecord;
      setSavedId(diksharthi?.diksharthi_code || diksharthi?.id);
      setShowModal(!isEditMode);
      navigate("/diksharthi-details");
    } catch (error) {
      console.error(error);
      alert("Error saving data");
    }
  };

  return (
    <div className="min-h-full bg-gray-50 flex p-6 justify-center">
      <div className="w-full max-w-8xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-8 text-slate-800">
          <FileText size={20} />
          <h2 className="text-xl font-bold"> Diksharthi Details</h2>
        </div>

        <div className="grid grid-cols-4 gap-6 mt-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name of P. Pujya. Sadhu/ Sadhvi Ji <span className="text-red-500">*</span></label>
            <input name="sadhu_sadhvi_name" value={formData.sadhu_sadhvi_name} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
            {errors.sadhu_sadhvi_name && <p className="text-red-500 text-xs">{errors.sadhu_sadhvi_name}</p>}
          </div>

          {/* DOB (Optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth of Maharaj saheb</label>
            <input name="dob" max={getMaxDOB()} value={formData.dob} onChange={handleChange} type="date" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
          </div>

          {/* Age (Manual Input) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Age of Maharaj saheb</label>
            <input name="age" type="number" value={formData.age} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md outline-none" />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender <span className="text-red-500">*</span></label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" value="Sadhu" checked={formData.gender === "Sadhu"} onChange={handleChange} /> Sadhu</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" value="Sadhvi" checked={formData.gender === "Sadhvi"} onChange={handleChange} /> Sadhvi</label>
            </div>
            {errors.gender && <p className="text-red-500 text-xs">{errors.gender}</p>}
          </div>

          {/* Pad */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pad <span className="text-red-500">*</span></label>
            <div className="relative">
              <select name="pad" value={formData.pad} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md appearance-none">
                <option value="">Select</option>
                <option>Acharya</option>
                <option>Upadyay</option>
                <option>Gani</option>
                <option>Muni</option>
                <option>Other</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400" />
            </div>
            {errors.pad && <p className="text-red-500 text-xs">{errors.pad}</p>}
          </div>

          {/* Samudaay */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Samudaay <span className="text-red-500">*</span></label>
            <input name="samudaay" value={formData.samudaay} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
            {errors.samudaay && <p className="text-red-500 text-xs">{errors.samudaay}</p>}
          </div>

          {/* Guru */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name of respected Guru / Guruni <span className="text-red-500">*</span></label>
            <input name="guruName" value={formData.guruName} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
            {errors.guruName && <p className="text-red-500 text-xs">{errors.guruName}</p>}
          </div>

          {/* Under which Acharya ji */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Under which Acharya ji <span className="text-red-500">*</span></label>
            <input name="acharya" value={formData.acharya} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
            {errors.acharya && <p className="text-red-500 text-xs">{errors.acharya}</p>}
          </div>

          {/* Gaachh */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gaachh</label>
            <input name="gaachh" value={formData.gaachh} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
          </div>

          {/* Gadipati */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name of Gachadhipati <span className="text-red-500">*</span></label>
            <input name="gadipati" value={formData.gadipati} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
            {errors.gadipati && <p className="text-red-500 text-xs">{errors.gadipati}</p>}
          </div>

          {/* Alive */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Is MS currently alive? <span className="text-red-500">*</span></label>
            <select name="isAlive" value={formData.isAlive} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md">
              <option value="">Select</option>
              <option>Yes</option>
              <option>No</option>
            </select>
            {errors.isAlive && <p className="text-red-500 text-xs">{errors.isAlive}</p>}
          </div>

          {formData.isAlive === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vihar Location <span className="text-red-500">*</span></label>
              <input name="viharLocation" value={formData.viharLocation} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md" />

            </div>
          )}

          {/* Optional Samadhi Fields */}
          {formData.isAlive === "No" && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Samadhi Date (Optional)</label>
              <input type="date" name="samadhiDate" value={formData.samadhiDate} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md" />
            </div>
          )}
          {formData.isAlive === "No" && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Samadhi Place (Optional)</label>
              <input name="samadhiPlace" value={formData.samadhiPlace} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Photo of P. Pujya. Sadhu/ Sadhvi Ji</label>
            <input
              type="file"
              accept=".png, .jpg, .jpeg"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="w-full p-2 border border-slate-300 rounded-md" />
          </div>


          {/* RBF Criteria */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">RBF Criteria <span className="text-red-500">*</span></label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="rbfCriteria" value="Yes" checked={formData.rbfCriteria === "Yes"} onChange={handleChange} /> Yes</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="rbfCriteria" value="No" checked={formData.rbfCriteria === "No"} onChange={handleChange} /> No</label>
            </div>
            {errors.rbfCriteria && <p className="text-red-500 text-xs">{errors.rbfCriteria}</p>}
          </div>

          {/* Relation (Conditional) */}
          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Relation to MS <span className="text-red-500">*</span></label>
             <select
                name="relation"
                value={formData.relation}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded-md outline-none"
              >
                <option value="">Select Relation</option>
                {RELATIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {errors.relation && <p className="text-red-500 text-xs">{errors.relation}</p>}
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Family Member First Name<span className="text-red-500">*</span></label>
              <input name="relationName" value={formData.relationName} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
              {errors.relationName && <p className="text-red-500 text-xs">{errors.relationName}</p>}
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Family Member Last Name<span className="text-red-500">*</span></label>
              <input name="relationName" value={formData.relationName} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
              {errors.relationName && <p className="text-red-500 text-xs">{errors.relationName}</p>}
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
              <input name="mobileNo" value={formData.mobileNo} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alternate Mobile Number</label>
              <input name="altMobileNo" value={formData.altMobileNo} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Permanent Address</label>
              <input name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Address</label>
              <input name="currentAddress" value={formData.currentAddress} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pin Code</label>
              <input name="pinCode" value={formData.pinCode} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
            </div>

          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Village</label>

              <select
                onChange={(e) => {
                  const selected = JSON.parse(e.target.value);

                  setFormData((prev) => ({
                    ...prev,
                    village: selected.Name,
                    taluka: selected.Block,
                    district: selected.District,
                    state: selected.State,
                  }));
                }}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select Village</option>
                {postOffices.map((po, index) => (
                  <option key={index} value={JSON.stringify(po)}>
                    {po.Name} ({po.Block})
                  </option>
                ))}
              </select>
              {/* <input name="village" value={formData.village} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" /> */}
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Taluka</label>
              <input name="taluka" value={formData.taluka} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
              <input name="district" value={formData.district} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <input name="state" value={formData.state} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
            </div>
          )}
          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RBF Assistance Received? <span className="text-red-500">*</span></label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="assistanceReceived" value="Yes" checked={formData.assistanceReceived === "Yes"} onChange={handleChange} /> Yes</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="assistanceReceived" value="No" checked={formData.assistanceReceived === "No"} onChange={handleChange} /> No</label>
              </div>
              {errors.assistanceReceived && <p className="text-red-500 text-xs">{errors.assistanceReceived}</p>}
            </div>
          )}

          {formData.assistanceReceived === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Relations</label>
              {/* <input name="state" value={formData.state} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />

              <input
                type="checkbox"
                value={formData.}
                // checked={formData.relation.includes(item.value)}
                onChange={handleChange}
              /> */}

              <div className="flex flex-wrap gap-4">
                {RELATIONS.map((item) => (
                  <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={item.value}
                      checked={formData.relation === item.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          relation: e.target.value,
                        }))
                      }
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          )}

        

       
        </div>



        <div className="p-6 flex justify-between items-center bg-white mt-4">
          <button onClick={() => navigate(-1)} className="bg-[#fbc02d] text-white px-10 py-2 rounded font-bold uppercase text-sm">Cancel</button>
          <button onClick={handleSave} className="bg-[#fbc02d] text-white px-10 py-2 rounded font-bold uppercase text-sm">{isEditMode ? "Update" : "Save"}</button>
        </div>
      </div>
    </div>
  );
};

export default DiksharthiDetailsAdd;
