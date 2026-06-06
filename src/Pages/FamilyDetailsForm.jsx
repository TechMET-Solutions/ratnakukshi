import axios from "axios";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import { useAuth } from "../context/AuthContext";
import { isValidAadhaar, isValidPAN } from "../utils/validation";
import Family_Details_Staff from "./Family_Details_Staff";

const INITIAL_FORM_DATA = {
  permanentAddress: "",
  currentAddress: "",
  state: "",
  district: "",
  taluka: "",
  village: "",
  pinCode: "",
  houseDetails: "",
  typeOfHouse: "",
  maintenanceCost: "",
  rentCost: "",
  lightBillCost: "",
  relations: [],
  mediclaim: false,
  family_mediclaim_type: "",
  Family_mediclaim_amount: "",
  mediclaimPremiumAmount: "",
  family_mediclaim_companyName: "",
  ngoAssistance: false,
  sanghName: "",
  ngoAmount: "",
  ngoFrequency: "",
  ngoRemark: "",
};

const FamilyDetailsForm = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const id = location?.state?.id;
  const code = location?.state?.diksharthi_code;
  const name = location?.state?.sadhu_sadhvi_name;
  const gender = location?.state?.gender;
const ngo_assistance = location?.state?.ngo_assistance;
const mediclaim = location?.state?.mediclaim;

  console.log("ID:", id);
  console.log("Code:", code);
  console.log("Name:", name);
  console.log("Gender:", gender);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [initialLockSnapshot, setInitialLockSnapshot] = useState({
    formData: INITIAL_FORM_DATA,
    relationDetails: {},
    assistanceData: {},
    headOfFamily: null,
  });
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const role = String(user?.role || "").trim().toLowerCase();
  const isKaryakarta = role === "karyakarta";

  const hasPrefilledValue = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (typeof value === "number") return true;
    if (typeof value === "boolean") return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return false;
  };

  const isFormFieldLocked = (fieldName) =>
    isKaryakarta && hasPrefilledValue(initialLockSnapshot?.formData?.[fieldName]);

  const isRelationFieldLocked = (relation, fieldName) =>
    isKaryakarta &&
    hasPrefilledValue(initialLockSnapshot?.relationDetails?.[relation]?.[fieldName]);

  // const isAssistanceFieldLocked = (relation, type, fieldName) =>
  //   isKaryakarta &&
  //   hasPrefilledValue(
  //     initialLockSnapshot?.assistanceData?.[relation]?.[type]?.[fieldName]
  //   );

  const isAssistanceFieldLocked = (relation, type, fieldName) => {
    // ❌ DO NOT LOCK THESE FIELDS
    const alwaysEditableFields = [
      "remarks",
      "queryReason",
      "queryImage",
      "status"
    ];

    if (alwaysEditableFields.includes(fieldName)) return false;

    return (
      isKaryakarta &&
      hasPrefilledValue(
        initialLockSnapshot?.assistanceData?.[relation]?.[type]?.[fieldName]
      )
    );
  };

  const isHeadOfFamilyLocked =
    isKaryakarta && hasPrefilledValue(initialLockSnapshot?.headOfFamily);

  const lockInputClass = (isLocked) =>
    isLocked
      ? "bg-gray-100 text-gray-600 cursor-not-allowed"
      : "";

  const updateFormField = (fieldName, value, extra = {}) => {
    if (isFormFieldLocked(fieldName)) return;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
      ...extra,
    }));
  };
  const selectedRelations = Array.isArray(formData?.relations)
    ? formData.relations
    : [];

  console.log(selectedRelations, "--------selectedRelations------------")
  const allowRelationEditing = false;

  const [deselectData, setDeselectData] = useState(null);
  // { rel, type, reason }

  console.log(formData, "formData");
  const [relationDetails, setRelationDetails] = useState({});
  console.log(relationDetails, "relationDetails")
  const [selectedRelation, setSelectedRelation] = useState(null);
  console.log(relationDetails, "relationDetails", selectedRelation, "selectedRelation");
  const [expandedRelations, setExpandedRelations] = useState({});
  console.log(expandedRelations, "expandedRelations");
  const [assistanceTypes] = useState([
    "Medical",
    "Education",
    "Job",
    "Grocery",
    "Rent",
    "Housing",
    "Vaiyavacch",
    "LivelihoodExpenses",
    "Business"
  ]);

  ;
  const [additionalRelations, setAdditionalRelations] = useState({});
  const [deselectedAssistance, setDeselectedAssistance] = useState([]);
  const [extraAssistance, setExtraAssistance] = useState([]);

const [medicalIssueTypes, setMedicalIssueTypes] = useState([]);

const getMedicalIssueTypes = async () => {
  try {
    const response = await fetch(
      "https://uat.ratnakukshi.org/api/medicalissuetype/all"
    );

    const data = await response.json();

    if (data?.success) {
      setMedicalIssueTypes(data?.data || []);
    }
  } catch (error) {
    console.log("Medical issue fetch error", error);
  }
};

useEffect(() => {
  getMedicalIssueTypes();
}, []);

  console.log(deselectedAssistance, "deselectedAssistance")
  const handleAddDocument = (rel) => {
    const prevDocs = assistanceData[rel]?.Medical?.medicalDocuments || [];

    handleMedicalChange(rel, "medicalDocuments", [
      ...prevDocs,
      { documentName: "", files: [] }
    ]);
  };

  const handleDocumentChange = (rel, index, field, value) => {
    const docs = [...(assistanceData[rel]?.Medical?.medicalDocuments || [])];
    docs[index][field] = value;

    handleMedicalChange(rel, "medicalDocuments", docs);
  };

  const handleAddRentDocument = (rel) => {
    const prevDocs = assistanceData[rel]?.Rent?.rentProofDocuments || [];

    handleRentChange(rel, "rentProofDocuments", [
      ...prevDocs,
      { documentName: "", files: [] },
    ]);
  };

  const handleRentDocumentChange = (rel, index, field, value) => {
    const docs = [...(assistanceData[rel]?.Rent?.rentProofDocuments || [])];
    docs[index] = {
      ...(docs[index] || {}),
      [field]: value,
    };

    handleRentChange(rel, "rentProofDocuments", docs);
  };

  const handleAddHousingDocument = (rel) => {
    const prevDocs = assistanceData[rel]?.Housing?.supportingDocuments || [];

    handleHousingChange(rel, "supportingDocuments", [
      ...prevDocs,
      { documentName: "", files: [] },
    ]);
  };

  const handleHousingDocumentChange = (rel, index, field, value) => {
    const docs = [...(assistanceData[rel]?.Housing?.supportingDocuments || [])];
    docs[index] = {
      ...(docs[index] || {}),
      [field]: value,
    };

    handleHousingChange(rel, "supportingDocuments", docs);
  };

  console.log(additionalRelations, "additionalRelations");
  const [headOfFamily, setHeadOfFamily] = useState(null);
  const [familyRecordId, setFamilyRecordId] = useState(null);
  console.log(headOfFamily, "headOfFamily");

  const normalizeAssistanceDataForPayload = (data) => {
    const result = {};

    Object.entries(data || {}).forEach(([relation, types]) => {
      result[relation] = {};

      Object.entries(types || {}).forEach(([type, values]) => {
        const cleanValues = { ...values };

        // ❌ remove unwanted UI fields
        delete cleanValues.status;

        // ✅ handle nested arrays safely
        if (type === "Medical" && Array.isArray(cleanValues.diseases)) {
          cleanValues.diseases = cleanValues.diseases.map((d) => ({
            diseaseName: d.diseaseName || "",
            frequency: d.frequency || "",
            sessions: d.sessions || "",
            costPerSession: d.costPerSession || "",
            totalEstimatedCost: d.totalEstimatedCost || "",
          }));
        }

        result[relation][type] = cleanValues;
      });
    });

    return result;
  };

  const buildRelationDetailsPayload = (data, headOfFamily) => {
    return Object.fromEntries(
      Object.entries(data || {}).map(([key, value]) => [
        key,
        {
          ...value,
          family_head: key === headOfFamily,
        },
      ])
    );
  };

  const buildAssistanceDataPayloadWithUploads = (data, formData) => {
    const result = {};

    Object.entries(data || {}).forEach(([rel, types]) => {
      result[rel] = {};

      Object.entries(types || {}).forEach(([type, values]) => {
        const newValues = { ...values };

        // Example: handle documents
        if (Array.isArray(values?.medicalDocuments)) {
          newValues.medicalDocuments = values.medicalDocuments.map(
            (doc, index) => {
              if (doc.files instanceof File) {
                const key = `doc_${rel}_${type}_${index}`;
                formData.append(key, doc.files);
                return { ...doc, files: key };
              }
              return doc;
            }
          );
        }

        result[rel][type] = newValues;
      });
    });

    return result;
  };

  const buildRelationDetailsPayloadWithUploads = (data, formData) => {
    const result = {};

    Object.entries(data || {}).forEach(([relation, details]) => {
      const newDetails = { ...details };

      // Handle photo file upload
      if (details?.photo instanceof File) {
        const key = `photo_${relation}`;
        formData.append(key, details.photo);
        newDetails.photo = key;
      }

      result[relation] = newDetails;
    });

    return result;
  };

  const handleCheckbox = (relation) => {
    if (
      isKaryakarta &&
      hasPrefilledValue(initialLockSnapshot?.relationDetails?.[relation])
    ) {
      return;
    }

    setFormData((prev) => {
      const prevRelations = Array.isArray(prev?.relations) ? prev.relations : [];
      const isChecked = prevRelations.includes(relation);

      return {
        ...prev,
        relations: isChecked
          ? prevRelations.filter((r) => r !== relation)
          : [...prevRelations, relation],
      };
    });

    const isAlreadySelected = selectedRelations.includes(relation);

    if (isAlreadySelected) {
      // ❌ REMOVE DATA WHEN UNCHECKED
      setRelationDetails((prev) => {
        const updated = { ...prev };
        delete updated[relation];
        return updated;
      });

      setAssistanceData((prev) => {
        const updated = { ...prev };
        delete updated[relation];
        return updated;
      });

      setExpandedRelations((prev) => {
        const updated = { ...prev };
        delete updated[relation];
        return updated;
      });
    } else {
      // ✅ ADD NEW
      setRelationDetails((prev) => ({
        ...prev,
        [relation]: {
          relationName: "",
          relationDetailsName: "",
          firstName: "",
          lastName: "",
          dob: "",
          age: "",
          guardian: "",
          aadharNumber: "",
          mobileNumber: "",
          photo: null,
          photoPreview: "",
          ayushman: null,
          amount: "",
          mediclaim: null,
          needAssistance: null,
          assistanceCategories: [],
          isMarried: null,
        },
      }));

      setExpandedRelations((prev) => ({
        ...prev,
        [relation]: true,
      }));
    }
  };

  const handleRelationDetailChange = (relation, field, value) => {
    if (isRelationFieldLocked(relation, field)) return;

    setRelationDetails((prev) => {
      const nextRelationDetails = {
        ...prev,
        [relation]: {
          ...prev[relation],
          [field]: value,
        },
      };

      if (field === "dob") {
        const calculatedAge = calculateAgeFromDob(value);
        nextRelationDetails[relation].age = calculatedAge;

        if (calculatedAge === "" || Number(calculatedAge) >= 18) {
          nextRelationDetails[relation].guardian = "";
        }
      }

      if (field === "mobileNumber") {
        const trimmedValue = String(value || "").trim();

        setValidationErrors((prevErrors) => {
          const nextErrors = { ...prevErrors };

          // if (!trimmedValue) {
          //   nextErrors[`mobile_${relation}`] = "Mobile number is required";
          // } else if (!/^[1-9]\d{9}$/.test(trimmedValue)) {
          //   nextErrors[`mobile_${relation}`] =
          //     "Mobile number must be 10 digits";
          // } else {
          //   delete nextErrors[`mobile_${relation}`];
          // }

          if (trimmedValue && !/^[1-9]\d{9}$/.test(trimmedValue)) {
            nextErrors[`mobile_${relation}`] =
              "Mobile number must be 10 digits";
          } else {
            delete nextErrors[`mobile_${relation}`];
          }

          return nextErrors;
        });
      }

      if (field === "aadharNumber") {
        const trimmedValue = String(value || "").trim();
        const isDuplicate = Object.entries(nextRelationDetails).some(
          ([key, data]) =>
            key !== relation &&
            String(data?.aadharNumber || "").trim() !== "" &&
            String(data?.aadharNumber || "").trim() === trimmedValue,
        );

        setValidationErrors((prevErrors) => {
          const nextErrors = { ...prevErrors };

          if (!trimmedValue) {
            delete nextErrors[`aadhar_${relation}`];
          } else if (!isValidAadhaar(trimmedValue)) {
            nextErrors[`aadhar_${relation}`] =
              "Aadhar number must be exactly 12 digits";
          } else if (isDuplicate) {
            nextErrors[`aadhar_${relation}`] = "Aadhar number must be unique";
          } else {
            delete nextErrors[`aadhar_${relation}`];
          }

          return nextErrors;
        });
      }

      if (field === "panNumber") {
        const trimmedValue = String(value || "").trim();
        setValidationErrors((prevErrors) => {
          const nextErrors = { ...prevErrors };

          if (!trimmedValue) {
            delete nextErrors[`pan_${relation}`];
          } else if (!isValidPAN(trimmedValue)) {
            nextErrors[`pan_${relation}`] =
              "PAN must be in format ABCDE1234F (5 letters + 4 digits + 1 letter)";
          } else {
            delete nextErrors[`pan_${relation}`];
          }

          return nextErrors;
        });
      }

      return nextRelationDetails;
    });
  };

  const handleHeadOfFamilyChange = (relation) => {
    if (isHeadOfFamilyLocked) return;

    // If the current head is being unchecked, set to null
    if (headOfFamily === relation) {
      setHeadOfFamily(null);
    } else {
      // Set the new head of family (exclusive)
      setHeadOfFamily(relation);
    }
  };
  // const resolvePhotoUrl = (photo) => {
  //   if (!photo) return "/user.png";

  //   // If already full URL
  //   if (photo.startsWith("http")) return photo;

  //   // If stored as filename/path from backend
  //   return `${API}/uploads/${photo}`;
  // };

  const resolvePhotoUrl = (photo) => {
    if (!photo) return "/user.png";

    const imagePath = String(photo).trim();

    // ✅ already full url from api
    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    // ✅ backend relative path
    return `${API}/${imagePath.replace(/^\/+/, "")}`;
  };

  const calculateAgeFromDob = (dobValue) => {
    if (!dobValue) return "";
    const dob = new Date(dobValue);
    if (Number.isNaN(dob.getTime())) return "";

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age -= 1;
    }

    return age < 0 ? "" : age;
  };

  const normalizeDateForInput = (value) => {
    if (!value) return "";
    const rawValue = String(value).trim();
    if (!rawValue) return "";

    const yyyyMmDd = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (yyyyMmDd) return rawValue;

    const ddMmYyyy = rawValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddMmYyyy) {
      return `${ddMmYyyy[3]}-${ddMmYyyy[2]}-${ddMmYyyy[1]}`;
    }

    const parsed = new Date(rawValue);
    if (Number.isNaN(parsed.getTime())) return "";

    const year = parsed.getUTCFullYear();
    const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
    const day = String(parsed.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const normalizeYesNoToBoolean = (value) => {
    if (value === true || value === false) return value;
    if (value === null || value === undefined || value === "") return null;
    const normalized = String(value).trim().toLowerCase();
    if (["yes", "y", "true", "1"].includes(normalized)) return true;
    if (["no", "n", "false", "0"].includes(normalized)) return false;
    return null;
  };

  const normalizeBooleanWithFallback = (primaryValue, fallbackValue) => {
    const normalizedPrimary = normalizeYesNoToBoolean(primaryValue);
    if (normalizedPrimary !== null) return normalizedPrimary;
    return normalizeYesNoToBoolean(fallbackValue);
  };

  const normalizeRelationLabel = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  };

  const validateAadharUnique = () => {
    const aadharList = Object.values(relationDetails)
      .map(r => r?.aadharNumber)
      .filter(Boolean);

    const uniqueSet = new Set(aadharList);

    return aadharList.length === uniqueSet.size;
  };



  const handleProfileUpload = (relation, event) => {
    if (isRelationFieldLocked(relation, "photo")) return;

    const file = event.target.files?.[0];

    if (file) {
      setRelationDetails((prev) => {
        const currentPreview = prev[relation]?.photoPreview;

        if (
          typeof currentPreview === "string" &&
          currentPreview.startsWith("blob:")
        ) {
          URL.revokeObjectURL(currentPreview);
        }

        return {
          ...prev,
          [relation]: {
            ...(prev[relation] || {}), // ✅ FIX
            photo: file,
            photoPreview: URL.createObjectURL(file),
          },
        };
      });
    }
  };
  const handleAssistanceCategory = (
    relation,
    category,
    isRemove = false,
    reason = ""
  ) => {
    if (isRelationFieldLocked(relation, "assistanceCategories")) return;

    const lowerCategory = category.toLowerCase();

    // ✅ Update relationDetails
    setRelationDetails((prev) => {
      const existing = prev[relation]?.assistanceCategories || [];

      let updatedCategories;

      if (isRemove) {
        updatedCategories = existing.filter(
          (c) => c.toLowerCase() !== lowerCategory
        );
      } else {
        const alreadyExists = existing.some(
          (c) => c.toLowerCase() === lowerCategory
        );

        updatedCategories = alreadyExists
          ? existing
          : [...existing, category];
      }

      return {
        ...prev,
        [relation]: {
          ...prev[relation],
          assistanceCategories: updatedCategories,
        },
      };
    });

    // ✅ ALWAYS update selectedAssistance (FIXED)
    setselectedAssistance((prev) => {
      if (isRemove) {
        return prev.filter(
          (c) => c.toLowerCase() !== lowerCategory
        );
      } else {
        return prev.some((c) => c.toLowerCase() === lowerCategory)
          ? prev
          : [...prev, category];
      }
    });

    // ✅ Track deselection with reason
    if (isRemove) {
      setDeselectedAssistance((prev) => [
        ...prev.filter(
          (item) =>
            !(
              item.relation === relation &&
              item.type.toLowerCase() === lowerCategory
            )
        ),
        { relation, type: category, reason },
      ]);
    } else {
      setDeselectedAssistance((prev) =>
        prev.filter(
          (item) =>
            !(
              item.relation === relation &&
              item.type.toLowerCase() === lowerCategory
            )
        )
      );
    }
  };
  const handleAddRelationRow = (baseRelation) => {
    const relationType = baseRelation;
    const count = (additionalRelations[relationType]?.length || 0) + 1;
    const newRelationId = `${relationType}-${count}`;

    setAdditionalRelations((prev) => ({
      ...prev,
      [relationType]: [...(prev[relationType] || []), newRelationId],
    }));

    setRelationDetails((prev) => ({
      ...prev,
      [newRelationId]: {
        relationName: "",
        relationDetailsName: "",
        firstName: "",
        lastName: "",
        dob: "",
        age: "",
        guardian: "",
        aadharNumber: "",
        photo: null,
        photoPreview: "",
        ayushman: null,
        amount: "",
        mediclaim: null,
        needAssistance: null,
        assistanceCategories: [],
        isMarried: null,
      },
    }));

    setFormData((prev) => ({
      ...prev,
      relations: [
        ...(Array.isArray(prev?.relations) ? prev.relations : []),
        newRelationId,
      ],
    }));

    // Auto-expand the new accordion
    setExpandedRelations((prev) => ({
      ...prev,
      [newRelationId]: true,
    }));
  };

  const handleRemoveRelationRow = (relationId, baseRelation) => {
    setAdditionalRelations((prev) => ({
      ...prev,
      [baseRelation]:
        prev[baseRelation]?.filter((id) => id !== relationId) || [],
    }));

    setFormData((prev) => ({
      ...prev,
      relations: (Array.isArray(prev?.relations) ? prev.relations : []).filter(
        (r) => r !== relationId
      ),
    }));

    setRelationDetails((prev) => {
      const newDetails = { ...prev };
      delete newDetails[relationId];
      return newDetails;
    });

    setExpandedRelations((prev) => {
      const newExpanded = { ...prev };
      delete newExpanded[relationId];
      return newExpanded;
    });
  };

  const relations = [
    "Father",
    "Mother",
    "Husband",
    "Wife",
    "Son",
    "Daughter",
    "Brother",
    "Sister",
    "Other",
  ].filter((rel) => {
    if (gender === "Sadhu" && rel === "Husband") return false;
    if (gender === "Sadhvi" && rel === "Wife") return false;
    return true;
  });

  const [assistanceData, setAssistanceData] = useState({});
  const [selectedAssistance, setselectedAssistance] = useState([]);
  const [defaultAssistance, setdefaultAssisatce] = useState([]);
  console.log(selectedAssistance, "selectedAssistance")
  console.log(assistanceData, "assistanceData");

  const [validationErrors, setValidationErrors] = useState({});
  // useEffect(() => {
  //   if (!id) return;

  //   const fetchFamilyDetailsById = async () => {
  //     try {
  //       const [diksharthiRes, familyRes] = await Promise.all([
  //         axios.get(`${API}/api/diksharthi/${id}`),
  //         axios
  //           .get(`${API}/api/family-details/${id}`)
  //           .catch(() => ({ data: { data: [] } })),
  //       ]);

  //       const diksharthiData = diksharthiRes?.data?.data || {};
  //       const familyData = familyRes?.data?.data?.[0] || {};

  //       // ================= FORM DATA =================
  //       const normalizedFormData = {
  //         permanentAddress:
  //           familyData?.formData?.permanentAddress ||
  //           diksharthiData?.permanent_address ||
  //           "",
  //         currentAddress:
  //           familyData?.formData?.currentAddress ||
  //           diksharthiData?.current_address ||
  //           "",
  //         village: familyData?.formData?.village || diksharthiData?.village || "",
  //         taluka: familyData?.formData?.taluka || diksharthiData?.taluka || "",
  //         district: familyData?.formData?.district || diksharthiData?.district || "",
  //         state: familyData?.formData?.state || diksharthiData?.state || "",
  //         pinCode: familyData?.formData?.pinCode || diksharthiData?.pin_code || "",

  //         houseDetails:
  //           familyData?.formData?.houseDetails || diksharthiData?.house_details || "",
  //         typeOfHouse:
  //           familyData?.formData?.typeOfHouse || diksharthiData?.type_of_house || "",
  //         maintenanceCost:
  //           familyData?.formData?.maintenanceCost ||
  //           diksharthiData?.maintenance_cost ||
  //           "",
  //         lightBillCost:
  //           familyData?.formData?.lightBillCost ||
  //           diksharthiData?.light_bill_cost ||
  //           "",
  //         rentCost: familyData?.formData?.rentCost || diksharthiData?.rent_cost || "",

  //         mediclaim: normalizeBooleanWithFallback(
  //           familyData?.formData?.mediclaim,
  //           diksharthiData?.mediclaim
  //         ),
  //         family_mediclaim_type:
  //           familyData?.formData?.family_mediclaim_type ||
  //           diksharthiData?.Family_mediclaim_type ||
  //           "",
  //         Family_mediclaim_amount:
  //           familyData?.formData?.Family_mediclaim_amount ||
  //           diksharthiData?.family_mediclaim_amount ||
  //           "",
  //         mediclaimPremiumAmount:
  //           familyData?.formData?.mediclaimPremiumAmount ||
  //           diksharthiData?.mediclaim_premium_amount ||
  //           "",
  //         family_mediclaim_companyName:
  //           familyData?.formData?.family_mediclaim_companyName ||
  //           diksharthiData?.family_mediclaim_companyName ||
  //           "",

  //         ngoAssistance: normalizeBooleanWithFallback(
  //           familyData?.formData?.ngoAssistance,
  //           diksharthiData?.ngo_assistance
  //         ),
  //         sanghName:
  //           familyData?.formData?.sanghName || diksharthiData?.ngo_sangh_name || "",
  //         ngoAmount: familyData?.formData?.ngoAmount || diksharthiData?.ngo_amount || "",
  //         ngoFrequency:
  //           familyData?.formData?.ngoFrequency ||
  //           familyData?.formData?.ngo_frequency ||
  //           diksharthiData?.ngo_frequency ||
  //           "",
  //         ngoRemark: familyData?.formData?.ngoRemark || diksharthiData?.ngo_remark || "",
  //       };

  //       // ================= RELATIONS FROM API =================
  //       const diksharthiRelations = String(
  //         diksharthiData?.family_relation || ""
  //       )
  //         .split(",")
  //         .map((r) => normalizeRelationLabel(r))
  //         .filter(Boolean);

  //       const apiRelations = [
  //         ...new Set(
  //           (familyData?.formData?.relations || []).map(
  //             (r) => normalizeRelationLabel(r)
  //           )
  //         ),
  //       ];

  //       // ================= SELECTED RELATION =================
  //       const relationFromApiRaw = familyData?.relation || diksharthiData?.relation || null;
  //       const formattedRelation = normalizeRelationLabel(relationFromApiRaw) || null;

  //       // ================= RELATION DETAILS =================
  //       const relationDetailsRaw = familyData?.relationDetails ?? {};
  //       const normalizedRelationDetails = {};

  //       Object.keys(relationDetailsRaw).forEach((key) => {
  //         const formattedKey = normalizeRelationLabel(key);
  //         const dobValue =
  //           relationDetailsRaw[key]?.dob ||
  //           relationDetailsRaw[key]?.dateOfBirth ||
  //           "";
  //         const normalizedDobValue = normalizeDateForInput(dobValue);
  //         const derivedAge = calculateAgeFromDob(normalizedDobValue);
  //         normalizedRelationDetails[formattedKey] = {
  //           relationName: formattedKey,
  //           firstName: relationDetailsRaw[key]?.firstName || "",
  //           lastName: relationDetailsRaw[key]?.lastName || "",
  //           dob: normalizedDobValue,
  //           age:
  //             relationDetailsRaw[key]?.age !== undefined &&
  //             relationDetailsRaw[key]?.age !== null &&
  //             relationDetailsRaw[key]?.age !== ""
  //               ? relationDetailsRaw[key]?.age
  //               : derivedAge,
  //           guardian:
  //             relationDetailsRaw[key]?.guardian ||
  //             relationDetailsRaw[key]?.guardianName ||
  //             "",
  //           aadharNumber: relationDetailsRaw[key]?.aadharNumber || "",
  //           mobileNumber:
  //             relationDetailsRaw[key]?.mobileNumber ||
  //             relationDetailsRaw[key]?.mobile_no ||
  //             "",
  //           panNumber: relationDetailsRaw[key]?.panNumber || "",
  //           photo: relationDetailsRaw[key]?.photo || "",
  //           ayushman: normalizeYesNoToBoolean(
  //             relationDetailsRaw[key]?.ayushman ??
  //               relationDetailsRaw[key]?.ayushman_coverage
  //           ),
  //           mediclaim: normalizeYesNoToBoolean(
  //             relationDetailsRaw[key]?.mediclaim ??
  //               relationDetailsRaw[key]?.has_mediclaim_policy
  //           ),
  //           ayushman_Amount: relationDetailsRaw[key]?.amount || null,
  //           mediclaim_amount: relationDetailsRaw[key]?.mediclaimAmount || null,
  //           member_mediclaim_premium_amount: relationDetailsRaw[key]?.mediclaimPremiumAmount || null,
  //           mediclaim_company_name: relationDetailsRaw[key]?.mediclaimCompanyName || null,
  //           mediclaim_type: relationDetailsRaw[key]?.mediclaim_type || null,
  //           // "mediclaimAmount": "1500",
  //           // "mediclaimCompanyName": "uyhgtfd",
  //           // "mediclaimPremiumAmount": "1000",

  //           needAssistance: normalizeYesNoToBoolean(
  //             relationDetailsRaw[key]?.needAssistance ??
  //               relationDetailsRaw[key]?.need_assistance
  //           ),
  //           family_head: relationDetailsRaw[key]?.family_head || false,
  //           assistanceCategories: relationDetailsRaw[key]?.assistanceCategories || [],
  //         };
  //       });

  //       if (!Object.keys(normalizedRelationDetails).length && formattedRelation) {
  //         normalizedRelationDetails[formattedRelation] = {
  //           relationName: formattedRelation,
  //           firstName: diksharthiData?.family_member_firstName || "",
  //           lastName: diksharthiData?.family_member_lastName || "",
  //           dob: "",
  //           age: "",
  //           guardian: "",
  //           aadharNumber: "",
  //           mobileNumber: diksharthiData?.mobile_no || "",
  //           panNumber: "",
  //           photo: "",
  //           ayushman: null,
  //           mediclaim: null,
  //           ayushman_Amount: null,
  //           mediclaim_amount: null,
  //           member_mediclaim_premium_amount: null,
  //           mediclaim_company_name: null,
  //           mediclaim_type: null,
  //           needAssistance: null,
  //           family_head: true,
  //           assistanceCategories: [],
  //         };
  //       }

  //       // ================= FINAL RELATIONS ARRAY =================
  //       const relationKeysFromDetails = Object.keys(normalizedRelationDetails || {});
  //       const finalRelations = Array.from(
  //         new Set(
  //           [
  //             ...apiRelations,
  //             ...diksharthiRelations,
  //             formattedRelation,
  //             ...relationKeysFromDetails,
  //           ].filter(Boolean)
  //         )
  //       );

  //       // ================= HEAD OF FAMILY =================
  //       const apiHead =
  //         Object.entries(normalizedRelationDetails).find(([_, val]) => val?.family_head)?.[0] ||
  //         formattedRelation ||
  //         null;

  //       // ================= ASSISTANCE DATA =================
  //       const assistanceRaw = familyData?.assistanceData ?? {};
  //       const selectedAssistance = familyData?.assistance ?? {};

  //       const normalizedAssistanceData = {};
  //       Object.keys(assistanceRaw).forEach((key) => {
  //         const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
  //         normalizedAssistanceData[formattedKey] = assistanceRaw[key];
  //       });

  //       // ================= EXPAND RELATIONS =================
  //       const expanded = finalRelations.reduce((acc, relationKey) => {
  //         acc[relationKey] = true;
  //         return acc;
  //       }, {});

  //       // ================= SET STATE =================
  //       setFormData((prev) => ({
  //         ...prev,
  //         ...normalizedFormData,
  //         relations: finalRelations,
  //       }));

  //       setRelationDetails(normalizedRelationDetails);
  //       setHeadOfFamily(apiHead);
  //       setAssistanceData(normalizedAssistanceData);
  //       setselectedAssistance(selectedAssistance);
  //       setdefaultAssisatce(selectedAssistance)
  //       setSelectedRelation(formattedRelation || apiHead || finalRelations[0] || null); // default selected
  //       setExpandedRelations(expanded);
  //       setFamilyRecordId(familyData?.id ?? null);
  //       setInitialLockSnapshot({
  //         formData: normalizedFormData,
  //         relationDetails: normalizedRelationDetails,
  //         assistanceData: normalizedAssistanceData,
  //         headOfFamily: apiHead,
  //       });

  //       // ================= DEBUG =================
  //       console.log("FINAL relationDetails:", normalizedRelationDetails);
  //       console.log("FINAL assistanceData:", normalizedAssistanceData);
  //       console.log("FINAL relations (formData):", finalRelations);
  //       console.log("Selected Relation:", formattedRelation);
  //       console.log("Expanded Relations:", expanded);

  //     } catch (error) {
  //       console.error("Error fetching family details:", error);
  //     }
  //   };

  //   fetchFamilyDetailsById();
  // }, [id]);


  useEffect(() => {
    if (!id) return;

    const fetchFamilyDetailsById = async () => {
      try {
        const [diksharthiRes, familyRes] = await Promise.all([
          axios.get(`${API}/api/diksharthi/${id}`),
          axios
            .get(`${API}/api/family-details/${id}`)
            .catch(() => ({ data: { data: [] } })),
        ]);

        const diksharthiData = diksharthiRes?.data?.data || {};
        const familyData = familyRes?.data?.data?.[0] || {};

        // ✅ ONLY TOP FORM DATA
        const normalizedFormData = {
          permanentAddress:
            familyData?.formData?.permanentAddress ||
            diksharthiData?.permanent_address ||
            "",

          currentAddress:
            familyData?.formData?.currentAddress ||
            diksharthiData?.current_address ||
            "",

          village:
            familyData?.formData?.village ||
            diksharthiData?.village ||
            "",

          taluka:
            familyData?.formData?.taluka ||
            diksharthiData?.taluka ||
            "",

          district:
            familyData?.formData?.district ||
            diksharthiData?.district ||
            "",

          state:
            familyData?.formData?.state ||
            diksharthiData?.state ||
            "",

          pinCode:
            familyData?.formData?.pinCode ||
            diksharthiData?.pin_code ||
            "",

          houseDetails:
            familyData?.formData?.houseDetails ||
            diksharthiData?.house_details ||
            "",

          typeOfHouse:
            familyData?.formData?.typeOfHouse ||
            diksharthiData?.type_of_house ||
            "",

          maintenanceCost:
            familyData?.formData?.maintenanceCost ||
            diksharthiData?.maintenance_cost ||
            "",

          lightBillCost:
            familyData?.formData?.lightBillCost ||
            diksharthiData?.light_bill_cost ||
            "",

          rentCost:
            familyData?.formData?.rentCost ||
            diksharthiData?.rent_cost ||
            "",

          // Do not prefill these sections from API data
          mediclaim: false,
          family_mediclaim_type: "",
          Family_mediclaim_amount: "",
          mediclaimPremiumAmount: "",
          family_mediclaim_companyName: "",
          ngoAssistance: false,
          sanghName: "",
          ngoAmount: "",
          ngoFrequency: "",
          ngoRemark: "",
        };

        // ✅ relationDetails REMOVE
        // ✅ assistance REMOVE
        // ✅ selected relation REMOVE

        setFormData((prev) => ({
          ...prev,
          ...normalizedFormData,
        }));

        setFamilyRecordId(familyData?.id ?? null);

        setInitialLockSnapshot((prev) => ({
          ...prev,
          formData: normalizedFormData,
        }));

      } catch (error) {
        console.error(error);
      }
    };

    fetchFamilyDetailsById();
  }, [id]);

  const fetchFamilyMembers = async () => {
    try {
      const res = await axios.get(
        `${API}/api/get-family-members-full/${id}`
      );

      const apiData = res?.data?.data || {};

      const formattedData = {};

      Object.keys(apiData).forEach((relation) => {
        const member = apiData[relation];

        formattedData[relation] = {
          relationName: relation,
          firstName: member.firstName || "",
          lastName: member.lastName || "",
          dob: member.dob || "",
          age: member.age || "",
          aadharNumber: member.aadharNumber || "",
          mobileNumber: member.mobileNumber || "",
          panNumber: member.panNumber || "",

          photo: member.photo || "",

          // Do not prefill Mediclaim fields from API
          mediclaim: false,
          mediclaim_amount: "",
          mediclaim_company_name: "",
          member_mediclaim_premium_amount: "",

          ayushman: member.ayushmanCoverage ? true : false,
          ayushman_Amount: member.ayushmanAmount || "",

          // Do not prefill Need Assistance from API
          needAssistance: false,

          // Do not prefill selected assistance categories from API
          assistanceCategories: [],
          family_head: member.family_head || false,
        };
      });

      setRelationDetails(formattedData);
      setAssistanceData({});
      setDeselectedAssistance([]);
      setExtraAssistance([]);

      const relationKeys = Object.keys(formattedData);

      setFormData((prev) => ({
        ...prev,
        relations: relationKeys,
      }));

      const head = Object.keys(formattedData).find(
        (rel) => formattedData[rel].family_head
      );

      setHeadOfFamily(head || null);
      setExpandedRelations(
        relationKeys.reduce((acc, relationKey) => {
          acc[relationKey] = true;
          return acc;
        }, {})
      );

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchFamilyMembers();
    }
  }, [id]);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setInitialLockSnapshot({
      formData: INITIAL_FORM_DATA,
      relationDetails: {},
      assistanceData: {},
      headOfFamily: null,
    });

    setRelationDetails({});
    setExpandedRelations({});
    setAdditionalRelations({});
    setHeadOfFamily(null);
  };

  const sanitizeRelationDetailsForPayload = (details) =>
    Object.fromEntries(
      Object.entries(details || {}).map(([relationKey, relationValue]) => {
        const nextRelationValue = { ...(relationValue || {}) };
        delete nextRelationValue.photoPreview;

        return [relationKey, nextRelationValue];
      }),
    );

  const handleSave = async () => {
    debugger
    if (loading) return;
    setLoading(true);
    try {
      // 🔴 VALIDATION LOGIC FOR AADHAR AND PAN
      const errors = {};

      Object.entries(relationDetails).forEach(([rel, details]) => {
        // Validate Aadhar Number
        if (details?.aadharNumber) {
          if (!isValidAadhaar(details.aadharNumber)) {
            errors[`aadhar_${rel}`] = "Aadhar number must be exactly 12 digits";
          }
        }

        // // Validate Mobile Number
        // if (!details?.mobileNumber) {
        //   errors[`mobile_${rel}`] = "Mobile number is required";
        // } else if (!/^[1-9]\d{9}$/.test(details.mobileNumber)) {
        //   errors[`mobile_${rel}`] =
        //     "Mobile number must be 10 digits ";
        // }

        // Validate Mobile Number
        if (
          details?.mobileNumber &&
          !/^[1-9]\d{9}$/.test(details.mobileNumber)
        ) {
          errors[`mobile_${rel}`] =
            "Mobile number must be 10 digits";
        }

        // Validate PAN Number
        if (details?.panNumber) {
          if (!isValidPAN(details.panNumber)) {
            errors[`pan_${rel}`] = "PAN must be in format ABCDE1234F (5 letters + 4 digits + 1 letter)";
          }
        }
      });

      // Validate Mediclaim Premium vs Cover Amount
      if (formData.mediclaimPremiumAmount) {
        const premiumAmount = Number(formData.mediclaimPremiumAmount) || 0;
        const coverAmount = Number(formData.Family_mediclaim_amount) || 0;

        if (premiumAmount > coverAmount) {
          errors["mediclaim_premium"] = `Mediclaim premium (₹${premiumAmount}) cannot exceed cover amount (₹${coverAmount})`;
        }
      }

      // Validate EMI Amount vs Loan Amount for Housing Assistance
      Object.entries(assistanceData).forEach(([rel, assistances]) => {
        if (assistances?.Housing?.loanAmount && assistances?.Housing?.emiAmountMonthly) {
          const loanAmount = Number(assistances.Housing.loanAmount) || 0;
          const emiAmount = Number(assistances.Housing.emiAmountMonthly) || 0;

          if (emiAmount > loanAmount) {
            errors[`housing_emi_${rel}`] = `EMI amount (₹${emiAmount}) cannot exceed loan amount (₹${loanAmount})`;
          }
        }
      });

      // Check if there are validation errors
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        alert("Please fix the validation errors highlighted in the form");
        return;
      }

      // Clear validation errors if everything is valid
      setValidationErrors({});

      const formDataToSend = new FormData();
      const normalizedAssistanceData =
        normalizeAssistanceDataForPayload(assistanceData);
      const sanitizedRelationDetails = sanitizeRelationDetailsForPayload(
        buildRelationDetailsPayload(relationDetails, headOfFamily)
      );
      const uploadedRelationDetails = buildRelationDetailsPayloadWithUploads(
        sanitizedRelationDetails,
        formDataToSend
      );
      const uploadedAssistanceData = buildAssistanceDataPayloadWithUploads(
        normalizedAssistanceData,
        formDataToSend
      );

      const payload = {
        diksharthi_id: id,
        formData,
        relationDetails: uploadedRelationDetails,
        deselectedAssistance: deselectedAssistance,
        additionalRelations,
        expandedRelations,
        headOfFamily,
        selectedAssistance: selectedAssistance,
        assistanceData: uploadedAssistanceData,
        assistance_data: uploadedAssistanceData,
      };





      // ✅ FILES ADD KARO


      // 🔥 MAIN LOGIC (CREATE vs UPDATE)
      const url = familyRecordId
        ? `${API}/api/update-family-details/${id}`
        : `${API}/api/create-family-details`;

      const method = familyRecordId ? "put" : "post";

      formDataToSend.append("payload", JSON.stringify(payload));
      formDataToSend.append("diksharthi_id", id);
      formDataToSend.append("formData", JSON.stringify(formData));
      formDataToSend.append(
        "relationDetails",
        JSON.stringify(uploadedRelationDetails)
      );
      formDataToSend.append(
        "additionalRelations",
        JSON.stringify(additionalRelations)
      );
      formDataToSend.append(
        "expandedRelations",
        JSON.stringify(expandedRelations)
      );
      formDataToSend.append("headOfFamily", headOfFamily);
      formDataToSend.append(
        "assistanceData",
        JSON.stringify(uploadedAssistanceData)
      );
      formDataToSend.append(
        "assistance_data",
        JSON.stringify(uploadedAssistanceData)
      );

      const response = await axios({
        method,
        url,
        data: formDataToSend,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);

      if (response.data.success) {
        alert(
          familyRecordId
            ? "Family details updated successfully ✅"
            : "Family details saved successfully ✅"
        );
      }
      navigate("/diksharthi-details");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving family details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMedicalChange = (relation, field, value) => {
    if (isAssistanceFieldLocked(relation, "Medical", field)) return;

    setAssistanceData((prev) => {
      const nextMedical = {
        ...prev[relation]?.Medical,
        [field]: value,
        status: "Pending",
      };

      nextMedical.totalEstimatedCost = calculateMedicalTotal(nextMedical);

      return {
        ...prev,
        [relation]: {
          ...prev[relation],
          Medical: nextMedical,
        },
      };
    });
  };

  const calculateMedicalTotal = (medical) => {
    if (!medical?.diseases) return 0;

    return medical.diseases.reduce((total, disease) => {
      return total + (disease.totalEstimatedCost || 0);
    }, 0);
  };

  const calculateDiseaseTotal = (disease) => {
    if (!disease) return 0;

    const costPerSession = Number(disease.costPerSession || 0);
    const sessionsCount = Number(disease.sessionsCount || 0);

    return costPerSession * sessionsCount;
  };

  const handleDiseaseChange = (relation, index, field, value) => {
    if (isAssistanceFieldLocked(relation, "Medical", "diseases")) return;

    setAssistanceData((prev) => {
      if (field === "removeDisease") {
        const recalculatedDiseases = (value || []).map((item) => ({
          ...item,
          totalEstimatedCost: calculateDiseaseTotal(item),
        }));

        const nextMedical = {
          ...prev[relation]?.Medical,
          diseases: recalculatedDiseases,
        };

        const diseaseNames = (value || [])
          .map((item) => item?.diseaseName)
          .filter(Boolean)
          .join(", ");

        nextMedical.diseaseName = diseaseNames;
        nextMedical.totalEstimatedCost = calculateMedicalTotal(nextMedical);

        // Remove disease
        return {
          ...prev,
          [relation]: {
            ...prev[relation],
            Medical: nextMedical,
          },
        };
      }

      // Regular field update
      const diseases = [...(prev[relation]?.Medical?.diseases || [])];

      diseases[index] = {
        ...diseases[index],
        [field]: value,
      };
      diseases[index].totalEstimatedCost = calculateDiseaseTotal(diseases[index]);

      const diseaseNames = diseases
        .map((item) => item?.diseaseName)
        .filter(Boolean)
        .join(", ");

      const nextMedical = {
        ...prev[relation]?.Medical,
        diseases,
        diseaseName: diseaseNames,
      };
      nextMedical.totalEstimatedCost = calculateMedicalTotal(nextMedical);

      return {
        ...prev,
        [relation]: {
          ...prev[relation],
          Medical: nextMedical,
        },
      };
    });
  };

  const handleAddDisease = (relation) => {
    if (isAssistanceFieldLocked(relation, "Medical", "diseases")) return;

    setAssistanceData((prev) => ({
      ...prev,
      [relation]: {
        ...prev[relation],
        Medical: {
          ...prev[relation]?.Medical,
          diseases: [
            ...(prev[relation]?.Medical?.diseases || []),
            {
              diseaseName: "",
              frequency: "",
              sessions: "",
              costPerSession: "",
            },
          ],
        },
      },
    }));
  };

  const handleEducationChange = (relation, field, value) => {
    if (isAssistanceFieldLocked(relation, "Education", field)) return;

    setAssistanceData((prev) => ({
      ...prev,
      [relation]: {
        ...prev[relation],
        Education: {
          ...prev[relation]?.Education,
          [field]: value,
          status: "Pending",
        },
      },
    }));
  };

  const handleJobChange = (relation, field, value) => {
    if (isAssistanceFieldLocked(relation, "Job", field)) return;

    setAssistanceData((prev) => ({
      ...prev,
      [relation]: {
        ...prev[relation],
        Job: {
          ...prev[relation]?.Job,
          [field]: value,
          status: "Pending",
        },
      },
    }));
  };

  const handleFoodChange = (relation, field, value) => {
    if (isAssistanceFieldLocked(relation, "Food", field)) return;

    setAssistanceData((prev) => ({
      ...prev,
      [relation]: {
        ...prev[relation],
        Food: {
          ...prev[relation]?.Food,
          [field]: value,
          status: "Pending",
        },
      },
    }));
  };
  // const handleRentChange = (relation, field, value) => {
  //   if (isAssistanceFieldLocked(relation, "Rent", field)) return;

  //   setAssistanceData((prev) => ({
  //     ...prev,
  //     [relation]: {
  //       ...prev[relation],
  //       Rent: {
  //         ...prev[relation]?.Rent,
  //         [field]: value,
  //         status: "Pending",
  //       },
  //     },
  //   }));
  // };

  const handleRentChange = (relation, field, value) => {
    if (field !== "remarks" && isAssistanceFieldLocked(relation, "Rent", field)) return;

    setAssistanceData((prev) => ({
      ...prev,
      [relation]: {
        ...prev[relation],
        Rent: {
          ...prev[relation]?.Rent,
          [field]: value,
          status: "Pending",
        },
      },
    }));
  };

  const handleHousingChange = (relation, field, value) => {
    if (isAssistanceFieldLocked(relation, "Housing", field)) return;

    setAssistanceData((prev) => ({
      ...prev,
      [relation]: {
        ...prev[relation],
        Housing: {
          ...prev[relation]?.Housing,
          [field]: value,
          status: "Pending",
        },
      },
    }));
  };

  const handleVaiyavacchChange = (relation, field, value) => {
    if (isAssistanceFieldLocked(relation, "Vaiyavacch", field)) return;

    setAssistanceData((prev) => ({
      ...prev,
      [relation]: {
        ...prev[relation],
        Vaiyavacch: {
          ...prev[relation]?.Vaiyavacch,
          [field]: value,
          status: "Pending",
        },
      },
    }));
  };
  const handleEmergencyChange = (relation, field, value) => {
    if (isAssistanceFieldLocked(relation, "LivelihoodExpenses", field)) return;

    setAssistanceData((prev) => ({
      ...prev,
      [relation]: {
        ...prev[relation],
        LivelihoodExpenses: {
          ...prev[relation]?.LivelihoodExpenses,
          [field]: value,
          status: "Pending",
        },
      },
    }));
  };

  const handleBusinessChange = (relation, field, value) => {
    if (isAssistanceFieldLocked(relation, "Business", field)) return;

    setAssistanceData((prev) => ({
      ...prev,
      [relation]: {
        ...prev[relation],
        Business: {
          ...prev[relation]?.Business,
          [field]: value,
          status: "Pending",
        },
      },
    }));
  };

  //      const [assistanceTypes] = useState([
  //     "Medical",
  //     "Education",
  //     "Job",
  //     "Food",
  //     "Rent",
  //       "House_purchase_repair",
  //       "Vaiyavacch_Assistance",
  //       "Emergency_expenses",
  //       "Business_support",
  //       "Interest_free loans",
  //     "Skill_development"
  //   ]);
  return (
    <div className="min-h-screen bg-gray-50 flex p-6 justify-center">
      <div className="w-full max-w-8xl bg-white p-6 shadow-sm">
       
        <div className="flex items-center gap-2 mb-8 text-slate-800">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-xl font-bold">Family Basic Details</h2>
        </div>

        <form className="space-y-6">
     

          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <h2 className="text-sx font-bold">Family Address Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Permanent Address <span className="text-red-500">*</span>
                </label>
              </div>

              <input
                type="text"
                value={formData.permanentAddress}
                onChange={(e) =>
                  updateFormField("permanentAddress", e.target.value)
                }
                readOnly={isFormFieldLocked("permanentAddress")}
                className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${lockInputClass(
                  isFormFieldLocked("permanentAddress")
                )}`}
              />
            </div>

        
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  Current Address <span className="text-red-500">*</span>
                </label>
              </div>
              <input
                type="text"
                value={formData.currentAddress}
                onChange={(e) =>
                  updateFormField("currentAddress", e.target.value)
                }
                readOnly={isFormFieldLocked("currentAddress")}
                className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${lockInputClass(
                  isFormFieldLocked("currentAddress")
                )}`}
              />
            </div>
          </div>

         
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                State<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => updateFormField("state", e.target.value)}
                readOnly={isFormFieldLocked("state")}
                className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${lockInputClass(
                  isFormFieldLocked("state")
                )}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                District / City<span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={formData.district}
                onChange={(e) => updateFormField("district", e.target.value)}
                readOnly={isFormFieldLocked("district")}
                className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${lockInputClass(
                  isFormFieldLocked("district")
                )}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Taluka
              </label>
              <input
                type="text"
                value={formData.taluka}
                onChange={(e) => updateFormField("taluka", e.target.value)}
                readOnly={isFormFieldLocked("taluka")}
                className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${lockInputClass(
                  isFormFieldLocked("taluka")
                )}`}
                placeholder="Enter taluka"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Village
              </label>

              <input
                type="text"
                value={formData.village}
                onChange={(e) => updateFormField("village", e.target.value)}
                readOnly={isFormFieldLocked("village")}
                className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${lockInputClass(
                  isFormFieldLocked("village")
                )}`}
              />


            </div>

           
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pin Code<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.pinCode}
                onChange={(e) => updateFormField("pinCode", e.target.value)}
                readOnly={isFormFieldLocked("pinCode")}
                className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${lockInputClass(
                  isFormFieldLocked("pinCode")
                )}`}
              />
            </div>
          </div>



          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <h2 className="text-sx font-bold">Family House Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">


           
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                House <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="house"
                    value="own"
                    checked={formData.houseDetails === "own"}
                    onChange={(e) =>
                      updateFormField("houseDetails", e.target.value, { rentCost: "" })
                    }
                    disabled={isFormFieldLocked("houseDetails")}
                    className="w-4 h-4 text-blue-600"
                  />
                  Own
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="house"
                    value="rented"
                    checked={formData.houseDetails === "rented"}
                    onChange={(e) =>
                      updateFormField("houseDetails", e.target.value, {
                        maintenanceCost: "",
                      })
                    }
                    disabled={isFormFieldLocked("houseDetails")}
                    className="w-4 h-4 text-blue-600"
                  />
                  Rented
                </label>
              </div>
            </div>
 
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type Of House
              </label>
              <input
                type="text"
                placeholder="e.g. Apartment, Villa"
                value={formData.typeOfHouse}
                onChange={(e) => updateFormField("typeOfHouse", e.target.value)}
                readOnly={isFormFieldLocked("typeOfHouse")}
                className={`w-full p-2 border border-slate-300 rounded-md outline-none ${lockInputClass(
                  isFormFieldLocked("typeOfHouse")
                )}`}
              />
            </div>

           
            <div>
              {formData.houseDetails === "own" ? (
                <>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Maintenance Cost (Monthly)
                  </label>
                  <input
                    type="number"
                    value={formData.maintenanceCost}
                    onChange={(e) =>
                      updateFormField("maintenanceCost", e.target.value)
                    }
                    readOnly={isFormFieldLocked("maintenanceCost")}
                    className={`w-full p-2 border border-slate-300 rounded-md outline-none ${lockInputClass(
                      isFormFieldLocked("maintenanceCost")
                    )}`}
                  />
                </>
              ) : formData.houseDetails === "rented" ? (
                <>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Rent Cost (Monthly)
                  </label>
                  <input
                    type="number"
                    value={formData.rentCost}
                    onChange={(e) => updateFormField("rentCost", e.target.value)}
                    readOnly={isFormFieldLocked("rentCost")}
                    className={`w-full p-2 border border-slate-300 rounded-md outline-none ${lockInputClass(
                      isFormFieldLocked("rentCost")
                    )}`}
                  />
                </>
              ) : (
                
                <div className="h-[62px]"></div>
              )}
            </div>

           
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Light Bill Cost
              </label>
              <input
                type="number"
                value={formData.lightBillCost}
                onChange={(e) =>
                  updateFormField("lightBillCost", e.target.value)
                }
                readOnly={isFormFieldLocked("lightBillCost")}
                className={`w-full p-2 border border-slate-300 rounded-md outline-none ${lockInputClass(
                  isFormFieldLocked("lightBillCost")
                )}`}
              />
            </div>
          </div>

          {/* Relations Section */}
         <Family_Details_Staff

          diksarthiid={
           id
          }

          newdiksarthi={
            id
          }

          // savedMainDiksarthi={
          //   selectedMember
          // }

          // isEdit={
          //   isEditMode
          // }

          // memberData={
          //   selectedMember
          // }

           mode={
           
               "edit"
          }
           isEdit={"edit"}

        /> 
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {/* ===================================================== */}
  {/* MEDICLAIM */}
  {/* ===================================================== */}

  <div>
    <p className="text-sm font-medium text-slate-700 mb-2">
      Does the family have any Mediclaim policy?
      <span className="text-red-500">*</span>
    </p>

    <div className="flex gap-4">
      {/* YES */}
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="mediclaim"

          // ✅ DIRECT VARIABLE CHECK
          checked={mediclaim === "Yes"}

          disabled={isFormFieldLocked("mediclaim")}
        />

        Yes
      </label>

      {/* NO */}
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="mediclaim"

          // ✅ DIRECT VARIABLE CHECK
          checked={mediclaim === "No"}

          disabled={isFormFieldLocked("mediclaim")}
        />

        No
      </label>
    </div>
  </div>

  {/* ===================================================== */}
  {/* NGO ASSISTANCE */}
  {/* ===================================================== */}

  <div>
    <p className="text-sm font-medium text-slate-700 mb-2">
      Is any Sangh/NGO assistance received?
      <span className="text-red-500">*</span>
    </p>

    <div className="flex gap-4">
      {/* YES */}
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="ngo"

          // ✅ DIRECT VARIABLE CHECK
          checked={ngo_assistance === "Yes"}

          disabled={isFormFieldLocked("ngoAssistance")}
        />

        Yes
      </label>

      {/* NO */}
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="ngo"

          // ✅ DIRECT VARIABLE CHECK
          checked={ngo_assistance === "No"}

          disabled={isFormFieldLocked("ngoAssistance")}
        />

        No
      </label>
    </div>
  </div>
</div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {formData.mediclaim && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mediclaim Type
                  </label>

                  <select
                    className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${lockInputClass(
                      isFormFieldLocked("family_mediclaim_type")
                    )}`}
                    value={formData.family_mediclaim_type || ""}
                    onChange={(e) =>
                      updateFormField("family_mediclaim_type", e.target.value)
                    }
                    disabled={isFormFieldLocked("family_mediclaim_type")}
                  >
                    <option value="">Select Type</option>
                    <option value="single">Single</option>
                    <option value="joint">Joint</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Family Mediclaim policy Amount
                  </label>

                  <input
                    type="text"
                    value={formData.Family_mediclaim_amount || ""}
                    onChange={(e) =>
                      updateFormField("Family_mediclaim_amount", e.target.value)
                    }
                    readOnly={isFormFieldLocked("Family_mediclaim_amount")}
                    className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${lockInputClass(
                      isFormFieldLocked("Family_mediclaim_amount")
                    )}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mediclaim premium Amount
                  </label>
                  <input
                    type="number"
                    value={formData.mediclaimPremiumAmount || ""}
                    onChange={(e) => {
                      if (isFormFieldLocked("mediclaimPremiumAmount")) return;
                      let premiumAmount = Number(e.target.value);
                      const coverAmount = Number(formData.Family_mediclaim_amount) || 0;

                      // Ensure premiumAmount is LESS than coverAmount
                      if (premiumAmount >= coverAmount) {
                        alert(`Premium amount must be less than Family Mediclaim Policy Amount (₹${coverAmount})`);
                        premiumAmount = coverAmount > 0 ? coverAmount - 1 : 0; // automatically reduce by 1
                      }

                      updateFormField("mediclaimPremiumAmount", premiumAmount);
                    }}
                    readOnly={isFormFieldLocked("mediclaimPremiumAmount")}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${Number(formData.mediclaimPremiumAmount || 0) >= Number(formData.Family_mediclaim_amount || 0) &&
                      formData.Family_mediclaim_amount
                      ? "border-red-500 focus:ring-red-100"
                      : "border-slate-300"
                      } `}
                  />
                  {Number(formData.mediclaimPremiumAmount || 0) > Number(formData.Family_mediclaim_amount || 0) && formData.Family_mediclaim_amount && (
                    <p className="text-red-500 text-xs mt-1">
                      Premium amount cannot exceed cover amount (₹{formData.Family_mediclaim_amount})
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mediclaim Compnay Name
                  </label>
                  <input
                    type="text"
                    value={formData.family_mediclaim_companyName || ""}
                    onChange={(e) =>
                      updateFormField("family_mediclaim_companyName", e.target.value)
                    }
                    readOnly={isFormFieldLocked("family_mediclaim_companyName")}
                    className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none `}
                  />
                </div>
              </div>
            )}
            {formData.ngoAssistance && (
              <div className=" grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sangh Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sanghName || ""}
                    onChange={(e) => updateFormField("sanghName", e.target.value)}
                    readOnly={isFormFieldLocked("sanghName")}
                    className={`w-full p-2 border border-slate-300 rounded-md outline-none `}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.ngoAmount || ""}
                    onChange={(e) => updateFormField("ngoAmount", e.target.value)}
                    readOnly={isFormFieldLocked("ngoAmount")}
                    className={`w-full p-2 border border-slate-300 rounded-md outline-none $`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Frequency
                  </label>

                  <select
                    className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none`}
                    value={formData.ngoFrequency || ""}
                    onChange={(e) => updateFormField("ngoFrequency", e.target.value)}
                    disabled={isFormFieldLocked("ngoFrequency")}
                  >
                    <option value="">Select Frequency</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Details / Remark
                  </label>
                  <textarea
                    value={formData.ngoRemark || ""}
                    onChange={(e) => updateFormField("ngoRemark", e.target.value)}
                    readOnly={isFormFieldLocked("ngoRemark")}
                    className={`w-full p-2 border border-slate-300 rounded-md outline-none resize-none `}
                    rows={2}
                  />
                </div>

              </div>
            )}
          </div> */}

          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8">
            <div className="flex gap-4"></div>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className={`px-4 py-2 text-white font-semibold rounded-md transition-colors ${loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
                }`}
            >
              {loading
                ? familyRecordId
                  ? "Updating..."
                  : "Saving..."
                : familyRecordId
                  ? "Update"
                  : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FamilyDetailsForm;
