import axios from "axios";
import JoditEditor from "jodit-react";
import { ChevronDown, FileText, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import { useAuth } from "../context/AuthContext";
import { RELATIONS } from "../utils/constants";
import { getMaxDOB } from "../utils/validation";

const initialFormData = {
  sadhu_sadhvi_name: "",
  dob: "",
  age: "",
  gender: "",
  pad: "",
  samudaay: "",
  guruName: "",
  acharya: "",
  gadipati: "",
  isAlive: "",
  viharLocation: "",
  samadhiDate: "", // Optional
  samadhiPlace: "", // Optional
  rbfCriteria: "",
  relation: "",
  relation_name: "",   // ✅ add this
  isMarried: "",       // ✅ add this
  family_member_firstName: "",
  family_member_lastName: "",
  mobileNo: "",
  altMobileNo: "",
  permanentAddress: "",
  currentAddress: "",
  village: "",
  taluka: "",
  district: "",
  state: "",
  pinCode: "",
  assistanceReceived: "",
  assistance: [], // checkbox ke liye array
  // family_relation: [], // checkbox ke liye array
  summary: "",  // 👈 new field
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
  gadipati: record?.gadipati || "",
  isAlive: record?.isAlive || record?.is_alive || "",
  viharLocation: record?.viharLocation || record?.vihar_location || "",
  samadhiDate: toInputDate(record?.samadhiDate || record?.samadhi_date),
  samadhiPlace: record?.samadhiPlace || record?.samadhi_place || "",
  rbfCriteria: record?.rbfCriteria || record?.rbf_criteria || "",
  relation: record?.relation || "",
  relation_name: record?.relation_name || "",
  isMarried: record?.isMarried || record?.is_married || "",
  family_member_firstName: record?.family_member_firstName || "",
  family_member_lastName: record?.family_member_lastName || "",
  mobileNo: record?.mobileNo || record?.mobile_no || "",
  altMobileNo: record?.altMobileNo || record?.alt_mobile_no || "",
  permanentAddress: record?.permanentAddress || record?.permanent_address || "",
  currentAddress: record?.currentAddress || record?.current_address || "",
  village: record?.village || "",
  taluka: record?.taluka || "",
  district: record?.district || "",
  state: record?.state || "",
  assistance: record?.assistance,
  deselected_assistance: record?.deselected_assistance,
  pinCode: record?.pinCode || record?.pin_code || "",
  family_relation: String(record?.family_relation || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  assistanceReceived: record?.assistanceReceived || record?.assistance_received || "",
  summary: record?.summary || "",
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
  gadipati: formData.gadipati,
  is_alive: formData.isAlive,
  vihar_location: formData.viharLocation || null,
  samadhi_date: formData.samadhiDate || null,
  samadhi_place: formData.samadhiPlace || null,
  rbf_criteria: formData.rbfCriteria,
  relation: formData.relation,
  relation_name: formData.relation_name || null,
  is_married: formData.isMarried || null,
  family_member_firstName: formData.family_member_firstName,
  family_member_lastName: formData.family_member_lastName,
  mobile_no: formData.mobileNo,
  alt_mobile_no: formData.altMobileNo,
  permanent_address: formData.permanentAddress,
  current_address: formData.currentAddress,
  village: formData.village,
  taluka: formData.taluka,
  district: formData.district,
  state: formData.state,
  pin_code: formData.pinCode,
  assistance: formData.assistance,
  assistance_received: formData.assistanceReceived,
  summary: formData.summary,

});

const MOBILE_REGEX = /^\d{10}$/;
const PINCODE_REGEX = /^\d{6}$/;

const getFamilyNumber = (record) =>
  record?.family_details?.family_id ||
  record?.family_id ||
  "";

const getFamilyMemberLabel = (record) => {
  const first = String(record?.family_member_firstName || "").trim();
  const last = String(record?.family_member_lastName || "").trim();
  return `${first} ${last}`.trim() || "-";
};

const DiksharthiDetailsAdd = () => {
  const location = useLocation();
  const { user } = useAuth();
  const editRecord = location?.state?.mode === "edit" ? location?.state?.diksharthiData : null;
  const editId = editRecord?.id || location?.state?.id || null;
  const isEditMode = Boolean(editId);

  const [photo, setPhoto] = useState(null);
  const [uploadDoc, setUploadDoc] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [savedId, setSavedId] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  console.log(formData, "formData")
  const [isEditLoading, setIsEditLoading] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [allDiksharthi, setAllDiksharthi] = useState([]);
  const [isDiksharthiListLoading, setIsDiksharthiListLoading] = useState(false);
  const [diksharthiSearch, setDiksharthiSearch] = useState("");
  const [selectedSourceDiksharthi, setSelectedSourceDiksharthi] = useState(null);

  const [postOffices, setPostOffices] = useState([]);
  const rbfMandatoryFields = [
    "family_member_firstName",
    "family_member_lastName",
    "mobileNo",
    "permanentAddress",
    "pinCode",
    "district",
    "state",
  ];

  const [assistanceTypes] = useState(["Medical", "Education", "Job", "Grocery", "Rent", "Housing", "Vaiyavacch", "LivelihoodExpenses", "Business"]);


  const validateRbfField = (fieldName, fieldValue, rbfCriteria) => {
    if (rbfCriteria !== "Yes") return "";

    const value = String(fieldValue || "").trim();

    if (
      [
        "family_member_firstName",
        "family_member_lastName",
        "permanentAddress",
        "district",
        "state",
      ].includes(fieldName) &&
      !value
    ) {
      return "Required";
    }

    if (fieldName === "mobileNo") {
      if (!value) return "Required";
      if (!MOBILE_REGEX.test(value)) return "Mobile number must be 10 digits";
    }

    if (fieldName === "altMobileNo") {
      if (!value) return ""; // optional field hai 👍
      if (!MOBILE_REGEX.test(value)) return "Alt Mobile number must be 10 digits";
    }

    if (fieldName === "pinCode") {
      if (!value) return "Required";
      if (!PINCODE_REGEX.test(value)) return "Pin code must be 6 digits";
    }

    return "";
  };



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

  useEffect(() => {
    const fetchAllDiksharthi = async () => {
      try {
        setIsDiksharthiListLoading(true);
        const response = await fetch(`${API}/api/get-diksharthi`);
        const result = await response.json().catch(() => ({}));
        const rows = Array.isArray(result?.data) ? result.data : [];
        const currentId = editId ? String(editId) : "";
        const filteredRows = rows.filter((item) => String(item?.id) !== currentId);
        setAllDiksharthi(filteredRows);
      } catch (error) {
        console.error(error);
      } finally {
        setIsDiksharthiListLoading(false);
      }
    };

    fetchAllDiksharthi();
  }, [editId]);

  const handleSelectSourceDiksharthi = (selected) => {
    if (!selected) return;

    setSelectedSourceDiksharthi(selected);
    setDiksharthiSearch(
      `${selected?.sadhu_sadhvi_name || ""} (${selected?.diksharthi_code || selected?.id || ""})`
    );

    setFormData((prev) => {
      const nextState = {
        ...prev,
        rbfCriteria: "Yes",
        relation: selected?.relation || prev.relation || "",
        relation_name: selected?.relation_name || prev.relation_name || "",
        isMarried: selected?.is_married || selected?.isMarried || prev.isMarried || "",
        family_member_firstName: selected?.family_member_firstName || prev.family_member_firstName || "",
        family_member_lastName: selected?.family_member_lastName || prev.family_member_lastName || "",
        mobileNo: selected?.mobile_no || selected?.mobileNo || prev.mobileNo || "",
        altMobileNo: selected?.alt_mobile_no || selected?.altMobileNo || prev.altMobileNo || "",
        permanentAddress: selected?.permanent_address || selected?.permanentAddress || prev.permanentAddress || "",
        currentAddress: selected?.current_address || selected?.currentAddress || prev.currentAddress || "",
        village: selected?.village || prev.village || "",
        taluka: selected?.taluka || prev.taluka || "",
        district: selected?.district || prev.district || "",
        state: selected?.state || prev.state || "",
        pinCode: selected?.pin_code || selected?.pinCode || prev.pinCode || "",
      };

      if (String(nextState.pinCode || "").length === 6) {
        fetchPincodeDetails(nextState.pinCode);
      }

      return nextState;
    });

    setErrors((prev) => {
      const next = { ...prev };
      [
        "relation",
        "family_member_firstName",
        "family_member_lastName",
        "mobileNo",
        "altMobileNo",
        "permanentAddress",
        "pinCode",
        "district",
        "state",
      ].forEach((field) => delete next[field]);
      return next;
    });
  };

  const clearSelectedSourceDiksharthi = () => {
    setSelectedSourceDiksharthi(null);
    setDiksharthiSearch("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === "mobileNo" || name === "altMobileNo") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "pinCode") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setFormData((prev) => {
      let nextState = { ...prev, [name]: sanitizedValue };

      if (name === "pinCode") {
        if (sanitizedValue.length === 6) {
          fetchPincodeDetails(sanitizedValue);
        }
      }

      // Auto-calculate age when DOB changes
      if (name === "dob") {
        nextState.age = calculateAge(sanitizedValue);
      }

      if (name === "isAlive") {
        nextState.viharLocation = sanitizedValue === "Yes" ? prev.viharLocation : "";
        if (sanitizedValue === "Yes") {
          nextState.samadhiDate = "";
          nextState.samadhiPlace = "";
        }
      }
      if (name === "rbfCriteria" && sanitizedValue === "No") {
        nextState.relation = "";
        nextState.family_member_firstName = "";
        nextState.family_member_lastName = "";
        nextState.mobileNo = "";
        nextState.permanentAddress = "";
        nextState.pinCode = "";
        nextState.district = "";
        nextState.state = "";
        nextState.assistanceReceived = "";
        nextState.assistance = [];
      }

      if (name === "relation" && value !== "other") {
        nextState.relation_name = "";
      }

      if (name === "relation" && value !== "sister" && value !== "daughter") {
        nextState.isMarried = "";
      }

      if (name === "isMarried" && value === "Yes") {
        nextState.assistanceReceived = "";
      }
      return nextState;
    });

    const nextRbfCriteria = name === "rbfCriteria" ? sanitizedValue : formData.rbfCriteria;

    if (name === "rbfCriteria" && sanitizedValue !== "Yes") {
      setErrors((prev) => {
        const next = { ...prev };
        [
          "relation",
          "family_member_firstName",
          "family_member_lastName",
          "mobileNo",
          "permanentAddress",
          "pinCode",
          "district",
          "state",
          "assistanceReceived",
        ].forEach((field) => delete next[field]);
        return next;
      });
      return;
    }

    if (rbfMandatoryFields.includes(name) || name === "relation") {
      const errorMessage =
        name === "relation" && nextRbfCriteria === "Yes" && !String(sanitizedValue || "").trim()
          ? "Required for RBF"
          : validateRbfField(name, sanitizedValue, nextRbfCriteria);

      setErrors((prev) => {
        const next = { ...prev };
        if (errorMessage) next[name] = errorMessage;
        else delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.sadhu_sadhvi_name) newErrors.sadhu_sadhvi_name = "Required";
    if (!formData.gender) newErrors.gender = "Required";
    // if (!formData.pad) newErrors.pad = "Required";
    if (!formData.samudaay) newErrors.samudaay = "Required";
    // if (!formData.guruName) newErrors.guruName = "Required";
    if (!formData.gadipati) newErrors.gadipati = "Required";
    // if (!formData.isAlive) newErrors.isAlive = "Required";
    if (!formData.rbfCriteria) newErrors.rbfCriteria = "Required";

    if (formData.rbfCriteria === "Yes" && !formData.relation) {
      newErrors.relation = "Required for RBF";
    }
    if (formData.rbfCriteria === "Yes" && !formData.family_member_firstName) {
      newErrors.family_member_firstName = "Required for RBF";
    }
    if (formData.rbfCriteria === "Yes" && !formData.family_member_lastName) {
      newErrors.family_member_lastName = "Required for RBF";
    }
    if (formData.rbfCriteria === "Yes" && !String(formData.mobileNo || "").trim()) {
      newErrors.mobileNo = "Required";
    } else if (formData.rbfCriteria === "Yes" && !MOBILE_REGEX.test(String(formData.mobileNo || "").trim())) {
      newErrors.mobileNo = "Mobile number must be 10 digits";
    }
    if (formData.rbfCriteria === "Yes" && !String(formData.permanentAddress || "").trim()) {
      newErrors.permanentAddress = "Required";
    }
    if (formData.rbfCriteria === "Yes" && !String(formData.pinCode || "").trim()) {
      newErrors.pinCode = "Required";
    } else if (formData.rbfCriteria === "Yes" && !PINCODE_REGEX.test(String(formData.pinCode || "").trim())) {
      newErrors.pinCode = "Pin code must be 6 digits";
    }
    if (formData.rbfCriteria === "Yes" && !String(formData.district || "").trim()) {
      newErrors.district = "Required";
    }
    if (formData.rbfCriteria === "Yes" && !String(formData.state || "").trim()) {
      newErrors.state = "Required";
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
      const loggedInUserId = user?.id || user?.user_id || user?.userId || "";
      if (!loggedInUserId) {
        alert("Login user id missing. Please login again.");
        return;
      }
      const data = new FormData();
      const payload = mapFormDataToApiPayload(formData, loggedInUserId);
      Object.entries(payload).forEach(([key, value]) => {
        data.append(key, value ?? "");
      });
      if (photo) data.append("photo", photo);
      if (uploadDoc) data.append("uploadDoc", uploadDoc);

      const response = isEditMode
        ? await axios.put(`${API}/api/update-diksharthi/${editId}`, data)
        : await axios.post(`${API}/api/create-diksharthi`, data);

      const diksharthi = response?.data?.data || editRecord || {};
      const targetId = diksharthi?.id || editId || null;
      setSavedId(diksharthi?.diksharthi_code || diksharthi?.id);
      setShowModal(!isEditMode);
      if (!targetId) {
        navigate("/diksharthi-details");
        return;
      }
    } catch (error) {
      console.error(error);
      alert("Error saving data");
    }
  };


  const filteredRelations = RELATIONS.filter((item) => {
    if (formData.gender === "Sadhu" && item.value === "Husband") {
      return false;
    }
    if (formData.gender === "Sadhvi" && item.value === "Wife") {
      return false;
    }
    return true;
  });

  const normalizedDiksharthiSearch = String(diksharthiSearch || "").trim().toLowerCase();
  const filteredDiksharthiOptions = normalizedDiksharthiSearch
    ? allDiksharthi
      .filter((item) => {
        const familyNumber = String(getFamilyNumber(item) || "").toLowerCase();
        const searchFields = [
          item?.sadhu_sadhvi_name,
          item?.diksharthi_code,
          item?.mobile_no,
          item?.family_member_firstName,
          item?.family_member_lastName,
          familyNumber,
        ]
          .map((value) => String(value || "").toLowerCase())
          .join(" ");

        return searchFields.includes(normalizedDiksharthiSearch);
      })
      .slice(0, 8)
    : [];

  return (
    <div className="min-h-full bg-gray-50 flex p-6 justify-center">
      <div className="w-full max-w-8xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-8 text-slate-800">
          <FileText size={20} />
          <h2 className="text-xl font-bold"> Ratnakukshi Family Basic Info</h2>
        </div>

        <div className="mb-6 border border-slate-200 rounded-lg p-4 bg-slate-50">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Search M.S. Name / MS ID
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={diksharthiSearch}
              onChange={(e) => {
                setDiksharthiSearch(e.target.value);
                if (selectedSourceDiksharthi) setSelectedSourceDiksharthi(null);
              }}
              placeholder="Type M.S. Name, M.S. ID..."
              className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-md outline-none"
            />
            {diksharthiSearch && (
              <button
                type="button"
                onClick={clearSelectedSourceDiksharthi}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {isDiksharthiListLoading && (
            <p className="text-xs text-slate-500 mt-2">Loading diksharthi list...</p>
          )}

          {!isDiksharthiListLoading && normalizedDiksharthiSearch && filteredDiksharthiOptions.length > 0 && (
            <div className="mt-2 border border-slate-200 rounded-md bg-white max-h-64 overflow-auto">
              {filteredDiksharthiOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSourceDiksharthi(item)}
                  className="w-full text-left px-3 py-2 border-b border-slate-100 last:border-b-0 hover:bg-yellow-50"
                >
                  <p className="text-sm font-medium text-slate-800">
                    {item?.sadhu_sadhvi_name || "-"} ({item?.diksharthi_code || item?.id})
                  </p>
                  <p className="text-xs text-slate-500">
                    Family No: {getFamilyNumber(item) || "-"} | Family Member: {getFamilyMemberLabel(item)}
                  </p>
                </button>
              ))}
            </div>
          )}

          {!isDiksharthiListLoading && normalizedDiksharthiSearch && filteredDiksharthiOptions.length === 0 && (
            <p className="text-xs text-slate-500 mt-2">No matching diksharthi found.</p>
          )}

          {selectedSourceDiksharthi && (
            <div className="mt-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
              Selected: {selectedSourceDiksharthi?.sadhu_sadhvi_name || "-"} ({selectedSourceDiksharthi?.diksharthi_code || selectedSourceDiksharthi?.id})
              {" | "}
              Family No: {getFamilyNumber(selectedSourceDiksharthi) || "-"}
              {" | "}
              Family member fields are auto-filled.
            </div>
          )}
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth of M.S.</label>
            <input name="dob" max={getMaxDOB()} value={formData.dob} onChange={handleChange} type="date" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
          </div>

          {/* Age (Manual Input) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Age of M.S.</label>
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
                <option>Panyas</option>
                <option>Sadhviji</option>
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
          {/* <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gaachh</label>
            <input name="gaachh" value={formData.gaachh} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
          </div> */}

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
              <option value="Yes">Vidyamaan</option>
              <option value="No">Kaaldharma</option>
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
              <input
                type="date"
                name="samadhiDate"
                value={formData.samadhiDate}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}  // ✅ TODAY MAX
                className="w-full p-2 border border-slate-300 rounded-md"
              />
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
                {filteredRelations.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {errors.relation && <p className="text-red-500 text-xs">{errors.relation}</p>}
            </div>
          )}

          {formData.relation === "Other" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Relation Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="relation_name"
                value={formData.relation_name || ""}
                onChange={handleChange}
                placeholder="Enter relation name"
                className="w-full p-2 border border-slate-300 rounded-md outline-none"
              />

              {errors.relation_name && (
                <p className="text-red-500 text-xs">{errors.relation_name}</p>
              )}
            </div>
          )}

          {(formData.relation === "Sister" || formData.relation === "Daughter") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Is Married? <span className="text-red-500">*</span>
              </label>

              <select
                name="isMarried"
                value={formData.isMarried}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded-md outline-none"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>

              {errors.isMarried && (
                <p className="text-red-500 text-xs">{errors.isMarried}</p>
              )}
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Family Member First Name<span className="text-red-500">*</span></label>
              <input name="family_member_firstName" value={formData.family_member_firstName} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
              {errors.family_member_firstName && <p className="text-red-500 text-xs">{errors.family_member_firstName}</p>}
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Family Member Last Name<span className="text-red-500">*</span></label>
              <input name="family_member_lastName" value={formData.family_member_lastName} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
              {errors.family_member_lastName && <p className="text-red-500 text-xs">{errors.family_member_lastName}</p>}
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
              <input
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                type="text"
                inputMode="numeric"
                maxLength={10}
                className="w-full p-2 border border-slate-300 rounded-md outline-none"
              />
              {errors.mobileNo && <p className="text-red-500 text-xs">{errors.mobileNo}</p>}
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alternate Mobile Number</label>
              <input name="altMobileNo"
                value={formData.altMobileNo}
                onChange={handleChange}
                type="text"
                inputMode="numeric"
                maxLength={10}
                className="w-full p-2 border border-slate-300 rounded-md outline-none" />
              {errors.altMobileNo && <p className="text-red-500 text-xs">{errors.altMobileNo}</p>}
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <>
              {/* Permanent Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Permanent Address <span className="text-red-500">*</span>
                </label>

                <input
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded-md outline-none"
                />

                {errors.permanentAddress && (
                  <p className="text-red-500 text-xs">{errors.permanentAddress}</p>
                )}
              </div>

              {/* ✅ Checkbox */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  name="sameAddress"
                  checked={formData.sameAddress || false}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    setFormData((prev) => ({
                      ...prev,
                      sameAddress: checked,
                      currentAddress: checked ? prev.permanentAddress : ""
                    }));
                  }}
                />
                <label className="text-sm text-slate-700 cursor-pointer">
                  Same as Permanent Address
                </label>
              </div>

              {/* Current Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Current Address
                </label>

                <input
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleChange}
                  type="text"
                  disabled={formData.sameAddress} // ✅ disable when checked
                  className="w-full p-2 border border-slate-300 rounded-md outline-none bg-gray-100"
                />
              </div>
            </>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pin Code <span className="text-red-500">*</span></label>
              <input
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="w-full p-2 border border-slate-300 rounded-md outline-none"
              />
              {errors.pinCode && <p className="text-red-500 text-xs">{errors.pinCode}</p>}
            </div>

          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Village / Post Office</label>
              <select
                value={formData.village || ""}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">District / City <span className="text-red-500">*</span></label>
              <input name="district" value={formData.district} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
              {errors.district && <p className="text-red-500 text-xs">{errors.district}</p>}
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State <span className="text-red-500">*</span></label>
              <input name="state" value={formData.state} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
              {errors.state && <p className="text-red-500 text-xs">{errors.state}</p>}
            </div>
          )}
          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                RBF Assistance Required ? <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="assistanceReceived"
                    value="Yes"
                    checked={formData.assistanceReceived === "Yes"}
                    onChange={handleChange}
                  />
                  Yes
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="assistanceReceived"
                    value="No"
                    checked={formData.assistanceReceived === "No"}
                    onChange={handleChange}
                  />
                  No
                </label>
              </div>

              {errors.assistanceReceived && (
                <p className="text-red-500 text-xs">{errors.assistanceReceived}</p>
              )}
            </div>
          )}



          {formData.assistanceReceived === "Yes" && (

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload Documents</label>
              <input
                type="file"
                accept=".png, .jpg, .jpeg"
                onChange={(e) => setUploadDoc(e.target.files[0])}
                className="w-full p-2 border border-slate-300 rounded-md" />
            </div>
          )}
        </div>

        {formData.assistanceReceived === "Yes" && (
          <div className="my-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Assistance</label>
            <div className="flex flex-wrap gap-4">
              {assistanceTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={type}
                    checked={formData.assistance?.includes(type)}
                    onChange={(e) => {
                      const value = e.target.value;

                      setFormData((prev) => {
                        const exists = prev.assistance?.includes(value);

                        return {
                          ...prev,
                          assistance: exists
                            ? prev.assistance.filter((a) => a !== value)
                            : [...(prev.assistance || []), value],
                        };
                      });
                    }}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        )}


        <div className="col-span-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Summary
          </label>

          <JoditEditor
            value={formData.summary}
            onBlur={(newContent) =>
              setFormData((prev) => ({
                ...prev,
                summary: newContent,
              }))
            }
          />
        </div>

        <div className="col-span-4 mt-2">
          {formData?.deselected_assistance?.length ? (
            <>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Assistance Reasons
              </label>

              <div className="space-y-2">
                <p className="text-sm text-red-500">
                  The Karyakarta has deselected assistance for the following reason(s):
                </p>

                <ul className="list-disc pl-5 text-sm text-red-500">
                  {formData.deselected_assistance.map((item, index) => (
                    <li key={index} className="leading-relaxed">
                      <span className="font-semibold">{item.type}</span>{" "}
                      — {item.reason}{" "}
                      <span className="text-red-500">({item.relation})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
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
