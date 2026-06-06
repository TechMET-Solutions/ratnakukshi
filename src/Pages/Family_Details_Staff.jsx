import axios from "axios";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import { useAuth } from "../context/AuthContext";
import { isValidAadhaar, isValidPAN } from "../utils/validation";

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
};

const Family_Details_Staff = ({
  diksarthiid,
  newdiksarthi,
  savedMainDiksarthi,
  setCurrentStep,
  setCurrentDiksarthiStore,
  CurrentDiksarthiStore,
  isEdit,
  mode,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  console.log(newdiksarthi, "newdiksarthi");
  const [loading, setLoading] = useState(false);
  const id = diksarthiid;
  const code = location?.state?.diksharthi_code;
  const name = location?.state?.sadhu_sadhvi_name;
  const gender = location?.state?.gender;
  const [sameAsMain, setSameAsMain] = useState(true);
  const [backupRelationDetails, setBackupRelationDetails] = useState({});
  const [backupExpandedRelations, setBackupExpandedRelations] = useState({});
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

  console.log(CurrentDiksarthiStore, "CurrentDiksarthiStore");

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const role = String(user?.role || "")
    .trim()
    .toLowerCase();
  const isKaryakarta = role === "karyakarta";
  const handleSameAsMainChange = (checked) => {
    setSameAsMain(checked);

    if (!checked) {
      // ❌ UNCHECK → backup + clear everything
      setBackupRelationDetails(relationDetails);
      setBackupExpandedRelations(expandedRelations);

      setRelationDetails({});
      setExpandedRelations({});

      setFormData((prev) => ({
        ...prev,
        relations: [],
      }));
    } else {
      // ✅ CHECK → restore backup OR main data
      const restoredDetails =
        Object.keys(backupRelationDetails).length > 0
          ? backupRelationDetails
          : savedMainDiksarthi?.[0]?.relationDetails || {};

      const restoredExpanded =
        Object.keys(backupExpandedRelations).length > 0
          ? backupExpandedRelations
          : {};

      setRelationDetails(restoredDetails);
      setExpandedRelations(restoredExpanded);

      setFormData((prev) => ({
        ...prev,
        relations: Object.keys(restoredDetails),
      }));
    }
  };
  const hasPrefilledValue = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (typeof value === "number") return true;
    if (typeof value === "boolean") return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return false;
  };

  const toBool = (value) => {
    if (
      value === true ||
      value === 1 ||
      value === "1" ||
      String(value).toLowerCase() === "true" ||
      String(value).toLowerCase() === "yes"
    ) {
      return true;
    }

    if (
      value === false ||
      value === 0 ||
      value === "0" ||
      String(value).toLowerCase() === "false" ||
      String(value).toLowerCase() === "no"
    ) {
      return false;
    }

    return null;
  };

  const isFormFieldLocked = (fieldName) =>
    isKaryakarta &&
    hasPrefilledValue(initialLockSnapshot?.formData?.[fieldName]);

  const isRelationFieldLocked = (relation, fieldName) =>
    isKaryakarta &&
    hasPrefilledValue(
      initialLockSnapshot?.relationDetails?.[relation]?.[fieldName],
    );

  const isAssistanceFieldLocked = (relation, type, fieldName) =>
    isKaryakarta &&
    hasPrefilledValue(
      initialLockSnapshot?.assistanceData?.[relation]?.[type]?.[fieldName],
    );

  const isHeadOfFamilyLocked =
    isKaryakarta && hasPrefilledValue(initialLockSnapshot?.headOfFamily);

  const lockInputClass = (isLocked) =>
    isLocked ? "bg-gray-100 text-gray-600 cursor-not-allowed" : "";

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

  console.log(selectedRelations, "--------selectedRelations------------");
  const allowRelationEditing = false;

  const [deselectData, setDeselectData] = useState(null);
  // { rel, type, reason }

  console.log(formData, "formData");
  const [relationDetails, setRelationDetails] = useState({});
  console.log(relationDetails, "relationDetails");
  const [selectedRelation, setSelectedRelation] = useState(null);
  console.log(
    relationDetails,
    "relationDetails",
    selectedRelation,
    "selectedRelation",
  );
  const [expandedRelations, setExpandedRelations] = useState({});
  console.log(expandedRelations, "expandedRelations");
  const [assistanceTypes] = useState([
    "Medical",
    "Education",
    "Job",
    "Food",
    "Rent",
    "Housing",
    "Vaiyavacch",
    "LivelihoodExpenses",
    "BusinessSupport",
  ]);

  const [additionalRelations, setAdditionalRelations] = useState({});
  const [deselectedAssistance, setDeselectedAssistance] = useState([]);
  const [extraAssistance, setExtraAssistance] = useState([]);

  console.log(deselectedAssistance, "deselectedAssistance");
  const handleAddDocument = (rel) => {
    const prevDocs = assistanceData[rel]?.Medical?.medicalDocuments || [];

    handleMedicalChange(rel, "medicalDocuments", [
      ...prevDocs,
      { documentName: "", files: [] },
    ]);
  };

  const handleDocumentChange = (rel, index, field, value) => {
    const docs = [...(assistanceData[rel]?.Medical?.medicalDocuments || [])];
    docs[index][field] = value;

    handleMedicalChange(rel, "medicalDocuments", docs);
  };

 


const handleAddRentDocument = (rel) => {
  const docs =
    assistanceData[rel]?.Rent?.rentProofDocuments || [];

  handleRentChange(rel, "rentProofDocuments", [
    ...docs,
    {
      documentName: "",
      files: [],
    },
  ]);
};
  const handleEducationDocumentChange = (rel, index, field, value) => {
    const docs = [
      ...(assistanceData[rel]?.Education?.educationDocuments || []),
    ];

    docs[index][field] = value;

    handleEducationChange(rel, "educationDocuments", docs);
  };

  const handleAddEducationDocument = (rel) => {
    const docs = assistanceData[rel]?.Education?.educationDocuments || [];

    handleEducationChange(rel, "educationDocuments", [
      ...docs,
      {
        documentName: "",
        files: [],
      },
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


  const handleLivelihoodDocumentChange = (
  rel,
  index,
  field,
  value
) => {
  const docs = [
    ...(assistanceData[rel]?.LivelihoodExpenses
      ?.livelihoodDocuments || []),
  ];

  docs[index][field] = value;

  handleEmergencyChange(
    rel,
    "livelihoodDocuments",
    docs
  );
};

const handleAddLivelihoodDocument = (rel) => {
  const docs =
    assistanceData[rel]?.LivelihoodExpenses
      ?.livelihoodDocuments || [];

  handleEmergencyChange(
    rel,
    "livelihoodDocuments",
    [
      ...docs,
      {
        documentName: "",
        files: [],
      },
    ]
  );
};

const handleBusinessDocumentChange = (
  rel,
  index,
  field,
  value
) => {
  const docs = [
    ...(assistanceData[rel]?.BusinessSupport
      ?.businessDocuments || []),
  ];

  docs[index][field] = value;

  handleBusinessChange(
    rel,
    "businessDocuments",
    docs
  );
};

const handleAddBusinessDocument = (rel) => {
  const docs =
    assistanceData[rel]?.BusinessSupport
      ?.businessDocuments || [];

  handleBusinessChange(
    rel,
    "businessDocuments",
    [
      ...docs,
      {
        documentName: "",
        files: [],
      },
    ]
  );
};
  console.log(additionalRelations, "additionalRelations");
  const [headOfFamily, setHeadOfFamily] = useState(null);
  console.log(headOfFamily, "headOfFamily");
  const [familyRecordId, setFamilyRecordId] = useState(null);
  console.log(headOfFamily, "headOfFamily");
  const handleCheckbox = (relation) => {
    if (
      isKaryakarta &&
      hasPrefilledValue(initialLockSnapshot?.relationDetails?.[relation])
    ) {
      return;
    }

    setFormData((prev) => {
      const prevRelations = Array.isArray(prev?.relations)
        ? prev.relations
        : [];
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

  // const handleRelationDetailChange = (relation, field, value) => {
  //   if (isRelationFieldLocked(relation, field)) return;

  //   setRelationDetails((prev) => {
  //     const nextRelationDetails = {
  //       ...prev,
  //       [relation]: {
  //         ...prev[relation],
  //         [field]: value,
  //       },
  //     };

  //     if (field === "dob") {
  //       const calculatedAge = calculateAgeFromDob(value);
  //       nextRelationDetails[relation].age = calculatedAge;

  //       if (calculatedAge === "" || Number(calculatedAge) >= 18) {
  //         nextRelationDetails[relation].guardian = "";
  //       }
  //     }

  //     if (field === "mobileNumber") {
  //       const trimmedValue = String(value || "").trim();

  //       setValidationErrors((prevErrors) => {
  //         const nextErrors = { ...prevErrors };

  //         if (!trimmedValue) {
  //           nextErrors[`mobile_${relation}`] = "Mobile number is required";
  //         } else if (!/^[1-9]\d{9}$/.test(trimmedValue)) {
  //           nextErrors[`mobile_${relation}`] =
  //             "Mobile number must be 10 digits";
  //         } else {
  //           delete nextErrors[`mobile_${relation}`];
  //         }

  //         return nextErrors;
  //       });
  //     }

  //     if (field === "aadharNumber") {
  //       const trimmedValue = String(value || "").trim();
  //       const isDuplicate = Object.entries(nextRelationDetails).some(
  //         ([key, data]) =>
  //           key !== relation &&
  //           String(data?.aadharNumber || "").trim() !== "" &&
  //           String(data?.aadharNumber || "").trim() === trimmedValue,
  //       );

  //       setValidationErrors((prevErrors) => {
  //         const nextErrors = { ...prevErrors };

  //         if (!trimmedValue) {
  //           delete nextErrors[`aadhar_${relation}`];
  //         } else if (!isValidAadhaar(trimmedValue)) {
  //           nextErrors[`aadhar_${relation}`] =
  //             "Aadhar number must be exactly 12 digits";
  //         } else if (isDuplicate) {
  //           nextErrors[`aadhar_${relation}`] = "Aadhar number must be unique";
  //         } else {
  //           delete nextErrors[`aadhar_${relation}`];
  //         }

  //         return nextErrors;
  //       });
  //     }

  //     if (field === "panNumber") {
  //       const trimmedValue = String(value || "").trim();
  //       setValidationErrors((prevErrors) => {
  //         const nextErrors = { ...prevErrors };

  //         if (!trimmedValue) {
  //           delete nextErrors[`pan_${relation}`];
  //         } else if (!isValidPAN(trimmedValue)) {
  //           nextErrors[`pan_${relation}`] =
  //             "PAN must be in format ABCDE1234F (5 letters + 4 digits + 1 letter)";
  //         } else {
  //           delete nextErrors[`pan_${relation}`];
  //         }

  //         return nextErrors;
  //       });
  //     }

  //     return nextRelationDetails;
  //   });
  // };

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

      // DOB -> AGE
      if (field === "dob") {
        const calculatedAge = calculateAgeFromDob(value);

        nextRelationDetails[relation].age = calculatedAge;

        if (calculatedAge === "" || Number(calculatedAge) >= 18) {
          nextRelationDetails[relation].guardian = "";
        }
      }

      // MOBILE VALIDATION
      if (field === "mobileNumber") {
        const trimmedValue = String(value || "").trim();

        setValidationErrors((prevErrors) => {
          const nextErrors = { ...prevErrors };

          if (!trimmedValue) {
            nextErrors[`mobile_${relation}`] = "Mobile number is required";
          } else if (!/^[1-9]\d{9}$/.test(trimmedValue)) {
            nextErrors[`mobile_${relation}`] =
              "Mobile number must be 10 digits";
          } else {
            delete nextErrors[`mobile_${relation}`];
          }

          return nextErrors;
        });
      }

      // AADHAR VALIDATION
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

      // PAN VALIDATION
      if (field === "panNumber") {
        const trimmedValue = String(value || "").trim();

        setValidationErrors((prevErrors) => {
          const nextErrors = { ...prevErrors };

          if (!trimmedValue) {
            delete nextErrors[`pan_${relation}`];
          } else if (!isValidPAN(trimmedValue)) {
            nextErrors[`pan_${relation}`] = "PAN must be in format ABCDE1234F";
          } else {
            delete nextErrors[`pan_${relation}`];
          }

          return nextErrors;
        });
      }

      // AADHAR FILE VALIDATION
      if (field === "aadharFile") {
        setValidationErrors((prevErrors) => {
          const nextErrors = { ...prevErrors };

          if (!value) {
            nextErrors[`aadharFile_${relation}`] = "Please upload Aadhaar file";
          } else {
            delete nextErrors[`aadharFile_${relation}`];
          }

          return nextErrors;
        });
      }

      return nextRelationDetails;
    });
  };

  // ==========================================
  // FRONTEND
  // ==========================================

  // 🔥 CREATE THIS FUNCTION
  // const handleNeedAssistanceChange = async (
  //   rel,
  //   needAssistanceValue
  // ) => {

  //   try {

  //     // =========================================
  //     // GET DETAILS
  //     // =========================================

  //     const details = relationDetails?.[rel];

  //     if (!details) {
  //       return;
  //     }

  //     // =========================================
  //     // VALIDATION
  //     // =========================================

  //     if (
  //       needAssistanceValue === true &&
  //       (!details.aadharNumber ||
  //         details.aadharNumber.trim() === "")
  //     ) {

  //       alert(
  //         "Please add Aadhaar Number first"
  //       );

  //       return;
  //     }

  //     // =========================================
  //     // UPDATE LOCAL STATE
  //     // =========================================

  //     handleRelationDetailChange(
  //       rel,
  //       "needAssistance",
  //       needAssistanceValue
  //     );

  //     // =========================================
  //     // LOADING
  //     // =========================================

  //     setLoading(true);

  //     // =========================================
  //     // FORM DATA
  //     // =========================================

  //     const fd = new FormData();

  //     fd.append(
  //       "diksharthi_id",
  //       newdiksarthi || ""
  //     );

  //     fd.append(
  //       "relation_key",
  //       rel || ""
  //     );

  //     fd.append(
  //       "first_name",
  //       details.firstName || ""
  //     );

  //     fd.append(
  //       "last_name",
  //       details.lastName || ""
  //     );

  //     fd.append(
  //       "mobile_number",
  //       details.mobileNumber || ""
  //     );

  //     fd.append(
  //       "aadhar_number",
  //       details.aadharNumber || ""
  //     );

  //     fd.append(
  //       "pan_number",
  //       details.panNumber || ""
  //     );

  //     fd.append(
  //       "dob",
  //       details.dob || ""
  //     );

  //     fd.append(
  //       "age",
  //       details.age || ""
  //     );

  //     fd.append(
  //       "family_head",
  //       headOfFamily === rel ? 1 : 0
  //     );

  //     fd.append(
  //       "need_assistance",
  //       needAssistanceValue
  //     );

  //     fd.append(
  //       "medical_policy",
  //       details.medicalPolicy || ""
  //     );

  //     fd.append(
  //       "mediclaim_amount",
  //       details.mediclaimAmount || ""
  //     );

  //     fd.append(
  //       "mediclaim_company_name",
  //       details.mediclaimCompanyName || ""
  //     );

  //     fd.append(
  //       "member_mediclaim_premium_amount",
  //       details.mediclaimPremiumAmount || ""
  //     );

  //     fd.append(
  //       "mediclaim_type",
  //       details.mediclaimType || ""
  //     );

  //     // =========================================
  //     // FILES
  //     // =========================================

  //     // PHOTO
  //     if (
  //       details.photo &&
  //       details.photo instanceof File
  //     ) {

  //       fd.append(
  //         "photo",
  //         details.photo
  //       );
  //     }

  //     // PAN FILE
  //     if (
  //       details.panFile &&
  //       details.panFile instanceof File
  //     ) {

  //       fd.append(
  //         "pan_file",
  //         details.panFile
  //       );
  //     }

  //     // AADHAR FILE
  //     if (
  //       details.aadharFile &&
  //       details.aadharFile instanceof File
  //     ) {

  //       fd.append(
  //         "aadhar_file",
  //         details.aadharFile
  //       );
  //     }

  //     // =========================================
  //     // DEBUG FORM DATA
  //     // =========================================

  //     for (let pair of fd.entries()) {

  //       console.log(
  //         pair[0],
  //         pair[1]
  //       );
  //     }

  //     // =========================================
  //     // API CALL
  //     // =========================================

  //     const res = await axios.post(
  //       `${API}/api/save-need-assistance`,
  //       fd,
  //       {
  //         headers: {
  //           "Content-Type":
  //             "multipart/form-data",
  //         },

  //         timeout: 60000,
  //       }
  //     );

  //     // =========================================
  //     // SUCCESS RESPONSE
  //     // =========================================

  //     console.log(
  //       "✅ API RESPONSE =>",
  //       res.data
  //     );

  //     if (res.data.success) {

  //       alert(
  //         res.data.message ||
  //         "Saved Successfully"
  //       );

  //       // =====================================
  //       // UPDATE STATE WITH RESPONSE
  //       // =====================================

  //       setRelationDetails((prev) => ({

  //         ...prev,

  //         [rel]: {

  //           ...prev[rel],

  //           id:
  //             res.data?.data?.id || "",

  //           photo:
  //             res.data?.data?.photo || "",

  //           panFilePath:
  //             res.data?.data?.pan_file || "",

  //           aadharFilePath:
  //             res.data?.data?.aadhar_file || "",
  //         },
  //       }));

  //       console.log(
  //         "✅ SAVED DATA =>",
  //         res.data.data
  //       );
  //     }

  //     else {

  //       alert(
  //         res.data.message ||
  //         "Save Failed"
  //       );
  //     }

  //   }

  //   catch (err) {

  //     console.log(
  //       "❌ FULL ERROR =>",
  //       err
  //     );

  //     console.log(
  //       "❌ ERROR RESPONSE =>",
  //       err?.response
  //     );

  //     console.log(
  //       "❌ ERROR DATA =>",
  //       err?.response?.data
  //     );

  //     // =========================================
  //     // 524 TIMEOUT
  //     // =========================================

  //     if (
  //       err?.response?.status === 524
  //     ) {

  //       alert(
  //         "Server timeout. Please wait and try again."
  //       );
  //     }

  //     // =========================================
  //     // 500 ERROR
  //     // =========================================

  //     else if (
  //       err?.response?.status === 500
  //     ) {

  //       alert(
  //         err?.response?.data?.message ||
  //         "Internal Server Error"
  //       );
  //     }

  //     // =========================================
  //     // OTHER
  //     // =========================================

  //     else {

  //       alert(
  //         err?.response?.data?.message ||
  //         err.message ||
  //         "Something went wrong"
  //       );
  //     }
  //   }

  //   finally {

  //     setLoading(false);
  //   }
  // };

  // const handleNeedAssistanceChange = async (
  //   rel,
  //   needAssistanceValue
  // ) => {

  //   try {

  //     const details = relationDetails?.[rel];

  //     if (!details) {
  //       return;
  //     }

  //     // =========================================
  //     // VALIDATION
  //     // =========================================

  //     if (
  //       needAssistanceValue === true &&
  //       (!details.aadharNumber ||
  //         details.aadharNumber.trim() === "")
  //     ) {

  //       alert(
  //         "Please add Aadhaar Number first"
  //       );

  //       return;
  //     }

  //     // =========================================
  //     // UPDATE LOCAL STATE
  //     // =========================================

  //     handleRelationDetailChange(
  //       rel,
  //       "needAssistance",
  //       needAssistanceValue
  //     );

  //     setLoading(true);

  //     // =========================================
  //     // FORM DATA
  //     // =========================================

  //     const fd = new FormData();

  //     fd.append(
  //       "diksharthi_id",
  //       newdiksarthi || ""
  //     );

  //     fd.append(
  //       "relation_key",
  //       rel || ""
  //     );

  //     fd.append(
  //       "first_name",
  //       details.firstName || ""
  //     );

  //     fd.append(
  //       "last_name",
  //       details.lastName || ""
  //     );

  //     fd.append(
  //       "mobile_number",
  //       details.mobileNumber || ""
  //     );

  //     fd.append(
  //       "aadhar_number",
  //       details.aadharNumber || ""
  //     );

  //     fd.append(
  //       "pan_number",
  //       details.panNumber || ""
  //     );

  //     fd.append(
  //       "dob",
  //       details.dob || ""
  //     );

  //     fd.append(
  //       "age",
  //       details.age || ""
  //     );

  //     fd.append(
  //       "family_head",
  //       headOfFamily === rel ? 1 : 0
  //     );

  //     fd.append(
  //       "need_assistance",
  //       needAssistanceValue ? 1 : 0
  //     );

  //     fd.append(
  //       "ayushman_coverage",
  //       details.ayushman ? 1 : 0
  //     );

  //     fd.append(
  //       "has_mediclaim_policy",
  //       details.mediclaim ? 1 : 0
  //     );

  //     fd.append(
  //       "medical_policy",
  //       details.medicalPolicy || ""
  //     );

  //     fd.append(
  //       "mediclaim_amount",
  //       details.mediclaimAmount || ""
  //     );

  //     fd.append(
  //       "mediclaim_company_name",
  //       details.mediclaimCompanyName || ""
  //     );

  //     fd.append(
  //       "member_mediclaim_premium_amount",
  //       details.mediclaimPremiumAmount || ""
  //     );

  //     fd.append(
  //       "mediclaim_type",
  //       details.mediclaimType || ""
  //     );

  //     fd.append(
  //       "guardian",
  //       details.guardian || ""
  //     );

  //     if (
  //       details.photo &&
  //       details.photo instanceof File
  //     ) {

  //       fd.append(
  //         "photo",
  //         details.photo
  //       );
  //     }

  //     if (
  //       details.panFile &&
  //       details.panFile instanceof File
  //     ) {

  //       fd.append(
  //         "pan_file",
  //         details.panFile
  //       );
  //     }

  //     if (
  //       details.aadharFile &&
  //       details.aadharFile instanceof File
  //     ) {

  //       fd.append(
  //         "aadhar_file",
  //         details.aadharFile
  //       );
  //     }

  //     // =========================================
  //     // DEBUG
  //     // =========================================

  //     for (let pair of fd.entries()) {

  //       console.log(
  //         pair[0],
  //         pair[1]
  //       );
  //     }

  //     // =========================================
  //     // API CALL
  //     // =========================================

  //     const res = await axios.post(
  //       `${API}/api/save-need-assistance`,
  //       fd,
  //       {
  //         headers: {
  //           "Content-Type":
  //             "multipart/form-data",
  //         },

  //         timeout: 60000,
  //       }
  //     );

  //     console.log(
  //       "✅ API RESPONSE =>",
  //       res.data
  //     );

  //     if (res.data.success) {

  //       alert(
  //         res.data.message ||
  //         "Saved Successfully"
  //       );

  //       setRelationDetails((prev) => ({

  //         ...prev,

  //         [rel]: {

  //           ...prev[rel],

  //           id:
  //             res.data?.data?.id || "",

  //           photo:
  //             res.data?.data?.photo || "",

  //           panFilePath:
  //             res.data?.data?.pan_file || "",

  //           aadharFilePath:
  //             res.data?.data?.aadhar_file || "",
  //         },
  //       }));
  //     }

  //     else {

  //       alert(
  //         res.data.message ||
  //         "Save Failed"
  //       );
  //     }
  //   }

  //   catch (err) {

  //     console.log(
  //       "❌ ERROR =>",
  //       err
  //     );

  //     alert(
  //       err?.response?.data?.message ||
  //       err.message ||
  //       "Something went wrong"
  //     );
  //   }

  //   finally {

  //     setLoading(false);
  //   }
  // };
  // const handleNeedAssistanceChange = async (rel, needAssistanceValue) => {
  //   debugger;
  //   try {
  //     const details = relationDetails?.[rel];

  //     if (!details) {
  //       return;
  //     }

  //     // =========================================
  //     // VALIDATION
  //     // =========================================

  //     if (
  //       needAssistanceValue === true &&
  //       (!details.aadharNumber || details.aadharNumber.trim() === "")
  //     ) {
  //       alert("Please add Aadhaar Number first");

  //       return;
  //     }

  //     // =========================================
  //     // UPDATE LOCAL STATE
  //     // =========================================

  //     handleRelationDetailChange(rel, "needAssistance", needAssistanceValue);

  //     setLoading(true);

  //     // =========================================
  //     // FORM DATA
  //     // =========================================

  //     const fd = new FormData();

  //     fd.append("diksharthi_id", newdiksarthi || "");

  //     fd.append("relation_key", rel || "");

  //     fd.append("first_name", details.firstName || "");

  //     fd.append("last_name", details.lastName || "");

  //     fd.append("mobile_number", details.mobileNumber || "");

  //     fd.append("aadhar_number", details.aadharNumber || "");

  //     fd.append("pan_number", details.panNumber || "");

  //     fd.append("dob", details.dob || "");

  //     fd.append("age", details.age || "");

  //     fd.append("family_head", headOfFamily === rel ? 1 : 0);

  //     fd.append("need_assistance", needAssistanceValue ? 1 : 0);

  //     fd.append("ayushman_coverage", details.ayushman ? 1 : 0);

  //     fd.append("has_mediclaim_policy", details.mediclaim ? 1 : 0);

  //     fd.append("medical_policy", details.medicalPolicy || "");

  //     fd.append("mediclaim_amount", details.mediclaimAmount || "");

  //     fd.append("mediclaim_company_name", details.mediclaimCompanyName || "");

  //     fd.append(
  //       "member_mediclaim_premium_amount",
  //       details.mediclaimPremiumAmount || "",
  //     );

  //     fd.append("mediclaim_type", details.mediclaimType || "");

  //     fd.append("guardian", details.guardian || "");

  //     // =========================================
  //     // FILES
  //     // =========================================

  //     if (details.photo && details.photo instanceof File) {
  //       fd.append("photo", details.photo);
  //     }

  //     if (details.panFile && details.panFile instanceof File) {
  //       fd.append("pan_file", details.panFile);
  //     }

  //     if (details.aadharFile && details.aadharFile instanceof File) {
  //       fd.append("aadhar_file", details.aadharFile);
  //     }

  //     // =========================================
  //     // API CALL
  //     // =========================================

  //     const res = await axios.post(`${API}/api/save-need-assistance`, fd, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },

  //       timeout: 60000,
  //     });

  //     console.log("✅ API RESPONSE =>", res.data);

  //     // =========================================
  //     // IF AADHAR ALREADY EXISTS
  //     // =========================================

  //     if (res.data.already_exists) {
  //       const familyMember = res.data.family_details;

  //       const fullName = `${familyMember?.first_name || ""} ${familyMember?.last_name || ""}`;

  //       // RESET SWITCH

  //       handleRelationDetailChange(rel, "needAssistance", false);

  //       // DO NOT OPEN MODAL

  //       // setShowAssistanceModal(false);

  //       setSelectedRelation(null);

  //       alert(
  //         `Aadhar card is already exist in the system.\n\nPerson Name : ${fullName}`,
  //       );

  //       return;
  //     }

  //     // =========================================
  //     // SUCCESS
  //     // =========================================

  //     if (res.data.success) {
  //       alert(res.data.message || "Saved Successfully");

  //       // UPDATE STATE

  //       setRelationDetails((prev) => ({
  //         ...prev,

  //         [rel]: {
  //           ...prev[rel],

  //           id: res.data?.data?.id || "",

  //           photo: res.data?.data?.photo || "",

  //           panFilePath: res.data?.data?.pan_file || "",

  //           aadharFilePath: res.data?.data?.aadhar_file || "",
  //         },
  //       }));

  //       // =========================================
  //       // OPEN MODAL ONLY WHEN SUCCESS
  //       // =========================================

  //       if (needAssistanceValue === true) {
  //         setSelectedRelation(rel);

  //         // setShowAssistanceModal(true);
  //       }
  //     } else {
  //       // RESET SWITCH

  //       handleRelationDetailChange(rel, "needAssistance", false);

  //       // setShowAssistanceModal(false);

  //       setSelectedRelation(null);

  //       alert(res.data.message || "Save Failed");
  //     }
  //   } catch (err) {
  //     console.log("❌ ERROR =>", err);

  //     // RESET SWITCH

  //     handleRelationDetailChange(rel, "needAssistance", false);

  //     // CLOSE MODAL

  //     setShowAssistanceModal(false);

  //     setSelectedRelation(null);

  //     alert(
  //       err?.response?.data?.message || err.message || "Something went wrong",
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleNeedAssistanceChange = async (rel, needAssistanceValue) => {
  //   debugger;

  //   try {
  //     const details = relationDetails?.[rel];

  //     if (!details) return;

  //     // =========================================
  //     // VALIDATION
  //     // =========================================

  //     const errors = {};

  //     const firstName = details.firstName?.trim();
  //     const lastName = details.lastName?.trim();
  //     const aadharNumber = details.aadharNumber?.trim();

  //     // First Name
  //     if (!firstName) {
  //       errors[`firstName_${rel}`] = "First Name is required";
  //     }

  //     // Last Name
  //     if (!lastName) {
  //       errors[`lastName_${rel}`] = "Last Name is required";
  //     }

  //     // Aadhaar Number
  //     if (!aadharNumber) {
  //       errors[`aadharNumber_${rel}`] = "Aadhaar Number is required";
  //     }

  //     // Ayushman
  //     if (details.ayushman === null || details.ayushman === undefined) {
  //       errors[`ayushman_${rel}`] = "Please select Ayushman option";
  //     }

  //     // Mediclaim
  //     if (details.mediclaim === null || details.mediclaim === undefined) {
  //       errors[`mediclaim_${rel}`] = "Please select Mediclaim option";
  //     }

  //     // IF ERRORS FOUND
  //     if (Object.keys(errors).length > 0) {
  //       setValidationErrors((prev) => ({
  //         ...prev,
  //         ...errors,
  //       }));

  //       return;
  //     }

  //     // CLEAR OLD ERRORS
  //     setValidationErrors((prev) => {
  //       const updated = { ...prev };

  //       delete updated[`firstName_${rel}`];
  //       delete updated[`lastName_${rel}`];
  //       delete updated[`aadharNumber_${rel}`];
  //       delete updated[`ayushman_${rel}`];
  //       delete updated[`mediclaim_${rel}`];

  //       return updated;
  //     });

  //     // =========================================
  //     // UPDATE LOCAL STATE
  //     // =========================================

  //     handleRelationDetailChange(rel, "needAssistance", needAssistanceValue);

  //     setLoading(true);

  //     // =========================================
  //     // FORM DATA
  //     // =========================================

  //     const fd = new FormData();

  //     fd.append("diksharthi_id", newdiksarthi || "");
  //     fd.append("relation_key", rel || "");
  //     fd.append("first_name", details.firstName || "");
  //     fd.append("last_name", details.lastName || "");
  //     fd.append("mobile_number", details.mobileNumber || "");
  //     fd.append("aadhar_number", details.aadharNumber || "");
  //     fd.append("pan_number", details.panNumber || "");
  //     fd.append("dob", details.dob || "");
  //     fd.append("age", details.age || "");
  //     fd.append("family_head", headOfFamily === rel ? 1 : 0);
  //     fd.append("need_assistance", needAssistanceValue ? 1 : 0);
  //     fd.append("ayushman_coverage", details.ayushman ? 1 : 0);
  //     fd.append("has_mediclaim_policy", details.mediclaim ? 1 : 0);

  //     // =========================================
  //     // API CALL
  //     // =========================================

  //     const res = await axios.post(`${API}/api/save-need-assistance`, fd, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //       timeout: 60000,
  //     });

  //     console.log("✅ API RESPONSE =>", res.data);

  //     // your remaining code...
  //   } catch (err) {
  //     console.log("❌ ERROR =>", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleNeedAssistanceChange = async (rel, needAssistanceValue) => {
    debugger;

    try {
      const details = relationDetails?.[rel];
      console.log(details, "details");
      if (!details) return;

      const ayushmanValue = details?.ayushmanCoverage ?? details?.ayushman;

      const mediclaimValue = details?.medicalPolicy ?? details?.mediclaim;

      const errors = {};

      const firstName = details.firstName?.trim();
      const lastName = details.lastName?.trim();
      const mobileNumber = details.mobileNumber?.trim();
      const aadharNumber = details.aadharNumber?.trim();
      const panNumber = details.panNumber?.trim();

      // =========================================
      // FIRST NAME
      // =========================================

      if (!firstName) {
        errors[`firstName_${rel}`] = "First Name is required";
      }

      // =========================================
      // LAST NAME
      // =========================================

      if (!lastName) {
        errors[`lastName_${rel}`] = "Last Name is required";
      }

      if (needAssistanceValue === true) {
        if (!aadharNumber) {
          errors[`aadhar_${rel}`] = "Aadhar Number is required";
        } else if (!/^[2-9][0-9]{11}$/.test(aadharNumber)) {
          errors[`aadhar_${rel}`] = "Invalid Aadhar Number";
        } else {
          const isDuplicate = Object.entries(relationDetails).some(
            ([key, data]) =>
              key !== rel &&
              String(data?.aadharNumber || "").trim() === aadharNumber,
          );

          if (isDuplicate) {
            errors[`aadhar_${rel}`] = "Aadhar Number already exists";
          }
        }
      }
      // =========================================
      // PAN VALIDATION
      // =========================================

      if (
        panNumber &&
        !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())
      ) {
        errors[`pan_${rel}`] = "PAN format should be ABCDE1234F";
      }

      if (ayushmanValue !== true && ayushmanValue !== false) {
        errors[`ayushman_${rel}`] = "Please select Ayushman option";
      }

      if (mediclaimValue !== true && mediclaimValue !== false) {
        errors[`mediclaim_${rel}`] = "Please select Mediclaim option";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors((prev) => ({
          ...prev,
          ...errors,
        }));

        return;
      }

      // =========================================
      // CLEAR ERRORS
      // =========================================

      setValidationErrors((prev) => {
        const updated = { ...prev };

        delete updated[`firstName_${rel}`];
        delete updated[`lastName_${rel}`];
        delete updated[`mobile_${rel}`];
        delete updated[`aadhar_${rel}`];
        delete updated[`pan_${rel}`];
        delete updated[`ayushman_${rel}`];
        delete updated[`mediclaim_${rel}`];
        // delete updated[`aadharFile_${rel}`];

        return updated;
      });

      // =========================================
      // UPDATE LOCAL STATE
      // =========================================

      handleRelationDetailChange(rel, "needAssistance", needAssistanceValue);

      setLoading(true);

      // =========================================
      // FORM DATA
      // =========================================

      const fd = new FormData();

      fd.append("diksharthi_id", newdiksarthi || "");

      fd.append("relation_key", rel || "");

      fd.append("first_name", details.firstName || "");

      fd.append("last_name", details.lastName || "");

      fd.append("mobile_number", details.mobileNumber || "");

      fd.append("aadhar_number", details.aadharNumber || "");

      fd.append("pan_number", details.panNumber || "");

      fd.append("dob", details.dob || "");

      fd.append("age", details.age || "");

      fd.append("family_head", headOfFamily === rel ? 1 : 0);

      fd.append("need_assistance", needAssistanceValue ? 1 : 0);

      fd.append("ayushman_coverage", details.ayushman ? 1 : 0);

      fd.append("has_mediclaim_policy", details.mediclaim ? 1 : 0);

      fd.append("medical_policy", details.medicalPolicy || "");

      fd.append("mediclaim_amount", details.mediclaimAmount || "");

      fd.append("mediclaim_company_name", details.mediclaimCompanyName || "");

      fd.append(
        "member_mediclaim_premium_amount",
        details.mediclaimPremiumAmount || "",
      );

      fd.append("mediclaim_type", details.mediclaimType || "");

      fd.append("guardian", details.guardian || "");

      // =========================================
      // FILES
      // =========================================

      if (details.photo && details.photo instanceof File) {
        fd.append("photo", details.photo);
      }

      if (details.panFile && details.panFile instanceof File) {
        fd.append("pan_file", details.panFile);
      }

      if (details.aadharFile && details.aadharFile instanceof File) {
        fd.append("aadhar_file", details.aadharFile);
      }
      if (isEdit) {
        fd.append("mode", "edit");
      }
      // =========================================
      // API CALL
      // =========================================

      const res = await axios.post(`${API}/api/save-need-assistance`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },

        timeout: 60000,
      });

      console.log("✅ API RESPONSE =>", res.data);

      // =========================================
      // IF AADHAR EXISTS
      // =========================================

      if (res.data.already_exists) {
        handleRelationDetailChange(rel, "needAssistance", false);

        alert(
          `Aadhar already exists for ${res.data?.family_details?.first_name || ""} ${res.data?.family_details?.last_name || ""}`,
        );

        return;
      }

      // =========================================
      // SUCCESS
      // =========================================

      if (res.data.success) {
        alert(res.data.message || "Saved Successfully");

        setRelationDetails((prev) => ({
          ...prev,

          [rel]: {
            ...prev[rel],

            id: res.data?.data?.id || "",

            photo: res.data?.data?.photo || "",

            panFilePath: res.data?.data?.pan_file || "",

            aadharFilePath: res.data?.data?.aadhar_file || "",
          },
        }));

        if (needAssistanceValue === true) {
          setSelectedRelation(rel);
        }
      } else {
        handleRelationDetailChange(rel, "needAssistance", false);

        setSelectedRelation(null);

        alert(res.data.message || "Save Failed");
      }
    } catch (err) {
      console.log("❌ ERROR =>", err);

      handleRelationDetailChange(rel, "needAssistance", false);

      setSelectedRelation(null);

      alert(
        err?.response?.data?.message || err.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // const handleNeedAssistanceChange = async (
  //   rel,
  //   needAssistanceValue,
  // ) => {
  //   debugger;

  //   try {

  //      if (mode === "view") {
  //   return;
  //     };
  //     const details = relationDetails?.[rel];

  //     if (!details) return;

  //     // =========================================
  //     // VALIDATION
  //     // =========================================

  //     const errors = {};

  //     const firstName = details.firstName?.trim();
  //     const lastName = details.lastName?.trim();
  //     const aadharNumber = details.aadharNumber?.trim();
  //     const panNumber = details.panNumber?.trim();

  //     // =========================================
  //     // FIRST NAME
  //     // =========================================

  //     if (!firstName) {
  //       errors[`firstName_${rel}`] =
  //         "First Name is required";
  //     }

  //     // =========================================
  //     // LAST NAME
  //     // =========================================

  //     if (!lastName) {
  //       errors[`lastName_${rel}`] =
  //         "Last Name is required";
  //     }

  //     // =========================================
  //     // AADHAR VALIDATION ONLY FOR YES
  //     // =========================================

  //     if (needAssistanceValue === true) {

  //       if (!aadharNumber) {
  //         errors[`aadhar_${rel}`] =
  //           "Aadhar Number is required";
  //       }

  //       // MUST BE 12 DIGITS
  //       else if (!/^[2-9][0-9]{11}$/.test(aadharNumber)) {
  //         errors[`aadhar_${rel}`] =
  //           "Invalid Aadhar Number";
  //       }

  //       // DUPLICATE CHECK
  //       else {
  //         const isDuplicate = Object.entries(
  //           relationDetails,
  //         ).some(
  //           ([key, data]) =>
  //             key !== rel &&
  //             String(data?.aadharNumber || "").trim() ===
  //               aadharNumber,
  //         );

  //         if (isDuplicate) {
  //           errors[`aadhar_${rel}`] =
  //             "Aadhar Number already exists";
  //         }
  //       }
  //     }

  //     // =========================================
  //     // PAN VALIDATION
  //     // =========================================

  //     if (
  //       panNumber &&
  //       !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
  //         panNumber.toUpperCase(),
  //       )
  //     ) {
  //       errors[`pan_${rel}`] =
  //         "PAN format should be ABCDE1234F";
  //     }

  //     // =========================================
  //     // AYUSHMAN
  //     // =========================================

  //     if (!isEdit) {
  //       if (
  //       details.ayushman === null ||
  //       details.ayushman === undefined
  //     ) {
  //       errors[`ayushman_${rel}`] =
  //         "Please select Ayushman option";
  //     }

  //     if (
  //       details.mediclaim === null ||
  //       details.mediclaim === undefined
  //     ) {
  //       errors[`mediclaim_${rel}`] =
  //         "Please select Mediclaim option";
  //     }
  //     }

  //     if (Object.keys(errors).length > 0) {
  //       setValidationErrors((prev) => ({
  //         ...prev,
  //         ...errors,
  //       }));

  //       return;
  //     }

  //     // =========================================
  //     // CLEAR ERRORS
  //     // =========================================

  //     setValidationErrors((prev) => {
  //       const updated = { ...prev };

  //       delete updated[`firstName_${rel}`];
  //       delete updated[`lastName_${rel}`];
  //       delete updated[`aadhar_${rel}`];
  //       delete updated[`pan_${rel}`];
  //       delete updated[`ayushman_${rel}`];
  //       delete updated[`mediclaim_${rel}`];

  //       return updated;
  //     });

  //     // =========================================
  //     // UPDATE LOCAL STATE
  //     // =========================================

  //     handleRelationDetailChange(
  //       rel,
  //       "needAssistance",
  //       needAssistanceValue,
  //     );

  //     setLoading(true);

  //     // =========================================
  //     // FORM DATA
  //     // =========================================

  //     const fd = new FormData();

  //     fd.append("diksharthi_id", newdiksarthi || "");

  //     fd.append("relation_key", rel || "");

  //     fd.append("first_name", details.firstName || "");

  //     fd.append("last_name", details.lastName || "");

  //     fd.append(
  //       "mobile_number",
  //       details.mobileNumber || "",
  //     );

  //     fd.append(
  //       "aadhar_number",
  //       details.aadharNumber || "",
  //     );

  //     fd.append(
  //       "pan_number",
  //       details.panNumber || "",
  //     );

  //     fd.append("dob", details.dob || "");

  //     fd.append("age", details.age || "");

  //     fd.append(
  //       "family_head",
  //       headOfFamily === rel ? 1 : 0,
  //     );

  //     fd.append(
  //       "need_assistance",
  //       needAssistanceValue ? 1 : 0,
  //     );

  //     fd.append(
  //       "ayushman_coverage",
  //       details.ayushman ? 1 : 0,
  //     );

  //     fd.append(
  //       "has_mediclaim_policy",
  //       details.mediclaim ? 1 : 0,
  //     );

  //     fd.append(
  //       "medical_policy",
  //       details.medicalPolicy || "",
  //     );

  //     fd.append(
  //       "mediclaim_amount",
  //       details.mediclaimAmount || "",
  //     );

  //     fd.append(
  //       "mediclaim_company_name",
  //       details.mediclaimCompanyName || "",
  //     );

  //     fd.append(
  //       "member_mediclaim_premium_amount",
  //       details.mediclaimPremiumAmount || "",
  //     );

  //     fd.append(
  //       "mediclaim_type",
  //       details.mediclaimType || "",
  //     );

  //     fd.append(
  //       "guardian",
  //       details.guardian || "",
  //     );
  // if (isEdit) {
  //   fd.append("mode", "edit");
  // }
  //     // =========================================
  //     // FILES
  //     // =========================================

  //     if (
  //       details.photo &&
  //       details.photo instanceof File
  //     ) {
  //       fd.append("photo", details.photo);
  //     }

  //     if (
  //       details.panFile &&
  //       details.panFile instanceof File
  //     ) {
  //       fd.append("pan_file", details.panFile);
  //     }

  //     if (
  //       details.aadharFile &&
  //       details.aadharFile instanceof File
  //     ) {
  //       fd.append("aadhar_file", details.aadharFile);
  //     }

  //     // =========================================
  //     // API CALL
  //     // =========================================

  //     const res = await axios.post(
  //       `${API}/api/save-need-assistance`,
  //       fd,
  //       {
  //         headers: {
  //           "Content-Type":
  //             "multipart/form-data",
  //         },

  //         timeout: 60000,
  //       },
  //     );

  //     console.log(
  //       "✅ API RESPONSE =>",
  //       res.data,
  //     );

  //     // =========================================
  //     // IF AADHAR EXISTS
  //     // =========================================

  //     if (res.data.already_exists) {
  //       handleRelationDetailChange(
  //         rel,
  //         "needAssistance",
  //         false,
  //       );

  //       alert(
  //         `Aadhar already exists for ${
  //           res.data?.family_details?.first_name || ""
  //         } ${
  //           res.data?.family_details?.last_name || ""
  //         }`,
  //       );

  //       return;
  //     }

  //     // =========================================
  //     // SUCCESS
  //     // =========================================

  //     if (res.data.success) {

  //       alert(
  //         res.data.message ||
  //           "Saved Successfully",
  //       );

  //       setRelationDetails((prev) => ({
  //         ...prev,

  //         [rel]: {
  //           ...prev[rel],

  //           id: res.data?.data?.id || "",

  //           photo:
  //             res.data?.data?.photo || "",

  //           panFilePath:
  //             res.data?.data?.pan_file || "",

  //           aadharFilePath:
  //             res.data?.data?.aadhar_file || "",
  //         },
  //       }));

  //       // OPEN MODAL ONLY FOR YES

  //       if (needAssistanceValue === true) {
  //         setSelectedRelation(rel);
  //       } else {
  //         setSelectedRelation(null);
  //       }

  //     } else {

  //       handleRelationDetailChange(
  //         rel,
  //         "needAssistance",
  //         false,
  //       );

  //       setSelectedRelation(null);

  //       alert(
  //         res.data.message || "Save Failed",
  //       );
  //     }

  //   } catch (err) {

  //     console.log("❌ ERROR =>", err);

  //     handleRelationDetailChange(
  //       rel,
  //       "needAssistance",
  //       false,
  //     );

  //     setSelectedRelation(null);

  //     alert(
  //       err?.response?.data?.message ||
  //         err.message ||
  //         "Something went wrong",
  //     );

  //   } finally {

  //     setLoading(false);

  //   }
  // };
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
  const resolvePhotoUrl = (photo) => {
    if (!photo) return "/user.png";

    // If already full URL
    if (photo.startsWith("http")) return photo;

    // If stored as filename/path from backend
    return `${API}/uploads/${photo}`;
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
  // const handleAssistanceCategory = (
  //   relation,
  //   category,
  //   isRemove = false,
  //   reason = "",
  // ) => {
  //   if (isRelationFieldLocked(relation, "assistanceCategories")) return;

  //   const lowerCategory = category.toLowerCase();

  //   // ✅ Update relationDetails
  //   setRelationDetails((prev) => {
  //     const existing = prev[relation]?.assistanceCategories || [];

  //     let updatedCategories;

  //     if (isRemove) {
  //       updatedCategories = existing.filter(
  //         (c) => c.toLowerCase() !== lowerCategory,
  //       );
  //     } else {
  //       const alreadyExists = existing.some(
  //         (c) => c.toLowerCase() === lowerCategory,
  //       );

  //       updatedCategories = alreadyExists ? existing : [...existing, category];
  //     }

  //     return {
  //       ...prev,
  //       [relation]: {
  //         ...prev[relation],
  //         assistanceCategories: updatedCategories,
  //       },
  //     };
  //   });

  //   // ✅ ALWAYS update selectedAssistance (FIXED)
  //   setselectedAssistance((prev) => {
  //     if (isRemove) {
  //       return prev.filter((c) => c.toLowerCase() !== lowerCategory);
  //     } else {
  //       return prev.some((c) => c.toLowerCase() === lowerCategory)
  //         ? prev
  //         : [...prev, category];
  //     }
  //   });

  //   // ✅ Track deselection with reason
  //   if (isRemove) {
  //     setDeselectedAssistance((prev) => [
  //       ...prev.filter(
  //         (item) =>
  //           !(
  //             item.relation === relation &&
  //             item.type.toLowerCase() === lowerCategory
  //           ),
  //       ),
  //       { relation, type: category, reason },
  //     ]);
  //   } else {
  //     setDeselectedAssistance((prev) =>
  //       prev.filter(
  //         (item) =>
  //           !(
  //             item.relation === relation &&
  //             item.type.toLowerCase() === lowerCategory
  //           ),
  //       ),
  //     );
  //   }
  // };

  const handleAssistanceCategory = (
  relation,
  category,
  isRemove = false,
  reason = "",
) => {
  if (isRelationFieldLocked(relation, "assistanceCategories")) return;

  const lowerCategory = category.toLowerCase();

  setRelationDetails((prev) => {
    const existing = prev[relation]?.assistanceCategories || [];

    const updatedCategories = isRemove
      ? existing.filter(
          (c) => c.toLowerCase() !== lowerCategory
        )
      : existing.some(
          (c) => c.toLowerCase() === lowerCategory
        )
      ? existing
      : [...existing, category];

    return {
      ...prev,
      [relation]: {
        ...prev[relation],
        assistanceCategories: updatedCategories,
      },
    };
  });

  setselectedAssistance((prev) => {
    if (isRemove) {
      return prev.filter(
        (c) => c.toLowerCase() !== lowerCategory
      );
    }

    return prev.some(
      (c) => c.toLowerCase() === lowerCategory
    )
      ? prev
      : [...prev, category];
  });

  if (isRemove) {
    setDeselectedAssistance((prev) => [
      ...prev.filter(
        (item) =>
          !(
            item.relation === relation &&
            item.type.toLowerCase() === lowerCategory
          )
      ),
      {
        relation,
        type: category,
        reason,
      },
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
        (r) => r !== relationId,
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
  const [defaultAssistance, setdefaultAssisatce] = useState({});
  console.log(selectedAssistance, "selectedAssistance");
  console.log(assistanceData, "assistanceData");
  const [medicalIssueTypes, setMedicalIssueTypes] = useState([]);

  const getMedicalIssueTypes = async () => {
    try {
      const response = await fetch(
        "https://uat.ratnakukshi.org/api/medicalissuetype/all",
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
  const [validationErrors, setValidationErrors] = useState({});
  useEffect(() => {
    debugger;
    let finalId = null;

    if (isEdit && newdiksarthi) {
      // ✅ HIGHEST PRIORITY (EDIT MODE)
      finalId = newdiksarthi;
    } else if (CurrentDiksarthiStore && newdiksarthi) {
      // ✅ AFTER SAVE
      finalId = newdiksarthi;
    } else {
      // ✅ DEFAULT
      finalId = newdiksarthi;
    }

    if (!finalId) return; // ❗ only stop if both are missing

    const fetchFamily = async () => {
      try {
        const res = await axios.get(
          `${API}/api/get-family-members-full/${finalId}`,
        );

        // ================================
        // ✅ EXTRACT RESPONSE
        // ================================
        const familyData = res?.data?.data || {};
        const assistance = res?.data?.assistanceData || {};

        // ================================
        // ✅ SET FAMILY DETAILS
        // ================================
        setRelationDetails(familyData);

        // ================================
        // ✅ SET ASSISTANCE DATA
        // ================================
        setAssistanceData(assistance);

        // ================================
        // ✅ SET RELATIONS ARRAY
        // ================================
        setFormData((prev) => ({
          ...prev,
          relations: Object.keys(familyData || {}),
        }));

        // ================================
        // ✅ HEAD OF FAMILY DETECT
        // ================================
        const head =
          Object.keys(familyData || {}).find(
            (key) => familyData[key]?.family_head,
          ) || null;

        setHeadOfFamily(head);

        // ================================
        // ✅ DEBUG LOGS
        // ================================
        console.log("✅ FAMILY =>", familyData);
        console.log("🔥 ASSISTANCE =>", assistance);
        console.log("👤 HEAD =>", head);
      } catch (err) {
        console.error("❌ ERROR FETCHING FAMILY:", err);
      }
    };

    fetchFamily();
  }, [id, newdiksarthi]);

  //   const handleSave = async () => {
  //     if (loading) return;
  //     setLoading(true);

  //     try {
  //       const errors = {};
  //       Object.entries(relationDetails || {}).forEach(([rel, details]) => {
  //         const mobile = details?.mobileNumber?.trim();

  //         if (!mobile) {
  //           errors[`mobile_${rel}`] = "Mobile number required";
  //         } else if (!/^[1-9]\d{9}$/.test(mobile)) {
  //           errors[`mobile_${rel}`] = "Invalid mobile number";
  //         }
  //       });

  //       if (Object.keys(errors).length > 0) {
  //         setValidationErrors(errors);
  //         alert("Please fix validation errors");
  //         return;
  //       }

  // const cleaned = {};

  // Object.entries(relationDetails || {}).forEach(([relationKey, val]) => {
  //   if (!val) return;

  //   cleaned[relationKey] = {
  //     relationKey,

  //     // ✅ BASIC
  //     firstName: val.firstName?.trim() || "",
  //     lastName: val.lastName?.trim() || "",
  //     mobileNumber: val.mobileNumber?.trim() || "",
  //     aadharNumber: val.aadharNumber?.trim() || "",
  //     panNumber: val.panNumber?.trim() || "",
  //     // family_head: !!val.family_head,
  //     guardian: val.guardian || "",
  //    family_head: headOfFamily === relationKey,
  //     // ✅ PERSONAL
  //     dob: val.dob || "",
  //     age: val.age || "",

  //     // ✅ AYUSHMAN
  //     ayushmanCoverage: val.ayushmanCoverage || val.ayushman || "",
  //     ayushmanAmount:
  //       val.ayushmanAmount ||
  //       val.ayushman_Amount ||
  //       "",

  //     // ✅ MEDICLAIM
  //     medicalPolicy: val.medicalPolicy || val.mediclaim || "",
  //     mediclaimAmount:
  //       val.mediclaimAmount ||
  //       val.mediclaim_amount ||
  //       "",
  //     mediclaimCompanyName:
  //       val.mediclaimCompanyName ||
  //       val.mediclaim_company_name ||
  //       "",
  //     mediclaimPremiumAmount:
  //       val.mediclaimPremiumAmount ||
  //       val.member_mediclaim_premium_amount ||
  //       "",
  //     mediclaimType:
  //       val.mediclaimType ||
  //       val.mediclaim_type ||
  //       "",

  //     // ✅ ASSISTANCE
  //     needAssistance: val.needAssistance || "",

  //     // ✅ EXTRA (optional future safe)
  //     assistanceCategories: val.assistanceCategories || [],
  //   };
  // });
  //       // ================================
  //       // 🔥 ASSISTANCE
  //       // ================================
  //       // const formattedAssistance = assistanceData || {};

  //       const formattedAssistance = {};

  //       Object.entries(assistanceData || {}).forEach(([rel, types]) => {
  //         formattedAssistance[rel] = {};

  //         Object.entries(types || {}).forEach(([type, data]) => {
  //           // ❌ skip empty data
  //           if (!data || Object.keys(data).length === 0) return;

  //           // ✅ unique by type (overwrite if duplicate)
  //           formattedAssistance[rel][type] = data;
  //         });
  //       });

  //       // const assistanceTypesSet = new Set();

  //       const selectedAssistance = Array.from(
  //   new Set(
  //     Object.values(formattedAssistance)
  //       .flatMap((rel) => Object.keys(rel))
  //   )
  // );

  //       Object.values(formattedAssistance).forEach((relObj) => {
  //         Object.keys(relObj || {}).forEach((type) => {
  //           assistanceTypesSet.add(type);
  //         });
  //       });

  //       const selectedAssistance = Array.from(assistanceTypesSet);
  //       const fd = new FormData();

  //       fd.append("diksharthi_id", newdiksarthi); // optional but ok

  //       fd.append("form_step", 2);

  //       const relationArray = Object.keys(cleaned);

  //       fd.append("family_relation", relationArray.join(","));
  //       fd.append("family_relation_details", JSON.stringify(cleaned));
  //       fd.append("same_relations_with_fan", "No");

  //       fd.append("assistance", selectedAssistance.join(","));
  //       fd.append("assistance_data", JSON.stringify(formattedAssistance));

  //       console.log("🚀 UPDATE PAYLOAD READY");
  //       const res = await axios.put(
  //         `${API}/api/update-diksharthi/${newdiksarthi}`, // ✅ ID HERE
  //         fd,
  //         {
  //           headers: { "Content-Type": "multipart/form-data" },
  //         },
  //       );

  //       console.log("✅ UPDATE RESPONSE =>", res.data);
  //       setCurrentDiksarthiStore(true);
  //       setCurrentStep(3);

  //       if (res?.data?.success) {
  //         alert("Updated successfully ✅");
  //       } else {
  //         alert(res?.data?.message || "Update failed");
  //       }
  //     } catch (err) {
  //       console.error("❌ ERROR =>", err);
  //       alert("Something went wrong");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  // const handleSave = async () => {
  //   if (loading) return;
  //   setLoading(true);

  //   try {

  //     const errors = {};

  //     Object.entries(relationDetails || {}).forEach(([rel, details]) => {
  //       const mobile = details?.mobileNumber?.trim();
  //       if (mobile && !/^[1-9]\d{9}$/.test(mobile)) {
  //         errors[`mobile_${rel}`] = "Invalid mobile number";
  //       }
  //     });

  //     if (Object.keys(errors).length > 0) {
  //       setValidationErrors(errors);
  //       alert("Please fix validation errors");
  //       return;
  //     }
  //     const cleaned = {};

  //     Object.entries(relationDetails || {}).forEach(([relationKey, val]) => {
  //       if (!val) return;

  //       cleaned[relationKey] = {
  //         relationKey,

  //         firstName: val.firstName?.trim() || "",
  //         lastName: val.lastName?.trim() || "",
  //         mobileNumber: val.mobileNumber?.trim() || "",
  //         aadharNumber: val.aadharNumber?.trim() || "",
  //         panNumber: val.panNumber?.trim() || "",
  //         guardian: val.guardian || "",
  //         family_head: headOfFamily === relationKey,

  //         dob: val.dob || "",
  //         age: val.age || "",

  //         ayushmanCoverage: val.ayushmanCoverage || val.ayushman || "",
  //         ayushmanAmount:
  //           val.ayushmanAmount || val.ayushman_Amount || "",

  //         medicalPolicy: val.medicalPolicy || val.mediclaim || "",
  //         mediclaimAmount:
  //           val.mediclaimAmount || val.mediclaim_amount || "",
  //         mediclaimCompanyName:
  //           val.mediclaimCompanyName ||
  //           val.mediclaim_company_name ||
  //           "",
  //         mediclaimPremiumAmount:
  //           val.mediclaimPremiumAmount ||
  //           val.member_mediclaim_premium_amount ||
  //           "",
  //         mediclaimType:
  //           val.mediclaimType || val.mediclaim_type || "",

  //         needAssistance: val.needAssistance || "",
  //         assistanceCategories: val.assistanceCategories || [],
  //       };
  //     });

  //     // ================================
  //     // 🔥 CLEAN & REMOVE DUPLICATE ASSISTANCE
  //     // ================================
  //     const formattedAssistance = {};

  //     Object.entries(assistanceData || {}).forEach(([rel, types]) => {
  //       if (!types || typeof types !== "object") return;

  //       const uniqueTypes = {};

  //       Object.entries(types).forEach(([type, data]) => {
  //         // ❌ skip empty / null
  //         if (!data || Object.keys(data).length === 0) return;

  //         // ✅ overwrite duplicate (same type)
  //         uniqueTypes[type] = {
  //           ...data,
  //           status: data?.status || "Pending",
  //         };
  //       });

  //       // ❌ skip relation if no valid assistance
  //       if (Object.keys(uniqueTypes).length > 0) {
  //         formattedAssistance[rel] = uniqueTypes;
  //       }
  //     });

  //     // ================================
  //     // 🔹 UNIQUE ASSISTANCE TYPES
  //     // ================================
  //     const selectedAssistance = [
  //       ...new Set(
  //         Object.values(formattedAssistance).flatMap((rel) =>
  //           Object.keys(rel)
  //         )
  //       ),
  //     ];

  //     // ================================
  //     // 🔹 FORM DATA BUILD
  //     // ================================
  //     const fd = new FormData();

  //     fd.append("diksharthi_id", newdiksarthi);
  //     fd.append("form_step", 2);

  //     const relationArray = Object.keys(cleaned);

  //     fd.append("family_relation", relationArray.join(","));
  //     fd.append("family_relation_details", JSON.stringify(cleaned));
  //     fd.append("same_relations_with_fan", "No");

  //     fd.append("assistance", selectedAssistance.join(","));
  //     fd.append(
  //       "assistance_data",
  //       JSON.stringify(formattedAssistance)
  //     );

  //     console.log("🚀 FINAL PAYLOAD:", {
  //       cleaned,
  //       formattedAssistance,
  //       selectedAssistance,
  //     });

  //     // ================================
  //     // 🔹 API CALL
  //     // ================================
  //     const res = await axios.put(
  //       `${API}/api/update-diksharthi/${newdiksarthi}`,
  //       fd,
  //       {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       }
  //     );

  //     console.log("✅ RESPONSE =>", res.data);

  //     setCurrentDiksarthiStore(true);
  //     setCurrentStep(3);

  //     if (res?.data?.success) {
  //       alert("Family Details Added successfully ✅");
  //     } else {
  //       alert(res?.data?.message || "Update failed");
  //     }
  //   } catch (err) {
  //     console.error("❌ ERROR =>", err);
  //     alert("Something went wrong");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const errors = {};
      let hasHead = false;

      Object.entries(relationDetails || {}).forEach(([rel, details]) => {
        if (!details) return;

        const firstName = details.firstName?.trim();
        const lastName = details.lastName?.trim();
        const mobile = details.mobileNumber?.trim();

        // Clean relation name (remove numbers)
        const relationName = rel.replace(/\d+/g, "").toUpperCase();

        // ✅ First Name
        if (!firstName) {
          errors[`firstName_${rel}`] =
            `${relationName}: First Name is required`;
        }

        // ✅ Last Name
        if (!lastName) {
          errors[`lastName_${rel}`] = `${relationName}: Last Name is required`;
        }

        // ✅ Mobile validation
        if (mobile && !/^[1-9]\d{9}$/.test(mobile)) {
          errors[`mobile_${rel}`] = `${relationName}: Invalid mobile number`;
        }

        if (details.ayushman === null) {
          errors[`ayushman_${rel}`] = "Please select Ayushman option";
        }

        if (details.mediclaim === null) {
          errors[`mediclaim_${rel}`] = "Please select Mediclaim option";
        }

        // ✅ Head of Family check
        if (headOfFamily === rel) {
          hasHead = true;
        }

        if (
          details.needAssistance === undefined ||
          details.needAssistance === null ||
          details.needAssistance === ""
        ) {
          errors[`needAssistance_${rel}`] =
            `${relationName}: Please select Need Assistance Yes or No`;
        }
      });

      // ❌ No Head selected
      if (!hasHead) {
        alert("⚠️ Please select at least one Head of Family");
        return;
      }

      // ❌ Validation errors
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);

        // const errorList = Object.values(errors).join("\n");
        // alert(`⚠️ Please fix the following errors:\n\n${errorList}`);

        return;
      }

      // ================================
      // 🔹 CLEAN DATA
      // ================================
      const cleaned = {};

      Object.entries(relationDetails || {}).forEach(([relationKey, val]) => {
        if (!val) return;

        cleaned[relationKey] = {
          relationKey,

          firstName: val.firstName?.trim() || "",
          lastName: val.lastName?.trim() || "",
          mobileNumber: val.mobileNumber?.trim() || "",
          aadharNumber: val.aadharNumber?.trim() || "",
          panNumber: val.panNumber?.trim() || "",
          guardian: val.guardian || "",
          family_head: headOfFamily === relationKey,

          dob: val.dob || "",
          age: val.age || "",

          ayushmanCoverage: val.ayushmanCoverage || val.ayushman || "",
          ayushmanAmount: val.ayushmanAmount || val.ayushman_Amount || "",

          medicalPolicy: val.medicalPolicy || val.mediclaim || "",
          mediclaimAmount: val.mediclaimAmount || val.mediclaim_amount || "",
          mediclaimCompanyName:
            val.mediclaimCompanyName || val.mediclaim_company_name || "",
          mediclaimPremiumAmount:
            val.mediclaimPremiumAmount ||
            val.member_mediclaim_premium_amount ||
            "",
          mediclaimType: val.mediclaimType || val.mediclaim_type || "",

          needAssistance: val.needAssistance || "",
          assistanceCategories: val.assistanceCategories || [],
        };
      });

      // ================================
      // 🔥 CLEAN ASSISTANCE DATA
      // ================================
      const formattedAssistance = {};

      Object.entries(assistanceData || {}).forEach(([rel, types]) => {
        if (!types || typeof types !== "object") return;

        const uniqueTypes = {};

        Object.entries(types).forEach(([type, data]) => {
          if (!data || Object.keys(data).length === 0) return;

          uniqueTypes[type] = {
            ...data,
            status: data?.status || "Pending",
          };
        });

        if (Object.keys(uniqueTypes).length > 0) {
          formattedAssistance[rel] = uniqueTypes;
        }
      });

      // ================================
      // 🔹 UNIQUE ASSISTANCE TYPES
      // ================================
      const selectedAssistance = [
        ...new Set(
          Object.values(formattedAssistance).flatMap((rel) => Object.keys(rel)),
        ),
      ];

      // ================================
      // 🔹 FORM DATA
      // ================================
      const fd = new FormData();

      fd.append("diksharthi_id", newdiksarthi);
      fd.append("form_step", 2);

      const relationArray = Object.keys(cleaned);

      fd.append("family_relation", relationArray.join(","));
      fd.append("family_relation_details", JSON.stringify(cleaned));
      fd.append("same_relations_with_fan", "No");

      fd.append("assistance", selectedAssistance.join(","));
      fd.append("assistance_data", JSON.stringify(formattedAssistance));

      console.log("🚀 FINAL PAYLOAD:", {
        cleaned,
        formattedAssistance,
        selectedAssistance,
      });

      // ================================
      // 🔹 API CALL
      // ================================
      const res = await axios.put(
        `${API}/api/update-diksharthi/${newdiksarthi}`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      console.log("✅ RESPONSE =>", res.data);

      if (res?.data?.success) {
        alert("✅ Family Details Added Successfully");
        // setCurrentDiksarthiStore(true);
        // setCurrentStep(3);
      } else {
        alert(res?.data?.message || "❌ Update failed");
      }
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          err.message ||
          "❌ Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMedicalChange = (relation, field, value) => {
    if (isAssistanceFieldLocked(relation, "Medical", field)) return;

    setAssistanceData((prev) => {
      const previousMedical = prev[relation]?.Medical || {};

      let nextMedical = {
        ...previousMedical,
        [field]: value,
        status: "Pending",
      };

      // =========================================
      // IF YES SELECTED
      // ADD DEFAULT 1 RECORD
      // =========================================
      if (field === "repeatedAssistance" && value === true) {
        nextMedical.diseases =
          previousMedical?.diseases?.length > 0
            ? previousMedical.diseases
            : [
                {
                  diseaseName: "",
                  frequency: "",
                  costPerSession: "",
                  sessionsCount: "",
                  totalEstimatedCost: 0,
                },
              ];
      }

      // =========================================
      // IF NO SELECTED
      // CLEAR RECORDS
      // =========================================
      if (field === "repeatedAssistance" && value === false) {
        nextMedical.diseases = [];
        nextMedical.totalEstimatedCost = 0;
      }

      // =========================================
      // CALCULATE TOTAL
      // =========================================
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

  //   const handleSaveAssistance = async (relationDetails, relationKey, assistanceType) => {
  //     debugger
  //   try {
  //     // Get selected relation record
  //     const selectedRelation = relationDetails?.[relationKey];

  //     const payload = {
  //       diksharthiId: newdiksarthi,
  //       familyId: selectedRelation?.id, // 68
  //       relationKey, // Father
  //       assistanceType, // Medical
  //       assistanceData:
  //         assistanceData?.[relationKey]?.[assistanceType] || {},
  //     };

  //     console.log(payload);

  //     await axios.post(
  //       `${API}/api/assistance/save-assistance`,
  //       payload
  //     );
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  // const handleSaveAssistance = async (
  //   relationDetails,
  //   relationKey,
  //   assistanceType
  // ) => {
  //   try {
  //     const selectedRelation = relationDetails?.[relationKey];

  //     const assistance =
  //       assistanceData?.[relationKey]?.[assistanceType] || {};

  //     const formData = new FormData();

  //     formData.append("diksharthiId", newdiksarthi);
  //     formData.append("family_member_id", selectedRelation?.id);
  //     formData.append("relation_key", relationKey);
  //     formData.append("assistance_type", assistanceType);

  //     // Find all document arrays dynamically
  //     Object.keys(assistance).forEach((key) => {
  //       if (
  //         Array.isArray(assistance[key]) &&
  //         key.toLowerCase().includes("document")
  //       ) {
  //         assistance[key].forEach((doc, docIndex) => {
  //           doc?.files?.forEach((file) => {
  //             if (file instanceof File) {
  //               formData.append("documents", file);

  //               formData.append(
  //                 "documentMapping",
  //                 JSON.stringify({
  //                   documentField: key,
  //                   documentIndex: docIndex,
  //                   documentName: doc.documentName,
  //                 })
  //               );
  //             }
  //           });
  //         });
  //       }
  //     });

  //     formData.append(
  //       "assistanceData",
  //       JSON.stringify(assistance)
  //     );

  //     await axios.post(
  //       `${API}/api/assistance/save-assistanceDynamically`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );
  //      if (response?.data?.success) {
  //     alert(response.data.message);
  //   } else {
  //     alert(response.data.message || "Failed to save assistance");
  //   }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  const handleSaveAssistance = async (
    relationDetails,
    relationKey,
    assistanceType,
  ) => {
    debugger;
    try {
      const selectedRelation = relationDetails?.[relationKey];

      const assistance = assistanceData?.[relationKey]?.[assistanceType] || {};

      const formData = new FormData();

      formData.append("diksharthiId", newdiksarthi);
      formData.append("family_member_id", selectedRelation?.id);
      formData.append("relation_key", relationKey);
      formData.append("assistance_type", assistanceType);

      // Find all document arrays dynamically
      Object.keys(assistance).forEach((key) => {
        if (
          Array.isArray(assistance[key]) &&
          key.toLowerCase().includes("document")
        ) {
          assistance[key].forEach((doc, docIndex) => {
            doc?.files?.forEach((file) => {
              if (file instanceof File) {
                formData.append("documents", file);

                formData.append(
                  "documentMapping",
                  JSON.stringify({
                    documentField: key,
                    documentIndex: docIndex,
                    documentName: doc.documentName,
                  }),
                );
              }
            });
          });
        }
      });

      formData.append("assistanceData", JSON.stringify(assistance));

      const response = await axios.post(
        `${API}/api/assistance/save-assistanceDynamically`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response?.data?.success) {
        alert(response.data.message);
        // handleSave()
      } else {
        alert(response?.data?.message || "Failed to save assistance");
      }
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
    }
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

  // const handleDiseaseChange = (relation, index, field, value) => {
  //   if (isAssistanceFieldLocked(relation, "Medical", "diseases")) return;

  //   setAssistanceData((prev) => {
  //     if (field === "removeDisease") {
  //       const recalculatedDiseases = (value || []).map((item) => ({
  //         ...item,
  //         totalEstimatedCost: calculateDiseaseTotal(item),
  //       }));

  //       const nextMedical = {
  //         ...prev[relation]?.Medical,
  //         diseases: recalculatedDiseases,
  //       };

  //       const diseaseNames = (value || [])
  //         .map((item) => item?.diseaseName)
  //         .filter(Boolean)
  //         .join(", ");

  //       nextMedical.diseaseName = diseaseNames;
  //       nextMedical.totalEstimatedCost = calculateMedicalTotal(nextMedical);

  //       // Remove disease
  //       return {
  //         ...prev,
  //         [relation]: {
  //           ...prev[relation],
  //           Medical: nextMedical,
  //         },
  //       };
  //     }

  //     // Regular field update
  //     const diseases = [...(prev[relation]?.Medical?.diseases || [])];

  //     diseases[index] = {
  //       ...diseases[index],
  //       [field]: value,
  //     };
  //     diseases[index].totalEstimatedCost = calculateDiseaseTotal(
  //       diseases[index],
  //     );

  //     const diseaseNames = diseases
  //       .map((item) => item?.diseaseName)
  //       .filter(Boolean)
  //       .join(", ");

  //     const nextMedical = {
  //       ...prev[relation]?.Medical,
  //       diseases,
  //       diseaseName: diseaseNames,
  //     };
  //     nextMedical.totalEstimatedCost = calculateMedicalTotal(nextMedical);

  //     return {
  //       ...prev,
  //       [relation]: {
  //         ...prev[relation],
  //         Medical: nextMedical,
  //       },
  //     };
  //   });
  // };

  const handleDiseaseChange = (relation, index, field, value) => {
    if (isAssistanceFieldLocked(relation, "Medical", "diseases")) return;

    setAssistanceData((prev) => {
      const diseases = [...(prev[relation]?.Medical?.diseases || [])];

      // REMOVE DISEASE
      if (field === "removeDisease") {
        const updatedDiseases = value || [];

        const totalEstimatedCost = updatedDiseases.reduce(
          (sum, item) => sum + Number(item?.estimatedCost || 0),
          0,
        );

        return {
          ...prev,
          [relation]: {
            ...prev[relation],
            Medical: {
              ...prev[relation]?.Medical,
              diseases: updatedDiseases,
              totalEstimatedCost,
            },
          },
        };
      }

      // UPDATE FIELD
      diseases[index] = {
        ...diseases[index],
        [field]: value,
      };

      // IMPORTANT
      // SET EACH DISEASE TOTAL = ESTIMATED COST
      diseases[index].totalEstimatedCost = Number(
        diseases[index]?.estimatedCost || 0,
      );

      // MAIN TOTAL
      const totalEstimatedCost = diseases.reduce(
        (sum, item) => sum + Number(item?.totalEstimatedCost || 0),
        0,
      );

      return {
        ...prev,
        [relation]: {
          ...prev[relation],
          Medical: {
            ...prev[relation]?.Medical,
            diseases,
            totalEstimatedCost,
          },
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
  const handleJobDocumentChange = (rel, index, field, value) => {
    const docs = [...(assistanceData[rel]?.Job?.jobDocuments || [])];

    docs[index][field] = value;

    handleJobChange(rel, "jobDocuments", docs);
  };

  const handleAddJobDocument = (rel) => {
    const docs = assistanceData[rel]?.Job?.jobDocuments || [];

    handleJobChange(rel, "jobDocuments", [
      ...docs,
      {
        documentName: "",
        files: [],
      },
    ]);
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

  const handleFoodDocumentChange = (rel, index, field, value) => {
    const docs = [...(assistanceData[rel]?.Food?.foodDocuments || [])];

    docs[index][field] = value;

    handleFoodChange(rel, "foodDocuments", docs);
  };

  const handleAddFoodDocument = (rel) => {
    const docs = assistanceData[rel]?.Food?.foodDocuments || [];

    handleFoodChange(rel, "foodDocuments", [
      ...docs,
      {
        documentName: "",
        files: [],
      },
    ]);
  };
  const handleRentChange = (relation, field, value) => {
    if (isAssistanceFieldLocked(relation, "Rent", field)) return;

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

  useEffect(() => {
  if (!assistanceData) return;

  setRelationDetails((prev) => {
    const updated = { ...prev };

    Object.keys(
      assistanceData || {}
    ).forEach((relation) => {
      updated[relation] = {
        ...updated[relation],
        assistanceCategories:
          Object.keys(
            assistanceData[relation] || {}
          ),
      };
    });

    return updated;
  });
}, [assistanceData]);
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
        BusinessSupport: {
          ...prev[relation]?.BusinessSupport,
          [field]: value,
          status: "Pending",
        },
      },
    }));
  };

  return (
    <div className=" bg-gray-50 flex p-6 justify-center">
      <div className="w-full  bg-white p-6 shadow-sm">
        {/* Header */}

        <div className="flex items-center justify-between mb-4">
          {/* Left Side (Icon + Title) */}
          <div className="flex items-center gap-2 text-slate-800">
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

          {/* Right Side (Checkbox) */}
          {diksarthiid && mode !== "view" && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={sameAsMain}
                onChange={(e) => handleSameAsMainChange(e.target.checked)}
              />

              <span className="text-sm font-medium text-slate-700">
                All Relation same as
                {savedMainDiksarthi?.[0]?.sadhu_sadhvi_name && (
                  <span className="text-blue-600 font-semibold ml-1">
                    ({savedMainDiksarthi[0].sadhu_sadhvi_name})
                  </span>
                )}
              </span>
            </label>
          )}
        </div>

        <form className="space-y-2">
          <div>
            <label className="block text-md font-bold text-slate-800 mb-3">
              Relations<span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4 mb-4">
              {relations.map((rel) => (
                <label
                  key={rel}
                  className="flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Object.keys(relationDetails).includes(rel)}
                    onChange={() => handleCheckbox(rel)}
                    disabled={
                      isKaryakarta &&
                      hasPrefilledValue(
                        initialLockSnapshot?.relationDetails?.[rel],
                      )
                    }
                    className="w-5 h-5 border-slate-400 rounded"
                  />
                  <span>{rel}</span>
                </label>
              ))}
            </div>

            {/* Relation Details Accordions */}
            {selectedRelations?.map((rel) => {
              const baseRelation = rel.split("-")[0];
              const isAdditionalRow = rel !== baseRelation;
              const relationAge = Number(relationDetails?.[rel]?.age);
              const showGuardianDropdown =
                relationDetails?.[rel]?.age !== "" &&
                !Number.isNaN(relationAge) &&
                relationAge < 18;

              return (
                <div
                  key={rel}
                  className="border border-slate-300 rounded-md mb-3"
                >
                  <div className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200 gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedRelations((prev) => ({
                          ...prev,
                          [rel]: !prev[rel],
                        }))
                      }
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800">
                        {rel} Details
                      </span>
                      {expandedRelations[rel] ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>

                    {isAdditionalRow && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveRelationRow(rel, baseRelation)
                        }
                        className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md flex-shrink-0"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {expandedRelations[rel] && (
                    <div className="flex p-4 border-t border-slate-300 space-y-4">
                      <div className="w-[85%]">
                        {/* Head of Family Member - Exclusive */}
                        <div className="flex gap-4">
                          <div
                            className={`mb-4 p-3 w-[180px] rounded-md ${
                              headOfFamily !== null && headOfFamily !== rel
                                ? "bg-gray-100 opacity-50"
                                : "bg-blue-50"
                            }`}
                          >
                            <label
                              className={`flex items-center gap-2 ${
                                headOfFamily !== null && headOfFamily !== rel
                                  ? "cursor-not-allowed"
                                  : "cursor-pointer"
                              }`}
                            >
                              <input
                                type="radio"
                                name="headOfFamily"
                                checked={headOfFamily === rel}
                                onChange={() => handleHeadOfFamilyChange(rel)}
                                disabled={
                                  isHeadOfFamilyLocked ||
                                  (headOfFamily !== null &&
                                    headOfFamily !== rel)
                                }
                                className="w-5 h-5 border-slate-400 rounded"
                              />
                              <span className="font-semibold text-slate-700">
                                Head of Family
                              </span>
                            </label>
                          </div>

                          {/* Conditional Fields for "Other" Relation */}
                          {rel === "Other" && (
                            <div className="flex gap-6 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Relation Name
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Cousin, Uncle, Aunt"
                                  value={
                                    relationDetails[rel]?.relationName || ""
                                  }
                                  onChange={(e) =>
                                    handleRelationDetailChange(
                                      rel,
                                      "relationName",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                              </div>
                            </div>
                          )}
                          {(rel === "Sister" || rel === "Daughter") && (
                            <div className="flex gap-6 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  is marriage ?
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-8">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`isMarried-${rel}`}
                                      checked={
                                        relationDetails[rel]?.isMarried === true
                                      }
                                      onChange={() =>
                                        handleRelationDetailChange(
                                          rel,
                                          "isMarried",
                                          true,
                                        )
                                      }
                                    />
                                    Yes
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`isMarried-${rel}`}
                                      checked={
                                        relationDetails[rel]?.isMarried ===
                                        false
                                      }
                                      onChange={() =>
                                        handleRelationDetailChange(
                                          rel,
                                          "isMarried",
                                          false,
                                        )
                                      }
                                    />
                                    No
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex  gap-4">
                          {/* Full Name */}
                          <div className="w-[150px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              First Name<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={relationDetails[rel]?.firstName || ""}
                              disabled={!!relationDetails[rel]?.id}
                              onChange={(e) => {
                                const value = e.target.value;

                                if (/^[A-Za-z\s]*$/.test(value)) {
                                  handleRelationDetailChange(
                                    rel,
                                    "firstName",
                                    value,
                                  );
                                }
                              }}
                              className={`w-full p-2 border rounded-md focus:ring-2 outline-none
    ${
      relationDetails[rel]?.id
        ? "bg-gray-100 cursor-not-allowed border-gray-300"
        : "border-slate-300 focus:ring-blue-100"
    }
  `}
                            />

                            {validationErrors[`firstName_${rel}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors[`firstName_${rel}`]}
                              </p>
                            )}
                          </div>
                          <div className="w-[150px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Last Name<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              disabled={!!relationDetails[rel]?.id}
                              value={relationDetails[rel]?.lastName || ""}
                              onChange={(e) => {
                                const value = e.target.value;

                                // Allow only alphabets (A–Z, a–z)
                                if (/^[A-Za-z\s]*$/.test(value)) {
                                  handleRelationDetailChange(
                                    rel,
                                    "lastName",
                                    value,
                                  );
                                }
                              }}
                              className={`w-full p-2 border rounded-md focus:ring-2 outline-none
    ${
      relationDetails[rel]?.id
        ? "bg-gray-100 cursor-not-allowed border-gray-300"
        : "border-slate-300 focus:ring-blue-100"
    }
  `}
                            />
                            {validationErrors[`lastName_${rel}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors[`lastName_${rel}`]}
                              </p>
                            )}
                          </div>

                          {/* Aadhar Number */}
                          <div className="w-[150px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Mobile Number
                            </label>

                            <input
                              type="text"
                              disabled={!!relationDetails[rel]?.id}
                              value={relationDetails[rel]?.mobileNumber || ""}
                              maxLength={10}
                              onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(
                                  /\D/g,
                                  "",
                                );
                                handleRelationDetailChange(
                                  rel,
                                  "mobileNumber",
                                  onlyNumbers,
                                );
                              }}
                              className={`w-full p-2 border rounded-md focus:ring-2 outline-none
    ${
      relationDetails[rel]?.id
        ? "bg-gray-100 cursor-not-allowed border-gray-300"
        : "border-slate-300 focus:ring-blue-100"
    }
  `}
                            />
                            {validationErrors[`mobile_${rel}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors[`mobile_${rel}`]}
                              </p>
                            )}
                          </div>
                          <div className="w-[200px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              DOB
                            </label>
                            <input
                              type="date"
                              value={
                                relationDetails[rel]?.dob
                                  ? relationDetails[rel].dob.split("T")[0]
                                  : ""
                              }
                              disabled={!!relationDetails[rel]?.id}
                              max={new Date().toISOString().split("T")[0]}
                              onChange={(e) =>
                                handleRelationDetailChange(
                                  rel,
                                  "dob",
                                  e.target.value,
                                )
                              }
                              className={`w-full p-2 border rounded-md focus:ring-2 outline-none
    ${
      relationDetails[rel]?.id
        ? "bg-gray-100 cursor-not-allowed border-gray-300"
        : "border-slate-300 focus:ring-blue-100"
    }
  `}
                            />
                          </div>

                          <div className="w-[120px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Age
                            </label>

                            <input
                              type="number"
                              disabled={!!relationDetails[rel]?.id}
                              value={relationDetails[rel]?.age ?? ""}
                              onChange={(e) =>
                                handleRelationDetailChange(
                                  rel,
                                  "age",
                                  e.target.value,
                                )
                              }
                              className={`w-full p-2 border rounded-md focus:ring-2 outline-none
    ${
      relationDetails[rel]?.id
        ? "bg-gray-100 cursor-not-allowed border-gray-300"
        : "border-slate-300 focus:ring-blue-100"
    }
  `}
                            />
                          </div>
                        </div>

                        <div className="flex gap-4 mt-4">
                          <div className="w-[150px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Aadhar Number{" "}
                              <span className="text-red-500">*</span>
                            </label>

                            <input
                              type="text"
                              value={relationDetails[rel]?.aadharNumber || ""}
                              disabled={!!relationDetails[rel]?.id}
                              maxLength={12}
                              onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(
                                  /\D/g,
                                  "",
                                );

                                handleRelationDetailChange(
                                  rel,
                                  "aadharNumber",
                                  onlyNumbers,
                                );
                              }}
                              className={`w-full p-2 border rounded-md focus:ring-2 outline-none
    ${
      relationDetails[rel]?.id
        ? "bg-gray-100 cursor-not-allowed border-gray-300"
        : "border-slate-300 focus:ring-blue-100"
    }
  `}
                            />

                            {validationErrors[`aadhar_${rel}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors[`aadhar_${rel}`]}
                              </p>
                            )}

                            {/* AADHAR FILE */}
                          </div>
                          <div className="w-[200px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Upload Aadhaar File
                            </label>

                            <input
                              type="file"
                              disabled={!!relationDetails[rel]?.id}
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files[0];

                                handleRelationDetailChange(
                                  rel,
                                  "aadharFile",
                                  file,
                                );
                              }}
                              className={`w-full p-2 border rounded-md focus:ring-2 outline-none
    ${
      relationDetails[rel]?.id
        ? "bg-gray-100 cursor-not-allowed border-gray-300"
        : "border-slate-300 focus:ring-blue-100"
    }
  `}
                            />

                            {validationErrors[`aadharFile_${rel}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors[`aadharFile_${rel}`]}
                              </p>
                            )}

                            {relationDetails[rel]?.aadharFile && (
                              <div className="mt-2 text-xs text-green-600">
                                Uploaded File :{" "}
                                {relationDetails[rel]?.aadharFile?.name}
                              </div>
                            )}
                          </div>
                          <div className="w-[200px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Pan Number
                            </label>
                            <input
                              type="text"
                              disabled={!!relationDetails[rel]?.id}
                              value={relationDetails[rel]?.panNumber || ""}
                              maxLength={10}
                              onChange={(e) => {
                                const value = e.target.value
                                  .toUpperCase() // convert to uppercase
                                  .replace(/[^A-Z0-9]/g, ""); // allow only A-Z and 0-9

                                handleRelationDetailChange(
                                  rel,
                                  "panNumber",
                                  value,
                                );
                              }}
                              className={`w-full p-2 border rounded-md focus:ring-2 outline-none
    ${
      relationDetails[rel]?.id
        ? "bg-gray-100 cursor-not-allowed border-gray-300"
        : "border-slate-300 focus:ring-blue-100"
    }
  `}
                            />
                            {validationErrors[`pan_${rel}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors[`pan_${rel}`]}
                              </p>
                            )}
                          </div>
                          <div className="w-[220px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Upload PAN File
                            </label>

                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              disabled={!!relationDetails[rel]?.id}
                              onChange={(e) => {
                                const file = e.target.files[0];

                                handleRelationDetailChange(
                                  rel,
                                  "panFile",
                                  file,
                                );
                              }}
                              className={`w-full p-2 border rounded-md focus:ring-2 outline-none
    ${
      relationDetails[rel]?.id
        ? "bg-gray-100 cursor-not-allowed border-gray-300"
        : "border-slate-300 focus:ring-blue-100"
    }
  `}
                            />

                            {/* FILE NAME */}
                            {relationDetails[rel]?.panFile && (
                              <p className="text-xs text-green-600 mt-1 truncate">
                                {relationDetails[rel]?.panFile?.name}
                              </p>
                            )}

                            {/* ERROR */}
                            {validationErrors[`panFile_${rel}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors[`panFile_${rel}`]}
                              </p>
                            )}
                          </div>

                          {showGuardianDropdown && (
                            <div className="w-[200px]">
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Guardian
                              </label>
                              <select
                                value={relationDetails[rel]?.guardian || ""}
                                disabled={!!relationDetails[rel]?.id}
                                onChange={(e) =>
                                  handleRelationDetailChange(
                                    rel,
                                    "guardian",
                                    e.target.value,
                                  )
                                }
                                className={`w-full p-2 border rounded-md focus:ring-2 outline-none
    ${
      relationDetails[rel]?.id
        ? "bg-gray-100 cursor-not-allowed border-gray-300"
        : "border-slate-300 focus:ring-blue-100"
    }
  `}
                              >
                                <option value="">Select Guardian</option>
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-6 mt-4 w-full">
                          {/* Ayushman Radio */}
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">
                              Does this person have Ayushman coverage?
                              <span className="text-red-500">*</span>
                            </p>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  disabled={!!relationDetails[rel]?.id}
                                  name={`ayushman-${rel}`}
                                  value="true"
                                  checked={
                                    toBool(
                                      relationDetails?.[rel]?.ayushman ??
                                        relationDetails?.[rel]
                                          ?.ayushmanCoverage,
                                    ) === true
                                  }
                                  onChange={() =>
                                    handleRelationDetailChange(
                                      rel,
                                      "ayushman",
                                      true,
                                    )
                                  }
                                />
                                Yes
                              </label>

                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`ayushman-${rel}`}
                                  value="false"
                                  disabled={!!relationDetails[rel]?.id}
                                  // checked={
                                  //   toBool(
                                  //     relationDetails?.[rel]?.ayushmanCoverage
                                  //   ) === false
                                  // }
                                  checked={
                                    toBool(
                                      relationDetails?.[rel]?.ayushman ??
                                        relationDetails?.[rel]
                                          ?.ayushmanCoverage,
                                    ) === false
                                  }
                                  onChange={() =>
                                    handleRelationDetailChange(
                                      rel,
                                      "ayushman",
                                      false,
                                    )
                                  }
                                />
                                No
                              </label>
                            </div>
                            {validationErrors[`ayushman_${rel}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors[`ayushman_${rel}`]}
                              </p>
                            )}
                          </div>

                          {/* Do they have any Mediclaim policy?* Radio */}
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">
                              Do they have any Mediclaim policy?
                              <span className="text-red-500">*</span>
                            </p>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  disabled={!!relationDetails[rel]?.id}
                                  name={`mediclaim-${rel}`}
                                  checked={
                                    toBool(
                                      relationDetails?.[rel]?.mediclaim ??
                                        relationDetails?.[rel]?.medicalPolicy,
                                    ) === true
                                  }
                                  onChange={() =>
                                    handleRelationDetailChange(
                                      rel,
                                      "mediclaim",
                                      true,
                                    )
                                  }
                                />
                                Yes
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  disabled={!!relationDetails[rel]?.id}
                                  name={`mediclaim-${rel}`}
                                  // checked={
                                  //   relationDetails[rel]?.mediclaim === false
                                  // }
                                  // checked={toBool(relationDetails[rel]?.medicalPolicy) === false}
                                  checked={
                                    toBool(
                                      relationDetails?.[rel]?.mediclaim ??
                                        relationDetails?.[rel]?.medicalPolicy,
                                    ) === false
                                  }
                                  onChange={() =>
                                    handleRelationDetailChange(
                                      rel,
                                      "mediclaim",
                                      false,
                                    )
                                  }
                                />
                                No
                              </label>
                            </div>

                            {validationErrors[`mediclaim_${rel}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors[`mediclaim_${rel}`]}
                              </p>
                            )}
                          </div>

                          {/* {!(
                            (rel === "Sister" || rel === "Daughter") &&
                            relationDetails[rel]?.isMarried === true
                          ) && (
                              <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">
                                  Need Assistance
                                  <span className="text-red-500">*</span>
                                </p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`needAssistance-${rel}`}
                                      // checked={
                                      //   relationDetails[rel]?.needAssistance ===
                                      //   true
                                      // }
                                      checked={toBool(relationDetails[rel]?.needAssistance) === true}
                                      onChange={() => {
                                        const aadhar =
                                          relationDetails?.[rel]?.aadharNumber;

                                        if (!aadhar || aadhar.trim() === "") {
                                          alert(
                                            "Please add the Aadhaar details first",
                                          );
                                          return;
                                        }

                                        handleRelationDetailChange(
                                          rel,
                                          "needAssistance",
                                          true,
                                        );
                                      }}
                                    />
                                    Yes
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`needAssistance-${rel}`}
                                      // checked={
                                      //   relationDetails[rel]?.needAssistance ===
                                      //   false
                                      // }
                                      checked={toBool(relationDetails[rel]?.needAssistance) === false}
                                      onChange={() =>
                                        handleRelationDetailChange(
                                          rel,
                                          "needAssistance",
                                          false,
                                        )
                                      }
                                    />
                                    No
                                  </label>
                                </div>

                                 {
  validationErrors[`needAssistance_${rel}`] && (
    <p className="text-red-500 text-sm mt-1">
      {validationErrors[`needAssistance_${rel}`]}
    </p>
  )
}
                              </div>
                              
                            )} */}

                          {!(
                            (rel === "Sister" || rel === "Daughter") &&
                            relationDetails[rel]?.isMarried === true
                          ) && (
                            <div>
                              <p className="text-sm font-medium text-slate-700 mb-2">
                                Need Assistance
                                <span className="text-red-500">*</span>
                              </p>

                              <div className="flex gap-4">
                                {/* YES */}
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    disabled={!!relationDetails[rel]?.id}
                                    name={`needAssistance-${rel}`}
                                    checked={
                                      toBool(
                                        relationDetails[rel]?.needAssistance,
                                      ) === true
                                    }
                                    onChange={() =>
                                      handleNeedAssistanceChange(rel, true)
                                    }
                                  />
                                  Yes
                                </label>

                                {/* NO */}
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    disabled={!!relationDetails[rel]?.id}
                                    name={`needAssistance-${rel}`}
                                    checked={
                                      toBool(
                                        relationDetails[rel]?.needAssistance,
                                      ) === false
                                    }
                                    onChange={() =>
                                      handleNeedAssistanceChange(rel, false)
                                    }
                                  />
                                  No
                                </label>
                              </div>

                              {validationErrors[`needAssistance_${rel}`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {validationErrors[`needAssistance_${rel}`]}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        {/* Amount - Conditional Render */}
                        <div className="flex gap-5">
                          {toBool(
                            relationDetails?.[rel]?.ayushman ??
                              relationDetails?.[rel]?.ayushmanCoverage ??
                              relationDetails?.[rel]?.ayushman_coverage,
                          ) === true && (
                            <div className="w-[200px] mt-4">
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Ayushman Amount
                              </label>
                              <input
                                type="number"
                                value={
                                  relationDetails[rel]?.ayushmanAmount || ""
                                }
                                onChange={(e) =>
                                  handleRelationDetailChange(
                                    rel,
                                    "ayushmanAmount",
                                    e.target.value,
                                  )
                                }
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                              />
                            </div>
                          )}
                          {toBool(
                            relationDetails?.[rel]?.mediclaim ??
                              relationDetails?.[rel]?.medicalPolicy,
                          ) === true && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="w-[200px]">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Mediclaim Amount
                                </label>
                                <input
                                  type="number"
                                  value={
                                    relationDetails[rel]?.mediclaimAmount || ""
                                  }
                                  onChange={(e) =>
                                    handleRelationDetailChange(
                                      rel,
                                      "mediclaimAmount",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                              </div>
                              <div className="w-[200px]">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Yearly Premium Amount
                                </label>
                                <input
                                  type="number"
                                  value={
                                    relationDetails[rel]
                                      ?.mediclaimPremiumAmount || ""
                                  }
                                  onChange={(e) => {
                                    const premium = Number(e.target.value);
                                    const mediclaim = Number(
                                      relationDetails[rel]?.mediclaim_amount,
                                    );

                                    // Prevent equal OR greater
                                    if (premium >= mediclaim) {
                                      alert(
                                        "Yearly premium must be less than mediclaim amount",
                                      );
                                      return;
                                    }

                                    handleRelationDetailChange(
                                      rel,
                                      "mediclaimPremiumAmount",
                                      e.target.value,
                                    );
                                  }}
                                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                              </div>
                              <div className="w-[200px]">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Mediclaim Company Name
                                </label>
                                <input
                                  type="text"
                                  value={
                                    relationDetails[rel]
                                      ?.mediclaimCompanyName || ""
                                  }
                                  onChange={(e) =>
                                    handleRelationDetailChange(
                                      rel,
                                      "mediclaimCompanyName",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                              </div>
                              <div className="w-[200px]">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Mediclaim Type
                                </label>
                                <select
                                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                  value={
                                    relationDetails[rel]?.mediclaimType || ""
                                  }
                                  onChange={(e) =>
                                    handleRelationDetailChange(
                                      rel,
                                      "mediclaimType",
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value="">Select Type</option>
                                  <option value="single">Single</option>
                                  <option value="joint">Joint</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Show Assistance Categories when Need Assistance is Yes */}
                        {toBool(relationDetails[rel]?.needAssistance) ===
                          true && (
                          <div className="w-full mt-6">
                            <p className="text-sm font-medium text-slate-700 mb-3">
                              Assistances
                            </p>
                            <div className="flex flex-wrap gap-4">
                              {assistanceTypes.map((type) => {
                                const lowerType = type.toLowerCase();

                                // ✅ 1. Selected categories (state)
                                const selectedCategories =
                                  relationDetails[rel]?.assistanceCategories ||
                                  [];

                                const normalizedSelected =
                                  selectedCategories.map((i) =>
                                    i.toLowerCase(),
                                  );

                                // ✅ 2. API data
                                const relationKey = assistanceData?.[rel]
                                  ? rel
                                  : rel?.toLowerCase();

                                const assistanceFromAPI = Object.keys(
                                  assistanceData?.[relationKey] || {},
                                ).map((i) => i.toLowerCase());

                                // ✅ 3. Default + Extra
                                const defaultAssist = Array.isArray(
                                  defaultAssistance,
                                )
                                  ? defaultAssistance
                                      .filter((i) => i) // remove null/undefined
                                      .map((i) =>
                                        String(i).toLowerCase().trim(),
                                      )
                                  : [];
                                const extraAssist = Array.isArray(
                                  selectedAssistance,
                                )
                                  ? selectedAssistance.map((i) =>
                                      String(i).toLowerCase(),
                                    )
                                  : Object.values(selectedAssistance || {}).map(
                                      (i) => String(i).toLowerCase(),
                                    );

                                const isSameRelation =
                                  rel?.toLowerCase() ===
                                  selectedRelation?.toLowerCase();

                                // ✅ 4. Manual deselection (MOST IMPORTANT)
                                const isManuallyRemoved =
                                  deselectedAssistance?.some(
                                    (d) =>
                                      d.relation === rel &&
                                      d.type.toLowerCase() === lowerType,
                                  );

                                // ✅ 5. FINAL CHECK LOGIC (FIXED PRIORITY)
                                const isChecked =
                                  !isManuallyRemoved &&
                                  (normalizedSelected.includes(lowerType) || // state
                                    assistanceFromAPI.includes(lowerType) || // API
                                    (isSameRelation &&
                                      (defaultAssist.includes(lowerType) ||
                                        extraAssist.includes(lowerType))));

                                // ✅ 6. HANDLE CHANGE (CLEAN)
                                // const handleCheckboxChange = (checked) => {
                                //   const isDefault =
                                //     defaultAssist.includes(lowerType);

                                //   if (!checked && isSameRelation && isDefault) {
                                //     // 🚨 open modal for default
                                //     setDeselectData({ rel, type, reason: "" });
                                //   } else {
                                //     handleAssistanceCategory(
                                //       rel,
                                //       type,
                                //       !checked,
                                //     );
                                //   }
                                // };

                                const handleCheckboxChange = (checked) => {
  const isDefault =
    defaultAssist.includes(lowerType);

  // UNCHECK
  if (!checked) {
    if (isSameRelation && isDefault) {
      setDeselectData({
        rel,
        type,
        reason: "",
      });
      return;
    }

    handleAssistanceCategory(
      rel,
      type,
      true
    );

    // Clear assistance form data
    setAssistanceData((prev) => {
      const updated = { ...prev };

      const relationKey =
        updated?.[rel]
          ? rel
          : rel?.toLowerCase();

      if (updated?.[relationKey]) {
        delete updated[relationKey][type];

        if (
          Object.keys(
            updated[relationKey]
          ).length === 0
        ) {
          delete updated[relationKey];
        }
      }

      return updated;
    });

    return;
  }

  // CHECK
  handleAssistanceCategory(
    rel,
    type,
    false
  );
};

const isChecked2 =
  relationDetails?.[rel]?.assistanceCategories?.some(
    (item) =>
      item.toLowerCase() === lowerType
  ) || false;

                                
                              return (
                                  <label
                                    key={type}
                                    className="flex items-center gap-2 text-slate-700 cursor-pointer"
                                  >
                                   <input
  type="checkbox"
  checked={isChecked2}
  onChange={(e) =>
    handleCheckboxChange(
      e.target.checked
    )
  }
  className="w-4 h-4 border-slate-400 rounded"
/>
                                    <span>{type}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {deselectData && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
                                  <div className="flex justify-between mb-4">
                                    <h3 className="text-lg font-semibold">
                                      Reason for Deselecting
                                    </h3>
                                    <button
                                      onClick={() => setDeselectData(null)}
                                    >
                                      ✕
                                    </button>
                                  </div>

                                  <p>
                                    <b>Relation:</b> {deselectData.rel}
                                  </p>
                                  <p>
                                    <b>Assistance:</b> {deselectData.type}
                                  </p>

                                  <textarea
                                    className="w-full border p-2 mt-4"
                                    value={deselectData.reason}
                                    onChange={(e) =>
                                      setDeselectData((prev) => ({
                                        ...prev,
                                        reason: e.target.value,
                                      }))
                                    }
                                    placeholder="Enter reason..."
                                  />

                                  <div className="flex justify-end gap-3 mt-4">
                                    <button
                                      onClick={() => setDeselectData(null)}
                                    >
                                      Cancel
                                    </button>

                                    <button
                                      onClick={() => {
                                        if (!deselectData.reason.trim()) {
                                          alert("Please provide a reason");
                                          return;
                                        }

                                        // ✅ FIXED: REMOVE (true means remove)
                                        handleAssistanceCategory(
                                          deselectData.rel,
                                          deselectData.type,
                                          true,
                                          deselectData.reason,
                                        );

                                        setDeselectData(null);
                                      }}
                                      className="bg-blue-600 text-white px-4 py-2 rounded"
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            {(relationDetails[
                              rel
                            ]?.assistanceCategories?.includes("Medical") ||
                              Object.keys(assistanceData?.[rel] || {}).includes(
                                "Medical",
                              ) ||
                              (selectedRelation === rel &&
                                selectedAssistance?.includes("Medical"))) && (
                              <div className="mt-6 p-6 border rounded-lg bg-white shadow-sm font-sans">
                                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                  Medical support Assistance
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                  {/* Row 1 */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Type of Medical Issue?*
                                    </label>

                                    <select
                                      className="border p-2 rounded bg-white outline-none focus:border-blue-500"
                                      value={
                                        assistanceData[rel]?.Medical
                                          ?.issueType || ""
                                      }
                                      onChange={(e) =>
                                        handleMedicalChange(
                                          rel,
                                          "issueType",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="">
                                        Select Medical Issue
                                      </option>

                                      {medicalIssueTypes?.map((item) => (
                                        <option
                                          key={item.id}
                                          value={item.issue_type}
                                        >
                                          {item.issue_type}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Disease / Condition Name*
                                    </label>

                                    {(assistanceData[rel]?.Medical?.diseases
                                      ?.length
                                      ? assistanceData[rel]?.Medical?.diseases
                                      : [
                                          {
                                            diseaseName:
                                              assistanceData[rel]?.Medical
                                                ?.diseaseName || "",
                                          },
                                        ]
                                    ).map((diseaseItem, diseaseIndex) => (
                                      <div
                                        key={`${rel}-disease-${diseaseIndex}`}
                                        className="flex gap-2 items-center"
                                      >
                                        <input
                                          type="text"
                                          value={diseaseItem?.diseaseName || ""}
                                          onChange={(e) =>
                                            handleDiseaseChange(
                                              rel,
                                              diseaseIndex,
                                              "diseaseName",
                                              e.target.value,
                                            )
                                          }
                                          className="border p-2 rounded outline-none focus:border-blue-500 flex-1"
                                          placeholder={`Disease ${diseaseIndex + 1}`}
                                        />
                                        {(assistanceData[rel]?.Medical?.diseases
                                          ?.length || 1) > 1 && (
                                          <button
                                            type="button"
                                            className="px-3 py-2 rounded bg-red-100 text-red-700 text-sm"
                                            onClick={() => {
                                              const filteredDiseases = (
                                                assistanceData[rel]?.Medical
                                                  ?.diseases || []
                                              ).filter(
                                                (_, idx) =>
                                                  idx !== diseaseIndex,
                                              );
                                              handleDiseaseChange(
                                                rel,
                                                diseaseIndex,
                                                "removeDisease",
                                                filteredDiseases,
                                              );
                                            }}
                                          >
                                            Remove
                                          </button>
                                        )}
                                      </div>
                                    ))}

                                    <button
                                      type="button"
                                      className="w-fit px-3 py-2 rounded bg-blue-50 text-blue-700 text-sm"
                                      onClick={() => handleAddDisease(rel)}
                                    >
                                      + Add Disease
                                    </button>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Any Permanent Issue?*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["Yes", "No"].map((opt) => (
                                        <label
                                          key={opt}
                                          className="flex items-center gap-2 text-sm"
                                        >
                                          <input
                                            type="radio"
                                            name={`perm-${rel}`}
                                            checked={
                                              assistanceData[rel]?.Medical
                                                ?.isPermanent === opt
                                            }
                                            onChange={() =>
                                              handleMedicalChange(
                                                rel,
                                                "isPermanent",
                                                opt,
                                              )
                                            }
                                          />{" "}
                                          {opt}
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Row 2 */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Estimated/Actual Medical Expenses*
                                    </label>
                                    <input
                                      type="number"
                                      value={
                                        assistanceData[rel]?.Medical
                                          ?.estimatedExpense || ""
                                      }
                                      onChange={(e) =>
                                        handleMedicalChange(
                                          rel,
                                          "estimatedExpense",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Urgency Level?*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["High", "Medium", "Low"].map(
                                        (level) => (
                                          <label
                                            key={level}
                                            className="flex items-center gap-2 text-sm"
                                          >
                                            <input
                                              type="radio"
                                              name={`urgency-${rel}`}
                                              checked={
                                                assistanceData[rel]?.Medical
                                                  ?.urgency === level
                                              }
                                              onChange={() =>
                                                handleMedicalChange(
                                                  rel,
                                                  "urgency",
                                                  level,
                                                )
                                              }
                                            />{" "}
                                            {level}
                                          </label>
                                        ),
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Treatment Ongoing?*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["Yes", "No"].map((opt) => (
                                        <label
                                          key={opt}
                                          className="flex items-center gap-2 text-sm"
                                        >
                                          <input
                                            type="radio"
                                            name={`ongoing-${rel}`}
                                            checked={
                                              assistanceData[rel]?.Medical
                                                ?.isOngoing === opt
                                            }
                                            onChange={() =>
                                              handleMedicalChange(
                                                rel,
                                                "isOngoing",
                                                opt,
                                              )
                                            }
                                          />{" "}
                                          {opt}
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Row 3 */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Major Surgery Expected*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["Yes", "No"].map((opt) => (
                                        <label
                                          key={opt}
                                          className="flex items-center gap-2 text-sm"
                                        >
                                          <input
                                            type="radio"
                                            name={`surgery-${rel}`}
                                            checked={
                                              assistanceData[rel]?.Medical
                                                ?.majorSurgery === opt
                                            }
                                            onChange={() =>
                                              handleMedicalChange(
                                                rel,
                                                "majorSurgery",
                                                opt,
                                              )
                                            }
                                          />{" "}
                                          {opt}
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  {/* <div className="flex flex-col gap-1">
                                      <label className="text-[11px] font-bold uppercase text-gray-500">
                                        Assistance Required For*
                                      </label>
                                      <input
                                        type="text"
                                        value={
                                          assistanceData[rel]?.Medical
                                            ?.assistanceFor || ""
                                        }
                                        onChange={(e) =>
                                          handleMedicalChange(
                                            rel,
                                            "assistanceFor",
                                            e.target.value,
                                          )
                                        }
                                        className="border p-2 rounded outline-none focus:border-blue-500"
                                      />
                                    </div> */}

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Repeated Medical Assistance Required?*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      <label className="flex items-center gap-2 text-sm">
                                        <input
                                          type="checkbox"
                                          checked={
                                            assistanceData[rel]?.Medical
                                              ?.repeatedAssistance || false
                                          }
                                          onChange={(e) =>
                                            handleMedicalChange(
                                              rel,
                                              "repeatedAssistance",
                                              e.target.checked,
                                            )
                                          }
                                        />{" "}
                                        Yes
                                      </label>
                                      <label className="flex items-center gap-2 text-sm">
                                        <input
                                          type="checkbox"
                                          checked={
                                            !assistanceData[rel]?.Medical
                                              ?.repeatedAssistance
                                          }
                                          onChange={(e) =>
                                            handleMedicalChange(
                                              rel,
                                              "repeatedAssistance",
                                              !e.target.checked,
                                            )
                                          }
                                        />{" "}
                                        No
                                      </label>
                                    </div>
                                  </div>

                                  {assistanceData[rel]?.Medical
                                    ?.repeatedAssistance && (
                                    <div className="col-span-full md:col-span-3">
                                      <div className="space-y-3">
                                        {(
                                          assistanceData[rel]?.Medical
                                            ?.diseases || []
                                        ).map((diseaseItem, diseaseIndex) => (
                                          <div
                                            key={`${rel}-treatment-${diseaseIndex}`}
                                            className="border rounded-lg p-3 bg-gray-50"
                                          >
                                            <p className="text-xs font-semibold text-gray-700 mb-2">
                                              {diseaseItem?.diseaseName
                                                ? `Treatment Plan - ${diseaseItem.diseaseName}`
                                                : `Treatment Plan - Disease ${diseaseIndex + 1}`}
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                              <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold uppercase text-gray-500">
                                                  Treatment Duration*
                                                </label>

                                                <input
                                                  type="text"
                                                  placeholder="Enter Duration"
                                                  value={
                                                    diseaseItem?.treatmentDuration ||
                                                    ""
                                                  }
                                                  onChange={(e) =>
                                                    handleDiseaseChange(
                                                      rel,
                                                      diseaseIndex,
                                                      "treatmentDuration",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border p-2 rounded outline-none focus:border-blue-500 bg-white"
                                                />
                                              </div>

                                              <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold uppercase text-gray-500">
                                                  Estimated Cost*
                                                </label>

                                                <input
                                                  type="number"
                                                  value={
                                                    diseaseItem?.estimatedCost ||
                                                    ""
                                                  }
                                                  onChange={(e) =>
                                                    handleDiseaseChange(
                                                      rel,
                                                      diseaseIndex,
                                                      "estimatedCost",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border p-2 rounded outline-none focus:border-blue-500"
                                                  placeholder="Enter estimated cost"
                                                />
                                              </div>

                                              {/* Remark */}
                                              <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold uppercase text-gray-500">
                                                  Remark
                                                </label>

                                                <textarea
                                                  rows={3}
                                                  value={
                                                    diseaseItem?.remark || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleDiseaseChange(
                                                      rel,
                                                      diseaseIndex,
                                                      "remark",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border p-2 rounded outline-none focus:border-blue-500 resize-none w-[300px] h-[40px]"
                                                  placeholder="Enter remark"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        ))}

                                        <div className="flex flex-col gap-1 w-full md:w-72">
                                          <label className="text-[11px] font-bold uppercase text-gray-500">
                                            Overall Calculated Total
                                          </label>
                                          <input
                                            type="number"
                                            readOnly
                                            value={
                                              assistanceData[rel]?.Medical
                                                ?.totalEstimatedCost || ""
                                            }
                                            className="border p-2 rounded bg-gray-100 text-gray-700 outline-none"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* <div className="col-span-full md:col-span-2">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Upload Medical Documents
                                    </label>

                                    {(
                                      assistanceData[rel]?.Medical
                                        ?.medicalDocuments || []
                                    ).map((doc, index) => (
                                      <div
                                        key={index}
                                        className="flex gap-2 mt-2 items-center"
                                      >
                                       
                                        <input
                                          type="text"
                                          placeholder="Document Name"
                                          value={doc.documentName}
                                          onChange={(e) =>
                                            handleDocumentChange(
                                              rel,
                                              index,
                                              "documentName",
                                              e.target.value,
                                            )
                                          }
                                          className="border p-2 rounded w-1/3"
                                        />

                                        <input
                                          type="file"
                                          id={`file-upload-${rel}-${index}`}
                                          multiple
                                          className="hidden"
                                          accept="image/*,.pdf"
                                          onChange={(e) => {
                                            const files = Array.from(
                                              e.target.files,
                                            );
                                            handleDocumentChange(
                                              rel,
                                              index,
                                              "files",
                                              files,
                                            );
                                          }}
                                        />

                                      
                                        <button
                                          type="button"
                                          onClick={() =>
                                            document
                                              .getElementById(
                                                `file-upload-${rel}-${index}`,
                                              )
                                              .click()
                                          }
                                          className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
                                        >
                                          Upload
                                        </button>

                                        
                                        <div className="text-sm text-gray-500 max-w-[150px] truncate">
                                          {doc.files?.length
                                            ? doc.files
                                                .map((f) => f.name)
                                                .join(", ")
                                            : "No file"}
                                        </div>

                                       
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const docs =
                                              assistanceData[rel]?.Medical
                                                ?.medicalDocuments || [];
                                            handleMedicalChange(
                                              rel,
                                              "medicalDocuments",
                                              docs.filter(
                                                (_, i) => i !== index,
                                              ),
                                            );
                                          }}
                                          className="text-red-500 text-lg"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}


                                    <button
                                      type="button"
                                      onClick={() => handleAddDocument(rel)}
                                      className="mt-3 text-white px-2 py-1 flex items-center justify-center rounded-lg bg-blue-500"
                                    >
                                      <Plus /> Documents
                                    </button>
                                  </div> */}

                                  <div className="col-span-full md:col-span-2">
  <label className="text-[11px] font-bold uppercase text-gray-500">
    Upload Medical Documents
  </label>

  {(assistanceData[rel]?.Medical?.medicalDocuments || []).map(
    (doc, index) => (
      <div
        key={index}
        className="border rounded-lg p-3 mt-3 bg-gray-50"
      >
        <div className="flex flex-wrap gap-2 items-center">
          {/* Document Name */}
          <input
            type="text"
            placeholder="Document Name"
            value={doc.documentName || ""}
            onChange={(e) =>
              handleDocumentChange(
                rel,
                index,
                "documentName",
                e.target.value
              )
            }
            className="border p-2 rounded flex-1 min-w-[200px]"
          />

          {/* Hidden File Input */}
          <input
            type="file"
            id={`file-upload-${rel}-${index}`}
            multiple
            className="hidden"
            accept="image/*,.pdf"
            onChange={(e) => {
              const files = Array.from(e.target.files);

              handleDocumentChange(
                rel,
                index,
                "files",
                files
              );
            }}
          />

          {/* Upload Button */}
          <button
            type="button"
            onClick={() =>
              document
                .getElementById(
                  `file-upload-${rel}-${index}`
                )
                ?.click()
            }
            className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
          >
            Upload
          </button>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => {
              const docs =
                assistanceData[rel]?.Medical
                  ?.medicalDocuments || [];

              handleMedicalChange(
                rel,
                "medicalDocuments",
                docs.filter((_, i) => i !== index)
              );
            }}
            className="bg-red-500 text-white px-3 py-2 rounded"
          >
            Remove
          </button>
        </div>

        {/* Selected Files (Before Save) */}
        {doc.files?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Selected Files
            </p>

            <div className="flex flex-wrap gap-2">
              {doc.files.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
                >
                  <span className="text-sm">
                    {file.name}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        URL.createObjectURL(file),
                        "_blank"
                      )
                    }
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Files (After Fetch) */}
        {doc.uploadedFiles?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Uploaded Documents
            </p>

            <div className="flex flex-wrap gap-2">
              {doc.uploadedFiles.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
                >
                  <span className="text-sm">
                    {file.fileName}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `https://uat.ratnakukshi.org${file.filePath}`,
                        "_blank"
                      )
                    }
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  )}

  {/* Add Document Button */}
  <button
    type="button"
    onClick={() => handleAddDocument(rel)}
    className="mt-3 text-white px-3 py-2 flex items-center justify-center rounded-lg bg-blue-500"
  >
    <Plus className="mr-1" />
    Documents
  </button>
</div>

                                  <div className="hidden lg:block"></div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Treatment Start Date*
                                    </label>
                                    <input
                                      type="date"
                                      className="border p-2 rounded outline-none focus:border-blue-500 w-full"
                                      value={
                                        assistanceData[rel]?.Medical
                                          ?.nextDate || ""
                                      }
                                      onChange={(e) =>
                                        handleMedicalChange(
                                          rel,
                                          "nextDate",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Amount of Assistance Required?*
                                    </label>
                                    {/* <input
                                      type="number"
                                      placeholder="0.00"
                                      value={
                                        assistanceData[rel]?.Medical
                                          ?.amountRequired || ""
                                      }
                                      onChange={(e) =>
                                        handleMedicalChange(
                                          rel,
                                          "amountRequired",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    /> */}

                                    <input
                                      type="number"
                                      placeholder="0.00"
                                      value={
                                        assistanceData[rel]?.Medical
                                          ?.amountRequired || ""
                                      }
                                      onChange={(e) =>
                                        handleMedicalChange(
                                          rel,
                                          "amountRequired",
                                          e.target.value,
                                        )
                                      }
                                      className="no-spinner border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-1">
                                  <label className="text-[11px] font-bold uppercase text-gray-500">
                                    Remark
                                  </label>
                                  <textarea
                                    className="border p-2 rounded w-full h-24 outline-none focus:border-blue-500 resize-none"
                                    value={
                                      assistanceData[rel]?.Medical?.remark || ""
                                    }
                                    onChange={(e) =>
                                      handleMedicalChange(
                                        rel,
                                        "remark",
                                        e.target.value,
                                      )
                                    }
                                  ></textarea>
                                </div>

                                <div className="mt-6 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveAssistance(
                                        relationDetails,
                                        rel,
                                        "Medical",
                                      )
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                  >
                                    Save Medical Assistance
                                  </button>
                                </div>
                              </div>
                            )}

                            {(relationDetails[
                              rel
                            ]?.assistanceCategories?.includes("Education") ||
                              Object.keys(assistanceData?.[rel] || {}).includes(
                                "Education",
                              ) ||
                              (selectedRelation === rel &&
                                selectedAssistance?.includes("Education"))) && (
                              <div className="mt-6 p-6 border rounded-lg bg-white shadow-sm font-sans">
                                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                  Education support Assistance
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                  {/* Row 1 */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Class *
                                    </label>
                                    <input
                                      type="text"
                                      value={
                                        assistanceData[rel]?.Education
                                          ?.classGrade || ""
                                      }
                                      onChange={(e) =>
                                        handleEducationChange(
                                          rel,
                                          "classGrade",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Prev Year Grade / Marks
                                    </label>
                                    <input
                                      type="text"
                                      value={
                                        assistanceData[rel]?.Education?.marks ||
                                        ""
                                      }
                                      onChange={(e) =>
                                        handleEducationChange(
                                          rel,
                                          "marks",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Total Approx annual fees *
                                    </label>
                                    <input
                                      type="number"
                                      value={
                                        assistanceData[rel]?.Education
                                          ?.annualfees || ""
                                      }
                                      onChange={(e) =>
                                        handleEducationChange(
                                          rel,
                                          "annualfees",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Forward To School / College *
                                    </label>

                                    <select
                                      value={
                                        assistanceData[rel]?.Education
                                          ?.forwardTo || ""
                                      }
                                      onChange={(e) =>
                                        handleEducationChange(
                                          rel,
                                          "forwardTo",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500 bg-white"
                                    >
                                      <option value="">Select</option>
                                      <option value="jeap">JEAP</option>
                                      <option value="seed">SEED</option>
                                      <option value="smjv">SMJV</option>
                                      <option value="jeet">JEET</option>
                                    </select>
                                  </div>
                                </div>
                                {/* <div className="col-span-full mt-6">
                                  <label className="text-[11px] font-bold uppercase text-gray-500">
                                    Upload Education Documents
                                  </label>

                                  {(
                                    assistanceData[rel]?.Education
                                      ?.educationDocuments || []
                                  ).map((doc, index) => (
                                    <div
                                      key={index}
                                      className="flex gap-2 mt-2 items-center"
                                    >
                                     
                                      <input
                                        type="text"
                                        placeholder="Document Name"
                                        value={doc.documentName}
                                        onChange={(e) =>
                                          handleEducationDocumentChange(
                                            rel,
                                            index,
                                            "documentName",
                                            e.target.value,
                                          )
                                        }
                                        className="border p-2 rounded w-1/3"
                                      />

                                      
                                      <input
                                        type="file"
                                        id={`education-file-upload-${rel}-${index}`}
                                        multiple
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={(e) => {
                                          const files = Array.from(
                                            e.target.files,
                                          );

                                          handleEducationDocumentChange(
                                            rel,
                                            index,
                                            "files",
                                            files,
                                          );
                                        }}
                                      />

                                      
                                      <button
                                        type="button"
                                        onClick={() =>
                                          document
                                            .getElementById(
                                              `education-file-upload-${rel}-${index}`,
                                            )
                                            .click()
                                        }
                                        className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
                                      >
                                        Upload
                                      </button>

                                      
                                      <div className="text-sm text-gray-500 max-w-[150px] truncate">
                                        {doc.files?.length
                                          ? doc.files
                                              .map((f) => f.name)
                                              .join(", ")
                                          : "No file"}
                                      </div>

                                     
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const docs =
                                            assistanceData[rel]?.Education
                                              ?.educationDocuments || [];

                                          handleEducationChange(
                                            rel,
                                            "educationDocuments",
                                            docs.filter((_, i) => i !== index),
                                          );
                                        }}
                                        className="text-red-500 text-lg"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}


                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAddEducationDocument(rel)
                                    }
                                    className="mt-3 text-white px-2 py-1 flex items-center justify-center rounded-lg bg-blue-500"
                                  >
                                    <Plus /> Documents
                                  </button>
                                </div> */}

                                <div className="col-span-full mt-6">
  <label className="text-[11px] font-bold uppercase text-gray-500">
    Upload Education Documents
  </label>

  {(assistanceData[rel]?.Education?.educationDocuments || []).map(
    (doc, index) => (
      <div
        key={index}
        className="border rounded-lg p-3 mt-3 bg-gray-50"
      >
        <div className="flex flex-wrap gap-2 items-center">
          {/* Document Name */}
          <input
            type="text"
            placeholder="Document Name"
            value={doc.documentName || ""}
            onChange={(e) =>
              handleEducationDocumentChange(
                rel,
                index,
                "documentName",
                e.target.value
              )
            }
            className="border p-2 rounded flex-1 min-w-[200px]"
          />

          {/* Hidden File Input */}
          <input
            type="file"
            id={`education-file-upload-${rel}-${index}`}
            multiple
            className="hidden"
            accept="image/*,.pdf"
            onChange={(e) => {
              const files = Array.from(e.target.files);

              handleEducationDocumentChange(
                rel,
                index,
                "files",
                files
              );
            }}
          />

          {/* Upload Button */}
          <button
            type="button"
            onClick={() =>
              document
                .getElementById(
                  `education-file-upload-${rel}-${index}`
                )
                ?.click()
            }
            className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
          >
            Upload
          </button>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => {
              const docs =
                assistanceData[rel]?.Education
                  ?.educationDocuments || [];

              handleEducationChange(
                rel,
                "educationDocuments",
                docs.filter((_, i) => i !== index)
              );
            }}
            className="bg-red-500 text-white px-3 py-2 rounded"
          >
            Remove
          </button>
        </div>

        {/* Selected Files Before Save */}
        {doc.files?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Selected Files
            </p>

            <div className="flex flex-wrap gap-2">
              {doc.files.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
                >
                  <span className="text-sm">
                    {file.name}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        URL.createObjectURL(file),
                        "_blank"
                      )
                    }
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files From API */}
        {doc.uploadedFiles?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Uploaded Documents
            </p>

            <div className="flex flex-wrap gap-2">
              {doc.uploadedFiles.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
                >
                  <span className="text-sm">
                    {file.fileName}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `https://uat.ratnakukshi.org${file.filePath}`,
                        "_blank"
                      )
                    }
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  )}

  {/* Add Document Button */}
  <button
    type="button"
    onClick={() => handleAddEducationDocument(rel)}
    className="mt-3 text-white px-3 py-2 flex items-center justify-center rounded-lg bg-blue-500"
  >
    <Plus className="mr-1" />
    Documents
  </button>
</div>
                                {/* Remark Section */}
                                <div className="mt-8 flex flex-col gap-1">
                                  <label className="text-[11px] font-bold uppercase text-gray-500">
                                    Remark
                                  </label>
                                  <textarea
                                    placeholder="Write here..."
                                    className="border p-2 rounded w-full h-24 outline-none focus:border-blue-500 resize-none"
                                    value={
                                      assistanceData[rel]?.Education?.remark ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleEducationChange(
                                        rel,
                                        "remark",
                                        e.target.value,
                                      )
                                    }
                                  ></textarea>
                                </div>

                                <div className="mt-6 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveAssistance(
                                        relationDetails,
                                        rel,
                                        "Education",
                                      )
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                  >
                                    Save Education Assistance
                                  </button>
                                </div>
                              </div>
                            )}

                            {(relationDetails[
                              rel
                            ]?.assistanceCategories?.includes("Job") ||
                              Object.keys(assistanceData?.[rel] || {}).includes(
                                "Job",
                              ) ||
                              (selectedRelation === rel &&
                                selectedAssistance?.includes("Job"))) && (
                              <div className="mt-6 p-6 border rounded-lg bg-white shadow-sm font-sans">
                                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                  Job assistance
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                  {/* Row 1 */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Current Employment Status*
                                    </label>

                                    <select
                                      className="border p-2 rounded bg-white outline-none focus:border-blue-500 text-gray-500"
                                      value={
                                        assistanceData[rel]?.Job
                                          ?.employmentStatus || ""
                                      }
                                      onChange={(e) =>
                                        handleJobChange(
                                          rel,
                                          "employmentStatus",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="">Select</option>
                                      <option value="employed">Employed</option>
                                      <option value="unemployed">
                                        Unemployed
                                      </option>
                                    </select>
                                  </div>
                                  {assistanceData[rel]?.Job
                                    ?.employmentStatus === "employed" && (
                                    <>
                                      <div className="flex flex-col gap-1">
                                        <label className="text-[11px] font-bold uppercase text-gray-500">
                                          Current Salary*
                                        </label>
                                        <input
                                          type="number"
                                          value={
                                            assistanceData[rel]?.Job
                                              ?.currentSalary || ""
                                          }
                                          onChange={(e) =>
                                            handleJobChange(
                                              rel,
                                              "currentSalary",
                                              e.target.value,
                                            )
                                          }
                                          className="border p-2 rounded outline-none focus:border-blue-500"
                                        />
                                      </div>

                                      <div className="flex flex-col gap-1">
                                        <label className="text-[11px] font-bold uppercase text-gray-500">
                                          Expected Salary*
                                        </label>
                                        <input
                                          type="number"
                                          value={
                                            assistanceData[rel]?.Job
                                              ?.expectedSalary || ""
                                          }
                                          onChange={(e) =>
                                            handleJobChange(
                                              rel,
                                              "expectedSalary",
                                              e.target.value,
                                            )
                                          }
                                          className="border p-2 rounded outline-none focus:border-blue-500"
                                        />
                                      </div>
                                    </>
                                  )}

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Education*
                                    </label>
                                    <input
                                      type="text"
                                      value={
                                        assistanceData[rel]?.Job?.education ||
                                        ""
                                      }
                                      onChange={(e) =>
                                        handleJobChange(
                                          rel,
                                          "education",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Urgency Level?*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["High", "Medium", "Low"].map(
                                        (level) => (
                                          <label
                                            key={level}
                                            className="flex items-center gap-2 text-sm text-gray-600"
                                          >
                                            <input
                                              type="radio"
                                              name={`job-urgency-${rel}`}
                                              checked={
                                                assistanceData[rel]?.Job
                                                  ?.urgency === level
                                              }
                                              onChange={() =>
                                                handleJobChange(
                                                  rel,
                                                  "urgency",
                                                  level,
                                                )
                                              }
                                            />{" "}
                                            {level}
                                          </label>
                                        ),
                                      )}
                                    </div>
                                  </div>

                                  {/* Row 2 */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Skills / Experience*
                                    </label>
                                    <input
                                      type="text"
                                      value={
                                        assistanceData[rel]?.Job?.skills || ""
                                      }
                                      onChange={(e) =>
                                        handleJobChange(
                                          rel,
                                          "skills",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Preferred Job Type*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {[
                                        "Full-time",
                                        "Part-time",
                                        "Contract",
                                      ].map((type) => (
                                        <label
                                          key={type}
                                          className="flex items-center gap-2 text-sm text-gray-600"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={assistanceData[
                                              rel
                                            ]?.Job?.preferredJobType?.includes(
                                              type,
                                            )}
                                            onChange={(e) => {
                                              const currentTypes =
                                                assistanceData[rel]?.Job
                                                  ?.preferredJobType || [];
                                              const newTypes = e.target.checked
                                                ? [...currentTypes, type]
                                                : currentTypes.filter(
                                                    (t) => t !== type,
                                                  );
                                              handleJobChange(
                                                rel,
                                                "preferredJobType",
                                                newTypes,
                                              );
                                            }}
                                          />{" "}
                                          {type}
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Preferred Work Location*
                                    </label>
                                    <select
                                      className="border p-2 rounded bg-white outline-none focus:border-blue-500 text-gray-500"
                                      value={
                                        assistanceData[rel]?.Job?.location || ""
                                      }
                                      onChange={(e) =>
                                        handleJobChange(
                                          rel,
                                          "location",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="">Select</option>
                                      <option value="On-site">On-site</option>
                                      <option value="Remote">Remote</option>
                                      <option value="Hybrid">Hybrid</option>
                                    </select>
                                  </div>

                                  {/* <div className="flex flex-col gap-1">
                                      <label className="text-[11px] font-bold uppercase text-gray-500">
                                        Upload Resume*
                                      </label>
                                      <div className="flex items-center border rounded mt-1 overflow-hidden">
                                        <label className="bg-gray-100 px-3 py-2 border-r text-sm cursor-pointer hover:bg-gray-200 transition">
                                          Choose File
                                          <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) =>
                                              handleJobChange(
                                                rel,
                                                "resumeFile",
                                                e.target.files[0],
                                              )
                                            }
                                          />
                                        </label>
                                        <span className="px-3 text-sm text-gray-500 truncate">
                                          {assistanceData[rel]?.Job?.resumeFile
                                            ?.name || "No file chosen"}
                                        </span>
                                      </div>
                                    </div> */}

                                  <div className="col-span-full">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Interested in working in the following*
                                    </label>
                                    <div className="flex flex-wrap gap-6 mt-2">
                                      {[
                                        "Dharamshala",
                                        "Vihardham",
                                        "Tapovan",
                                        "Bhojan Shala",
                                        "None",
                                      ].map((place) => (
                                        <label
                                          key={place}
                                          className="flex items-center gap-2 text-sm text-gray-600"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={assistanceData[
                                              rel
                                            ]?.Job?.interests?.includes(place)}
                                            onChange={(e) => {
                                              const currentInterests =
                                                assistanceData[rel]?.Job
                                                  ?.interests || [];
                                              const newInterests = e.target
                                                .checked
                                                ? [...currentInterests, place]
                                                : currentInterests.filter(
                                                    (p) => p !== place,
                                                  );
                                              handleJobChange(
                                                rel,
                                                "interests",
                                                newInterests,
                                              );
                                            }}
                                          />{" "}
                                          {place}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                {/* <div className="col-span-full">
                                  <label className="text-[11px] font-bold uppercase text-gray-500">
                                    Upload Job Documents
                                  </label>

                                  {(
                                    assistanceData[rel]?.Job?.jobDocuments || []
                                  ).map((doc, index) => (
                                    <div
                                      key={index}
                                      className="flex gap-2 mt-2 items-center"
                                    >
                                      <input
                                        type="text"
                                        placeholder="Document Name"
                                        value={doc.documentName}
                                        onChange={(e) =>
                                          handleJobDocumentChange(
                                            rel,
                                            index,
                                            "documentName",
                                            e.target.value,
                                          )
                                        }
                                        className="border p-2 rounded w-1/3"
                                      />

                                      <input
                                        type="file"
                                        id={`job-file-upload-${rel}-${index}`}
                                        multiple
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,image/*"
                                        onChange={(e) => {
                                          const files = Array.from(
                                            e.target.files,
                                          );

                                          handleJobDocumentChange(
                                            rel,
                                            index,
                                            "files",
                                            files,
                                          );
                                        }}
                                      />

                                      <button
                                        type="button"
                                        onClick={() =>
                                          document
                                            .getElementById(
                                              `job-file-upload-${rel}-${index}`,
                                            )
                                            .click()
                                        }
                                        className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
                                      >
                                        Upload
                                      </button>

                                      <div className="text-sm text-gray-500 max-w-[150px] truncate">
                                        {doc.files?.length
                                          ? doc.files
                                              .map((f) => f.name)
                                              .join(", ")
                                          : "No file"}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const docs =
                                            assistanceData[rel]?.Job
                                              ?.jobDocuments || [];

                                          handleJobChange(
                                            rel,
                                            "jobDocuments",
                                            docs.filter((_, i) => i !== index),
                                          );
                                        }}
                                        className="text-red-500 text-lg"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={() => handleAddJobDocument(rel)}
                                    className="mt-3 text-white px-2 py-1 flex items-center justify-center rounded-lg bg-blue-500"
                                  >
                                    <Plus /> Documents
                                  </button>
                                </div> */}

                                <div className="col-span-full">
  <label className="text-[11px] font-bold uppercase text-gray-500">
    Upload Job Documents
  </label>

  {(assistanceData[rel]?.Job?.jobDocuments || []).map(
    (doc, index) => (
      <div
        key={index}
        className="border rounded-lg p-3 mt-3 bg-gray-50"
      >
        <div className="flex flex-wrap gap-2 items-center">
          {/* Document Name */}
          <input
            type="text"
            placeholder="Document Name"
            value={doc.documentName || ""}
            onChange={(e) =>
              handleJobDocumentChange(
                rel,
                index,
                "documentName",
                e.target.value
              )
            }
            className="border p-2 rounded flex-1 min-w-[200px]"
          />

          {/* Hidden File Input */}
          <input
            type="file"
            id={`job-file-upload-${rel}-${index}`}
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files);

              handleJobDocumentChange(
                rel,
                index,
                "files",
                files
              );
            }}
          />

          {/* Upload Button */}
          <button
            type="button"
            onClick={() =>
              document
                .getElementById(
                  `job-file-upload-${rel}-${index}`
                )
                ?.click()
            }
            className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
          >
            Upload
          </button>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => {
              const docs =
                assistanceData[rel]?.Job?.jobDocuments || [];

              handleJobChange(
                rel,
                "jobDocuments",
                docs.filter((_, i) => i !== index)
              );
            }}
            className="bg-red-500 text-white px-3 py-2 rounded"
          >
            Remove
          </button>
        </div>

        {/* Selected Files Before Save */}
        {doc.files?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Selected Files
            </p>

            <div className="flex flex-wrap gap-2">
              {doc.files.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
                >
                  <span className="text-sm">
                    {file.name}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        URL.createObjectURL(file),
                        "_blank"
                      )
                    }
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files From API */}
        {doc.uploadedFiles?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Uploaded Documents
            </p>

            <div className="flex flex-wrap gap-2">
              {doc.uploadedFiles.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
                >
                  <span className="text-sm">
                    {file.fileName}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `https://uat.ratnakukshi.org${file.filePath}`,
                        "_blank"
                      )
                    }
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  )}

  {/* Add Document Button */}
  <button
    type="button"
    onClick={() => handleAddJobDocument(rel)}
    className="mt-3 text-white px-3 py-2 flex items-center justify-center rounded-lg bg-blue-500"
  >
    <Plus className="mr-1" />
    Documents
  </button>
</div>
                                {/* Remark Section */}
                                <div className="mt-8 flex flex-col gap-1">
                                  <label className="text-[11px] font-bold uppercase text-gray-500">
                                    Remark*
                                  </label>
                                  <textarea
                                    placeholder="Write here..."
                                    className="border p-2 rounded w-full h-24 outline-none focus:border-blue-500 resize-none"
                                    value={
                                      assistanceData[rel]?.Job?.remark || ""
                                    }
                                    onChange={(e) =>
                                      handleJobChange(
                                        rel,
                                        "remark",
                                        e.target.value,
                                      )
                                    }
                                  ></textarea>
                                </div>

                                <div className="mt-6 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveAssistance(
                                        relationDetails,
                                        rel,
                                        "Job",
                                      )
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                  >
                                    Save Job Assistance
                                  </button>
                                </div>
                              </div>
                            )}

                            {(relationDetails[
                              rel
                            ]?.assistanceCategories?.includes("Food") ||
                              Object.keys(assistanceData?.[rel] || {}).includes(
                                "Food",
                              ) ||
                              (selectedRelation === rel &&
                                selectedAssistance?.includes("Food"))) && (
                              <div className="mt-6 p-6 border rounded-lg bg-white shadow-sm font-sans">
                                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                  Grocery Support Assistance
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                  {/* Row 1 */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      No. Members Need Support?*
                                    </label>
                                    <input
                                      type="number"
                                      value={
                                        assistanceData[rel]?.Food
                                          ?.memberCount || ""
                                      }
                                      onChange={(e) =>
                                        handleFoodChange(
                                          rel,
                                          "memberCount",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Urgency Level?*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["High", "Medium", "Low"].map(
                                        (level) => (
                                          <label
                                            key={level}
                                            className="flex items-center gap-2 text-sm text-gray-600"
                                          >
                                            <input
                                              type="radio"
                                              name={`food-urgency-${rel}`}
                                              checked={
                                                assistanceData[rel]?.Food
                                                  ?.urgency === level
                                              }
                                              onChange={() =>
                                                handleFoodChange(
                                                  rel,
                                                  "urgency",
                                                  level,
                                                )
                                              }
                                            />{" "}
                                            {level}
                                          </label>
                                        ),
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Type of Grocery Support Required?*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["Dry ration", "Cooked meals"].map(
                                        (type) => (
                                          <label
                                            key={type}
                                            className="flex items-center gap-2 text-sm text-gray-600"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={assistanceData[
                                                rel
                                              ]?.Food?.foodType?.includes(type)}
                                              onChange={(e) => {
                                                const currentTypes =
                                                  assistanceData[rel]?.Food
                                                    ?.foodType || [];
                                                const newTypes = e.target
                                                  .checked
                                                  ? [...currentTypes, type]
                                                  : currentTypes.filter(
                                                      (t) => t !== type,
                                                    );
                                                handleFoodChange(
                                                  rel,
                                                  "foodType",
                                                  newTypes,
                                                );
                                              }}
                                            />{" "}
                                            {type}
                                          </label>
                                        ),
                                      )}
                                    </div>
                                  </div>

                                  {/* Row 2 */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Frequency
                                    </label>

                                    {(() => {
                                      const selectedFoodTypes =
                                        assistanceData[rel]?.Food?.foodType ||
                                        [];

                                      let frequencyOptions = [];

                                      // ✅ Dry ration options
                                      if (
                                        selectedFoodTypes.includes("Dry ration")
                                      ) {
                                        frequencyOptions.push(
                                          "Monthly",
                                          "6 Months",
                                          "Yearly",
                                        );
                                      }

                                      // ✅ Cooked meals options
                                      if (
                                        selectedFoodTypes.includes(
                                          "Cooked meals",
                                        )
                                      ) {
                                        frequencyOptions.push(
                                          "One-meals",
                                          "Two-meals",
                                          "Three-meals",
                                        );
                                      }

                                      return (
                                        <select
                                          className="border p-2 rounded bg-white outline-none focus:border-blue-500 text-gray-700"
                                          value={
                                            assistanceData[rel]?.Food
                                              ?.duration || ""
                                          }
                                          onChange={(e) =>
                                            handleFoodChange(
                                              rel,
                                              "duration",
                                              e.target.value,
                                            )
                                          }
                                        >
                                          <option value="">Select</option>

                                          {frequencyOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                              {opt}
                                            </option>
                                          ))}
                                        </select>
                                      );
                                    })()}
                                  </div>
                                </div>
                                {/* <div className="col-span-full mt-6">
                                  <label className="text-[11px] font-bold uppercase text-gray-500">
                                    Upload Grocery Documents
                                  </label>

                                  {(
                                    assistanceData[rel]?.Food?.foodDocuments ||
                                    []
                                  ).map((doc, index) => (
                                    <div
                                      key={index}
                                      className="flex gap-2 mt-2 items-center"
                                    >
                                      <input
                                        type="text"
                                        placeholder="Document Name"
                                        value={doc.documentName}
                                        onChange={(e) =>
                                          handleFoodDocumentChange(
                                            rel,
                                            index,
                                            "documentName",
                                            e.target.value,
                                          )
                                        }
                                        className="border p-2 rounded w-1/3"
                                      />

                                      <input
                                        type="file"
                                        id={`food-file-upload-${rel}-${index}`}
                                        multiple
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,image/*"
                                        onChange={(e) => {
                                          const files = Array.from(
                                            e.target.files,
                                          );

                                          handleFoodDocumentChange(
                                            rel,
                                            index,
                                            "files",
                                            files,
                                          );
                                        }}
                                      />

                                      <button
                                        type="button"
                                        onClick={() =>
                                          document
                                            .getElementById(
                                              `food-file-upload-${rel}-${index}`,
                                            )
                                            .click()
                                        }
                                        className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
                                      >
                                        Upload
                                      </button>

                                      <div className="text-sm text-gray-500 max-w-[150px] truncate">
                                        {doc.files?.length
                                          ? doc.files
                                              .map((f) => f.name)
                                              .join(", ")
                                          : "No file"}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const docs =
                                            assistanceData[rel]?.Food
                                              ?.foodDocuments || [];

                                          handleFoodChange(
                                            rel,
                                            "foodDocuments",
                                            docs.filter((_, i) => i !== index),
                                          );
                                        }}
                                        className="text-red-500 text-lg"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={() => handleAddFoodDocument(rel)}
                                    className="mt-3 text-white px-2 py-1 flex items-center justify-center rounded-lg bg-blue-500"
                                  >
                                    <Plus /> Documents
                                  </button>
                                </div> */}

                                <div className="col-span-full mt-6">
  <label className="text-[11px] font-bold uppercase text-gray-500">
    Upload Grocery Documents
  </label>

  {(assistanceData[rel]?.Food?.foodDocuments || []).map(
    (doc, index) => (
      <div
        key={index}
        className="border rounded-lg p-3 mt-3 bg-gray-50"
      >
        <div className="flex flex-wrap gap-2 items-center">
          {/* Document Name */}
          <input
            type="text"
            placeholder="Document Name"
            value={doc.documentName || ""}
            onChange={(e) =>
              handleFoodDocumentChange(
                rel,
                index,
                "documentName",
                e.target.value
              )
            }
            className="border p-2 rounded flex-1 min-w-[200px]"
          />

          {/* Hidden File Input */}
          <input
            type="file"
            id={`food-file-upload-${rel}-${index}`}
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files);

              handleFoodDocumentChange(
                rel,
                index,
                "files",
                files
              );
            }}
          />

          {/* Upload Button */}
          <button
            type="button"
            onClick={() =>
              document
                .getElementById(
                  `food-file-upload-${rel}-${index}`
                )
                ?.click()
            }
            className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
          >
            Upload
          </button>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => {
              const docs =
                assistanceData[rel]?.Food?.foodDocuments || [];

              handleFoodChange(
                rel,
                "foodDocuments",
                docs.filter((_, i) => i !== index)
              );
            }}
            className="bg-red-500 text-white px-3 py-2 rounded"
          >
            Remove
          </button>
        </div>

        {/* Selected Files Before Save */}
        {doc.files?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Selected Files
            </p>

            <div className="flex flex-wrap gap-2">
              {doc.files.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
                >
                  <span className="text-sm">
                    {file.name}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        URL.createObjectURL(file),
                        "_blank"
                      )
                    }
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files From API */}
        {doc.uploadedFiles?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Uploaded Documents
            </p>

            <div className="flex flex-wrap gap-2">
              {doc.uploadedFiles.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
                >
                  <span className="text-sm">
                    {file.fileName}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `https://uat.ratnakukshi.org${file.filePath}`,
                        "_blank"
                      )
                    }
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  )}

  {/* Add Document Button */}
  <button
    type="button"
    onClick={() => handleAddFoodDocument(rel)}
    className="mt-3 text-white px-3 py-2 flex items-center justify-center rounded-lg bg-blue-500"
  >
    <Plus className="mr-1" />
    Documents
  </button>
</div>
                                {/* Remark Section */}
                                <div className="mt-6 flex flex-col gap-1">
                                  <label className="text-[11px] font-bold uppercase text-gray-500">
                                    Remark*
                                  </label>
                                  <textarea
                                    placeholder="Write here..."
                                    className="border p-2 rounded w-full h-24 outline-none focus:border-blue-500 resize-none"
                                    value={
                                      assistanceData[rel]?.Food?.remark || ""
                                    }
                                    onChange={(e) =>
                                      handleFoodChange(
                                        rel,
                                        "remark",
                                        e.target.value,
                                      )
                                    }
                                  ></textarea>
                                </div>

                                <div className="mt-6 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveAssistance(
                                        relationDetails,
                                        rel,
                                        "Food",
                                      )
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                  >
                                    Save Grocery Assistance
                                  </button>
                                </div>
                              </div>
                            )}

                            {
                              // relationDetails[
                              // rel
                              // ]?.assistanceCategories?.includes("Rent") &&

                              // (
                              //   relationDetails[rel]?.assistanceCategories?.includes("Rent") ||
                              //   selectedAssistance?.includes("Rent")
                              // ) &&
                              (relationDetails[
                                rel
                              ]?.assistanceCategories?.includes("Rent") ||
                                Object.keys(
                                  assistanceData?.[rel] || {},
                                ).includes("Rent") ||
                                (selectedRelation === rel &&
                                  selectedAssistance?.includes("Rent"))) && (
                                <div className="mt-6 p-6 border rounded-lg bg-white shadow-sm font-sans">
                                  <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                    Rent support Assistance
                                  </h3>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                    {/* Row 1 */}
                                    <div className="flex flex-col gap-1">
                                      <label className="text-[11px] font-bold uppercase text-gray-500">
                                        Monthly Rent Amount*
                                      </label>
                                      <input
                                        type="number"
                                        placeholder="0.00"
                                        value={
                                          assistanceData[rel]?.Rent
                                            ?.monthlyAmount || ""
                                        }
                                        onChange={(e) =>
                                          handleRentChange(
                                            rel,
                                            "monthlyAmount",
                                            e.target.value,
                                          )
                                        }
                                        className="border p-2 rounded outline-none focus:border-blue-500"
                                      />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                      <label className="text-[11px] font-bold uppercase text-gray-500">
                                        Urgency Level?*
                                      </label>
                                      <div className="flex gap-4 mt-2">
                                        {["High", "Medium", "Low"].map(
                                          (level) => (
                                            <label
                                              key={level}
                                              className="flex items-center gap-2 text-sm text-gray-600"
                                            >
                                              <input
                                                type="radio"
                                                name={`rent-urgency-${rel}`}
                                                checked={
                                                  assistanceData[rel]?.Rent
                                                    ?.urgency === level
                                                }
                                                onChange={() =>
                                                  handleRentChange(
                                                    rel,
                                                    "urgency",
                                                    level,
                                                  )
                                                }
                                              />{" "}
                                              {level}
                                            </label>
                                          ),
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                      <label className="text-[11px] font-bold uppercase text-gray-500">
                                        Rent Pending*
                                      </label>
                                      <div className="flex gap-4 mt-2">
                                        {["Yes", "No"].map((opt) => (
                                          <label
                                            key={opt}
                                            className="flex items-center gap-2 text-sm text-gray-600"
                                          >
                                            <input
                                              type="radio"
                                              name={`pending-${rel}`}
                                              checked={
                                                assistanceData[rel]?.Rent
                                                  ?.isPending === opt
                                              }
                                              onChange={() =>
                                                handleRentChange(
                                                  rel,
                                                  "isPending",
                                                  opt,
                                                )
                                              }
                                            />{" "}
                                            {opt}
                                          </label>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Row 2 */}
                                    <div className="flex flex-col gap-1">
                                      <label className="text-[11px] font-bold uppercase text-gray-500">
                                        Pending Rent Months (If Any)
                                      </label>
                                      <input
                                        type="number"
                                        value={
                                          assistanceData[rel]?.Rent
                                            ?.pendingMonths || ""
                                        }
                                        onChange={(e) =>
                                          handleRentChange(
                                            rel,
                                            "pendingMonths",
                                            e.target.value,
                                          )
                                        }
                                        className="border p-2 rounded outline-none focus:border-blue-500"
                                      />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                      <label className="text-[11px] font-bold uppercase text-gray-500">
                                        Rent Proof Available*
                                      </label>
                                      <div className="flex gap-4 mt-2">
                                        {["Yes", "No"].map((opt) => (
                                          <label
                                            key={opt}
                                            className="flex items-center gap-2 text-sm text-gray-600"
                                          >
                                            <input
                                              type="radio"
                                              name={`proof-${rel}`}
                                              checked={
                                                assistanceData[rel]?.Rent
                                                  ?.proofAvailable === opt
                                              }
                                              onChange={() =>
                                                handleRentChange(
                                                  rel,
                                                  "proofAvailable",
                                                  opt,
                                                )
                                              }
                                            />{" "}
                                            {opt}
                                          </label>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                      <label className="text-[11px] font-bold uppercase text-gray-500">
                                        Is Rent Reimbursement Required?*
                                      </label>
                                      <div className="flex gap-4 mt-2">
                                        {["Yes", "No"].map((opt) => (
                                          <label
                                            key={opt}
                                            className="flex items-center gap-2 text-sm text-gray-600"
                                          >
                                            <input
                                              type="radio"
                                              name={`reimbursement-${rel}`}
                                              checked={
                                                assistanceData[rel]?.Rent
                                                  ?.reimbursementRequired ===
                                                opt
                                              }
                                              onChange={() =>
                                                handleRentChange(
                                                  rel,
                                                  "reimbursementRequired",
                                                  opt,
                                                )
                                              }
                                            />{" "}
                                            {opt}
                                          </label>
                                        ))}
                                      </div>
                                    </div>

                                   
                                  </div>
{/* <div className="col-span-full mt-6">
  <label className="text-[11px] font-bold uppercase text-gray-500">
    Upload Rent Documents
  </label>

  {(assistanceData[rel]?.Rent?.rentProofDocuments || []).map(
    (doc, index) => (
      <div
        key={index}
        className="flex gap-2 mt-2 items-center"
      >
        <input
          type="text"
          placeholder="Document Name"
          value={doc.documentName}
          onChange={(e) =>
            handleRentDocumentChange(
              rel,
              index,
              "documentName",
              e.target.value
            )
          }
          className="border p-2 rounded w-1/3"
        />

        <input
          type="file"
          id={`rent-file-upload-${rel}-${index}`}
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files);

            handleRentDocumentChange(
              rel,
              index,
              "files",
              files
            );
          }}
        />

        <button
          type="button"
          onClick={() =>
            document
              .getElementById(
                `rent-file-upload-${rel}-${index}`
              )
              .click()
          }
          className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
        >
          Upload
        </button>

        <div className="text-sm text-gray-500 max-w-[150px] truncate">
          {doc.files?.length
            ? doc.files.map((f) => f.name).join(", ")
            : "No file"}
        </div>

        <button
          type="button"
          onClick={() => {
            const docs =
              assistanceData[rel]?.Rent?.rentProofDocuments || [];

            handleRentChange(
              rel,
              "rentProofDocuments",
              docs.filter((_, i) => i !== index)
            );
          }}
          className="text-red-500 text-lg"
        >
          ✕
        </button>
      </div>
    )
  )}

  <button
    type="button"
    onClick={() => handleAddRentDocument(rel)}
    className="mt-3 text-white px-2 py-1 flex items-center justify-center rounded-lg bg-blue-500"
  >
    <Plus /> Documents
  </button>
</div> */}

<div className="col-span-full mt-6">
  <label className="text-[11px] font-bold uppercase text-gray-500">
    Upload Rent Documents
  </label>

  {(assistanceData[rel]?.Rent?.rentProofDocuments || []).map(
    (doc, index) => (
      <div
        key={index}
        className="border rounded-lg p-3 mt-3 bg-gray-50"
      >
        <div className="flex flex-wrap gap-2 items-center">
          {/* Document Name */}
          <input
            type="text"
            placeholder="Document Name"
            value={doc.documentName || ""}
            onChange={(e) =>
              handleRentDocumentChange(
                rel,
                index,
                "documentName",
                e.target.value
              )
            }
            className="border p-2 rounded flex-1 min-w-[200px]"
          />

          {/* Hidden File Input */}
          <input
            type="file"
            id={`rent-file-upload-${rel}-${index}`}
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files);

              handleRentDocumentChange(
                rel,
                index,
                "files",
                files
              );
            }}
          />

          {/* Upload Button */}
          <button
            type="button"
            onClick={() =>
              document
                .getElementById(
                  `rent-file-upload-${rel}-${index}`
                )
                ?.click()
            }
            className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
          >
            Upload
          </button>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => {
              const docs =
                assistanceData[rel]?.Rent?.rentProofDocuments || [];

              handleRentChange(
                rel,
                "rentProofDocuments",
                docs.filter((_, i) => i !== index)
              );
            }}
            className="bg-red-500 text-white px-3 py-2 rounded"
          >
            Remove
          </button>
        </div>

        {/* Selected Files Before Save */}
        {doc.files?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Selected Files
            </p>

            <div className="flex flex-wrap gap-2">
              {doc.files.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
                >
                  <span className="text-sm">
                    {file.name}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        URL.createObjectURL(file),
                        "_blank"
                      )
                    }
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files From API */}
        {doc.uploadedFiles?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Uploaded Documents
            </p>

            <div className="flex flex-wrap gap-2">
              {doc.uploadedFiles.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
                >
                  <span className="text-sm">
                    {file.fileName}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `https://uat.ratnakukshi.org${file.filePath}`,
                        "_blank"
                      )
                    }
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  )}

  {/* Add Document Button */}
  <button
    type="button"
    onClick={() => handleAddRentDocument(rel)}
    className="mt-3 text-white px-3 py-2 flex items-center justify-center rounded-lg bg-blue-500"
  >
    <Plus className="mr-1" />
    Documents
  </button>
</div>
                                  {/* Remark Section */}
                                  <div className="mt-8 flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Remark*
                                    </label>
                                    <textarea
                                      placeholder="Write here..."
                                      className="border p-2 rounded w-full h-24 outline-none focus:border-blue-500 resize-none"
                                      value={
                                        assistanceData[rel]?.Rent?.remark || ""
                                      }
                                      onChange={(e) =>
                                        handleRentChange(
                                          rel,
                                          "remark",
                                          e.target.value,
                                        )
                                      }
                                    ></textarea>
                                  </div>

                                  <div className="mt-6 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveAssistance(
                                        relationDetails,
                                        rel,
                                        "Rent",
                                      )
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                  >
                                    Save Rent Assistance
                                  </button>
                                </div>
                                </div>
                              )
                            }

                            {
                             

                              (relationDetails[
                                rel
                              ]?.assistanceCategories?.includes("Housing") ||
                                Object.keys(
                                  assistanceData?.[rel] || {},
                                ).includes("Housing") ||
                                (selectedRelation === rel &&
                                  selectedAssistance?.includes("Housing"))) && (
                                <div className="mt-6 p-6 border rounded-lg bg-white shadow-sm font-sans text-[#4A4A4A]">
                                  <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                    House purchase/repair Assistance
                                  </h3>

                                  {(() => {
                                    const housingTypes =
                                      assistanceData[rel]?.Housing
                                        ?.assistanceType || [];
                                    const isHousePurchaseSelected =
                                      housingTypes.includes("House purchase");
                                    const hasOwnContribution =
                                      assistanceData[rel]?.Housing
                                        ?.ownContribution === "Yes";
                                    const hasLoanSupport =
                                      assistanceData[rel]?.Housing
                                        ?.hasOtherSupport === "Yes";

                                    return (
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                        {/* Row 1: Type of Housing Assistance */}
                                        <div className="col-span-full md:col-span-2 lg:col-span-1 flex flex-col gap-1">
                                          <label className="text-[11px] font-bold uppercase text-gray-500">
                                            Type of Housing Assistance
                                            Required?*
                                          </label>
                                          <div className="flex gap-6 mt-2">
                                            {[
                                              "House purchase",
                                              "House repair",
                                            ].map((type) => (
                                              <label
                                                key={type}
                                                className="flex items-center gap-2 text-sm"
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={assistanceData[
                                                    rel
                                                  ]?.Housing?.assistanceType?.includes(
                                                    type,
                                                  )}
                                                  onChange={(e) => {
                                                    const currentTypes =
                                                      assistanceData[rel]
                                                        ?.Housing
                                                        ?.assistanceType || [];
                                                    const newTypes = e.target
                                                      .checked
                                                      ? [...currentTypes, type]
                                                      : currentTypes.filter(
                                                          (t) => t !== type,
                                                        );
                                                    handleHousingChange(
                                                      rel,
                                                      "assistanceType",
                                                      newTypes,
                                                    );
                                                  }}
                                                />{" "}
                                                {type}
                                              </label>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="flex flex-col gap-1 lg:col-start-2 lg:col-span-2">
                                          {/* Spacer to align with 3-column layout */}
                                        </div>

                                        {/* Row 2 */}
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[11px] font-bold uppercase text-gray-500">
                                            Urgency Level?*
                                          </label>
                                          <div className="flex gap-4 mt-2">
                                            {["High", "Medium", "Low"].map(
                                              (level) => (
                                                <label
                                                  key={level}
                                                  className="flex items-center gap-2 text-sm"
                                                >
                                                  <input
                                                    type="radio"
                                                    name={`house-urgency-${rel}`}
                                                    checked={
                                                      assistanceData[rel]
                                                        ?.Housing?.urgency ===
                                                      level
                                                    }
                                                    onChange={() =>
                                                      handleHousingChange(
                                                        rel,
                                                        "urgency",
                                                        level,
                                                      )
                                                    }
                                                  />{" "}
                                                  {level}
                                                </label>
                                              ),
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                          <label className="text-[11px] font-bold uppercase text-gray-500">
                                            Estimated Expenses*
                                          </label>
                                          <input
                                            type="number"
                                            value={
                                              assistanceData[rel]?.Housing
                                                ?.totalCost || ""
                                            }
                                            onChange={(e) =>
                                              handleHousingChange(
                                                rel,
                                                "totalCost",
                                                e.target.value,
                                              )
                                            }
                                            className="border p-2 rounded outline-none focus:border-blue-500"
                                          />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                          <label className="text-[11px] font-bold uppercase text-gray-500">
                                            Partial Assistance Required?*
                                          </label>
                                          <div className="flex gap-4 mt-2">
                                            {["Yes", "No"].map((opt) => (
                                              <label
                                                key={opt}
                                                className="flex items-center gap-2 text-sm"
                                              >
                                                <input
                                                  type="radio"
                                                  name={`partial-${rel}`}
                                                  checked={
                                                    assistanceData[rel]?.Housing
                                                      ?.isPartial === opt
                                                  }
                                                  onChange={() =>
                                                    handleHousingChange(
                                                      rel,
                                                      "isPartial",
                                                      opt,
                                                    )
                                                  }
                                                />{" "}
                                                {opt}
                                              </label>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Row 3 */}
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[11px] font-bold uppercase text-gray-500">
                                            Amount of Assistance Required.*
                                          </label>
                                          <input
                                            type="number"
                                            value={
                                              assistanceData[rel]?.Housing
                                                ?.amountRequired || ""
                                            }
                                            onChange={(e) =>
                                              handleHousingChange(
                                                rel,
                                                "amountRequired",
                                                e.target.value,
                                              )
                                            }
                                            className="border p-2 rounded outline-none focus:border-blue-500"
                                          />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                          <label className="text-[11px] font-bold uppercase text-gray-500">
                                            Own Contribution Available?*
                                          </label>
                                          <div className="flex gap-4 mt-2">
                                            {["Yes", "No"].map((opt) => (
                                              <label
                                                key={opt}
                                                className="flex items-center gap-2 text-sm"
                                              >
                                                <input
                                                  type="radio"
                                                  name={`contribution-${rel}`}
                                                  checked={
                                                    assistanceData[rel]?.Housing
                                                      ?.ownContribution === opt
                                                  }
                                                  onChange={() =>
                                                    handleHousingChange(
                                                      rel,
                                                      "ownContribution",
                                                      opt,
                                                    )
                                                  }
                                                />{" "}
                                                {opt}
                                              </label>
                                            ))}
                                          </div>
                                        </div>

                                        {hasOwnContribution && (
                                          <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-bold uppercase text-gray-500">
                                              Own Contribution Amount l.{" "}
                                            </label>
                                            <input
                                              type="number"
                                              value={
                                                assistanceData[rel]?.Housing
                                                  ?.ownContributionAmount || ""
                                              }
                                              onChange={(e) =>
                                                handleHousingChange(
                                                  rel,
                                                  "ownContributionAmount",
                                                  e.target.value,
                                                )
                                              }
                                              className="border p-2 rounded outline-none focus:border-blue-500"
                                            />
                                          </div>
                                        )}

                                        <div className="flex flex-col gap-1">
                                          <label className="text-[11px] font-bold uppercase text-gray-500">
                                            Any Loan or Other Support?*
                                          </label>
                                          <div className="flex gap-4 mt-2">
                                            {["Yes", "No"].map((opt) => (
                                              <label
                                                key={opt}
                                                className="flex items-center gap-2 text-sm"
                                              >
                                                <input
                                                  type="radio"
                                                  name={`loan-${rel}`}
                                                  checked={
                                                    assistanceData[rel]?.Housing
                                                      ?.hasOtherSupport === opt
                                                  }
                                                  onChange={() =>
                                                    handleHousingChange(
                                                      rel,
                                                      "hasOtherSupport",
                                                      opt,
                                                    )
                                                  }
                                                />{" "}
                                                {opt}
                                              </label>
                                            ))}
                                          </div>
                                        </div>

                                        {isHousePurchaseSelected &&
                                          hasLoanSupport && (
                                            <>
                                              <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold uppercase text-gray-500">
                                                  Loan Amount
                                                </label>
                                                <input
                                                  type="number"
                                                  value={
                                                    assistanceData[rel]?.Housing
                                                      ?.loanAmount || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleHousingChange(
                                                      rel,
                                                      "loanAmount",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border p-2 rounded outline-none focus:border-blue-500"
                                                />
                                              </div>

                                              <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold uppercase text-gray-500">
                                                  EMI Amount Monthly
                                                </label>
                                                <input
                                                  type="number"
                                                  value={
                                                    assistanceData[rel]?.Housing
                                                      ?.emiAmountMonthly || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleHousingChange(
                                                      rel,
                                                      "emiAmountMonthly",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className={`border p-2 rounded outline-none focus:border-blue-500 ${
                                                    Number(
                                                      assistanceData[rel]
                                                        ?.Housing
                                                        ?.emiAmountMonthly || 0,
                                                    ) >
                                                      Number(
                                                        assistanceData[rel]
                                                          ?.Housing
                                                          ?.loanAmount || 0,
                                                      ) &&
                                                    assistanceData[rel]?.Housing
                                                      ?.loanAmount
                                                      ? "border-red-500 focus:ring-2 focus:ring-red-100"
                                                      : "border-slate-300"
                                                  }`}
                                                />
                                                {Number(
                                                  assistanceData[rel]?.Housing
                                                    ?.emiAmountMonthly || 0,
                                                ) >
                                                  Number(
                                                    assistanceData[rel]?.Housing
                                                      ?.loanAmount || 0,
                                                  ) &&
                                                  assistanceData[rel]?.Housing
                                                    ?.loanAmount && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                      EMI amount cannot exceed
                                                      loan amount (₹
                                                      {
                                                        assistanceData[rel]
                                                          ?.Housing?.loanAmount
                                                      }
                                                      )
                                                    </p>
                                                  )}
                                              </div>

                                              <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold uppercase text-gray-500">
                                                  Company Name
                                                </label>
                                                <input
                                                  type="text"
                                                  value={
                                                    assistanceData[rel]?.Housing
                                                      ?.companyName || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleHousingChange(
                                                      rel,
                                                      "companyName",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border p-2 rounded outline-none focus:border-blue-500"
                                                />
                                              </div>

                                              <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold uppercase text-gray-500">
                                                  No of Months of Loan Taken
                                                </label>
                                                <input
                                                  type="number"
                                                  value={
                                                    assistanceData[rel]?.Housing
                                                      ?.loanYears || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleHousingChange(
                                                      rel,
                                                      "loanYears",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border p-2 rounded outline-none focus:border-blue-500"
                                                  placeholder="Enter number of years"
                                                />
                                              </div>

                                              <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold uppercase text-gray-500">
                                                  No of Years EMI Paid
                                                </label>
                                                <input
                                                  type="number"
                                                  value={
                                                    assistanceData[rel]?.Housing
                                                      ?.emiYearsPaid || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleHousingChange(
                                                      rel,
                                                      "emiYearsPaid",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border p-2 rounded outline-none focus:border-blue-500"
                                                  placeholder="Enter number of years"
                                                />
                                              </div>
                                            </>
                                          )}

                                        {/* {isHousePurchaseSelected && (
                                          <div className="col-span-full md:col-span-2 lg:col-span-3">
                                            <label className="text-[11px] font-bold uppercase text-gray-500">
                                              Upload Agreement / Other Proofs
                                            </label>

                                            {(
                                              assistanceData[rel]?.Housing
                                                ?.supportingDocuments || []
                                            ).map((doc, index) => (
                                              <div
                                                key={index}
                                                className="flex gap-2 mt-2 items-center"
                                              >
                                                <input
                                                  type="text"
                                                  placeholder="Document Name"
                                                  value={doc.documentName || ""}
                                                  onChange={(e) =>
                                                    handleHousingDocumentChange(
                                                      rel,
                                                      index,
                                                      "documentName",
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="border p-2 rounded w-1/3"
                                                />

                                                <input
                                                  type="file"
                                                  id={`housing-file-upload-${rel}-${index}`}
                                                  multiple
                                                  className="hidden"
                                                  accept="image/*,.pdf"
                                                  onChange={(e) =>
                                                    handleHousingDocumentChange(
                                                      rel,
                                                      index,
                                                      "files",
                                                      Array.from(
                                                        e.target.files || [],
                                                      ),
                                                    )
                                                  }
                                                />

                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    document
                                                      .getElementById(
                                                        `housing-file-upload-${rel}-${index}`,
                                                      )
                                                      .click()
                                                  }
                                                  className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
                                                >
                                                  Upload
                                                </button>

                                                <div className="text-sm text-gray-500 max-w-[150px] truncate">
                                                  {doc.files?.length
                                                    ? doc.files
                                                        .map(
                                                          (file) => file.name,
                                                        )
                                                        .join(", ")
                                                    : "No file"}
                                                </div>

                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const docs =
                                                      assistanceData[rel]
                                                        ?.Housing
                                                        ?.supportingDocuments ||
                                                      [];
                                                    handleHousingChange(
                                                      rel,
                                                      "supportingDocuments",
                                                      docs.filter(
                                                        (_, i) => i !== index,
                                                      ),
                                                    );
                                                  }}
                                                  className="text-red-500 text-lg"
                                                >
                                                  x
                                                </button>
                                              </div>
                                            ))}

                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleAddHousingDocument(rel)
                                              }
                                              className="mt-3 text-white px-2 py-1 flex items-center justify-center rounded-lg bg-blue-500"
                                            >
                                              <Plus /> Document
                                            </button>
                                          </div>
                                        )} */}

                                        {isHousePurchaseSelected && (
  <div className="col-span-full md:col-span-2 lg:col-span-3">
    <label className="text-[11px] font-bold uppercase text-gray-500">
      Upload Agreement / Other Proofs
    </label>

    {(assistanceData[rel]?.Housing?.supportingDocuments || []).map(
      (doc, index) => (
        <div
          key={index}
          className="border rounded-lg p-3 mt-3 bg-gray-50"
        >
          <div className="flex flex-wrap gap-2 items-center">
            {/* Document Name */}
            <input
              type="text"
              placeholder="Document Name"
              value={doc.documentName || ""}
              onChange={(e) =>
                handleHousingDocumentChange(
                  rel,
                  index,
                  "documentName",
                  e.target.value
                )
              }
              className="border p-2 rounded flex-1 min-w-[200px]"
            />

            {/* Hidden File Input */}
            <input
              type="file"
              id={`housing-file-upload-${rel}-${index}`}
              multiple
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) =>
                handleHousingDocumentChange(
                  rel,
                  index,
                  "files",
                  Array.from(e.target.files || [])
                )
              }
            />

            {/* Upload Button */}
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById(
                    `housing-file-upload-${rel}-${index}`
                  )
                  ?.click()
              }
              className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
            >
              Upload
            </button>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => {
                const docs =
                  assistanceData[rel]?.Housing
                    ?.supportingDocuments || [];

                handleHousingChange(
                  rel,
                  "supportingDocuments",
                  docs.filter((_, i) => i !== index)
                );
              }}
              className="bg-red-500 text-white px-3 py-2 rounded"
            >
              Remove
            </button>
          </div>

          {/* Selected Files Before Save */}
          {doc.files?.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Selected Files
              </p>

              <div className="flex flex-wrap gap-2">
                {doc.files.map((file, fileIndex) => (
                  <div
                    key={fileIndex}
                    className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
                  >
                    <span className="text-sm">
                      {file.name}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          URL.createObjectURL(file),
                          "_blank"
                        )
                      }
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files From API */}
          {doc.uploadedFiles?.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Uploaded Documents
              </p>

              <div className="flex flex-wrap gap-2">
                {doc.uploadedFiles.map((file, fileIndex) => (
                  <div
                    key={fileIndex}
                    className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
                  >
                    <span className="text-sm">
                      {file.fileName}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          `https://uat.ratnakukshi.org${file.filePath}`,
                          "_blank"
                        )
                      }
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    )}

    {/* Add Document Button */}
    <button
      type="button"
      onClick={() => handleAddHousingDocument(rel)}
      className="mt-3 text-white px-3 py-2 flex items-center justify-center rounded-lg bg-blue-500"
    >
      <Plus className="mr-1" />
      Document
    </button>
  </div>
)}
                                      </div>
                                    );
                                  })()}

                                  {/* Remark Section */}
                                  <div className="mt-8 flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Remark
                                    </label>
                                    <textarea
                                      placeholder="Write here..."
                                      className="border p-2 rounded w-full h-24 outline-none focus:border-blue-500 resize-none"
                                      value={
                                        assistanceData[rel]?.Housing?.remark ||
                                        ""
                                      }
                                      onChange={(e) =>
                                        handleHousingChange(
                                          rel,
                                          "remark",
                                          e.target.value,
                                        )
                                      }
                                    ></textarea>
                                  </div>
                                   <div className="mt-6 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveAssistance(
                                        relationDetails,
                                        rel,
                                        "Housing",
                                      )
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                  >
                                    Save Housing Assistance
                                  </button>
                                </div>
                                </div>
                              )
                            }

                            {
                              // relationDetails[rel]?.assistanceCategories?.includes(
                              // "Vaiyavacch",
                              // ) &&
                              // (
                              //   relationDetails[rel]?.assistanceCategories?.includes("Vaiyavacch") ||
                              //   selectedAssistance?.includes("Vaiyavacch")
                              // ) &&

                              (relationDetails[
                                rel
                              ]?.assistanceCategories?.includes("Vaiyavacch") ||
                                Object.keys(
                                  assistanceData?.[rel] || {},
                                ).includes("Vaiyavacch") ||
                                (selectedRelation === rel &&
                                  selectedAssistance?.includes(
                                    "Vaiyavacch",
                                  ))) && (
                                <div className="p-6 border rounded-lg bg-white shadow-sm mt-5">
                                  <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                    Vaiyavacch Assistance
                                  </h3>

                                  <label className="text-[11px] font-bold uppercase text-gray-500">
                                    Remark
                                  </label>

                                  <div className="border rounded mt-2 overflow-hidden bg-white">
                                    {/* Rich Text Toolbar Mockup */}
                                    <div className="bg-gray-100 border-b p-2 flex gap-4 text-gray-600 text-sm">
                                      <button
                                        type="button"
                                        className="font-bold px-2 hover:bg-gray-200 rounded"
                                      >
                                        B
                                      </button>
                                      <button
                                        type="button"
                                        className="italic px-2 hover:bg-gray-200 rounded"
                                      >
                                        I
                                      </button>
                                      <button
                                        type="button"
                                        className="px-2 hover:bg-gray-200 rounded"
                                      >
                                        🔗
                                      </button>
                                      <button
                                        type="button"
                                        className="px-2 hover:bg-gray-200 rounded"
                                      >
                                        📋
                                      </button>
                                      <button
                                        type="button"
                                        className="px-2 hover:bg-gray-200 rounded"
                                      >
                                        🎬
                                      </button>
                                    </div>

                                    {/* Description Textarea */}
                                    <textarea
                                      className="w-full h-48 p-4 outline-none resize-none"
                                      placeholder="Enter Description"
                                      value={
                                        assistanceData[rel]?.Vaiyavacch
                                          ?.description || ""
                                      }
                                      onChange={(e) =>
                                        handleVaiyavacchChange(
                                          rel,
                                          "description",
                                          e.target.value,
                                        )
                                      }
                                    ></textarea>
                                  </div>

                                  <div className="mt-6 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveAssistance(
                                        relationDetails,
                                        rel,
                                        "Vaiyavacch",
                                      )
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                  >
                                    Save Vaiyavacch Assistance
                                  </button>
                                </div>
                                </div>
                              )
                            }

                            {
                              //   relationDetails[rel]?.assistanceCategories?.includes(
                              //   "LivelihoodExpenses ",
                              // ) &&

                              // (
                              //   relationDetails[rel]?.assistanceCategories?.includes("LivelihoodExpenses") ||
                              //   selectedAssistance?.includes("LivelihoodExpenses")
                              // ) &&

                              (relationDetails[
                                rel
                              ]?.assistanceCategories?.includes(
                                "LivelihoodExpenses",
                              ) ||
                                Object.keys(
                                  assistanceData?.[rel] || {},
                                ).includes("LivelihoodExpenses") ||
                                (selectedRelation === rel &&
                                  selectedAssistance?.includes(
                                    "LivelihoodExpenses",
                                  ))) && (
                                <div className="p-6 border rounded-lg bg-white shadow-sm mt-6">
                                  <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                    Livelihood Expenses Assistance
                                  </h3>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div>
                                      <label className="text-[11px] font-bold uppercase text-gray-500">
                                        Estimated Amount Required*
                                      </label>
                                      <input
                                        type="number"
                                        className="w-full border p-2 rounded mt-1 outline-none"
                                        value={
                                          assistanceData[rel]
                                            ?.LivelihoodExpenses?.amount || ""
                                        }
                                        onChange={(e) =>
                                          handleEmergencyChange(
                                            rel,
                                            "amount",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                   
                                  </div>

                                  <div className="mt-6">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Briefly Describe the Expenses.
                                    </label>
                                    <textarea
                                      className="w-full border p-2 rounded mt-1 h-24 outline-none resize-none"
                                      placeholder="Write here..."
                                      value={
                                        assistanceData[rel]?.LivelihoodExpenses
                                          ?.description || ""
                                      }
                                      onChange={(e) =>
                                        handleEmergencyChange(
                                          rel,
                                          "description",
                                          e.target.value,
                                        )
                                      }
                                    ></textarea>
                                  </div>

                                  {/* <div className="col-span-full mt-6">
  <label className="text-[11px] font-bold uppercase text-gray-500">
    Upload Supporting Documents
  </label>

  {(
    assistanceData[rel]?.LivelihoodExpenses
      ?.livelihoodDocuments || []
  ).map((doc, index) => (
    <div
      key={index}
      className="flex gap-2 mt-2 items-center"
    >
      <input
        type="text"
        placeholder="Document Name"
        value={doc.documentName}
        onChange={(e) =>
          handleLivelihoodDocumentChange(
            rel,
            index,
            "documentName",
            e.target.value
          )
        }
        className="border p-2 rounded w-1/3"
      />

      <input
        type="file"
        id={`livelihood-file-upload-${rel}-${index}`}
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,image/*"
        onChange={(e) => {
          const files = Array.from(e.target.files);

          handleLivelihoodDocumentChange(
            rel,
            index,
            "files",
            files
          );
        }}
      />

      <button
        type="button"
        onClick={() =>
          document
            .getElementById(
              `livelihood-file-upload-${rel}-${index}`
            )
            .click()
        }
        className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
      >
        Upload
      </button>

      <div className="text-sm text-gray-500 max-w-[150px] truncate">
        {doc.files?.length
          ? doc.files.map((f) => f.name).join(", ")
          : "No file"}
      </div>

      <button
        type="button"
        onClick={() => {
          const docs =
            assistanceData[rel]?.LivelihoodExpenses
              ?.livelihoodDocuments || [];

          handleEmergencyChange(
            rel,
            "livelihoodDocuments",
            docs.filter((_, i) => i !== index)
          );
        }}
        className="text-red-500 text-lg"
      >
        ✕
      </button>
    </div>
  ))}

  <button
    type="button"
    onClick={() => handleAddLivelihoodDocument(rel)}
    className="mt-3 text-white px-2 py-1 flex items-center justify-center rounded-lg bg-blue-500"
  >
    <Plus /> Documents
  </button>
</div> */}
<div className="col-span-full mt-6">
  <label className="text-[11px] font-bold uppercase text-gray-500">
    Upload Supporting Documents
  </label>

  {(assistanceData[rel]?.LivelihoodExpenses
    ?.livelihoodDocuments || []).map((doc, index) => (
    <div
      key={index}
      className="border rounded-lg p-3 mt-3 bg-gray-50"
    >
      <div className="flex flex-wrap gap-2 items-center">
        {/* Document Name */}
        <input
          type="text"
          placeholder="Document Name"
          value={doc.documentName || ""}
          onChange={(e) =>
            handleLivelihoodDocumentChange(
              rel,
              index,
              "documentName",
              e.target.value
            )
          }
          className="border p-2 rounded flex-1 min-w-[200px]"
        />

        {/* Hidden File Input */}
        <input
          type="file"
          id={`livelihood-file-upload-${rel}-${index}`}
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files);

            handleLivelihoodDocumentChange(
              rel,
              index,
              "files",
              files
            );
          }}
        />

        {/* Upload Button */}
        <button
          type="button"
          onClick={() =>
            document
              .getElementById(
                `livelihood-file-upload-${rel}-${index}`
              )
              ?.click()
          }
          className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
        >
          Upload
        </button>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => {
            const docs =
              assistanceData[rel]?.LivelihoodExpenses
                ?.livelihoodDocuments || [];

            handleEmergencyChange(
              rel,
              "livelihoodDocuments",
              docs.filter((_, i) => i !== index)
            );
          }}
          className="bg-red-500 text-white px-3 py-2 rounded"
        >
          Remove
        </button>
      </div>

      {/* Selected Files Before Save */}
      {doc.files?.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Selected Files
          </p>

          <div className="flex flex-wrap gap-2">
            {doc.files.map((file, fileIndex) => (
              <div
                key={fileIndex}
                className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
              >
                <span className="text-sm">
                  {file.name}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      URL.createObjectURL(file),
                      "_blank"
                    )
                  }
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files From API */}
      {doc.uploadedFiles?.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Uploaded Documents
          </p>

          <div className="flex flex-wrap gap-2">
            {doc.uploadedFiles.map((file, fileIndex) => (
              <div
                key={fileIndex}
                className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
              >
                <span className="text-sm">
                  {file.fileName}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `https://uat.ratnakukshi.org${file.filePath}`,
                      "_blank"
                    )
                  }
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ))}

  {/* Add Document Button */}
  <button
    type="button"
    onClick={() => handleAddLivelihoodDocument(rel)}
    className="mt-3 text-white px-3 py-2 flex items-center justify-center rounded-lg bg-blue-500"
  >
    <Plus className="mr-1" />
    Documents
  </button>
</div>
                                   <div className="mt-6 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveAssistance(
                                        relationDetails,
                                        rel,
                                        "LivelihoodExpenses",
                                      )
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                  >
                                    Save LivelihoodExpenses Assistance
                                  </button>
                                </div>
                                </div>
                              )
                            }

                            {(relationDetails[
                              rel
                            ]?.assistanceCategories?.includes("BusinessSupport") ||
                              Object.keys(assistanceData?.[rel] || {}).includes(
                                "BusinessSupport",
                              ) ||
                              (selectedRelation === rel &&
                                selectedAssistance?.includes("BusinessSupport"))) && (
                              <div className="p-6 border rounded-lg bg-white shadow-sm mt-6 font-sans">
                                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                  Business support Assistance
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                  {/* Type of Business Dropdown */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Type of Business?*
                                    </label>
                                    <select
                                      className="w-full border p-2 rounded mt-1 text-gray-500 outline-none focus:border-blue-500"
                                      value={
                                        assistanceData[rel]?.BusinessSupport
                                          ?.businessType || ""
                                      }
                                      onChange={(e) =>
                                        handleBusinessChange(
                                          rel,
                                          "businessType",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="">Select</option>
                                      <option value="Retail">Retail</option>
                                      <option value="Service">Service</option>
                                      <option value="Manufacturing">
                                        Manufacturing
                                      </option>
                                    </select>
                                  </div>

                                  {/* Business Duration */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Business Duration?*
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Monthly"
                                      className="w-full border p-2 rounded mt-1 outline-none focus:border-blue-500"
                                      value={
                                        assistanceData[rel]?.BusinessSupport
                                          ?.duration || ""
                                      }
                                      onChange={(e) =>
                                        handleBusinessChange(
                                          rel,
                                          "duration",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>

                                  {/* Urgency Level */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Urgency Level?*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["High", "Medium", "Low"].map(
                                        (level) => (
                                          <label
                                            key={level}
                                            className="flex items-center gap-2 text-sm text-gray-600"
                                          >
                                            <input
                                              type="radio"
                                              name={`biz-urgency-${rel}`}
                                              checked={
                                                assistanceData[rel]
                                                  ?.BusinessSupport?.urgency ===
                                                level
                                              }
                                              onChange={() =>
                                                handleBusinessChange(
                                                  rel,
                                                  "urgency",
                                                  level,
                                                )
                                              }
                                            />{" "}
                                            {level}
                                          </label>
                                        ),
                                      )}
                                    </div>
                                  </div>

                                  {/* Row 2: Income & Expenses */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Monthly Business Income*
                                    </label>
                                    <input
                                      type="number"
                                      className="w-full border p-2 rounded mt-1 outline-none focus:border-blue-500"
                                      value={
                                        assistanceData[rel]?.BusinessSupport
                                          ?.income || ""
                                      }
                                      onChange={(e) =>
                                        handleBusinessChange(
                                          rel,
                                          "income",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Monthly Business Expenses*
                                    </label>
                                    <input
                                      type="number"
                                      className="w-full border p-2 rounded mt-1 outline-none focus:border-blue-500"
                                      value={
                                        assistanceData[rel]?.BusinessSupport
                                          ?.expenses || ""
                                      }
                                      onChange={(e) =>
                                        handleBusinessChange(
                                          rel,
                                          "expenses",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>

                                  {/* Business Condition */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Business Condition*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["Profit", "Loss", "Closed"].map(
                                        (cond) => (
                                          <label
                                            key={cond}
                                            className="flex items-center gap-2 text-sm text-gray-600"
                                          >
                                            <input
                                              type="radio"
                                              name={`biz-condition-${rel}`}
                                              checked={
                                                assistanceData[rel]
                                                  ?.BusinessSupport
                                                  ?.condition === cond
                                              }
                                              onChange={() =>
                                                handleBusinessChange(
                                                  rel,
                                                  "condition",
                                                  cond,
                                                )
                                              }
                                            />{" "}
                                            {cond}
                                          </label>
                                        ),
                                      )}
                                    </div>
                                  </div>

                                  {/* Row 3: Dependents, Loans, Uploads */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Business Dependents (Count)*
                                    </label>
                                    <input
                                      type="number"
                                      className="w-full border p-2 rounded mt-1 outline-none focus:border-blue-500"
                                      value={
                                        assistanceData[rel]?.BusinessSupport
                                          ?.dependents || ""
                                      }
                                      onChange={(e) =>
                                        handleBusinessChange(
                                          rel,
                                          "dependents",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Any Business Loan?*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["Yes", "No"].map((opt) => (
                                        <label
                                          key={opt}
                                          className="flex items-center gap-2 text-sm text-gray-600"
                                        >
                                          <input
                                            type="radio"
                                            name={`biz-loan-${rel}`}
                                            checked={
                                              assistanceData[rel]
                                                ?.BusinessSupport?.hasLoan ===
                                              opt
                                            }
                                            onChange={() =>
                                              handleBusinessChange(
                                                rel,
                                                "hasLoan",
                                                opt,
                                              )
                                            }
                                          />{" "}
                                          {opt}
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Upload Documents (If Any) */}
                                  {/* <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Upload Business Documents (If Any)
                                    </label>
                                    <div className="flex border rounded mt-1 overflow-hidden">
                                      <label className="bg-gray-100 px-3 py-2 text-sm border-r cursor-pointer hover:bg-gray-200 transition">
                                        Choose File
                                        <input
                                          type="file"
                                          className="hidden"
                                          onChange={(e) =>
                                            handleBusinessChange(
                                              rel,
                                              "bizDoc",
                                              e.target.files[0],
                                            )
                                          }
                                        />
                                      </label>
                                      <span className="px-3 py-2 text-sm text-gray-400 truncate">
                                        {assistanceData[rel]?.BusinessSupport
                                          ?.bizDoc?.name || "No file chosen"}
                                      </span>
                                    </div>
                                  </div> */}

                                  {/* Row 4: Schemes & Quotations */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Any Government Scheme/Subsidy?*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["Yes", "No"].map((opt) => (
                                        <label
                                          key={opt}
                                          className="flex items-center gap-2 text-sm text-gray-600"
                                        >
                                          <input
                                            type="radio"
                                            name={`biz-scheme-${rel}`}
                                            checked={
                                              assistanceData[rel]
                                                ?.BusinessSupport?.hasScheme ===
                                              opt
                                            }
                                            onChange={() =>
                                              handleBusinessChange(
                                                rel,
                                                "hasScheme",
                                                opt,
                                              )
                                            }
                                          />{" "}
                                          {opt}
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Upload Quotation */}
                                  {/* <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Upload Quotation / Estimate
                                    </label>
                                    <div className="flex border rounded mt-1 overflow-hidden">
                                      <label className="bg-gray-100 px-3 py-2 text-sm border-r cursor-pointer hover:bg-gray-200 transition">
                                        Choose File
                                        <input
                                          type="file"
                                          className="hidden"
                                          onChange={(e) =>
                                            handleBusinessChange(
                                              rel,
                                              "quotationFile",
                                              e.target.files[0],
                                            )
                                          }
                                        />
                                      </label>
                                      <span className="px-3 py-2 text-sm text-gray-400 truncate">
                                        {assistanceData[rel]?.BusinessSupport
                                          ?.quotationFile?.name ||
                                          "No file chosen"}
                                      </span>
                                    </div>
                                  </div> */}
                                </div>
{/* <div className="col-span-full mt-2">
  <label className="text-[11px] font-bold uppercase text-gray-500">
    Upload Business Documents
  </label>

  {(assistanceData[rel]?.BusinessSupport
    ?.businessDocuments || []).map((doc, index) => (
    <div
      key={index}
      className="flex gap-2 mt-2 items-center"
    >
      <input
        type="text"
        placeholder="Document Name"
        value={doc.documentName}
        onChange={(e) =>
          handleBusinessDocumentChange(
            rel,
            index,
            "documentName",
            e.target.value
          )
        }
        className="border p-2 rounded w-1/3"
      />

      <input
        type="file"
        id={`business-file-upload-${rel}-${index}`}
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,image/*"
        onChange={(e) => {
          const files = Array.from(e.target.files);

          handleBusinessDocumentChange(
            rel,
            index,
            "files",
            files
          );
        }}
      />

      <button
        type="button"
        onClick={() =>
          document
            .getElementById(
              `business-file-upload-${rel}-${index}`
            )
            .click()
        }
        className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
      >
        Upload
      </button>

      <div className="text-sm text-gray-500 max-w-[150px] truncate">
        {doc.files?.length
          ? doc.files.map((f) => f.name).join(", ")
          : "No file"}
      </div>

      <button
        type="button"
        onClick={() => {
          const docs =
            assistanceData[rel]?.BusinessSupport
              ?.businessDocuments || [];

          handleBusinessChange(
            rel,
            "businessDocuments",
            docs.filter((_, i) => i !== index)
          );
        }}
        className="text-red-500 text-lg"
      >
        ✕
      </button>
    </div>
  ))}

  <button
    type="button"
    onClick={() => handleAddBusinessDocument(rel)}
    className="mt-3 text-white px-2 py-1 flex items-center justify-center rounded-lg bg-blue-500"
  >
    <Plus /> Documents
  </button>
</div> */}
                             
                             
                             <div className="col-span-full mt-2">
  <label className="text-[11px] font-bold uppercase text-gray-500">
    Upload Business Documents
  </label>

  {(assistanceData[rel]?.BusinessSupport
    ?.businessDocuments || []).map((doc, index) => (
    <div
      key={index}
      className="border rounded-lg p-3 mt-3 bg-gray-50"
    >
      <div className="flex flex-wrap gap-2 items-center">
        {/* Document Name */}
        <input
          type="text"
          placeholder="Document Name"
          value={doc.documentName || ""}
          onChange={(e) =>
            handleBusinessDocumentChange(
              rel,
              index,
              "documentName",
              e.target.value
            )
          }
          className="border p-2 rounded flex-1 min-w-[200px]"
        />

        {/* Hidden File Input */}
        <input
          type="file"
          id={`business-file-upload-${rel}-${index}`}
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files);

            handleBusinessDocumentChange(
              rel,
              index,
              "files",
              files
            );
          }}
        />

        {/* Upload Button */}
        <button
          type="button"
          onClick={() =>
            document
              .getElementById(
                `business-file-upload-${rel}-${index}`
              )
              ?.click()
          }
          className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
        >
          Upload
        </button>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => {
            const docs =
              assistanceData[rel]?.BusinessSupport
                ?.businessDocuments || [];

            handleBusinessChange(
              rel,
              "businessDocuments",
              docs.filter((_, i) => i !== index)
            );
          }}
          className="bg-red-500 text-white px-3 py-2 rounded"
        >
          Remove
        </button>
      </div>

      {/* Selected Files Before Save */}
      {doc.files?.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Selected Files
          </p>

          <div className="flex flex-wrap gap-2">
            {doc.files.map((file, fileIndex) => (
              <div
                key={fileIndex}
                className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
              >
                <span className="text-sm">
                  {file.name}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      URL.createObjectURL(file),
                      "_blank"
                    )
                  }
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files From API */}
      {doc.uploadedFiles?.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Uploaded Documents
          </p>

          <div className="flex flex-wrap gap-2">
            {doc.uploadedFiles.map((file, fileIndex) => (
              <div
                key={fileIndex}
                className="flex items-center gap-2 bg-white border px-2 py-1 rounded"
              >
                <span className="text-sm">
                  {file.fileName}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `https://uat.ratnakukshi.org${file.filePath}`,
                      "_blank"
                    )
                  }
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ))}

  {/* Add Document Button */}
  <button
    type="button"
    onClick={() => handleAddBusinessDocument(rel)}
    className="mt-3 text-white px-3 py-2 flex items-center justify-center rounded-lg bg-blue-500"
  >
    <Plus className="mr-1" />
    Documents
  </button>
</div>   {/* Remark Section */}
                                <div className="mt-8 flex flex-col gap-1">
                                  <label className="text-[11px] font-bold uppercase text-gray-500">
                                    Remark*
                                  </label>
                                  <textarea
                                    placeholder="Write here..."
                                    className="w-full border p-2 rounded mt-1 h-24 outline-none resize-none focus:border-blue-500"
                                    value={
                                      assistanceData[rel]?.BusinessSupport
                                        ?.remark || ""
                                    }
                                    onChange={(e) =>
                                      handleBusinessChange(
                                        rel,
                                        "remark",
                                        e.target.value,
                                      )
                                    }
                                  ></textarea>
                                </div>

                                <div className="mt-6 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveAssistance(
                                        relationDetails,
                                        rel,
                                        "BusinessSupport",
                                      )
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                  >
                                    Save Business Assistance
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {allowRelationEditing && selectedRelations.includes("Son") && (
              <button
                type="button"
                onClick={() => handleAddRelationRow("Son")}
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md mb-3 flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span> Add Son
              </button>
            )}

            {allowRelationEditing && selectedRelations.includes("Daughter") && (
              <button
                type="button"
                onClick={() => handleAddRelationRow("Daughter")}
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md mb-3 flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span> Add Daughter
              </button>
            )}

            {allowRelationEditing && selectedRelations.includes("Brother") && (
              <button
                type="button"
                onClick={() => handleAddRelationRow("Brother")}
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md mb-3 flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span> Add Brother
              </button>
            )}

            {allowRelationEditing && selectedRelations.includes("Sister") && (
              <button
                type="button"
                onClick={() => handleAddRelationRow("Sister")}
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md mb-3 flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span> Add Sister
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {formData.mediclaim && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mediclaim Type
                  </label>

                  <select
                    className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${lockInputClass(
                      isFormFieldLocked("family_mediclaim_type"),
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
                      isFormFieldLocked("Family_mediclaim_amount"),
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
                      const coverAmount =
                        Number(formData.Family_mediclaim_amount) || 0;

                      // Ensure premiumAmount is LESS than coverAmount
                      if (premiumAmount >= coverAmount) {
                        alert(
                          `Premium amount must be less than Family Mediclaim Policy Amount (₹${coverAmount})`,
                        );
                        premiumAmount = coverAmount > 0 ? coverAmount - 1 : 0; // automatically reduce by 1
                      }

                      updateFormField("mediclaimPremiumAmount", premiumAmount);
                    }}
                    readOnly={isFormFieldLocked("mediclaimPremiumAmount")}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${
                      Number(formData.mediclaimPremiumAmount || 0) >=
                        Number(formData.Family_mediclaim_amount || 0) &&
                      formData.Family_mediclaim_amount
                        ? "border-red-500 focus:ring-red-100"
                        : "border-slate-300"
                    } ${lockInputClass(isFormFieldLocked("mediclaimPremiumAmount"))}`}
                  />
                  {Number(formData.mediclaimPremiumAmount || 0) >
                    Number(formData.Family_mediclaim_amount || 0) &&
                    formData.Family_mediclaim_amount && (
                      <p className="text-red-500 text-xs mt-1">
                        Premium amount cannot exceed cover amount (₹
                        {formData.Family_mediclaim_amount})
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mediclaim Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.family_mediclaim_companyName || ""}
                    onChange={(e) =>
                      updateFormField(
                        "family_mediclaim_companyName",
                        e.target.value,
                      )
                    }
                    readOnly={isFormFieldLocked("family_mediclaim_companyName")}
                    className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${lockInputClass(
                      isFormFieldLocked("family_mediclaim_companyName"),
                    )}`}
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
                    onChange={(e) =>
                      updateFormField("sanghName", e.target.value)
                    }
                    readOnly={isFormFieldLocked("sanghName")}
                    className={`w-full p-2 border border-slate-300 rounded-md outline-none ${lockInputClass(
                      isFormFieldLocked("sanghName"),
                    )}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.ngoAmount || ""}
                    onChange={(e) =>
                      updateFormField("ngoAmount", e.target.value)
                    }
                    readOnly={isFormFieldLocked("ngoAmount")}
                    className={`w-full p-2 border border-slate-300 rounded-md outline-none ${lockInputClass(
                      isFormFieldLocked("ngoAmount"),
                    )}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Frequency
                  </label>

                  <select
                    className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${lockInputClass(
                      isFormFieldLocked("ngoFrequency"),
                    )}`}
                    value={formData.ngoFrequency || ""}
                    onChange={(e) =>
                      updateFormField("ngoFrequency", e.target.value)
                    }
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
                    onChange={(e) =>
                      updateFormField("ngoRemark", e.target.value)
                    }
                    readOnly={isFormFieldLocked("ngoRemark")}
                    className={`w-full p-2 border border-slate-300 rounded-md outline-none resize-none ${lockInputClass(
                      isFormFieldLocked("ngoRemark"),
                    )}`}
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 ">
            {mode !== "view" && (
    //           <button
    //             type="button"
    //             onClick={handleSave}
    //             disabled={loading}
    //             className={`
    //   px-4 py-2
    //   text-white
    //   font-semibold
    //   rounded-md
    //   transition-colors

    //   ${
    //     loading
    //       ? "bg-blue-400 cursor-not-allowed"
    //       : "bg-blue-500 hover:bg-blue-600"
    //   }
    // `}
    //           >
    //             Save
    //           </button>
              <>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Family_Details_Staff;
