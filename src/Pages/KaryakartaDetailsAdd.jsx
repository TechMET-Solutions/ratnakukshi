import React, { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const steps = [
    { id: 1, title: "Personal Details" },
    { id: 2, title: "Company Details" },
    { id: 3, title: "Family Details" },
    { id: 4, title: "Social Activity Details" },
    { id: 5, title: "Dum" },
];

const createInitialForm = (user) => ({
    personalDetails: {
        fullName: user?.name || "",
        email: user?.email || "",
        mobile: user?.mobile || "",
        role: user?.role || "karyakarta",
        dateOfBirth: "",
        gender: "",
        education: "",
        bloodGroup: "",
        maritalStatus: "",
        address: "",
        city: "",
        taluka: "",
        district: "",
        state: "",
        pinCode: "",
    },
    companyDetails: {
        companyName: "",
        officeAddress: "",
        city: "",
        taluka: "",
        district: "",
        state: "",
        pinCode: "",
        officePhone1: "",
        officePhone2: "",
        website: "",
        email: "",
    },
    familyDetails: {
        members: [
            {
                name: "",
                relation: "",
                dob: "",
                bloodGroup: "",
                mobileNo: "",
                qualification: "",
            },
        ],
    },
    socialActivityDetails: {
        organizationName: "",
        designation: "",
        tenure: "",
        areaOfWork: "",
        referredByJeet: "",
        mobileNo: "",
        joinReason: "",
    },
});

const fieldClassName =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100";

const Field = ({
    label,
    children,
    className = "",
}) => (
    <div className={className}>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
        </label>
        {children}
    </div>
);

function KaryakartaDetailsAdd() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user || null;

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(() => createInitialForm(user));

    const pageTitle = useMemo(
        () =>
            user?.name
                ? `Add Karyakarta Details for ${user.name}`
                : "Add Karyakarta Details",
        [user]
    );

    const updateSection = (section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const nextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    };

    const previousStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Karyakarta details form data:", formData);
        alert("Karyakarta details saved in form state. Backend integration can be added next.");
        navigate("/user");
    };

    const addFamilyMember = () => {
        setFormData((prev) => ({
            ...prev,
            familyDetails: {
                ...prev.familyDetails,
                members: [
                    ...prev.familyDetails.members,
                    {
                        name: "",
                        relation: "",
                        dob: "",
                        bloodGroup: "",
                        mobileNo: "",
                        qualification: "",
                    },
                ],
            },
        }));
    };

    const removeFamilyMember = (index) => {
        setFormData((prev) => {
            if (prev.familyDetails.members.length === 1) {
                return prev;
            }

            return {
                ...prev,
                familyDetails: {
                    ...prev.familyDetails,
                    members: prev.familyDetails.members.filter((_, itemIndex) => itemIndex !== index),
                },
            };
        });
    };

    const updateFamilyMember = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            familyDetails: {
                ...prev.familyDetails,
                members: prev.familyDetails.members.map((member, itemIndex) =>
                    itemIndex === index ? { ...member, [field]: value } : member
                ),
            },
        }));
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="mx-auto max-w-6xl">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-6 md:px-8">
                        <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Fill the personal, company, and family details for this karyakarta.
                        </p>
                    </div>

                    <div className="border-b border-slate-100 px-6 py-5 md:px-8">
                        <div className="grid gap-3 md:grid-cols-3">
                            {steps.map((step) => {
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;

                                return (
                                    <div
                                        key={step.id}
                                        className={`rounded-2xl border px-4 py-4 transition ${isActive
                                                ? "border-rose-300 bg-rose-50"
                                                : isCompleted
                                                    ? "border-emerald-200 bg-emerald-50"
                                                    : "border-slate-200 bg-slate-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${isActive
                                                        ? "bg-rose-500 text-white"
                                                        : isCompleted
                                                            ? "bg-emerald-500 text-white"
                                                            : "bg-slate-200 text-slate-700"
                                                    }`}
                                            >
                                                {isCompleted ? <CheckCircle2 size={18} /> : step.id}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Step {step.id}
                                                </p>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {step.title}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-6 md:px-8">
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Personal Details
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Basic profile and address information.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <Field label="Full Name">
                                        <input
                                            className={fieldClassName}
                                            value={formData.personalDetails.fullName}
                                            onChange={(e) =>
                                                updateSection("personalDetails", "fullName", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Email ID">
                                        <input
                                            className={fieldClassName}
                                            value={formData.personalDetails.email}
                                            onChange={(e) =>
                                                updateSection("personalDetails", "email", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Mobile Number">
                                        <input
                                            className={fieldClassName}
                                            value={formData.personalDetails.mobile}
                                            onChange={(e) =>
                                                updateSection("personalDetails", "mobile", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Role">
                                        <input
                                            className={fieldClassName}
                                            value={formData.personalDetails.role}
                                            onChange={(e) =>
                                                updateSection("personalDetails", "role", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Date of Birth">
                                        <input
                                            type="date"
                                            className={fieldClassName}
                                            value={formData.personalDetails.dateOfBirth}
                                            onChange={(e) =>
                                                updateSection("personalDetails", "dateOfBirth", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Gender">
                                        <select
                                            className={fieldClassName}
                                            value={formData.personalDetails.gender}
                                            onChange={(e) =>
                                                updateSection("personalDetails", "gender", e.target.value)
                                            }
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </Field>

                                    <Field label="Education">
                                        <input
                                            className={fieldClassName}
                                            value={formData.personalDetails.education}
                                            onChange={(e) =>
                                                updateSection("personalDetails", "education", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Blood Group">
                                        <input
                                            className={fieldClassName}
                                            value={formData.personalDetails.bloodGroup}
                                            onChange={(e) =>
                                                updateSection("personalDetails", "bloodGroup", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Marital Status">
                                        <select
                                            className={fieldClassName}
                                            value={formData.personalDetails.maritalStatus}
                                            onChange={(e) =>
                                                updateSection(
                                                    "personalDetails",
                                                    "maritalStatus",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">Select Status</option>
                                            <option value="single">Single</option>
                                            <option value="married">Married</option>
                                        </select>
                                    </Field>

                                    <Field label="Address" className="md:col-span-3">
                                        <textarea
                                            rows={3}
                                            className={fieldClassName}
                                            value={formData.personalDetails.address}
                                            onChange={(e) =>
                                                updateSection("personalDetails", "address", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="City">
                                        <input
                                            className={fieldClassName}
                                            value={formData.personalDetails.city}
                                            onChange={(e) =>
                                                updateSection("personalDetails", "city", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Taluka">
                                        <input
                                            className={fieldClassName}
                                            value={formData.personalDetails.taluka}
                                            onChange={(e) =>
                                                updateSection("personalDetails", "taluka", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="District">
                                        <input
                                            className={fieldClassName}
                                            value={formData.personalDetails.district}
                                            onChange={(e) =>
                                                updateSection("personalDetails", "district", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="State">
                                        <input
                                            className={fieldClassName}
                                            value={formData.personalDetails.state}
                                            onChange={(e) =>
                                                updateSection("personalDetails", "state", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Pin Code">
                                        <input
                                            className={fieldClassName}
                                            value={formData.personalDetails.pinCode}
                                            onChange={(e) =>
                                                updateSection("personalDetails", "pinCode", e.target.value)
                                            }
                                        />
                                    </Field>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Company Details
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Office and company contact information.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <Field label="Company Name">
                                        <input
                                            className={fieldClassName}
                                            value={formData.companyDetails.companyName}
                                            onChange={(e) =>
                                                updateSection("companyDetails", "companyName", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Office Email">
                                        <input
                                            className={fieldClassName}
                                            value={formData.companyDetails.email}
                                            onChange={(e) =>
                                                updateSection("companyDetails", "email", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Website">
                                        <input
                                            className={fieldClassName}
                                            value={formData.companyDetails.website}
                                            onChange={(e) =>
                                                updateSection("companyDetails", "website", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Office Address" className="md:col-span-3">
                                        <textarea
                                            rows={3}
                                            className={fieldClassName}
                                            value={formData.companyDetails.officeAddress}
                                            onChange={(e) =>
                                                updateSection(
                                                    "companyDetails",
                                                    "officeAddress",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field label="City">
                                        <input
                                            className={fieldClassName}
                                            value={formData.companyDetails.city}
                                            onChange={(e) =>
                                                updateSection("companyDetails", "city", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Taluka">
                                        <input
                                            className={fieldClassName}
                                            value={formData.companyDetails.taluka}
                                            onChange={(e) =>
                                                updateSection("companyDetails", "taluka", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="District">
                                        <input
                                            className={fieldClassName}
                                            value={formData.companyDetails.district}
                                            onChange={(e) =>
                                                updateSection("companyDetails", "district", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="State">
                                        <input
                                            className={fieldClassName}
                                            value={formData.companyDetails.state}
                                            onChange={(e) =>
                                                updateSection("companyDetails", "state", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Pin Code">
                                        <input
                                            className={fieldClassName}
                                            value={formData.companyDetails.pinCode}
                                            onChange={(e) =>
                                                updateSection("companyDetails", "pinCode", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <Field label="Office Phone 1">
                                        <input
                                            className={fieldClassName}
                                            value={formData.companyDetails.officePhone1}
                                            onChange={(e) =>
                                                updateSection(
                                                    "companyDetails",
                                                    "officePhone1",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field label="Office Phone 2">
                                        <input
                                            className={fieldClassName}
                                            value={formData.companyDetails.officePhone2}
                                            onChange={(e) =>
                                                updateSection(
                                                    "companyDetails",
                                                    "officePhone2",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Field>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Family Details
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        You can add multiple family member entries here.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {formData.familyDetails.members.map((member, index) => (
                                        <div
                                            key={index}
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                        >
                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-slate-800">
                                                    Family Member {index + 1}
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFamilyMember(index)}
                                                    disabled={formData.familyDetails.members.length === 1}
                                                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-3">
                                                <Field label="Name">
                                                    <input
                                                        className={fieldClassName}
                                                        value={member.name}
                                                        onChange={(e) =>
                                                            updateFamilyMember(index, "name", e.target.value)
                                                        }
                                                    />
                                                </Field>

                                                <Field label="Relation">
                                                    <input
                                                        className={fieldClassName}
                                                        value={member.relation}
                                                        onChange={(e) =>
                                                            updateFamilyMember(index, "relation", e.target.value)
                                                        }
                                                    />
                                                </Field>

                                                <Field label="DOB">
                                                    <input
                                                        type="date"
                                                        className={fieldClassName}
                                                        value={member.dob}
                                                        onChange={(e) =>
                                                            updateFamilyMember(index, "dob", e.target.value)
                                                        }
                                                    />
                                                </Field>

                                                <Field label="Blood Group">
                                                    <input
                                                        className={fieldClassName}
                                                        value={member.bloodGroup}
                                                        onChange={(e) =>
                                                            updateFamilyMember(index, "bloodGroup", e.target.value)
                                                        }
                                                    />
                                                </Field>

                                                <Field label="Mobile No">
                                                    <input
                                                        className={fieldClassName}
                                                        value={member.mobileNo}
                                                        onChange={(e) =>
                                                            updateFamilyMember(index, "mobileNo", e.target.value)
                                                        }
                                                    />
                                                </Field>

                                                <Field label="Qualification">
                                                    <input
                                                        className={fieldClassName}
                                                        value={member.qualification}
                                                        onChange={(e) =>
                                                            updateFamilyMember(index, "qualification", e.target.value)
                                                        }
                                                    />
                                                </Field>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addFamilyMember}
                                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        Add Family Member
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Social Activity Details
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Add organization and JEET joining details.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <Field label="Name of Organizations">
                                        <input
                                            className={fieldClassName}
                                            value={formData.socialActivityDetails.organizationName}
                                            onChange={(e) =>
                                                updateSection(
                                                    "socialActivityDetails",
                                                    "organizationName",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field label="My Designation">
                                        <input
                                            className={fieldClassName}
                                            value={formData.socialActivityDetails.designation}
                                            onChange={(e) =>
                                                updateSection(
                                                    "socialActivityDetails",
                                                    "designation",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field label="Tenure">
                                        <input
                                            className={fieldClassName}
                                            value={formData.socialActivityDetails.tenure}
                                            onChange={(e) =>
                                                updateSection(
                                                    "socialActivityDetails",
                                                    "tenure",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field label="Area of Work">
                                        <input
                                            className={fieldClassName}
                                            value={formData.socialActivityDetails.areaOfWork}
                                            onChange={(e) =>
                                                updateSection(
                                                    "socialActivityDetails",
                                                    "areaOfWork",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field label="Reference of JEET By">
                                        <input
                                            className={fieldClassName}
                                            value={formData.socialActivityDetails.referredByJeet}
                                            onChange={(e) =>
                                                updateSection(
                                                    "socialActivityDetails",
                                                    "referredByJeet",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field label="Mobile No">
                                        <input
                                            className={fieldClassName}
                                            value={formData.socialActivityDetails.mobileNo}
                                            onChange={(e) =>
                                                updateSection(
                                                    "socialActivityDetails",
                                                    "mobileNo",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field
                                        label="I Want to Join with JEET Because"
                                        className="md:col-span-3"
                                    >
                                        <textarea
                                            rows={4}
                                            className={fieldClassName}
                                            value={formData.socialActivityDetails.joinReason}
                                            onChange={(e) =>
                                                updateSection(
                                                    "socialActivityDetails",
                                                    "joinReason",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field label="Area, which I want to serve">
                                        <input
                                            className={fieldClassName}
                                            value={formData.socialActivityDetails.areaServe}
                                            onChange={(e) =>
                                                updateSection(
                                                    "socialActivityDetails",
                                                    "areaServe",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field label="I Will spend my time for JEET (in Hrs.)">
                                        <input
                                            className={fieldClassName}
                                            value={formData.socialActivityDetails.spendTime}
                                            onChange={(e) =>
                                                updateSection(
                                                    "socialActivityDetails",
                                                    "spendTime",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Field>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Step {currentStep} of {steps.length}
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={previousStep}
                                    disabled={currentStep === 1}
                                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                {currentStep < steps.length ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700"
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                                    >
                                        Save Details
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default KaryakartaDetailsAdd;
