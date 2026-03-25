import axios from "axios";
import React, { useEffect, useState } from "react";
import { Edit3, Mail, MapPin, Phone, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API } from "../api/BaseURL";

const DetailCard = ({ title, items }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {items.map(({ label, value }) => (
        <div key={label} className="rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-sm text-slate-800">{value || "-"}</p>
        </div>
      ))}
    </div>
  </div>
);

function Pofile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(Boolean(user?.id));

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let ignore = false;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/api/karyakarta-details/${user.id}`);
        if (!ignore) {
          setProfileData(response?.data?.data || null);
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          console.error("Failed to fetch karyakarta profile:", error);
        }
        if (!ignore) {
          setProfileData(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      ignore = true;
    };
  }, [user]);

  const personalDetails = profileData?.personalDetails || {};
  const companyDetails = profileData?.companyDetails || {};
  const socialActivityDetails = profileData?.socialActivityDetails || {};
  const familyMembers = profileData?.familyDetails?.members || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user?.name || "Profile"}
                  className="h-20 w-20 rounded-2xl border border-white/30 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15">
                  <UserCircle size={44} />
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold">{personalDetails.fullName || user?.name || "Karyakarta Profile"}</h1>
                <p className="mt-1 text-sm text-white/85">
                  {user?.role || "karyakarta"}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/90">
                  <span className="inline-flex items-center gap-2">
                    <Mail size={16} />
                    {personalDetails.email || user?.email || "-"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Phone size={16} />
                    {personalDetails.mobile || user?.mobile || "-"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={16} />
                    {personalDetails.city || personalDetails.address || "-"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/karyakarta-add", {
                  state: {
                    user,
                    existingDetails: profileData,
                    source: "profile",
                  },
                })
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-sky-700 shadow-sm hover:bg-slate-100"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            Loading profile details...
          </div>
        ) : null}

        <DetailCard
          title="Personal Details"
          items={[
            { label: "Full Name", value: personalDetails.fullName || user?.name },
            { label: "Email", value: personalDetails.email || user?.email },
            { label: "Mobile", value: personalDetails.mobile || user?.mobile },
            { label: "Date of Birth", value: personalDetails.dateOfBirth },
            { label: "Gender", value: personalDetails.gender },
            { label: "Education", value: personalDetails.education },
            { label: "Blood Group", value: personalDetails.bloodGroup },
            { label: "Marital Status", value: personalDetails.maritalStatus },
            { label: "Address", value: personalDetails.address },
            { label: "City", value: personalDetails.city },
            { label: "Taluka", value: personalDetails.taluka },
            { label: "District", value: personalDetails.district },
            { label: "State", value: personalDetails.state },
            { label: "Pin Code", value: personalDetails.pinCode },
          ]}
        />

        <DetailCard
          title="Company Details"
          items={[
            { label: "Company Name", value: companyDetails.companyName },
            { label: "Office Address", value: companyDetails.officeAddress },
            { label: "City", value: companyDetails.city },
            { label: "Taluka", value: companyDetails.taluka },
            { label: "District", value: companyDetails.district },
            { label: "State", value: companyDetails.state },
            { label: "Pin Code", value: companyDetails.pinCode },
            { label: "Office Phone 1", value: companyDetails.officePhone1 },
            { label: "Office Phone 2", value: companyDetails.officePhone2 },
            { label: "Website", value: companyDetails.website },
            { label: "Email", value: companyDetails.email },
          ]}
        />

        <DetailCard
          title="Social Activity Details"
          items={[
            { label: "Organization Name", value: socialActivityDetails.organizationName },
            { label: "Designation", value: socialActivityDetails.designation },
            { label: "Tenure", value: socialActivityDetails.tenure },
            { label: "Area Of Work", value: socialActivityDetails.areaOfWork },
            { label: "Referred By JEET", value: socialActivityDetails.referredByJeet },
            { label: "Mobile Number", value: socialActivityDetails.mobileNo },
            { label: "Join Reason", value: socialActivityDetails.joinReason },
            { label: "Area To Serve", value: socialActivityDetails.areaServe },
            { label: "Time For JEET", value: socialActivityDetails.spendTime },
          ]}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Family Details</h2>
          {familyMembers.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {familyMembers.map((member, index) => (
                <div key={`${member.name || "member"}-${index}`} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    {member.name || `Family Member ${index + 1}`}
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600">
                    <p>Relation: {member.relation || "-"}</p>
                    <p>DOB: {member.dob || "-"}</p>
                    <p>Blood Group: {member.bloodGroup || "-"}</p>
                    <p>Mobile: {member.mobileNo || "-"}</p>
                    <p>Qualification: {member.qualification || "-"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No family details added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Pofile;
