import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { API } from "../api/BaseURL";

const AssistanceDetails = () => {
  const location = useLocation();

  const memberData = location?.state?.memberData || {};
  const relation = location?.state?.relation || "";
  const familyId = location?.state?.familyId || "";
  const sadhuName = location?.state?.sadhuName || "";
  const selectedSadhu = location?.state?.selectedSadhu || "";
  const existingAssistance = location?.state?.assistanceData || {};

  const [assistanceData, setAssistanceData] = useState({});
  const [relationDetails, setRelationDetails] = useState({});

  const assistanceTypes = [
    "Medical",
    "Education",
    "Job",
    "Food",
    "Rent",
    "Housing",
    "Vaiyavacch",
    "EmergencyExpenses",
    "Business",
  ];

  const includesValue = (list, value) =>
    Array.isArray(list) ? list.includes(value) : false;
  const normalizeAssistanceCategories = (data) =>
    Object.keys(data || {}).map((category) =>
      category === "BusinessSupport" ? "Business" : category,
    );

  // const fetchFamilyDetails = async () => {
  //   try {
  //     const res = await axios.get(`${API}/api/family-details/${selectedSadhu}`);

  //     const families = Array.isArray(res?.data?.data) ? res.data.data : [];
  //     const family =
  //       families.find((item) => String(item?.id) === String(familyId)) ||
  //       families[0];

  //     const existingAssistance = family?.assistance_data?.[relation] || {};

  //     setAssistanceData({
  //       [relation]: existingAssistance,
  //     });

  //     const categories = normalizeAssistanceCategories(existingAssistance);

  //     setRelationDetails({
  //       [relation]: {
  //         assistanceCategories: categories,
  //       },
  //     });
  //   } catch (error) {
  //     console.log("Error fetching family details", error);
  //   }
  // };


  const fetchFamilyDetails = async () => {
    try {
      const res = await axios.get(`${API}/api/family-details/${selectedSadhu}`);

      const families = Array.isArray(res?.data?.data) ? res.data.data : [];

      const family =
        families.find((item) => String(item?.id) === String(familyId)) ||
        families[0];

      const existingAssistance = family?.assistance_data?.[relation] || {};

      // ✅ Assistance data set karo
      setAssistanceData((prev) => ({
        ...prev,
        [relation]: existingAssistance,
      }));

      // ✅ Categories set karo
      const categories = Object.keys(existingAssistance).map((cat) =>
        cat === "BusinessSupport" ? "Business" : cat
      );

      setRelationDetails((prev) => ({
        ...prev,
        [relation]: {
          assistanceCategories: categories,
        },
      }));
    } catch (error) {
      console.log("Error fetching family details", error);
    }
  };

  useEffect(() => {
    if (!relation || !existingAssistance) return;

    const categories = normalizeAssistanceCategories(existingAssistance);

    setAssistanceData((prev) => ({
      ...prev,
      [relation]: existingAssistance,
    }));

    setRelationDetails((prev) => ({
      ...prev,
      [relation]: {
        assistanceCategories: categories,
      },
    }));
  }, [existingAssistance, relation]);

  // useEffect(() => {
  //   if (!relation) return;

  //   const categories = normalizeAssistanceCategories(existingAssistance);

  //   setAssistanceData({
  //     [relation]: existingAssistance,
  //   });

  //   setRelationDetails({
  //     [relation]: {
  //       assistanceCategories: categories,
  //     },
  //   });
  // }, [existingAssistance, relation]);

  useEffect(() => {
    if (familyId && relation) {
      fetchFamilyDetails();
    }
  }, [familyId, relation, selectedSadhu]);
  /* -------------------- Checkbox Toggle -------------------- */

  //   const handleCategoryToggle = (rel, category) => {
  //     setRelationDetails((prev) => {
  //       const current = prev[rel]?.assistanceCategories || [];

  //       const updated = current.includes(category)
  //         ? current.filter((c) => c !== category)
  //         : [...current, category];

  //       return {
  //         ...prev,
  //         [rel]: {
  //           ...prev[rel],
  //           assistanceCategories: updated,
  //         },
  //       };
  //     });
  //   };
  const handleCategoryToggle = (rel, category) => {
    setRelationDetails((prev) => {
      const currentCategories = prev[rel]?.assistanceCategories || [];
      const currentData = prev[rel]?.assistanceData || {};

      let updatedCategories;
      let updatedData = { ...currentData };

      if (currentCategories.includes(category)) {
        // UNCHECK → remove category
        updatedCategories = currentCategories.filter((c) => c !== category);
        delete updatedData[category];
        if (category === "Business") {
          delete updatedData.BusinessSupport;
        }
      } else {
        // CHECK → add category
        updatedCategories = [...currentCategories, category];
      }

      return {
        ...prev,
        [rel]: {
          ...prev[rel],
          assistanceCategories: updatedCategories,
          assistanceData: updatedData,
        },
      };
    });
  };
  /* -------------------- Handlers -------------------- */

  const handleMedicalChange = (relation, field, value) => {
    setAssistanceData((prev) => ({
      ...prev,
      [relation]: {
        ...prev[relation],
        Medical: {
          ...prev[relation]?.Medical,
          [field]: value,
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
        },
      },
    }));
  };

  const handleBusinessChange = (relation, field, value) => {
    setAssistanceData((prev) => ({
      ...prev,
      [relation]: {
        ...prev[relation],
        BusinessSupport: {
          ...prev[relation]?.BusinessSupport,
          [field]: value,
        },
      },
    }));
  };
  /* -------------------- UI -------------------- */
  const handleUpdateApplication = async () => {
    debugger;
    try {
      const payload = {
        familyId,
        relation,
        assistanceData: assistanceData?.[relation] || {},
      };

      console.log("Updating Application:", payload);

      const response = await axios.put(`${API}/api/update-assistance`, payload);

      if (response.data?.success) {
        alert("Application Updated Successfully");
        fetchFamilyDetails();
      } else {
        alert("Update Failed");
      }
    } catch (error) {
      console.error("Update Error:", error);
      alert("Something went wrong while updating");
    }
  };
  const rel = relation;

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Assistance Details</h1>

      <div className="bg-white p-6 rounded shadow mb-6">
        <p>
          <b>Sadhu:</b> {sadhuName}
        </p>
        <p>
          <b>Relation:</b> {relation}
        </p>
        <p>
          <b>Name:</b> {memberData?.fullName}
        </p>
      </div>

      {/* ---------------- Assistance Type Checkboxes ---------------- */}

      <div className="bg-white p-6 rounded shadow mb-6">
        <h3 className="font-semibold mb-4">Assistance Types</h3>

        <div className="flex flex-wrap gap-4">
          {assistanceTypes.map((type) => (
            <label key={type} className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={includesValue(
                  relationDetails[rel]?.assistanceCategories,
                  type,
                )}
                onChange={() => handleCategoryToggle(rel, type)}
              />

              {type}
            </label>
          ))}
        </div>
      </div>

      {relationDetails[rel]?.assistanceCategories?.includes("Medical") && (
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
                value={assistanceData[rel]?.Medical?.issueType || ""}
                onChange={(e) =>
                  handleMedicalChange(rel, "issueType", e.target.value)
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
                value={assistanceData[rel]?.Medical?.diseaseName || ""}
                onChange={(e) =>
                  handleMedicalChange(rel, "diseaseName", e.target.value)
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
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`perm-${rel}`}
                      checked={
                        assistanceData[rel]?.Medical?.isPermanent === opt
                      }
                      onChange={() =>
                        handleMedicalChange(rel, "isPermanent", opt)
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
                value={assistanceData[rel]?.Medical?.estimatedExpense || ""}
                onChange={(e) =>
                  handleMedicalChange(rel, "estimatedExpense", e.target.value)
                }
                className="border p-2 rounded outline-none focus:border-blue-500"
              />
            </div>

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
                      name={`urgency-${rel}`}
                      checked={assistanceData[rel]?.Medical?.urgency === level}
                      onChange={() =>
                        handleMedicalChange(rel, "urgency", level)
                      }
                    />{" "}
                    {level}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase text-gray-500">
                Treatment Ongoing?*
              </label>
              <div className="flex gap-4 mt-2">
                {["Yes", "No"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`ongoing-${rel}`}
                      checked={assistanceData[rel]?.Medical?.isOngoing === opt}
                      onChange={() =>
                        handleMedicalChange(rel, "isOngoing", opt)
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
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`surgery-${rel}`}
                      checked={
                        assistanceData[rel]?.Medical?.majorSurgery === opt
                      }
                      onChange={() =>
                        handleMedicalChange(rel, "majorSurgery", opt)
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
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`insurance-${rel}`}
                      checked={
                        assistanceData[rel]?.Medical?.hasInsurance === opt
                      }
                      onChange={() =>
                        handleMedicalChange(rel, "hasInsurance", opt)
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
                value={assistanceData[rel]?.Medical?.assistanceFor || ""}
                onChange={(e) =>
                  handleMedicalChange(rel, "assistanceFor", e.target.value)
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
                      assistanceData[rel]?.Medical?.repeatedAssistance || false
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
                    checked={!assistanceData[rel]?.Medical?.repeatedAssistance}
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
            { }
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
                        handleMedicalChange(
                          rel,
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
                      value={assistanceData[rel]?.Medical?.sessionsCount || ""}
                      onChange={(e) =>
                        handleMedicalChange(
                          rel,
                          "sessionsCount",
                          e.target.value,
                        )
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
                  value={assistanceData[rel]?.Medical?.documentName || ""}
                  onChange={(e) =>
                    handleMedicalChange(rel, "documentName", e.target.value)
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
                      handleMedicalChange(rel, "documentFile", file);
                    }
                  }}
                />

                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById(`file-upload-${rel}`).click()
                  }
                  className="border-2 border-blue-500 w-[250px] text-blue-500 px-4 py-2 rounded font-medium hover:bg-blue-50 transition"
                >
                  Upload Document
                </button>

                {/* Display File Name */}
                <span className="text-gray-400 text-sm self-center truncate max-w-[150px]">
                  {assistanceData[rel]?.Medical?.documentFile?.name ||
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
                  handleMedicalChange(rel, "nextDate", e.target.value)
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
                value={assistanceData[rel]?.Medical?.amountRequired || ""}
                onChange={(e) =>
                  handleMedicalChange(rel, "amountRequired", e.target.value)
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
              value={assistanceData[rel]?.Medical?.remark || ""}
              onChange={(e) =>
                handleMedicalChange(rel, "remark", e.target.value)
              }
            ></textarea>
          </div>
        </div>
      )}

      {relationDetails[rel]?.assistanceCategories?.includes("Education") && (
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
                value={assistanceData[rel]?.Education?.schoolName || ""}
                onChange={(e) =>
                  handleEducationChange(rel, "schoolName", e.target.value)
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
                value={assistanceData[rel]?.Education?.classGrade || ""}
                onChange={(e) =>
                  handleEducationChange(rel, "classGrade", e.target.value)
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
                value={assistanceData[rel]?.Education?.medium || ""}
                onChange={(e) =>
                  handleEducationChange(rel, "medium", e.target.value)
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
                value={assistanceData[rel]?.Education?.fees || ""}
                onChange={(e) =>
                  handleEducationChange(rel, "fees", e.target.value)
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
                value={assistanceData[rel]?.Education?.stationeryExpenses || ""}
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
                value={assistanceData[rel]?.Education?.minorityNumber || ""}
                onChange={(e) =>
                  handleEducationChange(rel, "OtherExpenses", e.target.value)
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
                value={assistanceData[rel]?.Education?.totalExpenses || ""}
                onChange={(e) =>
                  handleEducationChange(rel, "totalExpenses", e.target.value)
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
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`scholarship-${rel}`}
                      checked={
                        assistanceData[rel]?.Education?.hasScholarship === opt
                      }
                      onChange={() =>
                        handleEducationChange(rel, "hasScholarship", opt)
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
                value={assistanceData[rel]?.Education?.supportAmount || ""}
                onChange={(e) =>
                  handleEducationChange(rel, "supportAmount", e.target.value)
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
                  <label key={dur} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`duration-${rel}`}
                      checked={
                        assistanceData[rel]?.Education?.supportDuration === dur
                      }
                      onChange={() =>
                        handleEducationChange(rel, "supportDuration", dur)
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
                {["High", "Medium", "Low"].map((level) => (
                  <label
                    key={level}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name={`edu-urgency-${rel}`}
                      checked={
                        assistanceData[rel]?.Education?.urgency === level
                      }
                      onChange={() =>
                        handleEducationChange(rel, "urgency", level)
                      }
                    />{" "}
                    {level}
                  </label>
                ))}
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
                  {assistanceData[rel]?.Education?.idCardFile?.name ||
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
              value={assistanceData[rel]?.Education?.remark || ""}
              onChange={(e) =>
                handleEducationChange(rel, "remark", e.target.value)
              }
            ></textarea>
          </div>
        </div>
      )}

      {relationDetails[rel]?.assistanceCategories?.includes("Job") && (
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
                value={assistanceData[rel]?.Job?.education || ""}
                onChange={(e) =>
                  handleJobChange(rel, "education", e.target.value)
                }
                className="border p-2 rounded outline-none focus:border-blue-500"
              />
            </div>

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
                      name={`job-urgency-${rel}`}
                      checked={assistanceData[rel]?.Job?.urgency === level}
                      onChange={() => handleJobChange(rel, "urgency", level)}
                    />{" "}
                    {level}
                  </label>
                ))}
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase text-gray-500">
                Skills / Experience*
              </label>
              <input
                type="text"
                value={assistanceData[rel]?.Job?.skills || ""}
                onChange={(e) => handleJobChange(rel, "skills", e.target.value)}
                className="border p-2 rounded outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase text-gray-500">
                Preferred Job Type*
              </label>
              <div className="flex gap-4 mt-2">
                {["Full-time", "Part-time", "Contract"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <input
                      type="checkbox"
                      checked={includesValue(
                        assistanceData[rel]?.Job?.preferredJobType,
                        type,
                      )}
                      onChange={(e) => {
                        const currentTypes =
                          assistanceData[rel]?.Job?.preferredJobType || [];
                        const newTypes = e.target.checked
                          ? [...currentTypes, type]
                          : currentTypes.filter((t) => t !== type);
                        handleJobChange(rel, "preferredJobType", newTypes);
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
                value={assistanceData[rel]?.Job?.location || ""}
                onChange={(e) =>
                  handleJobChange(rel, "location", e.target.value)
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
                      checked={includesValue(
                        assistanceData[rel]?.Job?.interests,
                        place,
                      )}
                      onChange={(e) => {
                        const currentInterests =
                          assistanceData[rel]?.Job?.interests || [];
                        const newInterests = e.target.checked
                          ? [...currentInterests, place]
                          : currentInterests.filter((p) => p !== place);
                        handleJobChange(rel, "interests", newInterests);
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
              value={assistanceData[rel]?.Job?.remark || ""}
              onChange={(e) => handleJobChange(rel, "remark", e.target.value)}
            ></textarea>
          </div>
        </div>
      )}

      {relationDetails[rel]?.assistanceCategories?.includes("Food") && (
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
                value={assistanceData[rel]?.Food?.memberCount || ""}
                onChange={(e) =>
                  handleFoodChange(rel, "memberCount", e.target.value)
                }
                className="border p-2 rounded outline-none focus:border-blue-500"
              />
            </div>

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
                      name={`food-urgency-${rel}`}
                      checked={assistanceData[rel]?.Food?.urgency === level}
                      onChange={() => handleFoodChange(rel, "urgency", level)}
                    />{" "}
                    {level}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase text-gray-500">
                Type of Food Support Required?*
              </label>
              <div className="flex gap-4 mt-2">
                {["Dry ration", "Cooked meals"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <input
                      type="checkbox"
                      checked={includesValue(
                        assistanceData[rel]?.Food?.foodType,
                        type,
                      )}
                      onChange={(e) => {
                        const currentTypes =
                          assistanceData[rel]?.Food?.foodType || [];
                        const newTypes = e.target.checked
                          ? [...currentTypes, type]
                          : currentTypes.filter((t) => t !== type);
                        handleFoodChange(rel, "foodType", newTypes);
                      }}
                    />{" "}
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase text-gray-500">
                Frequency
              </label>
              <select
                className="border p-2 rounded bg-white outline-none focus:border-blue-500 text-gray-700"
                value={assistanceData[rel]?.Food?.duration || ""}
                onChange={(e) =>
                  handleFoodChange(rel, "duration", e.target.value)
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
                value={assistanceData[rel]?.Food?.FrequencyDuration || ""}
                onChange={(e) =>
                  handleFoodChange(rel, "FrequencyDuration", e.target.value)
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
              value={assistanceData[rel]?.Food?.reason || ""}
              onChange={(e) => handleFoodChange(rel, "reason", e.target.value)}
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
              value={assistanceData[rel]?.Food?.remark || ""}
              onChange={(e) => handleFoodChange(rel, "remark", e.target.value)}
            ></textarea>
          </div>
        </div>
      )}

      {relationDetails[rel]?.assistanceCategories?.includes("Rent") && (
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
                value={assistanceData[rel]?.Rent?.monthlyAmount || ""}
                onChange={(e) =>
                  handleRentChange(rel, "monthlyAmount", e.target.value)
                }
                className="border p-2 rounded outline-none focus:border-blue-500"
              />
            </div>

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
                      name={`rent-urgency-${rel}`}
                      checked={assistanceData[rel]?.Rent?.urgency === level}
                      onChange={() => handleRentChange(rel, "urgency", level)}
                    />{" "}
                    {level}
                  </label>
                ))}
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
                      checked={assistanceData[rel]?.Rent?.isPending === opt}
                      onChange={() => handleRentChange(rel, "isPending", opt)}
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
                value={assistanceData[rel]?.Rent?.pendingMonths || ""}
                onChange={(e) =>
                  handleRentChange(rel, "pendingMonths", e.target.value)
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
                        assistanceData[rel]?.Rent?.proofAvailable === opt
                      }
                      onChange={() =>
                        handleRentChange(rel, "proofAvailable", opt)
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
                        assistanceData[rel]?.Rent?.reimbursementRequired === opt
                      }
                      onChange={() =>
                        handleRentChange(rel, "reimbursementRequired", opt)
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
                      handleRentChange(rel, "rentProofFile", e.target.files[0])
                    }
                  />
                </label>
                <span className="px-3 text-sm text-gray-500 truncate">
                  {assistanceData[rel]?.Rent?.rentProofFile?.name ||
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
              value={assistanceData[rel]?.Rent?.remark || ""}
              onChange={(e) => handleRentChange(rel, "remark", e.target.value)}
            ></textarea>
          </div>
        </div>
      )}

      {relationDetails[rel]?.assistanceCategories?.includes("Housing") && (
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
                {["House purchase", "House repair"].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={includesValue(
                        assistanceData[rel]?.Housing?.assistanceType,
                        type,
                      )}
                      onChange={(e) => {
                        const currentTypes =
                          assistanceData[rel]?.Housing?.assistanceType || [];
                        const newTypes = e.target.checked
                          ? [...currentTypes, type]
                          : currentTypes.filter((t) => t !== type);
                        handleHousingChange(rel, "assistanceType", newTypes);
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
                {["High", "Medium", "Low"].map((level) => (
                  <label
                    key={level}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name={`house-urgency-${rel}`}
                      checked={assistanceData[rel]?.Housing?.urgency === level}
                      onChange={() =>
                        handleHousingChange(rel, "urgency", level)
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
                value={assistanceData[rel]?.Housing?.totalCost || ""}
                onChange={(e) =>
                  handleHousingChange(rel, "totalCost", e.target.value)
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
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`partial-${rel}`}
                      checked={assistanceData[rel]?.Housing?.isPartial === opt}
                      onChange={() =>
                        handleHousingChange(rel, "isPartial", opt)
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
                value={assistanceData[rel]?.Housing?.amountRequired || ""}
                onChange={(e) =>
                  handleHousingChange(rel, "amountRequired", e.target.value)
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
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`contribution-${rel}`}
                      checked={
                        assistanceData[rel]?.Housing?.ownContribution === opt
                      }
                      onChange={() =>
                        handleHousingChange(rel, "ownContribution", opt)
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
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`loan-${rel}`}
                      checked={
                        assistanceData[rel]?.Housing?.hasOtherSupport === opt
                      }
                      onChange={() =>
                        handleHousingChange(rel, "hasOtherSupport", opt)
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
              value={assistanceData[rel]?.Housing?.remark || ""}
              onChange={(e) =>
                handleHousingChange(rel, "remark", e.target.value)
              }
            ></textarea>
          </div>
        </div>
      )}

      {relationDetails[rel]?.assistanceCategories?.includes("Vaiyavacch") && (
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
              <button type="button" className="px-2 hover:bg-gray-200 rounded">
                🔗
              </button>
              <button type="button" className="px-2 hover:bg-gray-200 rounded">
                📋
              </button>
              <button type="button" className="px-2 hover:bg-gray-200 rounded">
                🎬
              </button>
            </div>

            {/* Description Textarea */}
            <textarea
              className="w-full h-48 p-4 outline-none resize-none"
              placeholder="Enter Description"
              value={assistanceData[rel]?.Vaiyavacch?.description || ""}
              onChange={(e) =>
                handleVaiyavacchChange(rel, "description", e.target.value)
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
                  value={assistanceData[rel]?.EmergencyExpenses?.type || ""}
                  onChange={(e) =>
                    handleEmergencyChange(rel, "type", e.target.value)
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
                  value={assistanceData[rel]?.EmergencyExpenses?.amount || ""}
                  onChange={(e) =>
                    handleEmergencyChange(rel, "amount", e.target.value)
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
                  value={assistanceData[rel]?.EmergencyExpenses?.mobile || ""}
                  onChange={(e) =>
                    handleEmergencyChange(rel, "mobile", e.target.value)
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
                value={assistanceData[rel]?.EmergencyExpenses?.description || ""}
                onChange={(e) =>
                  handleEmergencyChange(rel, "description", e.target.value)
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
                  value={assistanceData[rel]?.EmergencyExpenses?.docName || ""}
                  onChange={(e) =>
                    handleEmergencyChange(rel, "docName", e.target.value)
                  }
                />
                <div className="flex-1 flex border rounded overflow-hidden">
                  <label className="bg-gray-100 px-4 py-2 text-sm border-r cursor-pointer hover:bg-gray-200">
                    Choose File
                  </label>
                  <span className="px-4 py-2 text-sm text-gray-400 flex-1">
                    {assistanceData[rel]?.EmergencyExpenses?.file?.name ||
                      "No file chosen"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      handleEmergencyChange(rel, "file", e.target.files[0])
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

      {relationDetails[rel]?.assistanceCategories?.includes("Business") && (
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
                value={assistanceData[rel]?.BusinessSupport?.businessType || ""}
                onChange={(e) =>
                  handleBusinessChange(rel, "businessType", e.target.value)
                }
              >
                <option value="">Select</option>
                <option value="Retail">Retail</option>
                <option value="Service">Service</option>
                <option value="Manufacturing">Manufacturing</option>
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
                value={assistanceData[rel]?.BusinessSupport?.duration || ""}
                onChange={(e) =>
                  handleBusinessChange(rel, "duration", e.target.value)
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
                        assistanceData[rel]?.BusinessSupport?.urgency === level
                      }
                      onChange={() =>
                        handleBusinessChange(rel, "urgency", level)
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
                value={assistanceData[rel]?.BusinessSupport?.income || ""}
                onChange={(e) =>
                  handleBusinessChange(rel, "income", e.target.value)
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
                value={assistanceData[rel]?.BusinessSupport?.expenses || ""}
                onChange={(e) =>
                  handleBusinessChange(rel, "expenses", e.target.value)
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
                        assistanceData[rel]?.BusinessSupport?.condition === cond
                      }
                      onChange={() =>
                        handleBusinessChange(rel, "condition", cond)
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
                value={assistanceData[rel]?.BusinessSupport?.dependents || ""}
                onChange={(e) =>
                  handleBusinessChange(rel, "dependents", e.target.value)
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
                        assistanceData[rel]?.BusinessSupport?.hasLoan === opt
                      }
                      onChange={() => handleBusinessChange(rel, "hasLoan", opt)}
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
                      handleBusinessChange(rel, "bizDoc", e.target.files[0])
                    }
                  />
                </label>
                <span className="px-3 py-2 text-sm text-gray-400 truncate">
                  {assistanceData[rel]?.BusinessSupport?.bizDoc?.name ||
                    "No file chosen"}
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
                        assistanceData[rel]?.BusinessSupport?.hasScheme === opt
                      }
                      onChange={() =>
                        handleBusinessChange(rel, "hasScheme", opt)
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
                  {assistanceData[rel]?.BusinessSupport?.quotationFile?.name ||
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
              className="w-full border p-2 rounded mt-1 h-24 outline-none resize-none focus:border-blue-500"
              value={assistanceData[rel]?.BusinessSupport?.remark || ""}
              onChange={(e) =>
                handleBusinessChange(rel, "remark", e.target.value)
              }
            ></textarea>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={handleUpdateApplication}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow transition duration-200"
        >
          Update Application
        </button>
      </div>
    </div>
  );
};

export default AssistanceDetails;
