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
  fanIdExists: "",
  fan_id: "",
  sameRelationsWithFan: false,
  relation_name: "",   // ✅ add this
  isMarried: "",       // add this
  familyRelations: [],
  familyRelationDetails: {},
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
  houseDetails: "",
  typeOfHouse: "",
  maintenanceCost: "",
  rentCost: "",
  lightBillCost: "",
  mediclaim: null,
  family_mediclaim_type: "",
  Family_mediclaim_amount: "",
  mediclaimPremiumAmount: "",
  family_mediclaim_companyName: "",
  ngoAssistance: null,
  sanghName: "",
  ngoAmount: "",
  ngoFrequency: "",
  ngoRemark: "",
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

const toBooleanOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["yes", "y", "true", "1"].includes(normalized)) return true;
  if (["no", "n", "false", "0"].includes(normalized)) return false;
  return null;
};

const parseMaybeJsonObject = (value, fallback = {}) => {
  if (!value) return fallback;
  if (typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value !== "string") return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : fallback;
  } catch (_error) {
    return fallback;
  }
};

const createEmptyFamilyRelationDetails = (overrides = {}) => ({
  firstName: "",
  lastName: "",
  mobileNumber: "",
  aadharNumber: "",
  panNumber: "",
  dob: "",
  age: "",
  ayushmanCoverage: "",
  ayushmanAmount: "",
  medicalPolicy: "",
  mediclaimAmount: "",
  mediclaimPremiumAmount: "",
  mediclaimCompanyName: "",
  mediclaimType: "",
  needAssistance: "",
  assistanceCategories: [],
  ...overrides,
});

const getPrimaryFamilyMember = (formData) => {
  const selectedRelations = Array.isArray(formData?.familyRelations)
    ? formData.familyRelations
    : [];
  const detailsMap = formData?.familyRelationDetails || {};
  const preferredRelation = formData?.relation || selectedRelations[0] || "";
  const relationKey =
    preferredRelation && detailsMap[preferredRelation]
      ? preferredRelation
      : selectedRelations.find((item) => detailsMap[item]) || "";
  return {
    relationKey,
    details: relationKey ? detailsMap[relationKey] || {} : {},
  };
};

const mapDiksharthiToFormData = (record) => {
  const rawRelations = String(record?.family_relation || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const relationDetailsFromRecord = parseMaybeJsonObject(
    record?.family_relation_details_json,
    {}
  );
  const relationDetailsFromFamily = parseMaybeJsonObject(
    record?.family_details?.relationDetails,
    {}
  );

  const mergedDetails = {};
  Object.entries({ ...relationDetailsFromRecord, ...relationDetailsFromFamily }).forEach(
    ([key, value]) => {
      mergedDetails[key] = createEmptyFamilyRelationDetails({
        firstName: value?.firstName || "",
        lastName: value?.lastName || "",
        mobileNumber: value?.mobileNumber || value?.mobile_no || "",
        aadharNumber: value?.aadharNumber || "",
        panNumber: value?.panNumber || "",
        dob: toInputDate(value?.dob || value?.dateOfBirth),
        age: value?.age || "",
        ayushmanCoverage:
          value?.ayushmanCoverage ||
          (typeof value?.ayushman === "boolean"
            ? value?.ayushman
              ? "Yes"
              : "No"
            : value?.ayushman) ||
          "",
        ayushmanAmount: value?.ayushmanAmount || value?.amount || "",
        medicalPolicy:
          value?.medicalPolicy ||
          (typeof value?.mediclaim === "boolean"
            ? value?.mediclaim
              ? "Yes"
              : "No"
            : value?.mediclaim) ||
          "",
        mediclaimAmount: value?.mediclaimAmount || "",
        mediclaimPremiumAmount: value?.mediclaimPremiumAmount || "",
        mediclaimCompanyName: value?.mediclaimCompanyName || "",
        mediclaimType: value?.mediclaimType || value?.mediclaim_type || "",
        needAssistance:
          value?.needAssistance ||
          (typeof value?.need_assistance === "boolean"
            ? value?.need_assistance
              ? "Yes"
              : "No"
            : value?.need_assistance) ||
          "",
        assistanceCategories: Array.isArray(value?.assistanceCategories)
          ? value.assistanceCategories
          : [],
      });
    }
  );

  const inferredRelation = record?.relation || "";
  const familyRelations = Array.from(
    new Set([
      ...rawRelations,
      ...Object.keys(mergedDetails),
      ...(inferredRelation ? [inferredRelation] : []),
    ])
  );

  if (inferredRelation && !mergedDetails[inferredRelation]) {
    mergedDetails[inferredRelation] = createEmptyFamilyRelationDetails({
      firstName: record?.family_member_firstName || "",
      lastName: record?.family_member_lastName || "",
      mobileNumber: record?.mobileNo || record?.mobile_no || "",
    });
  }

  return {
    familyRelations,
    familyRelationDetails: mergedDetails,
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
    fanIdExists: record?.fan_id ? "Yes" : "",
    fan_id: record?.fan_id || "",
    sameRelationsWithFan: false,
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
    houseDetails: record?.houseDetails || record?.house_details || "",
    typeOfHouse: record?.typeOfHouse || record?.type_of_house || "",
    maintenanceCost: record?.maintenanceCost || record?.maintenance_cost || "",
    rentCost: record?.rentCost || record?.rent_cost || "",
    lightBillCost: record?.lightBillCost || record?.light_bill_cost || "",
    mediclaim: toBooleanOrNull(record?.mediclaim),
    family_mediclaim_type:
      record?.family_mediclaim_type || record?.Family_mediclaim_type || "",
    Family_mediclaim_amount:
      record?.Family_mediclaim_amount || record?.family_mediclaim_amount || "",
    mediclaimPremiumAmount:
      record?.mediclaimPremiumAmount || record?.mediclaim_premium_amount || "",
    family_mediclaim_companyName:
      record?.family_mediclaim_companyName || "",
    ngoAssistance: toBooleanOrNull(record?.ngoAssistance || record?.ngo_assistance),
    sanghName: record?.sanghName || record?.ngo_sangh_name || "",
    ngoAmount: record?.ngoAmount || record?.ngo_amount || "",
    ngoFrequency: record?.ngoFrequency || record?.ngo_frequency || "",
    ngoRemark: record?.ngoRemark || record?.ngo_remark || "",
    assistance: record?.assistance,
    deselected_assistance: record?.deselected_assistance,
    pinCode: record?.pinCode || record?.pin_code || "",
    assistanceReceived: record?.assistanceReceived || record?.assistance_received || "",
    summary: record?.summary || "",
  };
};

const mapFormDataToApiPayload = (formData, userId, currentStep = 1) => {
  const primaryMember = getPrimaryFamilyMember(formData);
  return {
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
    fan_id_exists: formData.fanIdExists || null,
    fan_id: formData.fan_id || null,
    same_relations_with_fan: formData.sameRelationsWithFan ? "Yes" : "No",
    relation: formData.relation,
    relation_name: formData.relation_name || null,
    is_married: formData.isMarried || null,
    family_member_firstName:
      primaryMember?.details?.firstName || formData.family_member_firstName,
    family_member_lastName:
      primaryMember?.details?.lastName || formData.family_member_lastName,
    mobile_no:
      primaryMember?.details?.mobileNumber || formData.mobileNo,
    family_relation:
      Array.isArray(formData?.familyRelations) ? formData.familyRelations : [],
    family_relation_details_json: JSON.stringify(formData?.familyRelationDetails || {}),
    alt_mobile_no: formData.altMobileNo,
    permanent_address: formData.permanentAddress,
    current_address: formData.currentAddress,
    village: formData.village,
    taluka: formData.taluka,
    district: formData.district,
    state: formData.state,
    pin_code: formData.pinCode,
    house_details: formData.houseDetails,
    type_of_house: formData.typeOfHouse,
    maintenance_cost: formData.maintenanceCost,
    rent_cost: formData.rentCost,
    light_bill_cost: formData.lightBillCost,
    mediclaim: formData.mediclaim,
    Family_mediclaim_type: formData.family_mediclaim_type,
    family_mediclaim_amount: formData.Family_mediclaim_amount,
    mediclaim_premium_amount: formData.mediclaimPremiumAmount,
    family_mediclaim_companyName: formData.family_mediclaim_companyName,
    ngo_assistance: formData.ngoAssistance,
    ngo_sangh_name: formData.sanghName,
    ngo_amount: formData.ngoAmount,
    ngo_frequency: formData.ngoFrequency,
    ngo_remark: formData.ngoRemark,
    assistance: formData.assistance,
    assistance_received: formData.assistanceReceived,
    summary: formData.summary,
    form_step: currentStep,
  };
};

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
  const [fanIdSearch, setFanIdSearch] = useState("");
  const [selectedSourceDiksharthi, setSelectedSourceDiksharthi] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [postOffices, setPostOffices] = useState([]);
  const rbfMandatoryFields = ["permanentAddress", "pinCode", "district", "state"];

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
        const mapped = mapDiksharthiToFormData(result?.data);
        setFormData(mapped);
        setFanIdSearch(mapped?.fan_id || "");
        setCurrentStep(Number(result?.data?.form_step) || 1);
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
      const selectedRelations = String(selected?.family_relation || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const selectedRelationDetails = parseMaybeJsonObject(
        selected?.family_relation_details_json,
        {}
      );
      const relationSeed = selected?.relation || prev.relation || "";
      const normalizedRelations = Array.from(
        new Set([
          ...selectedRelations,
          ...Object.keys(selectedRelationDetails),
          ...(relationSeed ? [relationSeed] : []),
        ])
      );
      const normalizedRelationDetails = {};
      normalizedRelations.forEach((relationKey) => {
        const current = selectedRelationDetails?.[relationKey] || {};
        normalizedRelationDetails[relationKey] = createEmptyFamilyRelationDetails({
          firstName: current?.firstName || "",
          lastName: current?.lastName || "",
          mobileNumber: current?.mobileNumber || "",
          aadharNumber: current?.aadharNumber || "",
          panNumber: current?.panNumber || "",
          dob: toInputDate(current?.dob),
          age: current?.age || "",
          ayushmanCoverage: current?.ayushmanCoverage || "",
          medicalPolicy: current?.medicalPolicy || "",
          needAssistance: current?.needAssistance || "",
        });
      });
      if (relationSeed && !normalizedRelationDetails[relationSeed]) {
        normalizedRelationDetails[relationSeed] = createEmptyFamilyRelationDetails({
          firstName: selected?.family_member_firstName || "",
          lastName: selected?.family_member_lastName || "",
          mobileNumber: selected?.mobile_no || "",
        });
      }

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
        houseDetails: selected?.house_details || selected?.houseDetails || prev.houseDetails || "",
        typeOfHouse: selected?.type_of_house || selected?.typeOfHouse || prev.typeOfHouse || "",
        maintenanceCost: selected?.maintenance_cost || selected?.maintenanceCost || prev.maintenanceCost || "",
        rentCost: selected?.rent_cost || selected?.rentCost || prev.rentCost || "",
        lightBillCost: selected?.light_bill_cost || selected?.lightBillCost || prev.lightBillCost || "",
        mediclaim: toBooleanOrNull(selected?.mediclaim ?? prev.mediclaim),
        family_mediclaim_type:
          selected?.Family_mediclaim_type ||
          selected?.family_mediclaim_type ||
          prev.family_mediclaim_type ||
          "",
        Family_mediclaim_amount:
          selected?.family_mediclaim_amount ||
          selected?.Family_mediclaim_amount ||
          prev.Family_mediclaim_amount ||
          "",
        mediclaimPremiumAmount:
          selected?.mediclaim_premium_amount ||
          selected?.mediclaimPremiumAmount ||
          prev.mediclaimPremiumAmount ||
          "",
        family_mediclaim_companyName:
          selected?.family_mediclaim_companyName ||
          prev.family_mediclaim_companyName ||
          "",
        ngoAssistance: toBooleanOrNull(selected?.ngo_assistance ?? selected?.ngoAssistance ?? prev.ngoAssistance),
        sanghName: selected?.ngo_sangh_name || selected?.sanghName || prev.sanghName || "",
        ngoAmount: selected?.ngo_amount || selected?.ngoAmount || prev.ngoAmount || "",
        ngoFrequency: selected?.ngo_frequency || selected?.ngoFrequency || prev.ngoFrequency || "",
        ngoRemark: selected?.ngo_remark || selected?.ngoRemark || prev.ngoRemark || "",
        familyRelations: normalizedRelations,
        familyRelationDetails: normalizedRelationDetails,
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

      if (name === "fanIdExists") {
        if (sanitizedValue === "No") {
          nextState.fan_id = "";
          nextState.sameRelationsWithFan = false;
          setFanIdSearch("");
        }
        if (sanitizedValue === "Yes" && prev?.fan_id) {
          setFanIdSearch(prev.fan_id);
        }
      }
      if (name === "rbfCriteria" && sanitizedValue === "No") {
        nextState.relation = "";
        nextState.family_member_firstName = "";
        nextState.family_member_lastName = "";
        nextState.mobileNo = "";
        nextState.familyRelations = [];
        nextState.familyRelationDetails = {};
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

      if (name === "relation" && String(sanitizedValue || "").trim()) {
        const relations = Array.isArray(nextState?.familyRelations)
          ? nextState.familyRelations
          : [];
        if (!relations.includes(sanitizedValue)) {
          nextState.familyRelations = [...relations, sanitizedValue];
        }
        if (!nextState?.familyRelationDetails?.[sanitizedValue]) {
          nextState.familyRelationDetails = {
            ...(nextState.familyRelationDetails || {}),
            [sanitizedValue]: createEmptyFamilyRelationDetails(),
          };
        }
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
    if (!formData.fanIdExists) newErrors.fanIdExists = "Required";
    if (formData.fanIdExists === "Yes" && !String(formData.fan_id || "").trim()) {
      newErrors.fan_id = "Select FAN ID";
    }
    if (!formData.rbfCriteria) newErrors.rbfCriteria = "Required";

    if (formData.rbfCriteria === "Yes" && !formData.relation) {
      newErrors.relation = "Required for RBF";
    }
    if (formData.rbfCriteria === "Yes") {
      const selectedRelations = Array.isArray(formData?.familyRelations)
        ? formData.familyRelations
        : [];
      if (!selectedRelations.length) {
        newErrors.familyRelations = "Select at least one family relation";
      }
      selectedRelations.forEach((relationKey) => {
        const details = formData?.familyRelationDetails?.[relationKey] || {};
        if (!String(details?.firstName || "").trim()) {
          newErrors[`family_firstName_${relationKey}`] = "Required";
        }
        if (!String(details?.lastName || "").trim()) {
          newErrors[`family_lastName_${relationKey}`] = "Required";
        }
        if (!String(details?.mobileNumber || "").trim()) {
          newErrors[`family_mobile_${relationKey}`] = "Required";
        } else if (!MOBILE_REGEX.test(String(details?.mobileNumber || "").trim())) {
          newErrors[`family_mobile_${relationKey}`] = "Mobile number must be 10 digits";
        }
      });
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

    if (
      formData.mediclaim === true &&
      Number(formData.mediclaimPremiumAmount || 0) >
      Number(formData.Family_mediclaim_amount || 0)
    ) {
      newErrors.mediclaimPremiumAmount = "Premium amount cannot exceed cover amount";
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
      const payload = mapFormDataToApiPayload(formData, loggedInUserId, currentStep);
      Object.entries(payload).forEach(([key, value]) => {
        data.append(key, value ?? "");
      });
      if (photo) data.append("photo", photo);
      if (uploadDoc) data.append("uploadDoc", uploadDoc);

      const response = isEditMode
        ? await axios.put(`${API}/api/update-diksharthi/${editId}`, data)
        : await axios.post(`${API}/api/create-diksharthi`, data);

      const diksharthi = response?.data?.data || editRecord || {};

      setSavedId(diksharthi?.diksharthi_code || diksharthi?.id);

      if (isEditMode) {
        alert("Updated successfully");
        navigate("/diksharthi-details")
      } else {
        alert("Added successfully");
        navigate("/diksharthi-details")
        // setShowModal(true);
      }
    } catch (error) {
      console.error(error);
      alert("Error saving data");
    }
  };

  const stepTitles = [
    "Diksharti Details",
    "Family Details",
    "Address and House Details",
    "Mediclaims and NGO",
    "Summary",
  ];

  const goToNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, stepTitles.length));
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
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

  const handleFamilyRelationToggle = (relationValue) => {
    if (formData?.sameRelationsWithFan) return;
    setFormData((prev) => {
      const prevRelations = Array.isArray(prev?.familyRelations)
        ? prev.familyRelations
        : [];
      const exists = prevRelations.includes(relationValue);
      const nextRelations = exists
        ? prevRelations.filter((item) => item !== relationValue)
        : [...prevRelations, relationValue];

      const nextDetails = { ...(prev?.familyRelationDetails || {}) };
      if (exists) {
        delete nextDetails[relationValue];
      } else if (!nextDetails[relationValue]) {
        nextDetails[relationValue] = createEmptyFamilyRelationDetails();
      }

      const nextRelation =
        prev?.relation === relationValue && exists
          ? (nextRelations[0] || "")
          : (prev?.relation || relationValue);

      return {
        ...prev,
        familyRelations: nextRelations,
        familyRelationDetails: nextDetails,
        relation: nextRelation,
      };
    });
  };

  const handleFamilyRelationDetailChange = (relationValue, fieldName, rawValue) => {
    if (formData?.sameRelationsWithFan) return;
    let nextValue = rawValue;
    if (fieldName === "mobileNumber") {
      nextValue = String(rawValue || "").replace(/\D/g, "").slice(0, 10);
    }
    if (fieldName === "aadharNumber") {
      nextValue = String(rawValue || "").replace(/\D/g, "").slice(0, 12);
    }

    setFormData((prev) => {
      const current = prev?.familyRelationDetails?.[relationValue] || createEmptyFamilyRelationDetails();
      const updated = { ...current, [fieldName]: nextValue };
      if (fieldName === "dob") {
        updated.age = calculateAge(nextValue);
      }
      return {
        ...prev,
        familyRelationDetails: {
          ...(prev?.familyRelationDetails || {}),
          [relationValue]: updated,
        },
      };
    });
  };

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

  const uniqueFanOptions = Array.from(
    new Map(
      (allDiksharthi || [])
        .filter((item) => String(item?.fan_id || "").trim())
        .map((item) => [
          String(item.fan_id).trim(),
          {
            fan_id: String(item.fan_id).trim(),
            sadhu_sadhvi_name: item?.sadhu_sadhvi_name || "",
          },
        ])
    ).values()
  );

  const normalizedFanIdSearch = String(fanIdSearch || "").trim().toLowerCase();
  const filteredFanOptions = normalizedFanIdSearch
    ? uniqueFanOptions
      .filter((item) =>
        `${item?.fan_id || ""} ${item?.sadhu_sadhvi_name || ""}`
          .toLowerCase()
          .includes(normalizedFanIdSearch)
      )
      .slice(0, 8)
    : [];

  const fanSourceRecord =
    formData?.fan_id && String(formData.fan_id || "").trim()
      ? (allDiksharthi || []).find(
        (item) =>
          String(item?.fan_id || "").trim() === String(formData.fan_id || "").trim() &&
          String(item?.id || "") !== String(editId || "")
      ) || null
      : null;

  useEffect(() => {
    if (!formData?.sameRelationsWithFan) return;
    if (!fanSourceRecord) return;

    const sourceRelations = String(fanSourceRecord?.family_relation || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const sourceRelationDetailsRaw = parseMaybeJsonObject(
      fanSourceRecord?.family_relation_details_json,
      {}
    );

    const mergedRelationDetails = {};
    sourceRelations.forEach((relationKey) => {
      const source = sourceRelationDetailsRaw?.[relationKey] || {};
      mergedRelationDetails[relationKey] = createEmptyFamilyRelationDetails({
        firstName: source?.firstName || "",
        lastName: source?.lastName || "",
        mobileNumber: source?.mobileNumber || "",
        aadharNumber: source?.aadharNumber || "",
        panNumber: source?.panNumber || "",
        dob: toInputDate(source?.dob),
        age: source?.age || "",
        ayushmanCoverage: source?.ayushmanCoverage || "",
        ayushmanAmount: source?.ayushmanAmount || source?.amount || "",
        medicalPolicy: source?.medicalPolicy || "",
        mediclaimAmount: source?.mediclaimAmount || "",
        mediclaimPremiumAmount: source?.mediclaimPremiumAmount || "",
        mediclaimCompanyName: source?.mediclaimCompanyName || "",
        mediclaimType: source?.mediclaimType || source?.mediclaim_type || "",
        needAssistance: source?.needAssistance || "",
        assistanceCategories: Array.isArray(source?.assistanceCategories)
          ? source.assistanceCategories
          : [],
      });
    });

    if (!sourceRelations.length && fanSourceRecord?.relation) {
      const relationKey = String(fanSourceRecord.relation).trim();
      if (relationKey) {
        mergedRelationDetails[relationKey] = createEmptyFamilyRelationDetails({
          firstName: fanSourceRecord?.family_member_firstName || "",
          lastName: fanSourceRecord?.family_member_lastName || "",
          mobileNumber: fanSourceRecord?.mobile_no || "",
        });
        sourceRelations.push(relationKey);
      }
    }

    if (!sourceRelations.length) return;

    setFormData((prev) => ({
      ...prev,
      relation: prev?.relation || sourceRelations[0],
      familyRelations: Array.from(new Set(sourceRelations)),
      familyRelationDetails: mergedRelationDetails,
    }));
  }, [formData?.sameRelationsWithFan, fanSourceRecord]);

  return (
    <div className="min-h-full bg-gray-50 flex p-6 justify-center">
      <div className="w-full max-w-8xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-8 text-slate-800">
          <FileText size={20} />
          <h2 className="text-xl font-bold"> Ratnakukshi Family Basic Info</h2>
        </div>
{/* 
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
        </div> */}

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {stepTitles.map((title, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              return (
                <button
                  key={title}
                  type="button"
                  onClick={() => setCurrentStep(stepNumber)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${isActive
                    ? "bg-[#ECB000] text-white border-[#ECB000]"
                    : "bg-white text-slate-600 border-slate-300"
                    }`}
                >
                  {stepNumber}. {title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-5">
          {currentStep === 1 && (
            <>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name of P. Pujya. Sadhu/ Sadhvi Ji <span className="text-red-500">*</span></label>
            <input name="sadhu_sadhvi_name" value={formData.sadhu_sadhvi_name} onChange={handleChange} type="text" className="w-full p-2 border border-slate-300 rounded-md outline-none" />
            {errors.sadhu_sadhvi_name && <p className="text-red-500 text-xs">{errors.sadhu_sadhvi_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              FAN ID Exist? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="fanIdExists"
                  value="Yes"
                  checked={formData.fanIdExists === "Yes"}
                  onChange={handleChange}
                />
                Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="fanIdExists"
                  value="No"
                  checked={formData.fanIdExists === "No"}
                  onChange={handleChange}
                />
                No
              </label>
            </div>
            {errors.fanIdExists && <p className="text-red-500 text-xs">{errors.fanIdExists}</p>}
          </div>

          {formData.fanIdExists === "Yes" && (
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Search FAN ID</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={fanIdSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFanIdSearch(value);
                    setFormData((prev) => ({
                      ...prev,
                      fan_id: value.trim(),
                      sameRelationsWithFan: false,
                    }));
                  }}
                  placeholder="Type FAN ID..."
                  className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-md outline-none"
                />
                {fanIdSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setFanIdSearch("");
                      setFormData((prev) => ({ ...prev, fan_id: "", sameRelationsWithFan: false }));
                    }}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {errors.fan_id && <p className="text-red-500 text-xs mt-1">{errors.fan_id}</p>}

              {filteredFanOptions.length > 0 && (
                <div className="mt-2 border border-slate-200 rounded-md bg-white max-h-56 overflow-auto">
                  {filteredFanOptions.map((item) => (
                    <button
                      key={item.fan_id}
                      type="button"
                      onClick={() => {
                        setFanIdSearch(item.fan_id);
                        setFormData((prev) => ({
                          ...prev,
                          fan_id: item.fan_id,
                          sameRelationsWithFan: false,
                        }));
                      }}
                      className="w-full text-left px-3 py-2 border-b border-slate-100 last:border-b-0 hover:bg-yellow-50"
                    >
                      <p className="text-sm font-medium text-slate-800">{item.fan_id}</p>
                      <p className="text-xs text-slate-500">{item.sadhu_sadhvi_name || "-"}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {formData.fanIdExists === "No" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">FAN ID</label>
              <input
                type="text"
                value="Will be auto-generated (RBF/YY/0001)"
                readOnly
                className="w-full p-2 border border-slate-300 rounded-md outline-none bg-gray-100 text-gray-600"
              />
            </div>
          )}

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
            </>
          )}

          {currentStep === 2 && (
            <>

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

          {formData.rbfCriteria === "Yes" &&
            formData.fanIdExists === "Yes" &&
            String(formData.fan_id || "").trim() && (
              <div className="col-span-1 md:col-span-2 xl:col-span-4">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.sameRelationsWithFan)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sameRelationsWithFan: e.target.checked,
                      }))
                    }
                  />
                  Same Relations as existing FAN ID
                </label>
                {formData.sameRelationsWithFan && !fanSourceRecord && (
                  <p className="text-amber-600 text-xs mt-1">
                    Existing FAN member details not found, please add relations manually.
                  </p>
                )}
              </div>
            )}

          {formData.rbfCriteria === "Yes" && (
            <div className="col-span-1 md:col-span-2 xl:col-span-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Family Relations <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {filteredRelations
                  .filter((item) => item.value !== "Other")
                  .map((item) => {
                    const checked = (formData?.familyRelations || []).includes(item.value);
                    return (
                      <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={Boolean(formData.sameRelationsWithFan)}
                          onChange={() => handleFamilyRelationToggle(item.value)}
                        />
                        {item.label}
                      </label>
                    );
                  })}
              </div>
              {errors.familyRelations && (
                <p className="text-red-500 text-xs mt-1">{errors.familyRelations}</p>
              )}
            </div>
          )}

          {formData.rbfCriteria === "Yes" &&
            (formData?.familyRelations || []).map((relationKey) => {
              const details = formData?.familyRelationDetails?.[relationKey] || {};
              return (
                <div
                  key={relationKey}
                  className="col-span-1 md:col-span-2 xl:col-span-4 border border-slate-300 rounded-lg p-4"
                >
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">{relationKey} Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        value={details?.firstName || ""}
                        onChange={(e) => handleFamilyRelationDetailChange(relationKey, "firstName", e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md outline-none"
                      />
                      {errors[`family_firstName_${relationKey}`] && (
                        <p className="text-red-500 text-xs">{errors[`family_firstName_${relationKey}`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={details?.lastName || ""}
                        onChange={(e) => handleFamilyRelationDetailChange(relationKey, "lastName", e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md outline-none"
                      />
                      {errors[`family_lastName_${relationKey}`] && (
                        <p className="text-red-500 text-xs">{errors[`family_lastName_${relationKey}`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mobile No *</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={details?.mobileNumber || ""}
                        onChange={(e) => handleFamilyRelationDetailChange(relationKey, "mobileNumber", e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md outline-none"
                      />
                      {errors[`family_mobile_${relationKey}`] && (
                        <p className="text-red-500 text-xs">{errors[`family_mobile_${relationKey}`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Aadhar No</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={12}
                        value={details?.aadharNumber || ""}
                        onChange={(e) => handleFamilyRelationDetailChange(relationKey, "aadharNumber", e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">PAN No</label>
                      <input
                        type="text"
                        value={details?.panNumber || ""}
                        onChange={(e) => handleFamilyRelationDetailChange(relationKey, "panNumber", e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">DOB</label>
                      <input
                        type="date"
                        max={getMaxDOB()}
                        value={details?.dob || ""}
                        onChange={(e) => handleFamilyRelationDetailChange(relationKey, "dob", e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                      <input
                        type="number"
                        value={details?.age || ""}
                        onChange={(e) => handleFamilyRelationDetailChange(relationKey, "age", e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Does this person have Ayushman coverage?</label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`ayushmanCoverage_${relationKey}`}
                            value="Yes"
                            checked={details?.ayushmanCoverage === "Yes"}
                            onChange={(e) => handleFamilyRelationDetailChange(relationKey, "ayushmanCoverage", e.target.value)}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`ayushmanCoverage_${relationKey}`}
                            value="No"
                            checked={details?.ayushmanCoverage === "No"}
                            onChange={(e) => handleFamilyRelationDetailChange(relationKey, "ayushmanCoverage", e.target.value)}
                          />
                          No
                        </label>
                      </div>
                    </div>
                    {details?.ayushmanCoverage === "Yes" && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Do they have any Mediclaim policy?*</label>
                        <input
                          type="number"
                          value={details?.ayushmanAmount || ""}
                          onChange={(e) => handleFamilyRelationDetailChange(relationKey, "ayushmanAmount", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-md outline-none"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Medical Policy</label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`medicalPolicy_${relationKey}`}
                            value="Yes"
                            checked={details?.medicalPolicy === "Yes"}
                            onChange={(e) => handleFamilyRelationDetailChange(relationKey, "medicalPolicy", e.target.value)}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`medicalPolicy_${relationKey}`}
                            value="No"
                            checked={details?.medicalPolicy === "No"}
                            onChange={(e) => handleFamilyRelationDetailChange(relationKey, "medicalPolicy", e.target.value)}
                          />
                          No
                        </label>
                      </div>
                    </div>
                    {details?.medicalPolicy === "Yes" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Mediclaim Amount</label>
                          <input
                            type="number"
                            value={details?.mediclaimAmount || ""}
                            onChange={(e) => handleFamilyRelationDetailChange(relationKey, "mediclaimAmount", e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Yearly Premium Amount</label>
                          <input
                            type="number"
                            value={details?.mediclaimPremiumAmount || ""}
                            onChange={(e) => handleFamilyRelationDetailChange(relationKey, "mediclaimPremiumAmount", e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Mediclaim Company Name</label>
                          <input
                            type="text"
                            value={details?.mediclaimCompanyName || ""}
                            onChange={(e) => handleFamilyRelationDetailChange(relationKey, "mediclaimCompanyName", e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Mediclaim Type</label>
                          <select
                            value={details?.mediclaimType || ""}
                            onChange={(e) => handleFamilyRelationDetailChange(relationKey, "mediclaimType", e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md outline-none"
                          >
                            <option value="">Select</option>
                            <option value="single">Single</option>
                            <option value="joint">Joint</option>
                          </select>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Need Assistance</label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`needAssistance_${relationKey}`}
                            value="Yes"
                            checked={details?.needAssistance === "Yes"}
                            onChange={(e) => handleFamilyRelationDetailChange(relationKey, "needAssistance", e.target.value)}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`needAssistance_${relationKey}`}
                            value="No"
                            checked={details?.needAssistance === "No"}
                            onChange={(e) => handleFamilyRelationDetailChange(relationKey, "needAssistance", e.target.value)}
                          />
                          No
                        </label>
                      </div>
                    </div>
                    {details?.needAssistance === "Yes" && (
                      <div className="md:col-span-2 xl:col-span-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Assistances</label>
                        <div className="flex flex-wrap gap-4">
                          {assistanceTypes.map((type) => {
                            const selectedCategories = Array.isArray(details?.assistanceCategories)
                              ? details.assistanceCategories
                              : [];
                            const checked = selectedCategories.includes(type);
                            return (
                              <label key={`${relationKey}_${type}`} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    const nextCategories = e.target.checked
                                      ? [...selectedCategories, type]
                                      : selectedCategories.filter((item) => item !== type);
                                    handleFamilyRelationDetailChange(
                                      relationKey,
                                      "assistanceCategories",
                                      nextCategories
                                    );
                                  }}
                                />
                                {type}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {/* {formData.rbfCriteria === "Yes" && (
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
          )} */}
            </>
          )}

          {currentStep === 3 && (
            <>

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
                House <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="houseDetails"
                    value="own"
                    checked={formData.houseDetails === "own"}
                    onChange={handleChange}
                  />
                  Own
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="houseDetails"
                    value="rented"
                    checked={formData.houseDetails === "rented"}
                    onChange={handleChange}
                  />
                  Rented
                </label>
              </div>
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type Of House</label>
              <input
                name="typeOfHouse"
                value={formData.typeOfHouse}
                onChange={handleChange}
                type="text"
                placeholder="e.g. Apartment, Villa"
                className="w-full p-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
          )}

          {formData.rbfCriteria === "Yes" && formData.houseDetails === "own" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Maintenance Cost (Monthly)</label>
              <input
                name="maintenanceCost"
                value={formData.maintenanceCost}
                onChange={handleChange}
                type="number"
                className="w-full p-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
          )}

          {formData.rbfCriteria === "Yes" && formData.houseDetails === "rented" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rent Cost (Monthly)</label>
              <input
                name="rentCost"
                value={formData.rentCost}
                onChange={handleChange}
                type="number"
                className="w-full p-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Light Bill Cost</label>
              <input
                name="lightBillCost"
                value={formData.lightBillCost}
                onChange={handleChange}
                type="number"
                className="w-full p-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
          )}
            </>
          )}

          {currentStep === 4 && (
            <>
          {formData.rbfCriteria === "Yes" && (
            <div className="col-span-1 md:col-span-2 xl:col-span-2 border border-slate-200 rounded-lg p-4 bg-slate-50">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Does the family have any Mediclaim policy?
              </label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mediclaim"
                    checked={formData.mediclaim === true}
                    onChange={() => setFormData((prev) => ({ ...prev, mediclaim: true }))}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mediclaim"
                    checked={formData.mediclaim === false}
                    onChange={() => setFormData((prev) => ({ ...prev, mediclaim: false }))}
                  />
                  No
                </label>
              </div>

              {formData.mediclaim === true && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mediclaim Type</label>
                    <select
                      name="family_mediclaim_type"
                      value={formData.family_mediclaim_type || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-slate-300 rounded-md outline-none bg-white"
                    >
                      <option value="">Select Type</option>
                      <option value="single">Single</option>
                      <option value="joint">Joint</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Family Mediclaim Policy Amount</label>
                    <input
                      name="Family_mediclaim_amount"
                      value={formData.Family_mediclaim_amount || ""}
                      onChange={handleChange}
                      type="number"
                      className="w-full p-2 border border-slate-300 rounded-md outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mediclaim Premium Amount</label>
                    <input
                      name="mediclaimPremiumAmount"
                      value={formData.mediclaimPremiumAmount || ""}
                      onChange={handleChange}
                      type="number"
                      className="w-full p-2 border border-slate-300 rounded-md outline-none bg-white"
                    />
                    {errors.mediclaimPremiumAmount && (
                      <p className="text-red-500 text-xs">{errors.mediclaimPremiumAmount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mediclaim Company Name</label>
                    <input
                      name="family_mediclaim_companyName"
                      value={formData.family_mediclaim_companyName || ""}
                      onChange={handleChange}
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded-md outline-none bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.rbfCriteria === "Yes" && (
            <div className="col-span-1 md:col-span-2 xl:col-span-2 border border-slate-200 rounded-lg p-4 bg-slate-50">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Is any Sangh/NGO assistance received?
              </label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ngoAssistance"
                    checked={formData.ngoAssistance === true}
                    onChange={() => setFormData((prev) => ({ ...prev, ngoAssistance: true }))}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ngoAssistance"
                    checked={formData.ngoAssistance === false}
                    onChange={() => setFormData((prev) => ({ ...prev, ngoAssistance: false }))}
                  />
                  No
                </label>
              </div>

              {formData.ngoAssistance === true && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sangh Name</label>
                    <input
                      name="sanghName"
                      value={formData.sanghName || ""}
                      onChange={handleChange}
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded-md outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                    <input
                      name="ngoAmount"
                      value={formData.ngoAmount || ""}
                      onChange={handleChange}
                      type="number"
                      className="w-full p-2 border border-slate-300 rounded-md outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                    <select
                      name="ngoFrequency"
                      value={formData.ngoFrequency || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-slate-300 rounded-md outline-none bg-white"
                    >
                      <option value="">Select Frequency</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Details / Remark</label>
                    <textarea
                      name="ngoRemark"
                      value={formData.ngoRemark || ""}
                      onChange={handleChange}
                      rows={2}
                      className="w-full p-2 border border-slate-300 rounded-md outline-none resize-none bg-white"
                    />
                  </div>
                </div>
              )}
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
            </>
          )}

          {currentStep === 5 && (
            <>

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
            </>
          )}
        </div>
        <div className="p-6 flex justify-between items-center bg-white mt-4">
          <button onClick={() => navigate(-1)} className="bg-[#fbc02d] text-white px-10 py-2 rounded font-bold uppercase text-sm">Cancel</button>
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={goToPreviousStep}
                className="bg-slate-500 text-white px-6 py-2 rounded font-bold uppercase text-sm"
              >
                Previous
              </button>
            )}
            {currentStep < stepTitles.length ? (
              <button
                type="button"
                onClick={goToNextStep}
                className="bg-[#fbc02d] text-white px-10 py-2 rounded font-bold uppercase text-sm"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="bg-[#fbc02d] text-white px-10 py-2 rounded font-bold uppercase text-sm"
              >
                {isEditMode ? "Update" : "Save"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiksharthiDetailsAdd;



