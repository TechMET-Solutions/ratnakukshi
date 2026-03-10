import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";

const INITIAL_FORM_DATA = {
  permanentAddress: "",
  currentAddress: "",
  village: "",
  taluka: "",
  district: "",
  pinCode: "",
  houseDetails: "",
  typeOfHouse: "",
  maintenanceCost: "",
  lightBillCost: "",
  rentCost: "",
  relations: [],
  mediclaim: null,
  Family_mediclaim_amount: null,
  ngoAssistance: null,
};

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const asObject = (value) => (value && typeof value === "object" ? value : {});

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

  console.log(formData, "formData");
  const [relationDetails, setRelationDetails] = useState({});

  console.log(relationDetails, "relationDetails");
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
    "EmergencyExpenses",
    
  ]);
  const [additionalRelations, setAdditionalRelations] = useState({});

  console.log(additionalRelations, "additionalRelations");
  const [headOfFamily, setHeadOfFamily] = useState(null);
  console.log(headOfFamily, "headOfFamily");
  const handleCheckbox = (relation) => {
    setFormData((prev) => ({
      ...prev,
      relations: prev.relations.includes(relation)
        ? prev.relations.filter((r) => r !== relation)
        : [...prev.relations, relation],
    }));

    // Initialize relation details if not exists
    if (!relationDetails[relation]) {
      setRelationDetails((prev) => ({
        ...prev,
        [relation]: {
          relationName: "",
          relationDetailsName: "",
          fullName: "",
          aadharNumber: "",
          photo: "",
          ayushman: null,
          amount: "",
          mediclaim: null,
          needAssistance: null,
          assistanceCategories: [],
        },
      }));
    }

    // Toggle accordion expansion
    setExpandedRelations((prev) => ({
      ...prev,
      [relation]: !prev[relation],
    }));
  };

  const handleRelationDetailChange = (relation, field, value) => {
    setRelationDetails((prev) => ({
      ...prev,
      [relation]: {
        ...prev[relation],
        [field]: value,
      },
    }));
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

  const handleProfileUpload = (relation, event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleRelationDetailChange(relation, "photo", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAssistanceCategory = (relation, category) => {
    setRelationDetails((prev) => ({
      ...prev,
      [relation]: {
        ...prev[relation],
        assistanceCategories: prev[relation]?.assistanceCategories.includes(
          category,
        )
          ? prev[relation].assistanceCategories.filter((c) => c !== category)
          : [...(prev[relation]?.assistanceCategories || []), category],
      },
    }));
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
        fullName: "",
        aadharNumber: "",
        photo: "",
        ayushman: null,
        amount: "",
        mediclaim: null,
        needAssistance: null,
        assistanceCategories: [],
      },
    }));

    setFormData((prev) => ({
      ...prev,
      relations: [...prev.relations, newRelationId],
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
      relations: prev.relations.filter((r) => r !== relationId),
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

  console.log(assistanceData, "assistanceData");

  useEffect(() => {
    if (!id) return;

    const fetchFamilyDetailsById = async () => {
      try {
        const res = await axios.get(
          `${API}/api/family-details/${id}`,
        );

        const payload = res?.data?.data;
        const rows = Array.isArray(payload)
          ? payload
          : payload
            ? [payload]
            : [];
        const matchedFamily =
          rows.find((row) => String(row?.diksharthi_id) === String(id)) ||
          rows[0];

        if (!matchedFamily) return;

        const fetchedRelationDetails = asObject(
          parseMaybeJson(
          matchedFamily?.relationDetails ?? matchedFamily?.relation_details ?? {},
          ),
        );
        const fetchedAdditionalRelations = asObject(parseMaybeJson(
          matchedFamily?.additionalRelations ??
            matchedFamily?.additional_relations ??
            {},
        ));
        const fetchedExpandedRelations = asObject(parseMaybeJson(
          matchedFamily?.expandedRelations ?? matchedFamily?.expanded_relations ?? {},
        ));
        const fetchedAssistanceData = asObject(parseMaybeJson(
          matchedFamily?.assistanceData ?? matchedFamily?.assistance_data ?? {},
        ));
        const fetchedHeadOfFamily =
          matchedFamily?.headOfFamily ?? matchedFamily?.head_of_family ?? null;

        const nestedFormData = parseMaybeJson(
          matchedFamily?.formData ?? matchedFamily?.form_data,
        );
        const fallbackRelations = Object.keys(fetchedRelationDetails);
        const normalizedFormData =
          nestedFormData && typeof nestedFormData === "object"
            ? nestedFormData
            : {
                permanentAddress:
                  matchedFamily?.permanentAddress ??
                  matchedFamily?.permanent_address ??
                  "",
                currentAddress:
                  matchedFamily?.currentAddress ??
                  matchedFamily?.current_address ??
                  "",
                village: matchedFamily?.village ?? "",
                taluka: matchedFamily?.taluka ?? "",
                district: matchedFamily?.district ?? "",
                pinCode: matchedFamily?.pinCode ?? matchedFamily?.pin_code ?? "",
                houseDetails:
                  matchedFamily?.houseDetails ?? matchedFamily?.house_details ?? "",
                typeOfHouse:
                  matchedFamily?.typeOfHouse ?? matchedFamily?.type_of_house ?? "",
                maintenanceCost:
                  matchedFamily?.maintenanceCost ??
                  matchedFamily?.maintenance_cost ??
                  "",
                lightBillCost:
                  matchedFamily?.lightBillCost ??
                  matchedFamily?.light_bill_cost ??
                  "",
                rentCost: matchedFamily?.rentCost ?? matchedFamily?.rent_cost ?? "",
                mediclaim: matchedFamily?.mediclaim ?? null,
                Family_mediclaim_amount:
                  matchedFamily?.Family_mediclaim_amount ??
                  matchedFamily?.family_mediclaim_amount ??
                  null,
                ngoAssistance:
                  matchedFamily?.ngoAssistance ??
                  matchedFamily?.ngo_assistance ??
                  null,
                relations: fallbackRelations,
              };

        setFormData({
          ...INITIAL_FORM_DATA,
          ...normalizedFormData,
          relations:
            normalizedFormData?.relations?.length > 0
              ? normalizedFormData.relations
              : fallbackRelations,
        });
        setRelationDetails(fetchedRelationDetails);
        setAdditionalRelations(fetchedAdditionalRelations);
        setExpandedRelations(fetchedExpandedRelations);
        setAssistanceData(fetchedAssistanceData);
        setHeadOfFamily(fetchedHeadOfFamily);
      } catch (error) {
        console.error("Error fetching family details by id:", error);
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

const handleSave = async () => {
  try {
    const payload = {
      diksharthi_id: id,
      formData: formData,
      relationDetails: relationDetails,
      additionalRelations: additionalRelations,
      expandedRelations: expandedRelations,
      headOfFamily: headOfFamily,
      assistanceData: assistanceData, // ✅ new field
    };

    console.log(payload, "Sending Data");

    const response = await axios.post(
      `${API}/api/create-family-details`,
      payload
    );

    console.log(response.data);

    if (response.data.success) {
      alert("Family details saved successfully");
      resetForm();
      navigate("/diksharthi-details");
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
};
  const handleMedicalChange = (relation, field, value) => {
    setAssistanceData((prev) => ({
      ...prev,
      [relation]: {
        ...prev[relation],
        Medical: {
          ...prev[relation]?.Medical,
            [field]: value,
           status: "Pending",
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
        EmergencyExpenses: {
          ...prev[relation]?.EmergencyExpenses,
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
      <div className="w-full max-w-6xl bg-white p-6 shadow-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Address (Permanent)<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.permanentAddress}
                onChange={(e) =>
                  setFormData({ ...formData, permanentAddress: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Address (Current)<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.currentAddress}
                onChange={(e) =>
                  setFormData({ ...formData, currentAddress: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          {/* Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Village<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) =>
                  setFormData({ ...formData, village: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Taluka<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.taluka}
                onChange={(e) =>
                  setFormData({ ...formData, taluka: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                District<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pin Code<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pinCode}
                onChange={(e) =>
                  setFormData({ ...formData, pinCode: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          {/* House Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                House Details<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="house"
                    value="own"
                    checked={formData.houseDetails === "own"}
                    onChange={(e) =>
                      setFormData({ ...formData, houseDetails: e.target.value })
                    }
                    className="w-4 h-4 text-blue-600"
                  />{" "}
                  <span>Own</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="house"
                    value="rented"
                    checked={formData.houseDetails === "rented"}
                    onChange={(e) =>
                      setFormData({ ...formData, houseDetails: e.target.value })
                    }
                    className="w-4 h-4 text-blue-600"
                  />{" "}
                  <span>Rented</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type Of House<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.typeOfHouse}
                onChange={(e) =>
                  setFormData({ ...formData, typeOfHouse: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Maintenance Cost<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.maintenanceCost}
                onChange={(e) =>
                  setFormData({ ...formData, maintenanceCost: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            {/* Rent Cost - Conditional Render */}
            {formData.houseDetails === "rented" && (
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rent Cost<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.rentCost}
                  onChange={(e) =>
                    setFormData({ ...formData, rentCost: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 rounded-md outline-none"
                />
              </div>
            )}

            {/* Light Bill */}
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Light Bill cost<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lightBillCost}
                onChange={(e) =>
                  setFormData({ ...formData, lightBillCost: e.target.value })
                }
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
                    checked={formData.relations.includes(rel)}
                    onChange={() => handleCheckbox(rel)}
                    className="w-5 h-5 border-slate-400 rounded"
                  />
                  <span>{rel}</span>
                </label>
              ))}
            </div>

            {/* Relation Details Accordions */}
            {formData.relations.map((rel) => {
              const baseRelation = rel.split("-")[0];
              const isAdditionalRow = rel !== baseRelation;

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
                        <div className="mb-4 p-3 w-[180px] bg-blue-50 rounded-md">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={headOfFamily === rel}
                              disabled={headOfFamily && headOfFamily !== rel}
                              onChange={() => handleHeadOfFamilyChange(rel)}
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

                        <div className="flex  gap-4">
                          {/* Full Name */}
                          <div className="w-[350px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Full Name<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={relationDetails[rel]?.fullName || ""}
                              onChange={(e) =>
                                handleRelationDetailChange(
                                  rel,
                                  "fullName",
                                  e.target.value,
                                )
                              }
                              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                          </div>

                          {/* Aadhar Number */}
                          <div className="w-[250px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Aadhar Number
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={relationDetails[rel]?.aadharNumber || ""}
                              onChange={(e) =>
                                handleRelationDetailChange(
                                  rel,
                                  "aadharNumber",
                                  e.target.value,
                                )
                              }
                              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                          </div>

                          {/* Pan Number */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Pan Number<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={relationDetails[rel]?.panNumber || ""}
                              onChange={(e) =>
                                handleRelationDetailChange(
                                  rel,
                                  "panNumber",
                                  e.target.value,
                                )
                              }
                              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                          </div>
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
                                  checked={
                                    relationDetails[rel]?.ayushman === true
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
                                  checked={
                                    relationDetails[rel]?.ayushman === false
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
                                type="text"
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
                            <div className="w-[200px] mt-4">
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                mediclaim Amount
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
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
                          )}
                        </div>

                        {/* Show Assistance Categories when Need Assistance is Yes */}
                        {relationDetails[rel]?.needAssistance === true && (
                          <div className="w-full mt-6">
                            <p className="text-sm font-medium text-slate-700 mb-3">
                              Assistances<span className="text-red-500">*</span>
                            </p>
                            <div className="flex flex-wrap gap-4">
                              {assistanceTypes.map((type) => (
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
                              ))}
                            </div>

                            {relationDetails[
                              rel
                            ]?.assistanceCategories?.includes("Medical") && (
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

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Disease / Condition Name*
                                    </label>
                                    <input
                                      type="text"
                                      value={
                                        assistanceData[rel]?.Medical
                                          ?.diseaseName || ""
                                      }
                                      onChange={(e) =>
                                        handleMedicalChange(
                                          rel,
                                          "diseaseName",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
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

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Any Insurance / Ayushman Card*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["Yes", "No"].map((opt) => (
                                        <label
                                          key={opt}
                                          className="flex items-center gap-2 text-sm"
                                        >
                                          <input
                                            type="radio"
                                            name={`insurance-${rel}`}
                                            checked={
                                              assistanceData[rel]?.Medical
                                                ?.hasInsurance === opt
                                            }
                                            onChange={() =>
                                              handleMedicalChange(
                                                rel,
                                                "hasInsurance",
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
                                  </div>

                                                      
                               
                                                      
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



                                 

                                                      {/* Row 5: Document Upload */}
                                                      {
                                                          
                                                      }
                             {assistanceData[rel]?.Medical?.repeatedAssistance && (
  <div className="col-span-full md:col-span-2">
    <div className="flex gap-2">

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-bold uppercase text-gray-500">
          Treatment Frequency*
        </label>
        <select
          className="border p-2 rounded bg-white outline-none focus:border-blue-500"
          value={assistanceData[rel]?.Medical?.frequency || ""}
          onChange={(e) =>
            handleMedicalChange(rel, "frequency", e.target.value)
          }
        >
          <option value="">Select</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-bold uppercase text-gray-500">
          Estimated Cost Per Session*
        </label>
        <input
          type="number"
          value={assistanceData[rel]?.Medical?.costPerSession || ""}
          onChange={(e) =>
            handleMedicalChange(rel, "costPerSession", e.target.value)
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
          value={assistanceData[rel]?.Medical?.sessionsCount || ""}
          onChange={(e) =>
            handleMedicalChange(rel, "sessionsCount", e.target.value)
          }
          className="border p-2 rounded outline-none focus:border-blue-500"
        />
      </div>

    </div>
  </div>
)}
                                  
                                  <div className="col-span-full md:col-span-2">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Upload Medical Documents
                                    </label>
                                    <div className="flex gap-2 mt-1">
                                      {/* Document Name Input */}
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

                                      {/* Hidden File Input */}
                                      <input
                                        type="file"
                                        id={`file-upload-${rel}`}
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (file) {
                                            handleMedicalChange(
                                              rel,
                                              "documentFile",
                                              file,
                                            );
                                          }
                                        }}
                                      />

                                      {/* Trigger Button */}
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

                                      {/* Display File Name */}
                                      <span className="text-gray-400 text-sm self-center truncate max-w-[150px]">
                                        {assistanceData[rel]?.Medical
                                          ?.documentFile?.name ||
                                          "No File Chosen"}
                                      </span>

                                      <button
                                        type="button"
                                        className="border rounded-full w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100"
                                      >
                                        +
                                      </button>
                                    </div>
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

                                {/* Remark Section */}
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

                            {relationDetails[
                              rel
                            ]?.assistanceCategories?.includes("Education") && (
                              <div className="mt-6 p-6 border rounded-lg bg-white shadow-sm font-sans">
                                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                  Education support Assistance
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                  {/* Row 1 */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Name of School/ College *
                                    </label>
                                    <input
                                      type="text"
                                      value={
                                        assistanceData[rel]?.Education
                                          ?.schoolName || ""
                                      }
                                      onChange={(e) =>
                                        handleEducationChange(
                                          rel,
                                          "schoolName",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Class / Grade *
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
                                      Medium of Education *
                                    </label>
                                    <input
                                      type="text"
                                      value={
                                        assistanceData[rel]?.Education
                                          ?.medium || ""
                                      }
                                      onChange={(e) =>
                                        handleEducationChange(
                                          rel,
                                          "medium",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  {/* Row 2 */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      School / College Fees*
                                    </label>
                                    <input
                                      type="number"
                                      value={
                                        assistanceData[rel]?.Education?.fees ||
                                        ""
                                      }
                                      onChange={(e) =>
                                        handleEducationChange(
                                          rel,
                                          "fees",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Fee Books / Stationery Expenses*
                                    </label>
                                    <input
                                      type="number"
                                      value={
                                        assistanceData[rel]?.Education
                                          ?.stationeryExpenses || ""
                                      }
                                      onChange={(e) =>
                                        handleEducationChange(
                                          rel,
                                          "stationeryExpenses",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>
<div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Other Expenses
                                    </label>
                                    <input
                                      type="text"
                                      value={
                                        assistanceData[rel]?.Education
                                          ?.minorityNumber || ""
                                      }
                                      onChange={(e) =>
                                        handleEducationChange(
                                          rel,
                                          "OtherExpenses",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Total Expenses*
                                    </label>
                                    <input
                                      type="number"
                                      value={
                                        assistanceData[rel]?.Education
                                          ?.totalExpenses || ""
                                      }
                                      onChange={(e) =>
                                        handleEducationChange(
                                          rel,
                                          "totalExpenses",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  {/* Row 3 */}
                                  

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Government Scholarship / Benefit*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["Yes", "No"].map((opt) => (
                                        <label
                                          key={opt}
                                          className="flex items-center gap-2 text-sm"
                                        >
                                          <input
                                            type="radio"
                                            name={`scholarship-${rel}`}
                                            checked={
                                              assistanceData[rel]?.Education
                                                ?.hasScholarship === opt
                                            }
                                            onChange={() =>
                                              handleEducationChange(
                                                rel,
                                                "hasScholarship",
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
                                      Estimated Support Amount*
                                    </label>
                                    <input
                                      type="number"
                                      value={
                                        assistanceData[rel]?.Education
                                          ?.supportAmount || ""
                                      }
                                      onChange={(e) =>
                                        handleEducationChange(
                                          rel,
                                          "supportAmount",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  {/* Row 4 */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Support Duration*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["One Time", "Yearly"].map((dur) => (
                                        <label
                                          key={dur}
                                          className="flex items-center gap-2 text-sm"
                                        >
                                          <input
                                            type="radio"
                                            name={`duration-${rel}`}
                                            checked={
                                              assistanceData[rel]?.Education
                                                ?.supportDuration === dur
                                            }
                                            onChange={() =>
                                              handleEducationChange(
                                                rel,
                                                "supportDuration",
                                                dur,
                                              )
                                            }
                                          />{" "}
                                          {dur}
                                        </label>
                                      ))}
                                    </div>
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
                                              name={`edu-urgency-${rel}`}
                                              checked={
                                                assistanceData[rel]?.Education
                                                  ?.urgency === level
                                              }
                                              onChange={() =>
                                                handleEducationChange(
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

                                  {/* File Upload Field */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Upload School/ College ID*
                                    </label>
                                    <div className="flex items-center border rounded mt-1 overflow-hidden">
                                      <label className="bg-gray-100 px-3 py-2 border-r text-sm cursor-pointer hover:bg-gray-200 transition">
                                        Choose File
                                        <input
                                          type="file"
                                          className="hidden"
                                          onChange={(e) =>
                                            handleEducationChange(
                                              rel,
                                              "idCardFile",
                                              e.target.files[0],
                                            )
                                          }
                                        />
                                      </label>
                                      <span className="px-3 text-sm text-gray-500 truncate">
                                        {assistanceData[rel]?.Education
                                          ?.idCardFile?.name ||
                                          "No file chosen"}
                                      </span>
                                    </div>
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

                            {relationDetails[
                              rel
                            ]?.assistanceCategories?.includes("Job") && (
                              <div className="mt-6 p-6 border rounded-lg bg-white shadow-sm font-sans">
                                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                  Job assistance
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                  {/* Row 1 */}
                                  {/* <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Current Employment Status*
                                    </label>
                                    <input
                                      type="text"
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
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div> */}
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

                            {relationDetails[
                              rel
                            ]?.assistanceCategories?.includes("Food") && (
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
                                    <select
                                      className="border p-2 rounded bg-white outline-none focus:border-blue-500 text-gray-700"
                                      value={
                                        assistanceData[rel]?.Food?.duration ||
                                        ""
                                      }
                                      onChange={(e) =>
                                        handleFoodChange(
                                          rel,
                                          "duration",
                                          e.target.value,
                                        )
                                      }
                                    >
                                         <option value="Daily">Daily</option>
                                      <option value="Monthly">Monthly</option>
                                      <option value="Weekly">Weekly</option>
                                      <option value="One-time">One-time</option>
                                         <option value="One-time">Temporary</option>
                                    </select>
                                  </div>

                                                      <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                    Duration(Days/Month)?*
                                    </label>
                                    <input
                                      type="text"
                                      value={
                                        assistanceData[rel]?.Food
                                          ?.FrequencyDuration || ""
                                      }
                                      onChange={(e) =>
                                        handleFoodChange(
                                          rel,
                                          "FrequencyDuration",
                                          e.target.value,
                                        )
                                      }
                                      className="border p-2 rounded outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  {/* <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Any Special Dietary Requirement?*
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                      {["Yes", "No"].map((opt) => (
                                        <label
                                          key={opt}
                                          className="flex items-center gap-2 text-sm text-gray-600"
                                        >
                                          <input
                                            type="radio"
                                            name={`dietary-${rel}`}
                                            checked={
                                              assistanceData[rel]?.Food
                                                ?.specialDietary === opt
                                            }
                                            onChange={() =>
                                              handleFoodChange(
                                                rel,
                                                "specialDietary",
                                                opt,
                                              )
                                            }
                                          />{" "}
                                          {opt}
                                        </label>
                                      ))}
                                    </div>
                                  </div> */}
                                </div>

                                {/* Reason Section */}
                                <div className="mt-8 flex flex-col gap-1">
                                  <label className="text-[11px] font-bold uppercase text-gray-500">
                                    Reason for Food Support?*
                                  </label>
                                  <textarea
                                    placeholder="Write here..."
                                    className="border p-2 rounded w-full h-24 outline-none focus:border-blue-500 resize-none"
                                    value={
                                      assistanceData[rel]?.Food?.reason || ""
                                    }
                                    onChange={(e) =>
                                      handleFoodChange(
                                        rel,
                                        "reason",
                                        e.target.value,
                                      )
                                    }
                                  ></textarea>
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

                            {relationDetails[
                              rel
                            ]?.assistanceCategories?.includes("Rent") && (
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

                                  {/* Row 3 - File Upload */}
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-500">
                                      Upload Rent Proof (If Yes)
                                    </label>
                                    <div className="flex items-center border rounded mt-1 overflow-hidden">
                                      <label className="bg-gray-100 px-3 py-2 border-r text-sm cursor-pointer hover:bg-gray-200 transition">
                                        Choose File
                                        <input
                                          type="file"
                                          className="hidden"
                                          onChange={(e) =>
                                            handleRentChange(
                                              rel,
                                              "rentProofFile",
                                              e.target.files[0],
                                            )
                                          }
                                        />
                                      </label>
                                      <span className="px-3 text-sm text-gray-500 truncate">
                                        {assistanceData[rel]?.Rent
                                          ?.rentProofFile?.name ||
                                          "No file chosen"}
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

                                          {relationDetails[rel]?.assistanceCategories?.includes(
                          "Housing",
                        ) && (
                          <div className="mt-6 p-6 border rounded-lg bg-white shadow-sm font-sans text-[#4A4A4A]">
                            <h3 className="text-xl font-semibold mb-6 text-gray-800">
                              House purchase/repair Assistance
                            </h3>

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

                        {relationDetails[rel]?.assistanceCategories?.includes(
                          "Vaiyavacch",
                        ) && (
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

                        {relationDetails[rel]?.assistanceCategories?.includes(
                          "EmergencyExpenses",
                        ) && (
                          <div className="p-6 border rounded-lg bg-white shadow-sm mt-6">
                            <h3 className="text-xl font-semibold mb-6 text-gray-800">
                              Emergency expenses Assistance
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* <div>
                                <label className="text-[11px] font-bold uppercase text-gray-500">
                                  Emergency Assistance Required*
                                </label>
                                <select
                                  className="w-full border p-2 rounded mt-1 text-gray-500 outline-none"
                                  value={
                                    assistanceData[rel]?.EmergencyExpenses
                                      ?.type || ""
                                  }
                                  onChange={(e) =>
                                    handleEmergencyChange(
                                      rel,
                                      "type",
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value="">Select</option>
                                  <option value="Hospitalization">
                                    Hospitalization
                                  </option>
                                  <option value="Accident">Accident</option>
                                </select>
                              </div> */}
                               <div>
                                <label className="text-[11px] font-bold uppercase text-gray-500">
                                  Emergency Assistance Required For?
                                </label>
                                <input
                                  type="text"
                                  className="w-full border p-2 rounded mt-1 outline-none"
                                  value={
                                    assistanceData[rel]?.EmergencyExpenses
                                      ?.type || ""
                                  }
                                  onChange={(e) =>
                                    handleEmergencyChange(
                                      rel,
                                      "type",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold uppercase text-gray-500">
                                  Estimated Amount Required*
                                </label>
                                <input
                                  type="number"
                                  className="w-full border p-2 rounded mt-1 outline-none"
                                  value={
                                    assistanceData[rel]?.EmergencyExpenses
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
                              <div>
                                <label className="text-[11px] font-bold uppercase text-gray-500">
                                  Mobile Number.*
                                </label>
                                <input
                                  type="text"
                                  className="w-full border p-2 rounded mt-1 outline-none"
                                  value={
                                    assistanceData[rel]?.EmergencyExpenses
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
                              </div>
                            </div>

                            <div className="mt-6">
                              <label className="text-[11px] font-bold uppercase text-gray-500">
                                Briefly Describe the Emergency.
                              </label>
                              <textarea
                                className="w-full border p-2 rounded mt-1 h-24 outline-none resize-none"
                                placeholder="Write here..."
                                value={
                                  assistanceData[rel]?.EmergencyExpenses
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

                            <div className="mt-6">
                              <label className="text-[11px] font-bold uppercase text-gray-500">
                                Upload Medical Documents
                              </label>
                              <div className="flex gap-2 mt-1">
                                <input
                                  type="text"
                                  placeholder="Document Name"
                                  className="border p-2 rounded w-1/4 outline-none"
                                  value={
                                    assistanceData[rel]?.EmergencyExpenses
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
                                    {assistanceData[rel]?.EmergencyExpenses
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
                            </div>
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
                              relationDetails[rel]?.photo
                                ? relationDetails[rel].photo
                                : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E'
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

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end p-4 border-t border-slate-300 bg-slate-50">
                    {/* <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md"
                                        >
                                            Cancel
                                        </button> */}
                    {/* <button
  type="button"
  onClick={handleSave}
  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md"
>
  Save
</button> */}
                  </div>
                </div>
              );
            })}

            {formData.relations.includes("Son") && (
              <button
                type="button"
                onClick={() => handleAddRelationRow("Son")}
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md mb-3 flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span> Add Son
              </button>
            )}

            {formData.relations.includes("Daughter") && (
              <button
                type="button"
                onClick={() => handleAddRelationRow("Daughter")}
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md mb-3 flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span> Add Daughter
              </button>
            )}

            {formData.relations.includes("Brother") && (
              <button
                type="button"
                onClick={() => handleAddRelationRow("Brother")}
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md mb-3 flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span> Add Brother
              </button>
            )}

            {formData.relations.includes("Sister") && (
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

              {formData.mediclaim && (
                <div className="w-[200px] mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Family Mediclaim policy Amount
                    <span className="text-red-500">*</span>
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
              )}
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
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-dashed border-blue-200">
            <div className="flex gap-4"></div>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FamilyDetailsForm;
