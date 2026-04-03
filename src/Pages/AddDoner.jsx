import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import { BLOOD_GROUP, GENDER } from "../utils/constants";
import { isValidAadhaar, isValidPAN } from "../utils/validation";

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const asObject = (value) => (value && typeof value === "object" ? value : {});
const DOC_ACCEPT = ".png,.jpg,.jpeg,.pdf";
const IMAGE_ACCEPT = ".png,.jpg,.jpeg";
const DOC_ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
const IMAGE_ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

function AddDonor() {

  const navigate = useNavigate();

  const location = useLocation();
  const editDonorId = location?.state?.id;
  const isEditMode = Boolean(editDonorId);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalDetails: {
      salutation: "",
      firstName: "",
      lastName: "",
      gender: "",
      dob: "",
      anniversary: "",
      mobileNumber: "",
      altMobileNumber: "",
      email: "",
      bloodGroup: "",
      motherTongue: "",
      nativePlace: "",
      aadhaarNumber: "",
      aadhaarFile: null,
      panNumber: "",
      panFile: null,
      photo: null,
    },

    contactPerson: {
      contactPersonName: "",
      contactPersonMobile: "",
    },

    residentialAddress: {
      address1: "",
      city: "",
      pincode: "",
      contactCode: "",
      contactNumber: "",
      proof: "",
      preferredAddress: "",
    },

    communicationAddress: {
      communicationAddress1: "",
      communicationAddress2: "",
    },

    companyDetails: {
      companyName: "",
      companyNumber: "",
      companyAddress: "",
    },

    familyDetails: {
      fatherName: "",
      spouseName: "",
      spouseDob: "",
      spouseBloodGroup: "",
      hasChildren: "",
      children: [],
    },

    nomineeDetails: {
      nomineeName: "",
      nomineeContact: "",
      nomineeAddress: "",
      nomineecity: "",
      nomineepincode: "",
      nomineerelation: "",
      nomineehasCompany: "",
      nomineecompanyName: "",
      nomineeresidentialAddress: "",
      nomineeofficeAddress: "",
      nomineeofficeContact: "",
    },

    paymentDetails: {
      totalInstallmentsAmount: "",
      installments: [],
    },
  });


  const requiredFields = {
    personalDetails: [
      "salutation",
      "firstName",
      "lastName",
      "gender",
      "email",
      "bloodGroup",
      "motherTongue",
      "nativePlace",
      "aadhaarNumber",
      "panNumber",
    ],
    contactPerson: ["contactPersonName", "contactPersonMobile"],
    residentialAddress: [
      "address1",
      "city",
      "pincode",
      "contactCode",
      "contactNumber",
      "preferredAddress",
    ],
    nomineeDetails: [
      "nomineeName",
      "nomineeContact",
      "nomineeAddress",
      "nomineecity",
      "nomineepincode",
      "nomineerelation",
      "nomineehasCompany",
    ],
  };

  const validateRequiredFields = () => {
    const newErrors = {};

    Object.keys(requiredFields).forEach((section) => {
      requiredFields[section].forEach((field) => {
        const value = formData[section]?.[field];

        if (!value || value === "") {
          newErrors[field] = "This field is required";
        }
      });
    });

    setErrors((prev) => ({ ...prev, ...newErrors }));

    return Object.keys(newErrors).length === 0;
  };


  const [errors, setErrors] = useState({});
  const [installmentError, setInstallmentError] = useState("");
  const [requiredValidationTriggered, setRequiredValidationTriggered] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const validateStep1 = (showAlert = false, showRequired = true) => {
    const e = {};
    const data = formData.personalDetails;

    // Required: Salutation
    if (showRequired && !data.salutation) {
      e.salutation = "Salutation is required";
    }

    // Required: First Name
    if (showRequired && !data.firstName) {
      e.firstName = "First name required";
    }

    // Required: Last Name
    if (showRequired && !data.lastName) {
      e.lastName = "Last name required";
    }

    // Required: Gender
    if (showRequired && (!data.gender || data.gender === "#")) {
      e.gender = "Gender required";
    }

    // Required: DOB with age check
    const today = new Date();
    const dob = new Date(data.dob);

    if (showRequired && !data.dob) {
      e.dob = "Date of Birth is required";
    } else if (data.dob && dob > today) {
      e.dob = "DOB cannot be future date";
    } else if (data.dob) {
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) {
        e.dob = "Age must be at least 18 years";
      }
    }

    // Required: Anniversary
    // if (showRequired && !data.anniversary) {
    //   e.anniversary = "Anniversary date is required";
    // }

    // Required: Mobile
    if (showRequired && !data.mobileNumber) {
      e.mobileNumber = "Mobile Number required";
    } else if (data.mobileNumber && !/^\d{10}$/.test(data.mobileNumber)) {
      e.mobileNumber = "Mobile must be 10 digits";
    }

    // Optional: Alt Mobile (but if provided, must be valid)
    if (data.altMobileNumber && !/^\d{10}$/.test(data.altMobileNumber)) {
      e.altMobileNumber = "Alt mobile must be 10 digits";
    }

    // Required: Email
    if (showRequired && !data.email) {
      e.email = "Email is required";
    } else if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      e.email = "Invalid email format";
    }

    // Required: Blood Group
    if (showRequired && !data.bloodGroup) {
      e.bloodGroup = "Blood Group required";
    }

    // Required: Aadhaar Number
    if (showRequired && !data.aadhaarNumber) {
      e.aadhaarNumber = "Aadhaar number required";
    } else if (data.aadhaarNumber && !isValidAadhaar(data.aadhaarNumber)) {
      e.aadhaarNumber = "Aadhaar must be 12 digits";
    }

    // Required: Aadhaar File
    if (showRequired && !data.aadhaarFile) {
      e.aadhaarFile = "Aadhaar upload is required";
    }

    // Required: PAN Number
    if (showRequired && !data.panNumber) {
      e.panNumber = "PAN number required";
    } else if (data.panNumber && !isValidPAN(data.panNumber)) {
      e.panNumber = "Invalid PAN format (ABCDE1234F)";
    }

    // Required: PAN File
    if (showRequired && !data.panFile) {
      e.panFile = "PAN upload is required";
    }

    // Required: Photo
    if (showRequired && !data.photo) {
      e.photo = "Photo upload is required";
    }

    
    // Residential Address - Required fields
    if (showRequired && !formData.residentialAddress.address1) {
      e.resAddress1 = "Residential address is required";
    }
    if (showRequired && !formData.residentialAddress.city) {
      e.resCity = "Residential city is required";
    }
    if (showRequired && !formData.residentialAddress.pincode) {
      e.resPincode = "Residential pincode is required";
    }
    if (showRequired && !formData.residentialAddress.contactCode) {
      e.resContactCode = "Contact code is required";
    }
    if (showRequired && !formData.residentialAddress.contactNumber) {
      e.resContactNumber = "Contact number is required";
    }
    if (showRequired && !formData.residentialAddress.preferredAddress) {
      e.preferredAddress = "Preferred address type is required";
    }

    setErrors(e);
    if (showAlert && Object.keys(e).length > 0) {
      alert("Please fill all required fields marked with *");
    }

    return Object.keys(e).length === 0;
  };

  const validateStep2 = (showAlert = false, showRequired = true) => {
    const e = {};
    const data = formData.familyDetails;

    // Required: Father's Name
    if (showRequired && !data.fatherName) {
      e.fatherName = "Father's name is required";
    }

    // Required: Has Children
    if (showRequired && !data.hasChildren) {
      e.hasChildren = "Please select if you have children";
    }

    // If children exist, validate each child
    if (showRequired && data.hasChildren === "Yes" && data.children) {
      data.children.forEach((child, index) => {
        if (!child.name) {
          e[`child_${index}_name`] = "Child name is required";
        }
        if (!child.relation) {
          e[`child_${index}_relation`] = "Child relation is required";
        }
        if (!child.dob) {
          e[`child_${index}_dob`] = "Child DOB is required";
        }
        if (!child.bloodGroup) {
          e[`child_${index}_bloodGroup`] = "Child blood group is required";
        }
        if (!child.maritalStatus) {
          e[`child_${index}_maritalStatus`] = "Child marital status is required";
        }
      });
    }

    setErrors(e);
    if (showAlert && Object.keys(e).length > 0) {
      alert("Please fill all required fields in Family Details");
    }

    return Object.keys(e).length === 0;
  };

  const validateStep3 = (showAlert = false, showRequired = true) => {
    const e = {};
    const data = formData.nomineeDetails;

    // Required fields
    if (showRequired && !data.nomineeName) {
      e.nomineeName = "Nominee name is required";
    }
    if (showRequired && !data.nomineeContact) {
      e.nomineeContact = "Valid 10-digit contact number is required";
    } else if (data.nomineeContact && !/^\d{10}$/.test(data.nomineeContact)) {
      e.nomineeContact = "Valid 10-digit contact number is required";
    }
    if (showRequired && !data.nomineeAddress) {
      e.nomineeAddress = "Nominee address is required";
    }
    if (showRequired && !data.nomineecity) {
      e.nomineecity = "Nominee city is required";
    }
    if (showRequired && !data.nomineepincode) {
      e.nomineepincode = "Nominee pincode is required";
    }
    if (showRequired && !data.nomineerelation) {
      e.nomineerelation = "Nominee relation is required";
    }
    if (showRequired && !data.nomineehasCompany) {
      e.nomineehasCompany = "Please select if nominee has company";
    }

    setErrors(e);
    if (showAlert && Object.keys(e).length > 0) {
      alert("Please fill all required fields in Nominee Details");
    }

    return Object.keys(e).length === 0;
  };

  const validateStep4 = (showAlert = false, showRequired = true) => {
    const e = {};

    // Check total amount
    if (showRequired && !formData.paymentDetails.totalInstallmentsAmount) {
      e.totalInstallmentsAmount = "Total installment amount is required";
    }

    // Check if installments are added
    if (
      showRequired &&
      (!formData.paymentDetails.installments || formData.paymentDetails.installments.length === 0)
    ) {
      e.installments = "Please add at least one installment";
    }

    // Validate installments sum
    const installmentError = validateInstallments();
    if (installmentError) {
      e.installmentValidation = installmentError;
    }

    setErrors(e);
    if (showAlert && Object.keys(e).length > 0) {
      alert(installmentError || "Please complete all payment details");
    }

    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    try {
      // Validate Step 4 (Payment Details) before submission
      const isValidStep4 = validateStep4();
      if (!isValidStep4) {
        return;
      }

      const resolvedDonorId =
        editDonorId || formData?.id || formData?.donor_id || null;

      const error = validateInstallments();
      if (error) {
        alert(error);
        return;
      }

      if (!isValidAadhaar(formData.personalDetails.aadhaarNumber)) {
        alert("Aadhaar must be 12 digits only");
        return;
      }

      if (!isValidPAN(formData.personalDetails.panNumber)) {
        alert("PAN must be in format AAAAA9999A");
        return;
      }

      const payload = {
        ...formData,
        personalDetails: {
          ...formData.personalDetails,
        },
        familyDetails: {
          ...formData.familyDetails,
        },
      };

      // delete payload.personalDetails.gender;
      // delete payload.personalDetails.dob;
      // delete payload.personalDetails.mobileNumber;
      // delete payload.personalDetails.altMobileNumber;
      // delete payload.familyDetails.spouseDob;

      if (isEditMode) {
        if (!resolvedDonorId) {
          alert("Donor id is missing for update.");
          return;
        }
        payload.id = resolvedDonorId;
        payload.donor_id = resolvedDonorId;
      }

      const requestData = new FormData();
      requestData.append(
        "personalDetails",
        JSON.stringify({
          ...payload.personalDetails,
          photo: undefined,
          panFile: undefined,
          aadhaarFile: undefined,
        }),
      );
      requestData.append("contactPerson", JSON.stringify(payload.contactPerson));
      requestData.append(
        "residentialAddress",
        JSON.stringify(payload.residentialAddress),
      );
      requestData.append(
        "communicationAddress",
        JSON.stringify(payload.communicationAddress),
      );
      requestData.append("companyDetails", JSON.stringify(payload.companyDetails));
      requestData.append("familyDetails", JSON.stringify(payload.familyDetails));
      requestData.append("nomineeDetails", JSON.stringify(payload.nomineeDetails));
      requestData.append("paymentDetails", JSON.stringify(payload.paymentDetails));

      if (formData.personalDetails.photo instanceof File) {
        requestData.append("photo", formData.personalDetails.photo);
      }
      if (formData.personalDetails.aadhaarFile instanceof File) {
        requestData.append("aadhaarFile", formData.personalDetails.aadhaarFile);
      }
      if (formData.personalDetails.panFile instanceof File) {
        requestData.append("panFile", formData.personalDetails.panFile);
      }

      const response = await fetch(
        isEditMode
          ? `${API}/api/donor/update/${resolvedDonorId}`
          : `${API}/api/donor/create`,
        {
          method: isEditMode ? "PUT" : "POST",
          body: requestData,
        },
      );

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to save donor");
      }

      alert(
        isEditMode ? "Donor Updated Successfully" : "Donor Created Successfully",
      );

      navigate("/donor");

      console.log(data);
    } catch (error) {
      console.log(error);
      alert(error.message || "Failed to save donor");
    }
  };



  const [numInstallments, setNumInstallments] = useState("");
  const [photo, setPhoto] = useState(null);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [isLanguageLoading, setIsLanguageLoading] = useState(false);
  const [resProofOptions, setResProofOptions] = useState([]);
  const [isResProofLoading, setIsResProofLoading] = useState(false);

  useEffect(() => {
    const fetchActiveLanguages = async () => {
      try {
        setIsLanguageLoading(true);
        const response = await fetch(`${API}/api/languages/list`);
        if (!response.ok) {
          throw new Error("Failed to fetch languages");
        }
        const data = await response.json();
        const rows = Array.isArray(data) ? data : [];
        const activeLanguages = rows
          .filter(
            (item) =>
              String(item?.status || "").toLowerCase() === "active" &&
              String(item?.name || "").trim(),
          )
          .map((item) => ({
            label: item.name,
            value: item.name,
          }));
        setLanguageOptions(activeLanguages);

      } catch (error) {
        console.error("Error fetching active languages:", error);
        setLanguageOptions([]);
      } finally {
        setIsLanguageLoading(false);
      }
    };

    fetchActiveLanguages();
  }, []);


  useEffect(() => {
    const fetchActiveResProof = async () => {
      try {
        setIsResProofLoading(true);

        const response = await fetch(`${API}/api/resproof/list`);

        if (!response.ok) {
          throw new Error("Failed to fetch res proof");
        }

        const data = await response.json();

        const activeResProofs = data
          .filter(
            (item) =>
              String(item?.status || "").toLowerCase() === "active" &&
              String(item?.name || "").trim()
          )
          .map((item) => ({
            label: item.name,
            value: item.name,
          }));

        setResProofOptions(activeResProofs);
        console.log("test", activeResProofs)

      } catch (error) {
        console.error("Error fetching res proof:", error);
        setResProofOptions([]);
      } finally {
        setIsResProofLoading(false);
      }
    };

    fetchActiveResProof();
  }, []);

  useEffect(() => {
    if (numInstallments) {
      const count = parseInt(numInstallments);

      setFormData((prev) => ({
        ...prev,
        paymentDetails: {
          ...prev.paymentDetails,
          installments: Array.from({ length: count }, (_, index) => {
            const existing = prev.paymentDetails?.installments?.[index];
            return (
              existing || {
                id: Date.now() + index,
                amount: "",
                dueDate: "",
                fundDate: "",
                paymentMode: "",
                utrNo: "",
                status: "",
              }
            );
          }),
        },
      }));
    }
  }, [numInstallments]);

  useEffect(() => {
    if (!editDonorId) return;

    const fetchDonorById = async () => {
      try {
        const response = await fetch(`${API}/api/donor/list`);
        const data = await response.json();
        const donors = Array.isArray(data?.data) ? data.data : [];
        const donor = donors.find(
          (item) => String(item?.id) === String(editDonorId),
        );

        if (!donor) return;

        const personalDetails = asObject(
          parseMaybeJson(donor?.personalDetails ?? donor?.personal_details ?? {}),
        );
        const contactPerson = asObject(
          parseMaybeJson(donor?.contactPerson ?? donor?.contact_person ?? {}),
        );
        const residentialAddress = asObject(
          parseMaybeJson(
            donor?.residentialAddress ?? donor?.residential_address ?? {},
          ),
        );
        const communicationAddress = asObject(
          parseMaybeJson(
            donor?.communicationAddress ?? donor?.communication_address ?? {},
          ),
        );
        const companyDetails = asObject(
          parseMaybeJson(donor?.companyDetails ?? donor?.company_details ?? {}),
        );
        const familyDetails = asObject(
          parseMaybeJson(donor?.familyDetails ?? donor?.family_details ?? {}),
        );
        const nomineeDetails = asObject(
          parseMaybeJson(donor?.nomineeDetails ?? donor?.nominee_details ?? {}),
        );
        const paymentDetails = asObject(
          parseMaybeJson(donor?.paymentDetails ?? donor?.payment_details ?? {}),
        );
        const installments = Array.isArray(paymentDetails?.installments)
          ? paymentDetails.installments
          : [];

        setFormData((prev) => ({
          ...prev,
          personalDetails: {
            ...prev.personalDetails,
            ...personalDetails,
          },
          contactPerson: {
            ...prev.contactPerson,
            ...contactPerson,
          },
          residentialAddress: {
            ...prev.residentialAddress,
            ...residentialAddress,
          },
          communicationAddress: {
            ...prev.communicationAddress,
            ...communicationAddress,
          },
          companyDetails: {
            ...prev.companyDetails,
            ...companyDetails,
          },
          familyDetails: {
            ...prev.familyDetails,
            ...familyDetails,
            children: Array.isArray(familyDetails?.children)
              ? familyDetails.children
              : [],
          },
          nomineeDetails: {
            ...prev.nomineeDetails,
            ...nomineeDetails,
          },
          paymentDetails: {
            ...prev.paymentDetails,
            ...paymentDetails,
            installments,
          },
        }));

        setNumInstallments(installments.length ? String(installments.length) : "");
        setPhoto(personalDetails?.photo ?? null);
      } catch (error) {
        console.log("Error fetching donor details:", error);
      }
    };

    fetchDonorById();
  }, [editDonorId]);

  const handleInstallmentChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedInstallments = [...prev.paymentDetails.installments];

      updatedInstallments[index] = {
        ...updatedInstallments[index],
        [field]: value,
      };

      return {
        ...prev,
        paymentDetails: {
          ...prev.paymentDetails,
          installments: updatedInstallments,
        },
      };
    });
  };

  const handleAddChild = () => {
    setFormData((prev) => ({
      ...prev,
      familyDetails: {
        ...prev.familyDetails,
        children: [
          ...prev.familyDetails.children,
          {
            id: Date.now(),
            name: "",
            relation: "",
            dob: "",
            bloodGroup: "",
            maritalStatus: "",
          },
        ],
      },
    }));
  };

  const steps = [
    "Personal Details",
    "Family Details",
    "Nominee Details",
    "Payment Details",
  ];
  // const handleNext = (e) => {
  //   e.preventDefault();

  //   if (currentStep < steps.length) {
  //     setCurrentStep((prev) => prev + 1);
  //   }
  // };

  const handleNext = (e) => {
    e.preventDefault();
    setRequiredValidationTriggered((prev) => ({ ...prev, [currentStep]: true }));

    // Validate based on current step
    if (currentStep === 1) {
      const isValidStep1 = validateStep1(true, true);
      if (!isValidStep1) return;
    } else if (currentStep === 2) {
      const isValidStep2 = validateStep2(true, true);
      if (!isValidStep2) return;
    } else if (currentStep === 3) {
      const isValidStep3 = validateStep3(true, true);
      if (!isValidStep3) return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = (e) => {
    e.preventDefault();

    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };


  const handleRemoveChild = (id) => {
    setFormData((prev) => ({
      ...prev,
      familyDetails: {
        ...prev.familyDetails,
        children: prev.familyDetails.children.filter(
          (child) => child.id !== id
        ),
      },
    }));
  };

  const handleChildChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      familyDetails: {
        ...prev.familyDetails,
        children: prev.familyDetails.children.map((child) =>
          child.id === id ? { ...child, [field]: value } : child
        ),
      },
    }));
  };

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const getMaxDOB = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);

    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const validateInstallments = () => {
    const totalAmount = Number(formData.paymentDetails.totalInstallmentsAmount || 0);

    const installmentAmounts = formData.paymentDetails.installments || [];

    const sum = installmentAmounts.reduce(
      (acc, item) => acc + Number(item.amount || 0),
      0
    );

    if (sum !== totalAmount) {
      return "Total installment amount and sum of installments must be equal";
    }

    return "";
  };

  useEffect(() => {
    const error = validateInstallments();
    setInstallmentError(error);
  }, [formData.paymentDetails]);

  useEffect(() => {
    // Step 1: format errors instant (required only after Next on this step)
    if (currentStep === 1) {
      validateStep1(false, requiredValidationTriggered[1]);
      return;
    }

    // Other steps: required errors appear only after Next is attempted on that step
    if (currentStep === 2 && requiredValidationTriggered[2]) {
      validateStep2(false, true);
      return;
    }

    if (currentStep === 3 && requiredValidationTriggered[3]) {
      validateStep3(false, true);
      return;
    }

    if (currentStep === 4 && requiredValidationTriggered[4]) {
      validateStep4(false, true);
    }
  }, [formData, currentStep, requiredValidationTriggered]);


  return (
    <div className="min-h-screen bg-gray-50 flex p-6 justify-center">
      <div className="w-full max-w-8xl bg-white p-6 shadow-sm">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${currentStep > index + 1 ? "bg-green-500" : currentStep === index + 1 ? "bg-blue-500" : "bg-gray-300"}`}
                >
                  {currentStep > index + 1 ? "✓" : index + 1}
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${currentStep === index + 1 ? "text-blue-500" : "text-gray-600"}`}
                  >
                    {step}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${currentStep > index + 1 ? "bg-green-500" : "bg-gray-300"}`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <>
              <h3 className="text-red-500 font-semibold text-lg">
                Personal Details
              </h3>

              {/* SECTION: Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Salutation<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.personalDetails.salutation}
                    onChange={(e) =>
                      handleChange(
                        "personalDetails",
                        "salutation",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select</option>
                    <option value="Shri">Shri.</option>
                    <option value="Smt">Smt.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    First Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.personalDetails.firstName}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    onChange={(e) =>
                      handleChange("personalDetails", "firstName", e.target.value)
                    }
                  />
                  {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.personalDetails.lastName}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    onChange={(e) =>
                      handleChange("personalDetails", "lastName", e.target.value)
                    }
                  />
                  {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}

                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Gender<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.personalDetails.gender}
                    onChange={(e) =>
                      handleChange(
                        "personalDetails",
                        "gender",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100">
                    <option value="#">Select</option>
                    {GENDER.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs">{errors.gender}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date of Birth<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    max={getMaxDOB()} // 🔥 restrict future + under 18
                    value={formData.personalDetails.dob}
                    onChange={(e) =>
                      handleChange(
                        "personalDetails",
                        "dob",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  {errors.dob && <p className="text-red-500 text-xs">{errors.dob}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Anniversary
                  </label>
                  <input
                    type="date"
                    value={formData.personalDetails.anniversary}
                    onChange={(e) =>
                      handleChange(
                        "personalDetails",
                        "anniversary",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mobile Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.personalDetails.mobileNumber}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");

                      handleChange(
                        "personalDetails",
                        "mobileNumber",
                        onlyNumbers
                      );
                    }}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  {errors.mobileNumber && (
                    <p className="text-red-500 text-xs">{errors.mobileNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Alt Mobile Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.personalDetails.altMobileNumber}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");

                      handleChange(
                        "personalDetails",
                        "altMobileNumber",
                        onlyNumbers
                      );
                    }}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  {errors.altMobileNumber && (
                    <p className="text-red-500 text-xs">{errors.altMobileNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email ID<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.personalDetails.email}
                    onChange={(e) =>
                      handleChange("personalDetails", "email", e.target.value)
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Blood Group<span className="text-red-500">*</span>
                  </label>

                  <select
                    value={formData.personalDetails.bloodGroup}
                    onChange={(e) =>
                      handleChange(
                        "personalDetails",
                        "bloodGroup",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUP.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {errors.bloodGroup && <p className="text-red-500 text-xs">{errors.bloodGroup}</p>}

                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mother Tongue<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.personalDetails.motherTongue}
                    onChange={(e) =>
                      handleChange(
                        "personalDetails",
                        "motherTongue",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    disabled={isLanguageLoading}
                  >
                    <option value="">
                      {isLanguageLoading ? "Loading languages..." : "Select"}
                    </option>
                    {languageOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {errors.motherTongue && <p className="text-red-500 text-xs">{errors.motherTongue}</p>}


                  {/* <input
                    type="text"
                    value={formData.personalDetails.motherTongue}
                    onChange={(e) =>
                      handleChange(
                        "personalDetails",
                        "motherTongue",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  /> */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Native Place<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.personalDetails.nativePlace}
                    onChange={(e) =>
                      handleChange(
                        "personalDetails",
                        "nativePlace",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  {errors.nativePlace && <p className="text-red-500 text-xs">{errors.nativePlace}</p>}

                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Aadhaar Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={formData.personalDetails.aadhaarNumber || ""}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      handleChange("personalDetails", "aadhaarNumber", onlyNumbers);
                    }}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="Enter 12 digit Aadhaar"
                  />
                  {errors.aadhaarNumber && <p className="text-red-500 text-xs">{errors.aadhaarNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Aadhaar Upload<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept={DOC_ACCEPT}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (!DOC_ALLOWED_TYPES.includes(file.type)) {
                        alert("Aadhaar upload: only PNG, JPG, JPEG, PDF allowed");
                        return;
                      }

                      handleChange("personalDetails", "aadhaarFile", file);
                    }}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    PAN Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.personalDetails.panNumber || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "");
                      handleChange("personalDetails", "panNumber", value);
                    }}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="ABCDE1234F"
                  />
                  {errors.panNumber && <p className="text-red-500 text-xs">{errors.panNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    PAN Upload<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept={DOC_ACCEPT}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (!DOC_ALLOWED_TYPES.includes(file.type)) {
                        alert("PAN upload: only PNG, JPG, JPEG, PDF allowed");
                        return;
                      }

                      handleChange("personalDetails", "panFile", file);
                    }}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Photo<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept={IMAGE_ACCEPT}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
                        alert("Photo upload: only PNG, JPG, JPEG allowed (PDF not allowed)");
                        return;
                      }

                      handleChange("personalDetails", "photo", file);
                    }}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              </div>

              {/* SECTION: Contact Person Details */}
              <div className="space-y-4">
                <h3 className="text-red-500 font-semibold text-lg">
                  Contact Person Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Contact Person Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson.contactPersonName}
                      onChange={(e) =>
                        handleChange(
                          "contactPerson",
                          "contactPersonName",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Contact Person Mobile Number
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.contactPerson.contactPersonMobile}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D/g, "");
                        handleChange(
                          "contactPerson",
                          "contactPersonMobile",
                          onlyNumbers
                        )
                      }}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Residential Address */}
              <div className="space-y-4">
                <h3 className="text-red-500 font-semibold text-lg">
                  Residential Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Res. Address 1<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      type="text"
                      value={formData.residentialAddress.address1}
                      onChange={(e) =>
                        handleChange("residentialAddress", "address1", e.target.value)
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Res. City<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.residentialAddress.city}
                      onChange={(e) =>
                        handleChange("residentialAddress", "city", e.target.value)
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Res. Pincode<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.residentialAddress.pincode}
                      onChange={(e) =>
                        handleChange("residentialAddress", "pincode", e.target.value)
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Res. Contact Code<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.residentialAddress.contactCode}
                      onChange={(e) =>
                        handleChange("residentialAddress", "contactCode", e.target.value)
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Res. Contact Number<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.residentialAddress.contactNumber}
                      maxLength={10}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D/g, "");

                        handleChange(
                          "residentialAddress",
                          "contactNumber",
                          onlyNumbers
                        );
                      }}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Res. Proof
                    </label>
                    <div className="flex gap-2">
                      {/* <select className="flex-1 p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100">
                        <option value="">Select</option>
                      </select> */}

                      <select
                        value={formData.residentialAddress.proof}
                        onChange={(e) =>
                          handleChange("residentialAddress", "proof", e.target.value)
                        }
                        className="flex-1 p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100"
                        disabled={isResProofLoading}
                      >
                        <option value="">
                          {isResProofLoading ? "Loading..." : "Select"}
                        </option>

                        {resProofOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex border rounded-md overflow-hidden">
                        <input
                          type="file"
                          accept={DOC_ACCEPT}
                          onChange={(e) => {
                            const file = e.target.files[0];

                            if (!file) return;

                            // ✅ File type validation
                            const allowedTypes = DOC_ALLOWED_TYPES;
                            if (!allowedTypes.includes(file.type)) {
                              alert("Only PNG, JPG, JPEG, PDF allowed");
                              return;
                            }

                            // ✅ File size validation (2MB)
                            if (file.size > 2 * 1024 * 1024) {
                              alert("File size must be less than 2MB");
                              return;
                            }

                            handleChange("residentialAddress", "resProofFile", file);
                          }}
                          className="w-full p-2 border border-slate-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="max-w-xs w-[450px]">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Preferred Address For Communication
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.residentialAddress.preferredAddress}
                      onChange={(e) =>
                        handleChange("residentialAddress", "preferredAddress", e.target.value)
                      }
                      className="w-[535px] p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Communication Address */}
              <div className="space-y-4">
                <h3 className="text-red-500 font-semibold text-lg">
                  Communication Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Communication Address 1
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.communicationAddress.communicationAddress1}
                      onChange={(e) =>
                        handleChange(
                          "communicationAddress",
                          "communicationAddress1",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Communication Address 2
                    </label>
                    <input
                      type="text"
                      value={formData.communicationAddress.communicationAddress2}
                      onChange={(e) =>
                        handleChange(
                          "communicationAddress",
                          "communicationAddress2",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Company Details */}
              <div className="space-y-4">
                <h3 className="text-red-500 font-semibold text-lg">
                  Company Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Company Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companyDetails.companyName}
                      onChange={(e) =>
                        handleChange("companyDetails", "companyName", e.target.value)
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Company Number<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.companyDetails.companyNumber}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D/g, "");
                        handleChange("companyDetails", "companyNumber", onlyNumbers)
                      }}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Company Address<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.companyDetails.companyAddress}
                      onChange={(e) =>
                        handleChange("companyDetails", "companyAddress", e.target.value)
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: Family Details */}
          {currentStep === 2 && (
            <>
              {/* SECTION: Contact Person Details */}
              <div className="space-y-4">
                <h3 className="text-red-500 font-semibold text-lg">
                  Family Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Father’s Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.familyDetails.fatherName}
                      onChange={(e) =>
                        handleChange("familyDetails", "fatherName", e.target.value)
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Spouse Name
                    </label>
                    <input
                      type="text"
                      value={formData.familyDetails.spouseName}
                      onChange={(e) =>
                        handleChange("familyDetails", "spouseName", e.target.value)
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Spouse Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.familyDetails.spouseDob}
                      onChange={(e) =>
                        handleChange("familyDetails", "spouseDob", e.target.value)
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Spouse Blood Group
                    </label>
                    <select
                      value={formData.familyDetails.spouseBloodGroup}
                      onChange={(e) =>
                        handleChange("familyDetails", "spouseBloodGroup", e.target.value)
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Do you have Children?
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasChildren"
                          value="Yes"
                          checked={formData.familyDetails.hasChildren === "Yes"}
                          onChange={(e) =>
                            handleChange("familyDetails", "hasChildren", e.target.value)
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        Yes
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasChildren"
                          value="No"
                          checked={formData.familyDetails.hasChildren === "No"}
                          onChange={(e) =>
                            handleChange("familyDetails", "hasChildren", e.target.value)
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Children Details - Conditional */}
              {formData.familyDetails.hasChildren === "Yes" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-red-500 font-semibold text-lg">
                      Children Details
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddChild}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm transition-all"
                    >
                      + Add Child
                    </button>
                  </div>

                  {formData.familyDetails.children.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">
                      Click "Add Child" button to add children details
                    </p>
                  ) : (
                    formData.familyDetails.children.map((child, index) => (
                      <div
                        key={child.id}
                        className="border border-slate-300 rounded-lg p-4 bg-slate-50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-slate-700 font-semibold">
                            Child {index + 1}
                          </h4>
                          {formData.familyDetails.children.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveChild(child.id)}
                              className="text-red-600 hover:text-red-800 font-semibold text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                          <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Name<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={child.name}
                              onChange={(e) =>
                                handleChildChange(
                                  child.id,
                                  "name",
                                  e.target.value,
                                )
                              }
                              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Relation<span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-4 mt-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`relation-${child.id}`}
                                  value="son"
                                  checked={child.relation === "son"}
                                  onChange={(e) =>
                                    handleChildChange(child.id, "relation", e.target.value)
                                  }
                                  className="w-4 h-4 text-blue-600"
                                />
                                Son
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`relation-${child.id}`}
                                  value="daughter"
                                  checked={child.relation === "daughter"}
                                  onChange={(e) =>
                                    handleChildChange(child.id, "relation", e.target.value)
                                  }
                                  className="w-4 h-4 text-blue-600"
                                />
                                Daughter
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Date of Birth
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={child.dob}
                              onChange={(e) =>
                                handleChildChange(
                                  child.id,
                                  "dob",
                                  e.target.value,
                                )
                              }
                              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Blood Group<span className="text-red-500">*</span>
                            </label>

                            <select
                              value={child.bloodGroup}
                              onChange={(e) =>
                                handleChildChange(
                                  child.id,
                                  "bloodGroup",
                                  e.target.value,
                                )
                              }
                              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            >
                              <option value="">Select Blood Group</option>
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                            </select>
                          </div>
                          <div className="w-[200px]">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Marital Status
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={child.maritalStatus}
                              onChange={(e) =>
                                handleChildChange(
                                  child.id,
                                  "maritalStatus",
                                  e.target.value,
                                )
                              }
                              className="flex-1 p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100 w-[200px]"
                            >
                              <option value="">Select</option>
                              <option value="Single">Single</option>
                              <option value="Married">Married</option>
                              <option value="Divorced">Divorced</option>
                              <option value="Widowed">Widowed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {/* STEP 3: Nominee Details */}
          {currentStep === 3 && (
            <>
              <h3 className="text-red-500 font-semibold text-lg">
                Nominee Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nomineeDetails.nomineeName}
                    onChange={(e) =>
                      handleChange(
                        "nomineeDetails",
                        "nomineeName",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.nomineeDetails.nomineeContact}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      if (onlyNumbers.length <= 10) {
                        handleChange(
                          "nomineeDetails",
                          "nomineeContact",
                          onlyNumbers,
                        );
                      }
                    }}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Address<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.nomineeDetails.nomineeAddress}
                    onChange={(e) =>
                      handleChange(
                        "nomineeDetails",
                        "nomineeAddress",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nomineeDetails.nomineecity}
                    onChange={(e) =>
                      handleChange(
                        "nomineeDetails",
                        "nomineecity",
                        e.target.value,
                      )
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
                    value={formData.nomineeDetails.nomineepincode}
                    onChange={(e) =>
                      handleChange(
                        "nomineeDetails",
                        "nomineepincode",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Relation<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nomineeDetails.nomineerelation}
                    onChange={(e) =>
                      handleChange(
                        "nomineeDetails",
                        "nomineerelation",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Do you have Company?<span className="text-red-500">*</span>
                  </label>

                  <div className="flex gap-4 mt-2">
                    <label>
                      <input
                        type="radio"
                        value="Yes"
                        checked={formData.nomineeDetails.nomineehasCompany === "Yes"}
                        onChange={(e) =>
                          handleChange("nomineeDetails", "nomineehasCompany", e.target.value)
                        }
                      />{" "}
                      Yes
                    </label>

                    <label>
                      <input
                        type="radio"
                        value="No"
                        checked={formData.nomineeDetails.nomineehasCompany === "No"}
                        onChange={(e) =>
                          handleChange("nomineeDetails", "nomineehasCompany", e.target.value)
                        }
                      />{" "}
                      No
                    </label>
                  </div>
                </div>
              </div>
              {formData.nomineeDetails.nomineehasCompany === "Yes" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={formData.nomineeDetails.nomineecompanyName}
                        onChange={(e) =>
                          handleChange(
                            "nomineeDetails",
                            "nomineecompanyName",
                            e.target.value,
                          )
                        }
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Residential Address
                      </label>
                      <textarea
                        value={formData.nomineeDetails.nomineeresidentialAddress}
                        onChange={(e) =>
                          handleChange(
                            "nomineeDetails",
                            "nomineeresidentialAddress",
                            e.target.value,
                          )
                        }
                        className="w-full p-2 border h-[40px] border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Office Address
                      </label>
                      <textarea
                        value={formData.nomineeDetails.nomineeofficeAddress}
                        onChange={(e) =>
                          handleChange(
                            "nomineeDetails",
                            "nomineeofficeAddress",
                            e.target.value,
                          )
                        }
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none h-[40px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Office Contact Number
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={formData.nomineeDetails.nomineeofficeContact}
                        onChange={(e) => {
                          const onlyNumbers = e.target.value.replace(/\D/g, "");
                          handleChange(
                            "nomineeDetails",
                            "nomineeofficeContact",
                            onlyNumbers,
                          )
                        }}
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 4: Payment Details */}
          {currentStep === 4 && (
            <>
              {/* SECTION: Number of Installments */}
              <div className="space-y-6">
                <h3 className="text-red-500 font-semibold text-lg">
                  Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Number of Installment
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={numInstallments}
                      onChange={(e) => {
                        e.preventDefault();
                        setNumInstallments(e.target.value);
                      }}
                      className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10</option>
                    </select>
                  </div>
                  <div className="">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Total Installments Amount
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.paymentDetails.totalInstallmentsAmount || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentDetails: {
                            ...prev.paymentDetails,
                            totalInstallmentsAmount: e.target.value,
                          },
                        }))
                      }
                      placeholder="Total Installments Amount"
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                    {/* ✅ Realtime Error */}
                    {installmentError && (
                      <p className="text-red-500 text-sm mt-1">
                        {installmentError}
                      </p>
                    )}
                  </div>
                 
                </div>

                {/* SECTION: Installment Tables - Conditional */}
                {numInstallments && (
                  <div className="mt-6 pt-6 border-t border-slate-300 space-y-6">
                    <p className="text-slate-600 font-semibold">
                      Fill in the details for {numInstallments} installment
                      {parseInt(numInstallments) > 1 ? "s" : ""}
                    </p>
                    {Array.from({ length: parseInt(numInstallments) }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="border-2 border-blue-200 rounded-lg p-5 bg-blue-50"
                        >
                          <h4 className="text-blue-700 font-bold text-lg mb-4">
                            Installment {index + 1}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Installment Amount
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={formData.paymentDetails.installments[index]?.amount || ""}
                                onChange={(e) =>
                                  handleInstallmentChange(index, "amount", e.target.value)
                                }
                                placeholder="Enter amount"
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Installment Due Date
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={formData.paymentDetails.installments[index]?.dueDate || ""}
                                onChange={(e) =>
                                  handleInstallmentChange(index, "dueDate", e.target.value)
                                }
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                              />
                            </div>

                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {!numInstallments && (
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                    <p className="text-sm font-medium">
                      Select number of installments above to proceed with
                      payment details.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex-1 md:flex-none bg-[#EAB308] hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-12 py-2.5 rounded-md font-bold uppercase shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} /> Previous
            </button>
            <div className="flex-1"></div>
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 md:flex-none bg-[#EAB308] hover:bg-yellow-600 text-white px-16 py-2.5 rounded-md font-bold uppercase shadow-sm transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-16 py-2.5 rounded-md font-bold uppercase shadow-sm transition-all"
              >
                {isEditMode ? "Update" : "Submit"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDonor;

