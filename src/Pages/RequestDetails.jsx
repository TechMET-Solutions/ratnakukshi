import axios from "axios";
import { ChevronLeft, Eye, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";

const typeTitleMap = {
  medical: "Medical Assistance",
  education: "Education Assistance",
  job: "Job Assistance",
  food: "Food Assistance",
  rent: "Rent Assistance",
  housing: "Housing Assistance",
  vaiyavacch: "Vaiyavacch Assistance",
  livelihoodexpenses: "Livelihood Expenses Assistance",
  businesssupport: "Business Support Assistance",
};

const typeFieldConfig = {
  medical: [
    { label: "Type of Medical Issue", key: "issueType" },
    { label: "Disease Name", key: "diseaseName" },
    { label: "Any Permanent Issue", key: "isPermanent" },
    { label: "Estimated Medical Expense", key: "estimatedExpense" },
    { label: "Urgency Level", key: "urgency" },
    { label: "Treatment Ongoing", key: "isOngoing" },
    { label: "Major Surgery Expected", key: "majorSurgery" },
    { label: "Assistance Required For", key: "assistanceFor" },
    { label: "Repeated Medical Assistance", key: "repeatedAssistance" },
    { label: "Treatment Frequency", key: "frequency" },
    { label: "Next Treatment Date", key: "nextDate", isDate: true },
    { label: "Cost Per Session", key: "costPerSession" },
    { label: "Sessions Count", key: "sessionsCount" },
    { label: "Calculated Total", key: "totalEstimatedCost" },
    { label: "Total Amount Requested", key: "amountRequired" },
  ],
  education: [
    { label: "School / College Name", key: "schoolName" },
    { label: "Class", key: "classGrade" },
    { label: "Medium", key: "medium" },
    { label: "Fees", key: "fees" },
    { label: "Stationery Expenses", key: "stationeryExpenses" },
    { label: "Other Expenses", key: "OtherExpenses" },
    { label: "Total Expenses", key: "totalExpenses" },
    { label: "Scholarship", key: "hasScholarship" },
    { label: "Support Amount", key: "supportAmount" },
    { label: "Support Duration", key: "supportDuration" },
    { label: "Urgency", key: "urgency" },
  ],
  job: [
    { label: "Current Job", key: "currentJob" },
    { label: "Employment Status", key: "employmentStatus" },
    { label: "Education", key: "education" },
    { label: "Skills", key: "skills" },
    { label: "Preferred Job Type", key: "preferredJobType" },
    { label: "Preferred Location", key: "location" },
    { label: "Urgency", key: "urgency" },
  ],
  food: [
    { label: "Family Member Count", key: "memberCount" },
    { label: "Food Support Type", key: "foodType" },
    { label: "Duration", key: "duration" },
    { label: "Frequency", key: "FrequencyDuration" },
    { label: "Urgency", key: "urgency" },
    { label: "Reason", key: "reason" },
  ],
  rent: [
    { label: "Monthly Rent Amount", key: "monthlyAmount" },
    { label: "Rent Pending", key: "isPending" },
    { label: "Pending Rent Months", key: "pendingMonths" },
    { label: "Rent Proof Available", key: "proofAvailable" },
    { label: "Rent Reimbursement Required", key: "reimbursementRequired" },
    { label: "Urgency", key: "urgency" },
  ],
  housing: [
    { label: "Housing Assistance Type", key: "assistanceType" },
    { label: "Total Cost", key: "totalCost" },
    { label: "Is Partial", key: "isPartial" },
    { label: "Amount Required", key: "amountRequired" },
    { label: "Own Contribution", key: "ownContribution" },
    { label: "Other Support Available", key: "hasOtherSupport" },
    { label: "Urgency", key: "urgency" },
  ],
  vaiyavacch: [{ label: "Description", key: "description" }],
  livelihoodexpenses: [
    { label: "Estimated Amount Required", key: "amount" },
    { label: "Mobile Number", key: "mobile" },
    { label: "Description", key: "description" },
  ],
  businesssupport: [
    { label: "Type of Business", key: "businessType" },
    { label: "Business Duration", key: "duration" },
    { label: "Urgency Level", key: "urgency" },
    { label: "Monthly Business Income", key: "income" },
    { label: "Monthly Business Expenses", key: "expenses" },
    { label: "Business Condition", key: "condition" },
    { label: "Business Dependents", key: "dependents" },
    { label: "Any Business Loan", key: "hasLoan" },
    { label: "Government Scheme/Subsidy", key: "hasScheme" },
    { label: "Remark", key: "remark" },
  ],
};

const normalizeType = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .replace(/-/g, "");

const toCanonicalType = (value) => {
  const normalized = normalizeType(value);
  const map = {
    jobs: "job",
    livelihood: "livelihoodexpenses",
    emergencyexpenses: "livelihoodexpenses",
    business: "businesssupport",
  };
  return map[normalized] || normalized;
};

const parseAssistanceData = (value) => {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
};

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

const formatValue = (value) => {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const RequestDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const row = location.state || {};

  const [assistanceData, setAssistanceData] = useState(
    parseAssistanceData(row?.assistance_data),
  );
  const [loading, setLoading] = useState(false);

  const normalizedType = useMemo(
    () => toCanonicalType(row?.assistance_type || row?.type),
    [row?.assistance_type, row?.type],
  );

  useEffect(() => {
    const initialData = parseAssistanceData(row?.assistance_data);
    if (Object.keys(initialData).length > 0) {
      setAssistanceData(initialData);
      return;
    }

    if (!row?.diksharthi_id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API}/api/assistance/all-assistance/${row.diksharthi_id}`,
        );

        const rows = Array.isArray(res?.data?.data) ? res.data.data : [];

        const matchedRow = rows.find((item) => {
          const sameRelation =
            String(item?.relation_key || item?.relation || "").trim().toLowerCase() ===
            String(row?.relation_key || row?.relation || "").trim().toLowerCase();
          const sameType =
            toCanonicalType(item?.assistance_type) === normalizedType;
          return sameRelation && sameType;
        });

        setAssistanceData(parseAssistanceData(matchedRow?.assistance_data));
      } catch (error) {
        console.error("Request details fetch failed:", error);
        setAssistanceData({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    normalizedType,
    row?.assistance_data,
    row?.diksharthi_id,
    row?.relation,
    row?.relation_key,
  ]);

  const labelStyle = "text-gray-500 font-semibold text-sm";
  const valueStyle = "text-gray-800 font-bold text-sm";
  const assistanceTitle = typeTitleMap[normalizedType] || "Assistance Details";

  const configuredFields = typeFieldConfig[normalizedType] || [];

  const dynamicDateFields = Object.keys(assistanceData || {})
    .filter((key) => /date/i.test(key))
    .filter((key) => !configuredFields.some((field) => field.key === key))
    .map((key) => ({
      label: key.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase()),
      key,
      isDate: true,
    }));

  const renderFields = [...configuredFields, ...dynamicDateFields];
  const memberName =
    `${row?.family_member_firstName || ""} ${row?.family_member_lastName || ""}`.trim() ||
    row?.member_name ||
    "-";

  const remarks =
    row?.query_reason || row?.remarks || row?.remark || "-";

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="flex justify-between items-start mb-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-red-500 font-bold text-lg mt-1 hover:underline"
          >
            <ChevronLeft size={20} />
            <h1>Request Details</h1>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="flex justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/50">
          <span className="text-sm text-gray-600">
            Family Head : <span className="font-bold">{row?.sadhu_sadhvi_name || "-"}</span>
          </span>
        </div>
        <div className="p-6 flex gap-8">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150"
            alt="Profile"
            className="w-24 h-24 rounded-lg object-cover border border-gray-200"
          />
          <div className="grid grid-cols-2 flex-grow gap-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{memberName}</h2>
              <p className="text-sm text-gray-500">
                M.S. ID : <span className="font-semibold text-gray-700">{row?.diksharthi_id || "-"}</span>
              </p>
              <p className="text-sm text-gray-500">
                Relation : <span className="font-semibold text-gray-700">{row?.relation_key || row?.relation || "-"}</span>
              </p>
              <p className="text-sm text-gray-500">
                Assistance Type : <span className="font-semibold text-gray-700">{row?.assistance_type || row?.type || "-"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm text-sm text-gray-500">
          Loading assistance details...
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-red-500 font-bold mb-4">{assistanceTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
            {renderFields.length > 0 ? (
              renderFields.map((field) => (
                <div key={field.key} className="flex justify-between gap-4">
                  <span className={labelStyle}>{field.label} :</span>
                  <span className={valueStyle}>
                    {field.isDate
                      ? formatDate(assistanceData?.[field.key])
                      : formatValue(assistanceData?.[field.key])}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">
                No assistance fields available for this type.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-red-500 font-bold mb-4">Previous Assistance</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#ECB0004D]/80">
              <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">Family Member</th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">Family Head</th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">Date</th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">Assistance</th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">Amount</th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">Renewal</th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="p-3 text-sm text-gray-700">Prakash Shah</td>
              <td className="p-3 text-sm text-gray-700">Ravi Shah</td>
              <td className="p-3 text-sm text-gray-700">05/02/2026</td>
              <td className="p-3 text-sm text-gray-700">Medical</td>
              <td className="p-3 text-sm text-gray-700 font-semibold">Rs 50,000</td>
              <td className="p-3 text-sm text-gray-700">Rs 50,000</td>
              <td className="p-3 text-center">
                <button className="text-yellow-600 hover:scale-110 transition-transform">
                  <Eye size={18} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-red-500 font-bold mb-4">Uploaded Documents</h3>
        <div className="flex gap-4">
          {["MedicalReport.pdf", "IncomeCer.pdf"].map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 border border-gray-200 rounded p-3 min-w-[280px]"
            >
              <div className="bg-red-50 p-2 rounded">
                <FileText className="text-red-500" size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">Ravi_Shah_{doc}</p>
                <button className="text-blue-500 text-[10px] flex items-center gap-0.5 hover:underline uppercase font-bold">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-red-500 font-bold mb-4">Additional Uploaded Documents</h3>
        <div className="flex items-center gap-3 border border-gray-200 rounded p-3 w-fit min-w-[280px]">
          <div className="bg-red-50 p-2 rounded">
            <FileText className="text-red-500" size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">Ravi_Shah_IncomeCer.pdf</p>
            <button className="text-blue-500 text-[10px] flex items-center gap-0.5 hover:underline uppercase font-bold">
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-red-500 font-bold mb-2">Remark</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{remarks}</p>
      </div>
    </div>
  );
};

export default RequestDetails;
