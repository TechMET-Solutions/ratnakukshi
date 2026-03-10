import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const asObject = (value) => (value && typeof value === "object" ? value : {});

function AddDonor() {

    const navigate = useNavigate();
  
  const location = useLocation();
  const editDonorId = location?.state?.id;
  const isEditMode = Boolean(editDonorId);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalDetails: {
      salutation: "",
      name: "",
      gender: "",
      dob: "",
      anniversary: "",
      mobile: "",
      altMobile: "",
      email: "",
      bloodGroup: "",
      motherTongue: "",
      nativePlace: "",
      aadhar: null,
      pan: null,
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
      nomineecompanyName: "",
      nomineeresidentialAddress: "",
      nomineeofficeAddress: "",
      nomineeofficeContact: "",
    },

    paymentDetails: {
      installments: [],
    },
  });

  const handleSubmit = async () => {
    try {
      const resolvedDonorId =
        editDonorId || formData?.id || formData?.donor_id || null;

      const payload = {
        ...formData,
        personalDetails: {
          ...formData.personalDetails,
        },
        familyDetails: {
          ...formData.familyDetails,
        },
      };

      delete payload.personalDetails.gender;
      delete payload.personalDetails.dob;
      delete payload.personalDetails.mobile;
      delete payload.personalDetails.altMobile;
      delete payload.familyDetails.spouseDob;

      if (isEditMode) {
        if (!resolvedDonorId) {
          alert("Donor id is missing for update.");
          return;
        }
        payload.id = resolvedDonorId;
        payload.donor_id = resolvedDonorId;
      }

      const response = await fetch(
        isEditMode
          ? `${API}/api/donor/update/${resolvedDonorId}`
          : `${API}/api/donor/create`,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      alert(
        isEditMode ? "Donor Updated Successfully" : "Donor Created Successfully",
      );

      navigate("/donor");

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  const [numInstallments, setNumInstallments] = useState("");
  const [photo, setPhoto] = useState(null);

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
  const handleNext = (e) => {
    e.preventDefault();

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
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

  
  return (
    <div className="min-h-screen bg-gray-50 flex p-6 justify-center">
      <div className="w-full max-w-6xl bg-white p-6 shadow-sm">
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
                    Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.personalDetails.name}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    onChange={(e) =>
                      handleChange("personalDetails", "name", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Gender<span className="text-red-500">*</span>
                  </label>
                  <select className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date of Birth<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.personalDetails.dateOfBirth}
                    onChange={(e) =>
                      handleChange(
                        "personalDetails",
                        "dateOfBirth",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Anniversary<span className="text-red-500">*</span>
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
                    value={formData.personalDetails.mobileNumber}
                    onChange={(e) =>
                      handleChange(
                        "personalDetails",
                        "mobileNumber",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Alt Mobile Number
                  </label>
                  <input
                    type="text"
                    value={formData.personalDetails.altMobileNumber}
                    onChange={(e) =>
                      handleChange(
                        "personalDetails",
                        "altMobileNumber",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Blood Group<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.personalDetails.bloodGroup}
                    onChange={(e) =>
                      handleChange(
                        "personalDetails",
                        "bloodGroup",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mother Tongue<span className="text-red-500">*</span>
                  </label>
                  <input
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
                  />
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Aadhar Card<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setPhoto(e.target.files[0])}
                    // value={}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Pan Card<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setPhoto(e.target.files[0])}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Photo<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setPhoto(e.target.files[0])}
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
                      value={formData.contactPerson.contactPersonMobile}
                      onChange={(e) =>
                        handleChange(
                          "contactPerson",
                          "contactPersonMobile",
                          e.target.value
                        )
                      }
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
                      type="text"
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
                      type="text"
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
                      onChange={(e) =>
                        handleChange("residentialAddress", "contactNumber", e.target.value)
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Res. Proof<span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select className="flex-1 p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100">
                        <option value="">Select</option>
                      </select>
                      <div className="flex border rounded-md overflow-hidden">
                        <button
                          type="button"
                          className="bg-gray-100 px-3 py-1 border-r text-sm"
                        >
                          Upload
                        </button>
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
                      <span className="text-red-500">*</span>
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
                      value={formData.companyDetails.companyNumber}
                      onChange={(e) =>
                        handleChange("companyDetails", "companyNumber", e.target.value)
                      }
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
                      Spouse Name<span className="text-red-500">*</span>
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
                      <span className="text-red-500">*</span>
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
                      Spouse Blood Group<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.familyDetails.spouseBloodGroup}
                      onChange={(e) =>
                        handleChange("familyDetails", "spouseBloodGroup", e.target.value)
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                    />
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
                            <input
                              type="text"
                              value={child.bloodGroup}
                              onChange={(e) =>
                                handleChildChange(
                                  child.id,
                                  "bloodGroup",
                                  e.target.value,
                                )
                              }
                              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                            />
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
                    value={formData.nomineeDetails.nomineeContact}
                    onChange={(e) =>
                      handleChange(
                        "nomineeDetails",
                        "nomineeContact",
                        e.target.value,
                      )
                    }
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
                    Name of Company<span className="text-red-500">*</span>
                  </label>
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
                    Residential Address<span className="text-red-500">*</span>
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
                    Office Address<span className="text-red-500">*</span>
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
                    Office Contact Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nomineeDetails.nomineeofficeContact}
                    onChange={(e) =>
                      handleChange(
                        "nomineeDetails",
                        "nomineeofficeContact",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              </div>
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
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Date Fund Received
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={formData.paymentDetails.installments[index]?.fundDate || ""}
                                onChange={(e) =>
                                  handleInstallmentChange(index, "fundDate", e.target.value)
                                }
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Mode of Payment
                                <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={formData.paymentDetails.installments[index]?.paymentMode || ""}
                                onChange={(e) =>
                                  handleInstallmentChange(index, "paymentMode", e.target.value)
                                }
                                className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100">
                                <option value="">Select</option>
                                <option value="Bank Transfer">
                                  Bank Transfer
                                </option>
                                <option value="Card">Card</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Cash">Cash</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                UTR Number
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={formData.paymentDetails.installments[index]?.utrNo || ""}
                                onChange={(e) =>
                                  handleInstallmentChange(index, "utrNo", e.target.value)
                                }
                                placeholder="Enter UTR"
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Status<span className="text-red-500">*</span>
                              </label>
                              <select
                                value={formData.paymentDetails.installments[index]?.status || ""}
                                onChange={(e) =>
                                  handleInstallmentChange(index, "status", e.target.value)
                                }
                                className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-100"
                              >
                                <option value="">Select</option>
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                                <option value="Failed">Failed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
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
