import axios from "axios";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
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
  ngoRemark: "",
};

const FamilyDetailsForm = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const id = location?.state?.id;
  const code = location?.state?.diksharthi_code;
  const name = location?.state?.sadhu_sadhvi_name;
  const gender = location?.state?.gender;

  console.log("ID:", id);
  console.log("Code:", code);
  console.log("Name:", name);
  console.log("Gender:", gender);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
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
    "Food",
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

          if (!trimmedValue) {
            nextErrors[`mobile_${relation}`] = "Mobile number is required";
          } else if (!/^[6-9]\d{9}$/.test(trimmedValue)) {
            nextErrors[`mobile_${relation}`] =
              "Mobile number must be 10 digits and start with 6-9";
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

  const validateAadharUnique = () => {
    const aadharList = Object.values(relationDetails)
      .map(r => r?.aadharNumber)
      .filter(Boolean);

    const uniqueSet = new Set(aadharList);

    return aadharList.length === uniqueSet.size;
  };



  const handleProfileUpload = (relation, event) => {
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

  // const handleAssistanceCategory = (relation, category, isDeselect = false) => {
  //   setRelationDetails((prev) => ({
  //     ...prev,
  //     [relation]: {
  //       ...prev[relation],
  //       assistanceCategories: isDeselect
  //         ? (prev[relation]?.assistanceCategories || []).filter((c) => c !== category)
  //         : prev[relation]?.assistanceCategories.includes(category)
  //           ? prev[relation].assistanceCategories.filter((c) => c !== category)
  //           : [...(prev[relation]?.assistanceCategories || []), category],
  //     },
  //   }));

  //   setselectedAssistance((prev) =>
  //     isDeselect ? prev.filter((c) => c !== category) : prev.includes(category) ? prev : [...prev, category]
  //   );
  // };

  // const handleAssistanceCategory = (relation, category, isDeselect = false, reason = "") => {
  //   debugger
  //   setRelationDetails((prev) => ({
  //     ...prev,
  //     [relation]: {
  //       ...prev[relation],
  //       assistanceCategories: isDeselect
  //         ? (prev[relation]?.assistanceCategories || []).filter((c) => c !== category)
  //         : prev[relation]?.assistanceCategories.includes(category)
  //           ? prev[relation].assistanceCategories.filter((c) => c !== category)
  //           : [...(prev[relation]?.assistanceCategories || []), category],
  //     },
  //   }));

  //   setselectedAssistance((prev) =>
  //     isDeselect ? prev.filter((c) => c !== category) : prev.includes(category) ? prev : [...prev, category]
  //   );

  //   if (isDeselect) {
  //     // Add to deselectedAssistance with reason
  //     setDeselectedAssistance((prev) => [
  //       ...prev.filter((item) => !(item.relation === relation && item.type === category)), // remove old if exists
  //       { relation, type: category, reason },
  //     ]);
  //   } else {
  //     // Remove from deselectedAssistance if user re-selects
  //     setDeselectedAssistance((prev) =>
  //       prev.filter((item) => !(item.relation === relation && item.type === category))
  //     );
  //   }
  // };

  // const handleAssistanceCategory = (relation, category, isDeselect = false, reason = "") => {
  //   setRelationDetails((prev) => ({
  //     ...prev,
  //     [relation]: {
  //       ...prev[relation],
  //       assistanceCategories: isDeselect
  //         ? (prev[relation]?.assistanceCategories || []).filter((c) => c !== category)
  //         : prev[relation]?.assistanceCategories.includes(category)
  //           ? prev[relation].assistanceCategories.filter((c) => c !== category)
  //           : [...(prev[relation]?.assistanceCategories || []), category],
  //     },
  //   }));

  //   setselectedAssistance((prev) =>
  //     isDeselect ? prev.filter((c) => c !== category) : prev.includes(category) ? prev : [...prev, category]
  //   );

  //   if (isDeselect) {
  //     // remove from extra if user unchecks
  //     setExtraAssistance((prev) => prev.filter((c) => c !== category));

  //     setDeselectedAssistance((prev) => [
  //       ...prev.filter((item) => !(item.relation === relation && item.type === category)),
  //       { relation, type: category, reason },
  //     ]);
  //   } else {
  //     // 👉 ADD to extra ONLY if it's NOT default
  //     if (!initialAssistance.includes(category.toLowerCase())) {
  //       setExtraAssistance((prev) => [...prev, category]);
  //     }

  //     setDeselectedAssistance((prev) =>
  //       prev.filter((item) => !(item.relation === relation && item.type === category))
  //     );
  //   }
  // };
  // const handleAssistanceCategory = (relation, category, isDeselect = false, reason = "") => {
  //   const lowerCategory = category.toLowerCase();

  //   setRelationDetails((prev) => ({
  //     ...prev,
  //     [relation]: {
  //       ...prev[relation],
  //       assistanceCategories: isDeselect
  //         ? (prev[relation]?.assistanceCategories || []).filter((c) => c !== category)
  //         : prev[relation]?.assistanceCategories.includes(category)
  //           ? prev[relation].assistanceCategories.filter((c) => c !== category)
  //           : [...(prev[relation]?.assistanceCategories || []), category],
  //     },
  //   }));

  //   const isDefault = defaultAssistance.map((i) => i.toLowerCase()).includes(lowerCategory);

  //   // ✅ Only track EXTRA here
  //   if (!isDefault) {
  //     setselectedAssistance((prev) =>
  //       isDeselect
  //         ? prev.filter((c) => c !== category)
  //         : prev.includes(category)
  //           ? prev
  //           : [...prev, category]
  //     );
  //   }

  //   if (isDeselect) {
  //     setDeselectedAssistance((prev) => [
  //       ...prev.filter((item) => !(item.relation === relation && item.type === category)),
  //       { relation, type: category, reason },
  //     ]);
  //   } else {
  //     setDeselectedAssistance((prev) =>
  //       prev.filter((item) => !(item.relation === relation && item.type === category))
  //     );
  //   }
  // };
  const handleAssistanceCategory = (
    relation,
    category,
    isRemove = false,
    reason = ""
  ) => {
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

  // Initialize Medical with one empty disease entry when Medical is selected
  // if (category === "Medical" && !assistanceData[relation]?.Medical?.diseases) {
  //   setAssistanceData((prev) => ({
  //     ...prev,
  //     [relation]: {
  //       ...prev[relation],
  //       Medical: {
  //         ...prev[relation]?.Medical,
  //         diseases: [
  //           {
  //             diseaseName: "",
  //             frequency: "",
  //             sessions: "",
  //             costPerSession: "",
  //           },
  //         ],
  //       },
  //     },
  //   }));
  // }


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
  const [selectedAssistance, setselectedAssistance] = useState({});
  const [defaultAssistance, setdefaultAssisatce] = useState({});
  console.log(selectedAssistance, "selectedAssistance")
  console.log(assistanceData, "assistanceData");

  const [validationErrors, setValidationErrors] = useState({});

  // useEffect(() => {
  //   if (!id) return;

  //   const fetchFamilyDetailsById = async () => {
  //     try {
  //       // ================= PARALLEL FETCH =================
  //       const [diksharthiRes, familyRes] = await Promise.all([
  //         axios.get(`${API}/api/diksharthi/${id}`),
  //         axios.get(`${API}/api/family-details/${id}`),
  //       ]);

  //       const diksharthiData = diksharthiRes?.data?.data || {};
  //       const familyData = familyRes?.data?.data?.[0] || {};



  //       const normalizedFormData = {
  //         permanentAddress: familyData?.formData?.permanentAddress || "",
  //         currentAddress: familyData?.formData?.currentAddress || "",
  //         village: familyData?.formData?.village || "",
  //         taluka: familyData?.formData?.taluka || "",
  //         district: familyData?.formData?.district || "",
  //         state: familyData?.formData?.state || "",
  //         pinCode: familyData?.formData?.pinCode || "",

  //         houseDetails: familyData?.formData?.houseDetails || "",
  //         typeOfHouse: familyData?.formData?.typeOfHouse || "",
  //         maintenanceCost: familyData?.formData?.maintenanceCost || "",
  //         lightBillCost: familyData?.formData?.lightBillCost || "",
  //         rentCost: familyData?.formData?.rentCost || "",

  //         mediclaim: familyData?.formData?.mediclaim || null,
  //         family_mediclaim_type: familyData?.formData?.family_mediclaim_type || "",
  //         Family_mediclaim_amount: familyData?.formData?.Family_mediclaim_amount || "",
  //         mediclaimPremiumAmount: familyData?.formData?.mediclaimPremiumAmount || "",
  //         family_mediclaim_companyName: familyData?.formData?.family_mediclaim_companyName || "",

  //         ngoAssistance: familyData?.formData?.ngoAssistance || null,
  //         sanghName: familyData?.formData?.sanghName || "",
  //         ngoAmount: familyData?.formData?.ngoAmount || "",
  //         ngoRemark: familyData?.formData?.ngoRemark || "",
  //       };



  //       const apiRelations = [
  //         ...new Set(
  //           (familyData?.formData?.relations || []).map(
  //             (r) =>
  //               r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()
  //           )
  //         ),
  //       ];

  //       // ================= HEAD OF FAMILY FROM FAMILY DETAILS =================
  //       const headOfFamily = familyData?.head_of_family || null;
  //       const headOfFamilyName = familyData?.head_of_family_name || null;

  //       // ================= RELATION DETAILS FROM FAMILY DETAILS =================
  //       const apiRelationDetails = familyData?.relationDetails || familyData?.relation_details || {};

  //       const apiHead = Object.entries(familyData?.relationDetails || {})
  //         .find(([_, val]) => val?.family_head)?.[0] || null;

  //       const relationDetailsData = familyData?.relationDetails || {};

  //       // const relationDetailsData = Array.isArray(apiRelations)
  //       //   ? Object.fromEntries(
  //       //     apiRelations.map((rel) => [
  //       //       rel,
  //       //       apiRelationDetails[rel] || {
  //       //         relationName: rel,
  //       //         firstName: "",
  //       //         lastName: "",
  //       //         aadharNumber: "",
  //       //         panNumber: "",
  //       //         photo: null,
  //       //         photoPreview: "",
  //       //         ayushman: null,
  //       //         mediclaim: null,
  //       //         needAssistance: null,
  //       //         assistanceCategories: [],
  //       //         isMarried: null,
  //       //       },
  //       //     ])
  //       //   )
  //       //   : apiRelationDetails;

  //       // ================= ASSISTANCE DATA FROM FAMILY DETAILS =================
  //       // const apiAssistanceData = familyData?.assistanceData || familyData?.assistance_data || {};
  //       const apiAssistanceData = familyData?.assistanceData || {};
  //       // ================= EXPAND ALL =================
  //       const expanded = {};
  //       apiRelations.forEach((rel) => {
  //         expanded[rel] = true;
  //       });

  //       // ================= SET STATE =================
  //       // setFormData((prev) => ({
  //       //   ...prev,
  //       //   ...normalizedFormData,
  //       //   relations: apiRelations,
  //       // }));

  //       // setRelationDetails(relationDetailsData);
  //       // setExpandedRelations(expanded);
  //       // setHeadOfFamily(headOfFamily);
  //       // setAssistanceData(apiAssistanceData);
  //       // setAdditionalRelations({});
  //       // setFamilyRecordId(familyData?.id ?? null);

  //       setFormData((prev) => ({
  //         ...prev,
  //         ...normalizedFormData,
  //         relations: apiRelations,
  //       }));

  //       setRelationDetails(relationDetailsData);
  //       setHeadOfFamily(apiHead);
  //       setAssistanceData(apiAssistanceData);

  //     } catch (error) {
  //       console.error("Error fetching family details:", error);
  //     }
  //   };

  //   fetchFamilyDetailsById();
  // }, [id]);

  // useEffect(() => {
  //   if (!id) return;

  //   const fetchFamilyDetailsById = async () => {
  //     try {
  //       const [diksharthiRes, familyRes] = await Promise.all([
  //         axios.get(`${API}/api/diksharthi/${id}`),
  //         axios.get(`${API}/api/family-details/${id}`),
  //       ]);

  //       const diksharthiData = diksharthiRes?.data?.data || {};
  //       const familyData = familyRes?.data?.data?.[0] || {};

  //       // ================= FORM DATA =================
  //       const normalizedFormData = {
  //         permanentAddress: familyData?.formData?.permanentAddress || "",
  //         currentAddress: familyData?.formData?.currentAddress || "",
  //         village: familyData?.formData?.village || "",
  //         taluka: familyData?.formData?.taluka || "",
  //         district: familyData?.formData?.district || "",
  //         state: familyData?.formData?.state || "",
  //         pinCode: familyData?.formData?.pinCode || "",

  //         houseDetails: familyData?.formData?.houseDetails || "",
  //         typeOfHouse: familyData?.formData?.typeOfHouse || "",
  //         maintenanceCost: familyData?.formData?.maintenanceCost || "",
  //         lightBillCost: familyData?.formData?.lightBillCost || "",
  //         rentCost: familyData?.formData?.rentCost || "",

  //         mediclaim: familyData?.formData?.mediclaim || null,
  //         family_mediclaim_type: familyData?.formData?.family_mediclaim_type || "",
  //         Family_mediclaim_amount: familyData?.formData?.Family_mediclaim_amount || "",
  //         mediclaimPremiumAmount: familyData?.formData?.mediclaimPremiumAmount || "",
  //         family_mediclaim_companyName:
  //           familyData?.formData?.family_mediclaim_companyName || "",

  //         ngoAssistance: familyData?.formData?.ngoAssistance || null,
  //         sanghName: familyData?.formData?.sanghName || "",
  //         ngoAmount: familyData?.formData?.ngoAmount || "",
  //         ngoRemark: familyData?.formData?.ngoRemark || "",
  //       };

  //       // ================= RELATIONS =================
  //       const apiRelations = [
  //         ...new Set(
  //           (familyData?.formData?.relations || []).map(
  //             (r) =>
  //               r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()
  //           )
  //         ),
  //       ];

  //       // ================= RELATION DETAILS =================
  //       const relationDetailsRaw = familyData?.relationDetails ?? {};
  //       const relationFromApi = familyData?.relation?.toLowerCase() || null;

  //       setSelectedRelation(relationFromApi);
  //       const normalizedRelationDetails = {};

  //       Object.keys(relationDetailsRaw).forEach((key) => {
  //         const formattedKey =
  //           key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();

  //         normalizedRelationDetails[formattedKey] = {
  //           relationName: formattedKey,
  //           firstName: relationDetailsRaw[key]?.firstName || "",
  //           lastName: relationDetailsRaw[key]?.lastName || "",
  //           aadharNumber: relationDetailsRaw[key]?.aadharNumber || "",
  //           panNumber: relationDetailsRaw[key]?.panNumber || "",
  //           photo: relationDetailsRaw[key]?.photo || "",
  //           ayushman: relationDetailsRaw[key]?.ayushman || null,
  //           mediclaim: relationDetailsRaw[key]?.mediclaim || null,
  //           needAssistance: relationDetailsRaw[key]?.needAssistance || null,
  //           family_head: relationDetailsRaw[key]?.family_head || false,
  //           assistanceCategories:
  //             relationDetailsRaw[key]?.assistanceCategories || [],
  //         };
  //       });

  //       // ================= FIND HEAD =================
  //       const apiHead =
  //         Object.entries(normalizedRelationDetails).find(
  //           ([_, val]) => val?.family_head
  //         )?.[0] || null;

  //       // ================= ASSISTANCE DATA =================
  //       const assistanceRaw = familyData?.assistanceData ?? {};
  //       const Selecetdassistance = familyData?.assistance ?? {};


  //       const normalizedAssistanceData = {};

  //       Object.keys(assistanceRaw).forEach((key) => {
  //         const formattedKey =
  //           key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();

  //         normalizedAssistanceData[formattedKey] = assistanceRaw[key];
  //       });

  //       // ================= EXPAND =================
  //       // const expanded = {};
  //       // apiRelations.forEach((rel) => {
  //       //   expanded[rel] = true;
  //       // });
  //       const relationFromApiRaw = familyData?.relation || null;

  //       const formattedRelation = relationFromApiRaw
  //         ? relationFromApiRaw.charAt(0).toUpperCase() +
  //         relationFromApiRaw.slice(1).toLowerCase()
  //         : null;
  //       const expanded = {};

  //       if (formattedRelation) {
  //         expanded[formattedRelation] = true;
  //       }

  //       // ================= SET STATE =================
  //       setFormData((prev) => ({
  //         ...prev,
  //         ...normalizedFormData,
  //         relations: apiRelations,
  //       }));

  //       setRelationDetails(normalizedRelationDetails);
  //       setHeadOfFamily(apiHead);
  //       setAssistanceData(normalizedAssistanceData);
  //       setselectedAssistance(Selecetdassistance)
  //       setExpandedRelations(expanded);
  //       setFamilyRecordId(familyData?.id ?? null);

  //       // ================= DEBUG =================
  //       console.log("FINAL relationDetails:", normalizedRelationDetails);
  //       console.log("FINAL assistanceData:", normalizedAssistanceData);

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
          axios.get(`${API}/api/family-details/${id}`),
        ]);

        const diksharthiData = diksharthiRes?.data?.data || {};
        const familyData = familyRes?.data?.data?.[0] || {};

        // ================= FORM DATA =================
        const normalizedFormData = {
          permanentAddress: familyData?.formData?.permanentAddress || "",
          currentAddress: familyData?.formData?.currentAddress || "",
          village: familyData?.formData?.village || "",
          taluka: familyData?.formData?.taluka || "",
          district: familyData?.formData?.district || "",
          state: familyData?.formData?.state || "",
          pinCode: familyData?.formData?.pinCode || "",

          houseDetails: familyData?.formData?.houseDetails || "",
          typeOfHouse: familyData?.formData?.typeOfHouse || "",
          maintenanceCost: familyData?.formData?.maintenanceCost || "",
          lightBillCost: familyData?.formData?.lightBillCost || "",
          rentCost: familyData?.formData?.rentCost || "",

          mediclaim: familyData?.formData?.mediclaim || null,
          family_mediclaim_type: familyData?.formData?.family_mediclaim_type || "",
          Family_mediclaim_amount: familyData?.formData?.Family_mediclaim_amount || "",
          mediclaimPremiumAmount: familyData?.formData?.mediclaimPremiumAmount || "",
          family_mediclaim_companyName:
            familyData?.formData?.family_mediclaim_companyName || "",

          ngoAssistance: familyData?.formData?.ngoAssistance || null,
          sanghName: familyData?.formData?.sanghName || "",
          ngoAmount: familyData?.formData?.ngoAmount || "",
          ngoRemark: familyData?.formData?.ngoRemark || "",
        };

        // ================= RELATIONS FROM API =================
        const apiRelations = [
          ...new Set(
            (familyData?.formData?.relations || []).map(
              (r) => r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()
            )
          ),
        ];

        // ================= SELECTED RELATION =================
        const relationFromApiRaw = familyData?.relation || null;
        const formattedRelation = relationFromApiRaw
          ? relationFromApiRaw.charAt(0).toUpperCase() + relationFromApiRaw.slice(1).toLowerCase()
          : null;

        // ================= FINAL RELATIONS ARRAY =================
        const finalRelations = formattedRelation
          ? Array.from(new Set([...apiRelations, formattedRelation])) // merge default relation
          : apiRelations;

        // ================= RELATION DETAILS =================
        const relationDetailsRaw = familyData?.relationDetails ?? {};
        const normalizedRelationDetails = {};

        Object.keys(relationDetailsRaw).forEach((key) => {
          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
          const dobValue =
            relationDetailsRaw[key]?.dob ||
            relationDetailsRaw[key]?.dateOfBirth ||
            "";
          const derivedAge = calculateAgeFromDob(dobValue);
          normalizedRelationDetails[formattedKey] = {
            relationName: formattedKey,
            firstName: relationDetailsRaw[key]?.firstName || "",
            lastName: relationDetailsRaw[key]?.lastName || "",
            dob: dobValue,
            age:
              relationDetailsRaw[key]?.age !== undefined &&
              relationDetailsRaw[key]?.age !== null &&
              relationDetailsRaw[key]?.age !== ""
                ? relationDetailsRaw[key]?.age
                : derivedAge,
            guardian:
              relationDetailsRaw[key]?.guardian ||
              relationDetailsRaw[key]?.guardianName ||
              "",
            aadharNumber: relationDetailsRaw[key]?.aadharNumber || "",
            mobileNumber:
              relationDetailsRaw[key]?.mobileNumber ||
              relationDetailsRaw[key]?.mobile_no ||
              "",
            panNumber: relationDetailsRaw[key]?.panNumber || "",
            photo: relationDetailsRaw[key]?.photo || "",
            ayushman: relationDetailsRaw[key]?.ayushman || null,
            mediclaim: relationDetailsRaw[key]?.mediclaim || null,
            ayushman_Amount: relationDetailsRaw[key]?.amount || null,
            mediclaim_amount: relationDetailsRaw[key]?.mediclaimAmount || null,
            member_mediclaim_premium_amount: relationDetailsRaw[key]?.mediclaimPremiumAmount || null,
            mediclaim_company_name: relationDetailsRaw[key]?.mediclaimCompanyName || null,
            mediclaim_type: relationDetailsRaw[key]?.mediclaim_type || null,
            // "mediclaimAmount": "1500",
            // "mediclaimCompanyName": "uyhgtfd",
            // "mediclaimPremiumAmount": "1000",

            needAssistance: relationDetailsRaw[key]?.needAssistance || null,
            family_head: relationDetailsRaw[key]?.family_head || false,
            assistanceCategories: relationDetailsRaw[key]?.assistanceCategories || [],
          };
        });

        // ================= HEAD OF FAMILY =================
        const apiHead =
          Object.entries(normalizedRelationDetails).find(([_, val]) => val?.family_head)?.[0] || null;

        // ================= ASSISTANCE DATA =================
        const assistanceRaw = familyData?.assistanceData ?? {};
        const selectedAssistance = familyData?.assistance ?? {};

        const normalizedAssistanceData = {};
        Object.keys(assistanceRaw).forEach((key) => {
          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
          normalizedAssistanceData[formattedKey] = assistanceRaw[key];
        });

        // ================= EXPAND RELATIONS =================
        const expanded = {};
        if (formattedRelation) {
          expanded[formattedRelation] = true;
        }

        // ================= SET STATE =================
        setFormData((prev) => ({
          ...prev,
          ...normalizedFormData,
          relations: finalRelations,
        }));

        setRelationDetails(normalizedRelationDetails);
        setHeadOfFamily(apiHead);
        setAssistanceData(normalizedAssistanceData);
        setselectedAssistance(selectedAssistance);
        setdefaultAssisatce(selectedAssistance)
        setSelectedRelation(formattedRelation); // default selected
        setExpandedRelations(expanded);
        setFamilyRecordId(familyData?.id ?? null);

        // ================= DEBUG =================
        console.log("FINAL relationDetails:", normalizedRelationDetails);
        console.log("FINAL assistanceData:", normalizedAssistanceData);
        console.log("FINAL relations (formData):", finalRelations);
        console.log("Selected Relation:", formattedRelation);
        console.log("Expanded Relations:", expanded);

      } catch (error) {
        console.error("Error fetching family details:", error);
      }
    };

    fetchFamilyDetailsById();
  }, [id]);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);

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

        // Validate Mobile Number
        if (!details?.mobileNumber) {
          errors[`mobile_${rel}`] = "Mobile number is required";
        } else if (!/^[6-9]\d{9}$/.test(details.mobileNumber)) {
          errors[`mobile_${rel}`] =
            "Mobile number must be 10 digits and start with 6-9";
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
  const handleRentChange = (relation, field, value) => {
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
        {/* Header */}
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
          {/* Address Row */}

          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <h2 className="text-sx font-bold">Family Address Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Permanent Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Permanent Address <span className="text-red-500">*</span>
                </label>
              </div>

              <input
                type="text"
                value={formData.permanentAddress}
                readOnly
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Current Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  Current Address <span className="text-red-500">*</span>
                </label>
              </div>
              <input
                type="text"
                value={formData.currentAddress}
                readOnly
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          {/* Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                State<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.state}
                readOnly
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                District / City<span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={formData.district}
                readOnly
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Taluka
              </label>
              <input
                type="text"
                value={formData.taluka}
                readOnly
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
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
                readOnly
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />


            </div>

            {/* 1. Pin Code */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pin Code<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.pinCode}
                readOnly
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>



          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <h2 className="text-sx font-bold">Family House Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">


            {/* 2. House Details (Radio) */}
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
                    onChange={(e) => setFormData({ ...formData, houseDetails: e.target.value, rentCost: "" })}
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
                    onChange={(e) => setFormData({ ...formData, houseDetails: e.target.value, maintenanceCost: "" })}
                    className="w-4 h-4 text-blue-600"
                  />
                  Rented
                </label>
              </div>
            </div>

            {/* 3. Type Of House */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type Of House
              </label>
              <input
                type="text"
                placeholder="e.g. Apartment, Villa"
                value={formData.typeOfHouse}
                onChange={(e) => setFormData({ ...formData, typeOfHouse: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-md outline-none"
              />
            </div>

            {/* 4. Conditional Cost Field */}
            <div>
              {formData.houseDetails === "own" ? (
                <>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Maintenance Cost (Monthly)
                  </label>
                  <input
                    type="number"
                    value={formData.maintenanceCost}
                    onChange={(e) => setFormData({ ...formData, maintenanceCost: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none"
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
                    onChange={(e) => setFormData({ ...formData, rentCost: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none"
                  />
                </>
              ) : (
                /* Placeholder to keep grid alignment when nothing is selected */
                <div className="h-[62px]"></div>
              )}
            </div>

            {/* 5. Light Bill */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Light Bill Cost
              </label>
              <input
                type="number"
                value={formData.lightBillCost}
                onChange={(e) => setFormData({ ...formData, lightBillCost: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
          </div>

          {/* Relations Section */}
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
                    className="w-5 h-5 border-slate-400 rounded"
                  />
                  <span>{rel}</span>
                </label>
              ))}
            </div>

            {/* Relation Details Accordions */}
            {selectedRelations.map((rel) => {
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
                          <div className={`mb-4 p-3 w-[180px] rounded-md ${headOfFamily !== null && headOfFamily !== rel
                            ? "bg-gray-100 opacity-50"
                            : "bg-blue-50"
                            }`}>
                            <label className={`flex items-center gap-2 ${headOfFamily !== null && headOfFamily !== rel
                              ? "cursor-not-allowed"
                              : "cursor-pointer"
                              }`}>
                              <input
                                type="radio"
                                name="headOfFamily"
                                checked={headOfFamily === rel}
                                onChange={() => handleHeadOfFamilyChange(rel)}
                                disabled={headOfFamily !== null && headOfFamily !== rel}
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
                                  value={relationDetails[rel]?.relationName || ""}
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
                                      checked={relationDetails[rel]?.isMarried === true}
                                      onChange={() =>
                                        handleRelationDetailChange(rel, "isMarried", true)
                                      }
                                    />
                                    Yes
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`isMarried-${rel}`}
                                      checked={relationDetails[rel]?.isMarried === false}
                                      onChange={() =>
                                        handleRelationDetailChange(rel, "isMarried", false)
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
                          <div className="w-[200px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              First Name<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={relationDetails[rel]?.firstName || ""}
                              // onChange={(e) =>
                              //   handleRelationDetailChange(
                              //     rel,
                              //     "firstName",
                              //     e.target.value,
                              //   )
                              // }
                              onChange={(e) => {
                                const value = e.target.value;

                                if (/^[A-Za-z]*$/.test(value)) {
                                  handleRelationDetailChange(rel, "firstName", value);
                                }
                              }}
                              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                          </div>
                          <div className="w-[200px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Last Name<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={relationDetails[rel]?.lastName || ""}
                              // onChange={(e) =>
                              //   handleRelationDetailChange(
                              //     rel,
                              //     "lastName",
                              //     e.target.value,
                              //   )
                              // }
                              onChange={(e) => {
                                const value = e.target.value;

                                // Allow only alphabets (A–Z, a–z)
                                if (/^[A-Za-z]*$/.test(value)) {
                                  handleRelationDetailChange(rel, "lastName", value);
                                }
                              }}
                              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                          </div>

                          {/* Aadhar Number */}
                          <div className="w-[250px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Mobile Number
                              
                            </label>

                            <input
                              type="text"
                              value={relationDetails[rel]?.mobileNumber || ""}
                              maxLength={10}
                              onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(/\D/g, "");
                                handleRelationDetailChange(rel, "mobileNumber", onlyNumbers);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-md"
                            />
                            {validationErrors[`mobile_${rel}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors[`mobile_${rel}`]}
                              </p>
                            )}
                          </div>
                          <div className="w-[250px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Aadhar Number
                              <span className="text-red-500">*</span>
                            </label>

                            <input
                              type="text"
                              value={relationDetails[rel]?.aadharNumber || ""}
                              maxLength={12}
                              onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(/\D/g, "");
                                handleRelationDetailChange(rel, "aadharNumber", onlyNumbers);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                            {validationErrors[`aadhar_${rel}`] && (
                              <p className="text-red-500 text-xs mt-1">{validationErrors[`aadhar_${rel}`]}</p>
                            )}
                          </div>

                          {/* Pan Number */}
                          <div className="w-[200px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Pan Number
                            </label>
                            <input
                              type="text"
                              value={relationDetails[rel]?.panNumber || ""}
                              maxLength={10}
                              onChange={(e) => {
                                const value = e.target.value
                                  .toUpperCase()                 // convert to uppercase
                                  .replace(/[^A-Z0-9]/g, "");    // allow only A-Z and 0-9

                                handleRelationDetailChange(rel, "panNumber", value);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                            {validationErrors[`pan_${rel}`] && (
                              <p className="text-red-500 text-xs mt-1">{validationErrors[`pan_${rel}`]}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-4 mt-4">
                          <div className="w-[200px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              DOB
                            </label>
                            <input
                              type="date"
                              value={relationDetails[rel]?.dob || ""}
                              max={new Date().toISOString().split("T")[0]}
                              onChange={(e) =>
                                handleRelationDetailChange(rel, "dob", e.target.value)
                              }
                              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                          </div>

                          <div className="w-[120px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Age
                            </label>
                            <input
                              type="text"
                              value={relationDetails[rel]?.age ?? ""}
                              readOnly
                              className="w-full p-2 border border-slate-300 rounded-md bg-gray-50 text-slate-600"
                            />
                          </div>

                          {showGuardianDropdown && (
                            <div className="w-[200px]">
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Guardian
                              </label>
                              <select
                                value={relationDetails[rel]?.guardian || ""}
                                onChange={(e) =>
                                  handleRelationDetailChange(rel, "guardian", e.target.value)
                                }
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
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
                                  name={`ayushman-${rel}`}
                                  value="true"
                                  checked={String(relationDetails?.[rel]?.ayushman) === "true"}
                                  onChange={() =>
                                    handleRelationDetailChange(rel, "ayushman", true)
                                  }
                                />
                                Yes
                              </label>

                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`ayushman-${rel}`}
                                  value="false"
                                  checked={String(relationDetails?.[rel]?.ayushman) === "false"}
                                  onChange={() =>
                                    handleRelationDetailChange(rel, "ayushman", false)
                                  }
                                />
                                No
                              </label>
                            </div>
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
                                  name={`mediclaim-${rel}`}
                                  checked={
                                    relationDetails[rel]?.mediclaim === true
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
                                  name={`mediclaim-${rel}`}
                                  checked={
                                    relationDetails[rel]?.mediclaim === false
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
                          </div>

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
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`needAssistance-${rel}`}
                                      checked={
                                        relationDetails[rel]?.needAssistance ===
                                        true
                                      }
                                      onChange={() =>
                                        handleRelationDetailChange(
                                          rel,
                                          "needAssistance",
                                          true,
                                        )
                                      }
                                    />
                                    Yes
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`needAssistance-${rel}`}
                                      checked={
                                        relationDetails[rel]?.needAssistance ===
                                        false
                                      }
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
                              </div>
                            )}
                        </div>
                        {/* Amount - Conditional Render */}
                        <div className="flex gap-5">
                          {relationDetails[rel]?.ayushman === true && (
                            <div className="w-[200px] mt-4">
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Ayushman Amount
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                value={
                                  relationDetails[rel]?.ayushman_Amount || ""
                                }
                                onChange={(e) =>
                                  handleRelationDetailChange(
                                    rel,
                                    "ayushman_Amount",
                                    e.target.value,
                                  )
                                }
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                              />
                            </div>
                          )}
                          {relationDetails[rel]?.mediclaim === true && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="w-[200px]">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Mediclaim Amount
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={
                                    relationDetails[rel]?.mediclaim_amount || ""
                                  }
                                  onChange={(e) =>
                                    handleRelationDetailChange(
                                      rel,
                                      "mediclaim_amount",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                              </div>
                              <div className="w-[200px]">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Yearly Premium Amount
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={
                                    relationDetails[rel]?.member_mediclaim_premium_amount || ""
                                  }
                                  onChange={(e) => {
                                    const premium = Number(e.target.value);
                                    const mediclaim = Number(
                                      relationDetails[rel]?.mediclaim_amount
                                    );

                                    // Prevent equal OR greater
                                    if (premium >= mediclaim) {
                                      alert("Yearly premium must be less than mediclaim amount");
                                      return;
                                    }

                                    handleRelationDetailChange(
                                      rel,
                                      "member_mediclaim_premium_amount",
                                      e.target.value
                                    );
                                  }}
                                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                              </div>
                              <div className="w-[200px]">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Mediclaim Compnay Name
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={
                                    relationDetails[rel]?.mediclaim_company_name || ""
                                  }
                                  onChange={(e) =>
                                    handleRelationDetailChange(
                                      rel,
                                      "mediclaim_company_name",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                              </div>
                              <div className="w-[200px]">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Mediclaim Type
                                  <span className="text-red-500">*</span>
                                </label>
                                <select
                                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                                  value={
                                    relationDetails[rel]?.mediclaim_type || ""
                                  }
                                  onChange={(e) =>
                                    handleRelationDetailChange(
                                      rel,
                                      "mediclaim_type",
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
                        {relationDetails[rel]?.needAssistance === true && (
                          <div className="w-full mt-6">
                            <p className="text-sm font-medium text-slate-700 mb-3">
                              Assistances<span className="text-red-500">*</span>
                            </p>
                            <div className="flex flex-wrap gap-4">
                              {/* {assistanceTypes.map((type) => (
                                <label
                                  key={type}
                                  className="flex items-center gap-2 text-slate-700 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      relationDetails[
                                        rel
                                      ]?.assistanceCategories?.includes(type) ||
                                      false
                                    }
                                    onChange={() =>
                                      handleAssistanceCategory(rel, type)
                                    }
                                    className="w-4 h-4 border-slate-400 rounded"
                                  />
                                  <span>{type}</span>
                                </label>
                              ))} */}

                              {/* {assistanceTypes.map((type) => {
                                const selectedCategories = (
                                  relationDetails[rel]?.assistanceCategories || []
                                ).map((item) => item.toLowerCase());

                                const defaultAssist = (selectedAssistance || []).map((item) =>
                                  item.toLowerCase()
                                );

                                // ✅ FIX: normalize case
                                const isSameRelation =
                                  rel?.toLowerCase() === selectedRelation?.toLowerCase();

                                const isChecked =
                                  selectedCategories.includes(type.toLowerCase()) || // saved data
                                  (isSameRelation && defaultAssist.includes(type.toLowerCase())); // default only for selected

                                return (
                                  <label
                                    key={type}
                                    className="flex items-center gap-2 text-slate-700 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleAssistanceCategory(rel, type)}
                                      className="w-4 h-4 border-slate-400 rounded"
                                    />
                                    <span>{type}</span>
                                  </label>
                                );
                              })} */}

                              {/* {assistanceTypes.map((type) => {
                                const lowerType = type.toLowerCase();

                                const selectedCategories =
                                  relationDetails[rel]?.assistanceCategories || [];

                                const normalizedSelected = selectedCategories.map((i) =>
                                  i.toLowerCase()
                                );

                                const defaultAssist = (defaultAssistance || []).map((i) =>
                                  i.toLowerCase()
                                );

                                const extraAssist = (selectedAssistance || []).map((i) =>
                                  i.toLowerCase()
                                );

                                const isSameRelation =
                                  rel?.toLowerCase() === selectedRelation?.toLowerCase();

                                // ✅ FINAL CHECK (IMPORTANT FIX)
                                const isChecked =
                                  normalizedSelected.includes(lowerType) ||
                                  (isSameRelation &&
                                    (defaultAssist.includes(lowerType) ||
                                      extraAssist.includes(lowerType)) &&
                                    !deselectedAssistance?.some(
                                      (d) =>
                                        d.relation === rel &&
                                        d.type.toLowerCase() === lowerType
                                    ));

                                const handleCheckboxChange = (checked) => {
                                  const isDefault = defaultAssist.includes(lowerType);

                                  if (!checked && isSameRelation && isDefault) {
                                    // 🚨 open modal
                                    setDeselectData({ rel, type, reason: "" });
                                  } else {
                                    handleAssistanceCategory(rel, type, checked === true ? false : true);
                                  }
                                };

                                return (
                                  <label
                                    key={type}
                                    className="flex items-center gap-2 text-slate-700 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) =>
                                        handleCheckboxChange(e.target.checked)
                                      }
                                      className="w-4 h-4 border-slate-400 rounded"
                                    />
                                    <span>{type}</span>
                                  </label>
                                );
                              })} */}

                              {assistanceTypes.map((type) => {
                                const lowerType = type.toLowerCase();

                                // ✅ 1. Selected categories (state)
                                const selectedCategories =
                                  relationDetails[rel]?.assistanceCategories || [];

                                const normalizedSelected = selectedCategories.map((i) =>
                                  i.toLowerCase()
                                );

                                // ✅ 2. API data
                                const relationKey =
                                  assistanceData?.[rel]
                                    ? rel
                                    : rel?.toLowerCase();

                                const assistanceFromAPI = Object.keys(
                                  assistanceData?.[relationKey] || {}
                                ).map((i) => i.toLowerCase());

                                // ✅ 3. Default + Extra
                                const defaultAssist = (defaultAssistance || []).map((i) =>
                                  i.toLowerCase()
                                );

                                const extraAssist = (selectedAssistance || []).map((i) =>
                                  i.toLowerCase()
                                );

                                const isSameRelation =
                                  rel?.toLowerCase() === selectedRelation?.toLowerCase();

                                // ✅ 4. Manual deselection (MOST IMPORTANT)
                                const isManuallyRemoved = deselectedAssistance?.some(
                                  (d) =>
                                    d.relation === rel &&
                                    d.type.toLowerCase() === lowerType
                                );

                                // ✅ 5. FINAL CHECK LOGIC (FIXED PRIORITY)
                                const isChecked =
                                  !isManuallyRemoved && (
                                    normalizedSelected.includes(lowerType) || // state
                                    assistanceFromAPI.includes(lowerType) || // API
                                    (isSameRelation &&
                                      (defaultAssist.includes(lowerType) ||
                                        extraAssist.includes(lowerType)))
                                  );

                                // ✅ 6. HANDLE CHANGE (CLEAN)
                                const handleCheckboxChange = (checked) => {
                                  const isDefault = defaultAssist.includes(lowerType);

                                  if (!checked && isSameRelation && isDefault) {
                                    // 🚨 open modal for default
                                    setDeselectData({ rel, type, reason: "" });
                                  } else {
                                    handleAssistanceCategory(rel, type, !checked);
                                  }
                                };

                                return (
                                  <label
                                    key={type}
                                    className="flex items-center gap-2 text-slate-700 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) =>
                                        handleCheckboxChange(e.target.checked)
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
                                    <button onClick={() => setDeselectData(null)}>✕</button>
                                  </div>

                                  <p><b>Relation:</b> {deselectData.rel}</p>
                                  <p><b>Assistance:</b> {deselectData.type}</p>

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
                                    <button onClick={() => setDeselectData(null)}>
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
                                          deselectData.reason
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
                            {

                              //   relationDetails[
                              //   rel
                              // ]?.assistanceCategories?.includes("Medical") &&
                              (relationDetails[rel]?.assistanceCategories?.includes("Medical") ||
                                (selectedRelation === rel && selectedAssistance?.includes("Medical"))) &&
                              (
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
                                        <option value="Surgery">Surgery</option>
                                        <option value="Medicine">Medicine</option>
                                        <option value="Therapy">Therapy</option>
                                      </select>
                                    </div>

                                    <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
                                      <label className="text-[11px] font-bold uppercase text-gray-500">
                                        Disease / Condition Name*
                                      </label>

                                      {(
                                        assistanceData[rel]?.Medical?.diseases?.length
                                          ? assistanceData[rel]?.Medical?.diseases
                                          : [{ diseaseName: assistanceData[rel]?.Medical?.diseaseName || "" }]
                                      ).map(
                                        (diseaseItem, diseaseIndex) => (
                                          <div key={`${rel}-disease-${diseaseIndex}`} className="flex gap-2 items-center">
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
                                            {(assistanceData[rel]?.Medical?.diseases?.length || 1) > 1 && (
                                              <button
                                                type="button"
                                                className="px-3 py-2 rounded bg-red-100 text-red-700 text-sm"
                                                onClick={() => {
                                                  const filteredDiseases = (
                                                    assistanceData[rel]?.Medical?.diseases || []
                                                  ).filter((_, idx) => idx !== diseaseIndex);
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
                                        ),
                                      )}

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
                                        Estimated Medical Expense*
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

                                    {assistanceData[rel]?.Medical?.repeatedAssistance && (
                                      <div className="col-span-full md:col-span-3">
                                        <div className="space-y-3">
                                          {(assistanceData[rel]?.Medical?.diseases || []).map(
                                            (diseaseItem, diseaseIndex) => (
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
                                                      Treatment Frequency*
                                                    </label>
                                                    <select
                                                      className="border p-2 rounded bg-white outline-none focus:border-blue-500"
                                                      value={diseaseItem?.frequency || ""}
                                                      onChange={(e) =>
                                                        handleDiseaseChange(
                                                          rel,
                                                          diseaseIndex,
                                                          "frequency",
                                                          e.target.value,
                                                        )
                                                      }
                                                    >
                                                      <option value="">Select</option>
                                                      <option value="Daily">Daily</option>
                                                      <option value="Alternate Days">Alternate Days</option>
                                                      <option value="Weekly">Weekly</option>
                                                      <option value="Bi-Weekly">Bi-Weekly</option>
                                                      <option value="Monthly">Monthly</option>
                                                      <option value="Quarterly">Quarterly</option>
                                                      <option value="Yearly">Yearly</option>
                                                    </select>
                                                  </div>

                                                  <div className="flex flex-col gap-1">
                                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                                      Estimated Cost Per Session*
                                                    </label>
                                                    <input
                                                      type="number"
                                                      value={diseaseItem?.costPerSession || ""}
                                                      onChange={(e) =>
                                                        handleDiseaseChange(
                                                          rel,
                                                          diseaseIndex,
                                                          "costPerSession",
                                                          e.target.value,
                                                        )
                                                      }
                                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                                    />
                                                  </div>

                                                  <div className="flex flex-col gap-1">
                                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                                      Expected Number of Sessions*
                                                    </label>
                                                    <input
                                                      type="number"
                                                      value={diseaseItem?.sessionsCount || ""}
                                                      onChange={(e) =>
                                                        handleDiseaseChange(
                                                          rel,
                                                          diseaseIndex,
                                                          "sessionsCount",
                                                          e.target.value,
                                                        )
                                                      }
                                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                                    />
                                                  </div>

                                                  <div className="flex flex-col gap-1">
                                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                                      Calculated Total
                                                    </label>
                                                    <input
                                                      type="number"
                                                      readOnly
                                                      value={diseaseItem?.totalEstimatedCost || ""}
                                                      className="border p-2 rounded bg-gray-100 text-gray-600 outline-none"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            ),
                                          )}

                                          <div className="flex flex-col gap-1 w-full md:w-72">
                                            <label className="text-[11px] font-bold uppercase text-gray-500">
                                              Overall Calculated Total
                                            </label>
                                            <input
                                              type="number"
                                              readOnly
                                              value={assistanceData[rel]?.Medical?.totalEstimatedCost || ""}
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
                                      <div className="flex gap-2 mt-1">
                                        <input
                                          type="text"
                                          placeholder="Document Name"
                                          value={
                                            assistanceData[rel]?.Medical
                                              ?.documentName || ""
                                          }
                                          onChange={(e) =>
                                            handleMedicalChange(
                                              rel,
                                              "documentName",
                                              e.target.value,
                                            )
                                          }
                                          className="border p-2 rounded w-1/2 outline-none"
                                        />

                                        <input
                                          type="file"
                                        id={`file-upload-${rel}`}
                                        multiple
                                          className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={(e) => {
                                          const files = Array.from(e.target.files);
                                          handleMedicalChange(rel, "documents", files);
                                        }}
                                          // onChange={(e) => {
                                          //   const file = e.target.files[0];
                                          //   if (file) {
                                          //     handleMedicalChange(
                                          //       rel,
                                          //       "documentFile",
                                          //       file,
                                          //     );
                                          //   }
                                          // }}
                                        />

                                        <button
                                          type="button"
                                          onClick={() =>
                                            document
                                              .getElementById(
                                                `file-upload-${rel}`,
                                              )
                                              .click()
                                          }
                                          className="border-2 border-blue-500 w-[250px] text-blue-500 px-4 py-2 rounded font-medium hover:bg-blue-50 transition"
                                        >
                                          Upload Document
                                        </button>

                                       <span className="text-gray-400 text-sm self-center truncate max-w-[150px]">
                                          {assistanceData[rel]?.Medical
                                            ?.documentFile?.name ||
                                            "No File Chosen"}
                                        </span>
                                      
                                      <div className="mt-2">
                                        {assistanceData[rel]?.Medical?.documents?.map((file, index) => (
                                          <div key={index} className="text-sm text-gray-600">
                                            {file.name}
                                          </div>
                                        ))}
                                      </div>

                                        <button
                                          type="button"
                                          className="border rounded-full w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div> */}

                                    <div className="col-span-full md:col-span-2">
                                      <label className="text-[11px] font-bold uppercase text-gray-500">
                                        Upload Medical Documents
                                      </label>

                                      {(assistanceData[rel]?.Medical?.medicalDocuments || []).map(
                                        (doc, index) => (
                                          <div key={index} className="flex gap-2 mt-2 items-center">

                                            {/* Document Name */}
                                            <input
                                              type="text"
                                              placeholder="Document Name"
                                              value={doc.documentName}
                                              onChange={(e) =>
                                                handleDocumentChange(rel, index, "documentName", e.target.value)
                                              }
                                              className="border p-2 rounded w-1/3"
                                            />

                                            {/* File Input */}
                                            <input
                                              type="file"
                                              id={`file-upload-${rel}-${index}`}
                                              multiple
                                              className="hidden"
                                              accept="image/*,.pdf"
                                              onChange={(e) => {
                                                const files = Array.from(e.target.files);
                                                handleDocumentChange(rel, index, "files", files);
                                              }}
                                            />

                                            {/* Upload Button */}
                                            <button
                                              type="button"
                                              onClick={() =>
                                                document
                                                  .getElementById(`file-upload-${rel}-${index}`)
                                                  .click()
                                              }
                                              className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
                                            >
                                              Upload
                                            </button>

                                            {/* File Names */}
                                            <div className="text-sm text-gray-500 max-w-[150px] truncate">
                                              {doc.files?.length
                                                ? doc.files.map((f) => f.name).join(", ")
                                                : "No file"}
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const docs = assistanceData[rel]?.Medical?.medicalDocuments || [];
                                                handleMedicalChange(
                                                  rel,
                                                  "medicalDocuments",
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

                                      {/* Add Button */}
                                      <button
                                        type="button"
                                        onClick={() => handleAddDocument(rel)}
                                        className="mt-3 text-white px-2 py-1 flex items-center justify-center rounded-lg bg-blue-500"
                                      >
                                        <Plus /> Documents
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
                                        className="border p-2 rounded outline-none focus:border-blue-500"
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-8 flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Remark*
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
                                </div>
                              )}

                            {
                              //   (

                              //     relationDetails[rel]?.assistanceCategories?.includes("Education") ||
                              //     selectedAssistance?.includes("Education")
                              // ) && 
                              (relationDetails[rel]?.assistanceCategories?.includes("Education") ||
                                (selectedRelation === rel && selectedAssistance?.includes("Education"))) &&

                              (
                                <div className="mt-6 p-6 border rounded-lg bg-white shadow-sm font-sans">
                                  <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                    Education support Assistance
                                  </h3>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                    {/* Row 1 */}
                                    <div className="flex flex-col gap-1">
                                      <label className="text-[11px] font-bold uppercase text-gray-500">
                                        Class  *
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
                                          assistanceData[rel]?.Education
                                            ?.marks || ""
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
                                        value={assistanceData[rel]?.Education?.forwardTo || ""}
                                        onChange={(e) =>
                                          handleEducationChange(
                                            rel,
                                            "forwardTo",
                                            e.target.value
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
                                </div>
                              )}

                            {

                              //   relationDetails[
                              //   rel
                              // ]?.assistanceCategories?.includes("Job") && 
                              // (
                              //   relationDetails[rel]?.assistanceCategories?.includes("Job") ||
                              //   selectedAssistance?.includes("Job")
                              // ) &&

                              (relationDetails[rel]?.assistanceCategories?.includes("Job") ||
                                (selectedRelation === rel && selectedAssistance?.includes("Job"))) &&

                              (
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
                                        value={assistanceData[rel]?.Job?.employmentStatus || ""}
                                        onChange={(e) =>
                                          handleJobChange(rel, "employmentStatus", e.target.value)
                                        }
                                      >
                                        <option value="">Select</option>
                                        <option value="employed">Employed</option>
                                        <option value="unemployed">Unemployed</option>
                                      </select>
                                    </div>
                                    {assistanceData[rel]?.Job?.employmentStatus === "employed" && (
                                      <>
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[11px] font-bold uppercase text-gray-500">
                                            Current Salary*
                                          </label>
                                          <input
                                            type="number"
                                            value={assistanceData[rel]?.Job?.currentSalary || ""}
                                            onChange={(e) =>
                                              handleJobChange(rel, "currentSalary", e.target.value)
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
                                            value={assistanceData[rel]?.Job?.expectedSalary || ""}
                                            onChange={(e) =>
                                              handleJobChange(rel, "expectedSalary", e.target.value)
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


                                    <div className="flex flex-col gap-1">
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
                                              handleJobChange(rel, "resumeFile", e.target.files[0])
                                            }
                                          />
                                        </label>
                                        <span className="px-3 text-sm text-gray-500 truncate">
                                          {assistanceData[rel]?.Job?.resumeFile?.name || "No file chosen"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Row 3 - Checkbox Group */}
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
                                </div>
                              )}

                            {
                              // relationDetails[
                              // rel
                              // ]?.assistanceCategories?.includes("Food") &&

                              // (
                              //   relationDetails[rel]?.assistanceCategories?.includes("Food") ||
                              //   selectedAssistance?.includes("Food")
                              // ) &&

                              (relationDetails[rel]?.assistanceCategories?.includes("Food") ||
                                (selectedRelation === rel && selectedAssistance?.includes("Food"))) &&

                              (
                                <div className="mt-6 p-6 border rounded-lg bg-white shadow-sm font-sans">
                                  <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                    Food support Assistance
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
                                        Type of Food Support Required?*
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
                                          assistanceData[rel]?.Food?.foodType || [];

                                        let frequencyOptions = [];

                                        // ✅ Dry ration options
                                        if (selectedFoodTypes.includes("Dry ration")) {
                                          frequencyOptions.push("Monthly", "6 Months", "Yearly");
                                        }

                                        // ✅ Cooked meals options
                                        if (selectedFoodTypes.includes("Cooked meals")) {
                                          frequencyOptions.push("One-meals", "Two-meals", "Three-meals");
                                        }

                                        return (
                                          <select
                                            className="border p-2 rounded bg-white outline-none focus:border-blue-500 text-gray-700"
                                            value={assistanceData[rel]?.Food?.duration || ""}
                                            onChange={(e) =>
                                              handleFoodChange(rel, "duration", e.target.value)
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
                              (relationDetails[rel]?.assistanceCategories?.includes("Rent") ||
                                (selectedRelation === rel && selectedAssistance?.includes("Rent"))) &&

                              (
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
                                                  ?.reimbursementRequired === opt
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

                                    <div className="col-span-full md:col-span-2 lg:col-span-3">
                                      <label className="text-[11px] font-bold uppercase text-gray-500">
                                        Upload Rent Proof Documents
                                      </label>

                                      {(assistanceData[rel]?.Rent?.rentProofDocuments || []).map(
                                        (doc, index) => (
                                          <div key={index} className="flex gap-2 mt-2 items-center">
                                            <input
                                              type="text"
                                              placeholder="Document Name"
                                              value={doc.documentName || ""}
                                              onChange={(e) =>
                                                handleRentDocumentChange(
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
                                              id={`rent-file-upload-${rel}-${index}`}
                                              multiple
                                              className="hidden"
                                              accept="image/*,.pdf"
                                              onChange={(e) =>
                                                handleRentDocumentChange(
                                                  rel,
                                                  index,
                                                  "files",
                                                  Array.from(e.target.files || []),
                                                )
                                              }
                                            />

                                            <button
                                              type="button"
                                              onClick={() =>
                                                document
                                                  .getElementById(`rent-file-upload-${rel}-${index}`)
                                                  .click()
                                              }
                                              className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
                                            >
                                              Upload
                                            </button>

                                            <div className="text-sm text-gray-500 max-w-[150px] truncate">
                                              {doc.files?.length
                                                ? doc.files.map((file) => file.name).join(", ")
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
                                                  docs.filter((_, i) => i !== index),
                                                );
                                              }}
                                              className="text-red-500 text-lg"
                                            >
                                              x
                                            </button>
                                          </div>
                                        )
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleAddRentDocument(rel)}
                                        className="mt-3 text-white px-2 py-1 flex items-center justify-center rounded-lg bg-blue-500"
                                      >
                                        <Plus /> Document
                                      </button>
                                    </div>
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
                                </div>
                              )}

                            {


                              //   relationDetails[rel]?.assistanceCategories?.includes(
                              //   "Housing",
                              // ) &&

                              // (
                              //   relationDetails[rel]?.assistanceCategories?.includes("Housing") ||
                              //   selectedAssistance?.includes("Housing")
                              // ) &&

                              (relationDetails[rel]?.assistanceCategories?.includes("Housing") ||
                                (selectedRelation === rel && selectedAssistance?.includes("Housing"))) &&


                              (
                                <div className="mt-6 p-6 border rounded-lg bg-white shadow-sm font-sans text-[#4A4A4A]">
                                  <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                    House purchase/repair Assistance
                                  </h3>

                                  {(() => {
                                    const housingTypes =
                                      assistanceData[rel]?.Housing?.assistanceType || [];
                                    const isHousePurchaseSelected =
                                      housingTypes.includes("House purchase");
                                    const hasOwnContribution =
                                      assistanceData[rel]?.Housing?.ownContribution === "Yes";
                                    const hasLoanSupport =
                                      assistanceData[rel]?.Housing?.hasOtherSupport === "Yes";

                                    return (
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                        {/* Row 1: Type of Housing Assistance */}
                                        <div className="col-span-full md:col-span-2 lg:col-span-1 flex flex-col gap-1">
                                          <label className="text-[11px] font-bold uppercase text-gray-500">
                                            Type of Housing Assistance Required?*
                                          </label>
                                          <div className="flex gap-6 mt-2">
                                            {["House purchase", "House repair"].map(
                                              (type) => (
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
                                                        assistanceData[rel]?.Housing
                                                          ?.assistanceType || [];
                                                      const newTypes = e.target.checked
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
                                              ),
                                            )}
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
                                            {["High", "Medium", "Low"].map((level) => (
                                              <label
                                                key={level}
                                                className="flex items-center gap-2 text-sm"
                                              >
                                                <input
                                                  type="radio"
                                                  name={`house-urgency-${rel}`}
                                                  checked={
                                                    assistanceData[rel]?.Housing
                                                      ?.urgency === level
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
                                            ))}
                                          </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                          <label className="text-[11px] font-bold uppercase text-gray-500">
                                            Estimated Expenses*
                                          </label>
                                          <input
                                            type="number"
                                            value={
                                              assistanceData[rel]?.Housing?.totalCost ||
                                              ""
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
                                              Own Contribution Amount
                                              l.                           </label>
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



                                        {isHousePurchaseSelected && hasLoanSupport && (
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
                                                className={`border p-2 rounded outline-none focus:border-blue-500 ${Number(assistanceData[rel]?.Housing?.emiAmountMonthly || 0) > Number(assistanceData[rel]?.Housing?.loanAmount || 0) && assistanceData[rel]?.Housing?.loanAmount
                                                  ? "border-red-500 focus:ring-2 focus:ring-red-100"
                                                  : "border-slate-300"
                                                  }`}
                                              />
                                              {Number(assistanceData[rel]?.Housing?.emiAmountMonthly || 0) > Number(assistanceData[rel]?.Housing?.loanAmount || 0) && assistanceData[rel]?.Housing?.loanAmount && (
                                                <p className="text-red-500 text-xs mt-1">
                                                  EMI amount cannot exceed loan amount (₹{assistanceData[rel]?.Housing?.loanAmount})
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

                                        {isHousePurchaseSelected && (
                                          <div className="col-span-full md:col-span-2 lg:col-span-3">
                                            <label className="text-[11px] font-bold uppercase text-gray-500">
                                              Upload Agreement / Other Proofs
                                            </label>

                                            {(assistanceData[rel]?.Housing?.supportingDocuments || []).map(
                                              (doc, index) => (
                                                <div key={index} className="flex gap-2 mt-2 items-center">
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
                                                        Array.from(e.target.files || []),
                                                      )
                                                    }
                                                  />

                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      document
                                                        .getElementById(`housing-file-upload-${rel}-${index}`)
                                                        .click()
                                                    }
                                                    className="border-2 border-blue-500 text-blue-500 px-3 py-2 rounded"
                                                  >
                                                    Upload
                                                  </button>

                                                  <div className="text-sm text-gray-500 max-w-[150px] truncate">
                                                    {doc.files?.length
                                                      ? doc.files.map((file) => file.name).join(", ")
                                                      : "No file"}
                                                  </div>

                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const docs =
                                                        assistanceData[rel]?.Housing?.supportingDocuments || [];
                                                      handleHousingChange(
                                                        rel,
                                                        "supportingDocuments",
                                                        docs.filter((_, i) => i !== index),
                                                      );
                                                    }}
                                                    className="text-red-500 text-lg"
                                                  >
                                                    x
                                                  </button>
                                                </div>
                                              )
                                            )}

                                            <button
                                              type="button"
                                              onClick={() => handleAddHousingDocument(rel)}
                                              className="mt-3 text-white px-2 py-1 flex items-center justify-center rounded-lg bg-blue-500"
                                            >
                                              <Plus /> Document
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
                                        assistanceData[rel]?.Housing?.remark || ""
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
                                </div>
                              )}

                            {
                              // relationDetails[rel]?.assistanceCategories?.includes(
                              // "Vaiyavacch",
                              // ) &&
                              // (
                              //   relationDetails[rel]?.assistanceCategories?.includes("Vaiyavacch") ||
                              //   selectedAssistance?.includes("Vaiyavacch")
                              // ) &&

                              (relationDetails[rel]?.assistanceCategories?.includes("Vaiyavacch") ||
                                (selectedRelation === rel && selectedAssistance?.includes("Vaiyavacch"))) &&

                              (
                                <div className="p-6 border rounded-lg bg-white shadow-sm">
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
                                </div>
                              )}

                            {

                              //   relationDetails[rel]?.assistanceCategories?.includes(
                              //   "LivelihoodExpenses ",
                              // ) &&

                              // (
                              //   relationDetails[rel]?.assistanceCategories?.includes("LivelihoodExpenses") ||
                              //   selectedAssistance?.includes("LivelihoodExpenses")
                              // ) &&

                              (relationDetails[rel]?.assistanceCategories?.includes("LivelihoodExpenses") ||
                                (selectedRelation === rel && selectedAssistance?.includes("LivelihoodExpenses"))) &&

                              (
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
                                          assistanceData[rel]?.LivelihoodExpenses
                                            ?.amount || ""
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
                                    {/* <div>
                                      <label className="text-[11px] font-bold uppercase text-gray-500">
                                        Mobile Number.*
                                      </label>
                                      <input
                                        type="text"
                                        className="w-full border p-2 rounded mt-1 outline-none"
                                        value={
                                          assistanceData[rel]?.LivelihoodExpenses
                                            ?.mobile || ""
                                        }
                                        onChange={(e) =>
                                          handleEmergencyChange(
                                            rel,
                                            "mobile",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div> */}
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

                                  {/* <div className="mt-6">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Upload Medical Documents
                                    </label>
                                    <div className="flex gap-2 mt-1">
                                      <input
                                        type="text"
                                        placeholder="Document Name"
                                        className="border p-2 rounded w-1/4 outline-none"
                                        value={
                                          assistanceData[rel]?.LivelihoodExpenses
                                            ?.docName || ""
                                        }
                                        onChange={(e) =>
                                          handleEmergencyChange(
                                            rel,
                                            "docName",
                                            e.target.value,
                                          )
                                        }
                                      />
                                      <div className="flex-1 flex border rounded overflow-hidden">
                                        <label className="bg-gray-100 px-4 py-2 text-sm border-r cursor-pointer hover:bg-gray-200">
                                          Choose File
                                        </label>
                                        <span className="px-4 py-2 text-sm text-gray-400 flex-1">
                                          {assistanceData[rel]?.LivelihoodExpenses
                                            ?.file?.name || "No file chosen"}
                                        </span>
                                        <input
                                          type="file"
                                          className="hidden"
                                          onChange={(e) =>
                                            handleEmergencyChange(
                                              rel,
                                              "file",
                                              e.target.files[0],
                                            )
                                          }
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        className="border rounded-full w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div> */}
                                </div>
                              )}

                            {relationDetails[rel]?.assistanceCategories?.includes(
                              "Business",
                            ) && (
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
                                        {["High", "Medium", "Low"].map((level) => (
                                          <label
                                            key={level}
                                            className="flex items-center gap-2 text-sm text-gray-600"
                                          >
                                            <input
                                              type="radio"
                                              name={`biz-urgency-${rel}`}
                                              checked={
                                                assistanceData[rel]?.BusinessSupport
                                                  ?.urgency === level
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
                                        ))}
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
                                        {["Profit", "Loss", "Closed"].map((cond) => (
                                          <label
                                            key={cond}
                                            className="flex items-center gap-2 text-sm text-gray-600"
                                          >
                                            <input
                                              type="radio"
                                              name={`biz-condition-${rel}`}
                                              checked={
                                                assistanceData[rel]?.BusinessSupport
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
                                        ))}
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
                                                assistanceData[rel]?.BusinessSupport
                                                  ?.hasLoan === opt
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
                                    <div className="flex flex-col gap-1">
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
                                    </div>

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
                                                assistanceData[rel]?.BusinessSupport
                                                  ?.hasScheme === opt
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
                                    <div className="flex flex-col gap-1">
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
                                            ?.quotationFile?.name || "No file chosen"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Remark Section */}
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
                                </div>
                              )}
                          </div>
                        )}


                      </div>
                      {/* Photo Upload Preview - Right Side */}
                      <div className="flex justify-center items-start mt-10 w-[15%] mb-4">
                        <div className="relative flex-shrink-0 group">
                          <img
                            src={
                              relationDetails[rel]?.photoPreview
                                ? relationDetails[rel].photoPreview
                                : typeof relationDetails[rel]?.photo === "string"
                                  ? resolvePhotoUrl(relationDetails[rel].photo)
                                  : "/user.png"
                            }
                            alt="profile"
                            className="w-[120px] h-[120px] border-2 border-gray-400 rounded object-cover"
                          />
                          <div
                            className="absolute inset-0 w-[120px] h-[120px] flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded cursor-pointer"
                            onClick={() =>
                              document
                                .getElementById(`photoUpload-${rel}`)
                                .click()
                            }
                          >
                            <span className="text-white text-xs font-semibold">
                              Upload
                            </span>
                          </div>
                          <input
                            type="file"
                            id={`photoUpload-${rel}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleProfileUpload(rel, e)}
                          />
                        </div>
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
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                Does the family have any Mediclaim policy?
                <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mediclaim"
                    checked={formData.mediclaim === true}
                    onChange={() =>
                      setFormData({ ...formData, mediclaim: true })
                    }
                  />{" "}
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mediclaim"
                    checked={formData.mediclaim === false}
                    onChange={() =>
                      setFormData({ ...formData, mediclaim: false })
                    }
                  />{" "}
                  No
                </label>
              </div>


            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                Is any NGO assistance received?
                <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="ngo"
                    checked={formData.ngoAssistance === true}
                    onChange={() =>
                      setFormData({ ...formData, ngoAssistance: true })
                    }
                  />{" "}
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="ngo"
                    checked={formData.ngoAssistance === false}
                    onChange={() =>
                      setFormData({ ...formData, ngoAssistance: false })
                    }
                  />{" "}
                  No
                </label>
              </div>


            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {formData.mediclaim && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mediclaim Type
                  </label>

                  <select
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    value={formData.family_mediclaim_type || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        family_mediclaim_type: e.target.value,
                      })
                    }
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
                      setFormData({
                        ...formData,
                        Family_mediclaim_amount: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
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
                      let premiumAmount = Number(e.target.value);
                      const coverAmount = Number(formData.Family_mediclaim_amount) || 0;

                      // Ensure premiumAmount is LESS than coverAmount
                      if (premiumAmount >= coverAmount) {
                        alert(`Premium amount must be less than Family Mediclaim Policy Amount (₹${coverAmount})`);
                        premiumAmount = coverAmount > 0 ? coverAmount - 1 : 0; // automatically reduce by 1
                      }

                      setFormData({
                        ...formData,
                        mediclaimPremiumAmount: premiumAmount,
                      });
                    }}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-100 outline-none ${Number(formData.mediclaimPremiumAmount || 0) >= Number(formData.Family_mediclaim_amount || 0) &&
                      formData.Family_mediclaim_amount
                      ? "border-red-500 focus:ring-red-100"
                      : "border-slate-300"
                      }`}
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
                      setFormData({
                        ...formData,
                        family_mediclaim_companyName: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
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
                      setFormData({
                        ...formData,
                        sanghName: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-md outline-none"
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
                      setFormData({
                        ...formData,
                        ngoAmount: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-md outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Details / Remark
                  </label>
                  <textarea
                    value={formData.ngoRemark || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ngoRemark: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-md outline-none resize-none"
                    rows={2}
                  />
                </div>

              </div>
            )}
          </div>

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
