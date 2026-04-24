import axios from "axios";
import { ChevronLeft, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";

const typeTitleMap = {
  medical: "Medical Assistance",
  education: "Education Assistance",
  job: "Job Assistance",
  food: "Grocery Assistance",
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
    { label: "Repeated Medical Assistance", key: "repeatedAssistance" },
    { label: "Next Treatment Date", key: "nextDate", isDate: true },
    { label: "Calculated Total", key: "totalEstimatedCost" },
    { label: "Total Amount Requested", key: "amountRequired" },
  ],
  education: [
    { label: "Class", key: "classGrade" },
    { label: "Annual Fees", key: "annualfees" },
    { label: "Marks", key: "marks" },
    { label: "Forward To", key: "forwardTo" },
  ],
  job: [
    { label: "Employment Status", key: "employmentStatus" },
    { label: "Current Salary", key: "currentSalary" },
    { label: "Expected Salary", key: "expectedSalary" },
    { label: "Education", key: "education" },
    { label: "Skills", key: "skills" },
    { label: "Preferred Job Type", key: "preferredJobType" },
    { label: "Preferred Location", key: "location" },
    { label: "Urgency", key: "urgency" },
  ],
  food: [
    { label: "Family Member Count", key: "memberCount" },
    { label: "Grocery Support Type", key: "foodType" },
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
    { label: "Briefly Describe the Expenses", key: "description" },
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

const getAmountValue = (assistance) => {
  const data = parseAssistanceData(assistance);
  const amountKeys = [
    "amountRequired",
    "supportAmount",
    "amount",
    "totalEstimatedCost",
    "estimatedExpense",
    "monthlyAmount",
    "totalCost",
    "totalExpenses",
  ];

  for (const key of amountKeys) {
    const value = data?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return `Rs ${value}`;
    }
  }

  return "-";
};

const fileNameFromPath = (value) => {
  if (!value) return "Document";
  const parts = String(value).split(/[\\/]/);
  return parts[parts.length - 1] || "Document";
};

const normalizeApiRoot = (apiValue) =>
  String(apiValue || "").replace(/\/?api\/?$/i, "");

const resolveFileUrl = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${normalizeApiRoot(API)}${raw}`;
  return `${normalizeApiRoot(API)}/${raw}`;
};

const collectDocumentFiles = (assistanceData) => {
  const docs = [];
  const seen = new Set();

  const addDoc = (name, rawPath) => {
    const docName = name || fileNameFromPath(rawPath);
    const url = resolveFileUrl(rawPath);
    const key = `${docName}__${url}`;
    if (seen.has(key)) return;
    seen.add(key);
    docs.push({ name: docName, url });
  };

  const walk = (value, keyHint = "") => {
    if (value == null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, keyHint));
      return;
    }

    if (typeof value === "string") {
      if (/(file|doc|proof|quotation|attachment|image)/i.test(keyHint)) {
        addDoc(fileNameFromPath(value), value);
      }
      return;
    }

    if (typeof value !== "object") return;

    if (value.documentName && Array.isArray(value.files)) {
      value.files.forEach((item, index) => {
        if (typeof item === "string") {
          addDoc(`${value.documentName} ${index + 1}`, item);
        } else if (item && typeof item === "object") {
          addDoc(
            item.name || item.filename || value.documentName,
            item.url || item.path || item.file || item.location || "",
          );
        }
      });
    }

    Object.entries(value).forEach(([key, val]) => {
      const looksLikeFileField = /(file|doc|document|proof|quotation|attachment|image)/i.test(key);

      if (looksLikeFileField) {
        if (typeof val === "string") {
          addDoc(fileNameFromPath(val), val);
          return;
        }

        if (Array.isArray(val)) {
          val.forEach((item, index) => {
            if (typeof item === "string") {
              addDoc(`${key} ${index + 1}`, item);
            } else if (item && typeof item === "object") {
              addDoc(
                item.documentName || item.name || item.filename || `${key} ${index + 1}`,
                item.url || item.path || item.file || item.location || "",
              );
            }
          });
          return;
        }

        if (val && typeof val === "object") {
          addDoc(
            val.documentName || val.name || val.filename || key,
            val.url || val.path || val.file || val.location || "",
          );
        }
      }

      walk(val, key);
    });
  };

  walk(assistanceData);
  return docs.filter((doc) => doc.name || doc.url);
};

const RequestDetails = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const [row, setRow] = useState(location.state || {});
  const [assistanceData, setAssistanceData] = useState({});

  // const [assistanceData, setAssistanceData] = useState(parseAssistanceData(row?.id));
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const normalizedType = useMemo(
    () => toCanonicalType(row?.assistance_type || row?.type),
    [row?.assistance_type, row?.type],
  );

 const fetchRequestDetails = async (id) => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/api/assistance/all-assistance/${id}`);

      if (res.data?.success) {
        const apiData = res.data.data;

        setRow(apiData);
        setAssistanceData(
          typeof apiData.assistance_data === "string"
            ? JSON.parse(apiData.assistance_data)
            : apiData.assistance_data || {}
        );

        setFeedbackList(apiData.feedback || []);
      }

    } catch (error) {
      console.error("Details Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (row?.id) {
      fetchRequestDetails(row.id);
    }
  }, [row?.id]);

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


  const previousAssistanceRows = useMemo(() => {
    const currentId = Number(row?.id);
    const currentRelation = String(row?.relation_key || row?.relation || "").trim().toLowerCase();

    return allRows
      .filter((item) => Number(item?.id) !== currentId)
      .filter((item) => {
        const relation = String(item?.relation_key || item?.relation || "").trim().toLowerCase();
        return !currentRelation || relation === currentRelation;
      })
      .sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0));
  }, [allRows, row?.id, row?.relation, row?.relation_key]);

  const uploadedDocuments = useMemo(
    () => collectDocumentFiles(assistanceData),
    [assistanceData],
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="flex justify-between items-start mb-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-red-500 font-bold text-lg mt-1 hover:underline"
          >
            <ChevronLeft size={20} />
            <h1>Assistances Details</h1>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="flex justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/50">
          <span className="text-sm text-gray-600">
            Family Head :{" "}
            <span className="font-bold">
              {row?.family_head_name || "-"}
            </span>
          </span>
        </div>

        <div className="p-6 flex gap-8">
          <img
            src={row?.photo ? row.photo : "/user.png"}
            alt="Profile"
            className="w-24 h-24 rounded-lg object-cover border border-gray-200"
          />

          <div className="grid grid-cols-2 flex-grow gap-x-10 gap-y-3">
            {/* Left Side */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {row?.family_member_name || "-"}
              </h2>

              <p className="text-sm text-gray-500">
                M.S. ID :{" "}
                <span className="font-semibold text-gray-700">
                  {row?.diksharthi_id || "-"}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                M.S. Name :{" "}
                <span className="font-semibold text-gray-700">
                  {row?.sadhu_sadhvi_name || "-"}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                Relation to M.S. :{" "}
                <span className="font-semibold text-gray-700">
                  {row?.relation_key || row?.relation || "-"}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                Assistance Type :{" "}
                <span className="font-semibold text-gray-700">
                  {row?.assistance_type || row?.type || "-"}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                Address / City :{" "}
                <span className="font-semibold text-gray-700">
                  {row?.address || "-"}
                </span>
              </p>
            </div>

            {/* Right Side */}
            <div>
              <p className="text-sm text-gray-500">
                Mobile No :{" "}
                <span className="font-semibold text-gray-700">
                  {row?.mobile_number || "-"}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                Aadhar No :{" "}
                <span className="font-semibold text-gray-700">
                  {row?.aadhar_number || "-"}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                PAN No :{" "}
                <span className="font-semibold text-gray-700">
                  {row?.pan_number || "-"}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                DOB :{" "}
                <span className="font-semibold text-gray-700">
                  {row?.dob?.slice(0, 10) || "-"}
                </span>
              </p>

              {/* <p className="text-sm text-gray-500">
                Ayushman Coverage :{" "}
                <span className="font-semibold text-gray-700">
                  {row?.ayushman_coverage || "-"}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                Mediclaim :{" "}
                <span className="font-semibold text-gray-700">
                  {row?.has_mediclaim_policy || "-"}
                </span>
              </p> */}

              {/* <p className="text-sm text-gray-500">
                Mediclaim Amount :{" "}
                <span className="font-semibold text-gray-700">
                  {row?.mediclaim_amount || "-"}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                Company Name :{" "}
                <span className="font-semibold text-gray-700">
                  {row?.mediclaim_company_name || "-"}
                </span>
              </p> */}
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
              <p className="text-sm text-gray-500 italic">No assistance fields available for this type.</p>
            )}
          </div>
        </div>
      )}

      {previousAssistanceRows.length > 0 && (
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
              </tr>
            </thead>
            <tbody>
              {previousAssistanceRows.map((item) => {
                const rowMemberName =
                  `${item?.family_member_firstName || ""} ${item?.family_member_lastName || ""}`.trim() || "-";

                return (
                  <tr
                    key={item?.id || `${item?.assistance_type}-${item?.created_at}`}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-3 text-sm text-gray-700">{rowMemberName}</td>
                    <td className="p-3 text-sm text-gray-700">{item?.sadhu_sadhvi_name || "-"}</td>
                    <td className="p-3 text-sm text-gray-700">{formatDate(item?.created_at)}</td>
                    <td className="p-3 text-sm text-gray-700">{item?.assistance_type || "-"}</td>
                    <td className="p-3 text-sm text-gray-700 font-semibold">{getAmountValue(item?.assistance_data)}</td>
                    <td className="p-3 text-sm text-gray-700">-</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {uploadedDocuments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-red-500 font-bold mb-4">Uploaded Documents</h3>
          <div className="flex flex-wrap gap-4">
            {uploadedDocuments.map((doc, idx) => (
              <div
                key={`${doc.name}-${idx}`}
                className="flex items-center gap-3 border border-gray-200 rounded p-3 min-w-[280px]"
              >
                <div className="bg-red-50 p-2 rounded">
                  <FileText className="text-red-500" size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{doc.name || "Document"}</p>
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 text-[10px] flex items-center gap-0.5 hover:underline uppercase font-bold"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400 text-[10px] uppercase font-bold">No Link</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-red-500 font-bold mb-4">Remarks & Feedback</h3>

        {/* Summary First */}
        <div className="mb-6 border-b pb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Summary</h4>
          <div
            className="text-sm text-gray-700"
            dangerouslySetInnerHTML={{
              __html: row?.summary || "-"
            }}
          />
        </div>

        {/* Diksharthi Feedback */}
        <div className="mb-6 border-b pb-4">
          <h4 className="font-semibold text-blue-600 mb-3">
            Karyakarta Feedback
          </h4>

          {row?.diksharthi_feedback?.length > 0 ? (
            row.diksharthi_feedback.map((item, index) => (
              <div
                key={index}
                className="mb-3 p-3 bg-blue-50 rounded-md border overflow-hidden"
              >
                <p className="text-xs text-gray-500 mb-2">
                  {item.feedback_date?.slice(0, 10)} | {item.feedback_time}
                </p>

                <div
                  className="text-sm text-gray-700 leading-relaxed
                     break-all whitespace-pre-wrap
                     overflow-hidden w-full"
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap"
                  }}
                  dangerouslySetInnerHTML={{
                    __html: item.feedback || "-"
                  }}
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No Feedback Found</p>
          )}
        </div>


        {/* Operation Manager Feedback */}
        <div className="mb-6 border-b pb-4">
          <h4 className="font-semibold text-green-600 mb-3">
            Operation Manager Feedback
          </h4>

          {row?.operation_manager_feedback?.length > 0 ? (
            row.operation_manager_feedback.map((item, index) => (
              <div
                key={index}
                className="mb-3 p-3 bg-green-50 rounded-md border overflow-hidden"
              >
                <p className="text-xs text-gray-500 mb-2">
                  {item.feedback_date?.slice(0, 10)} | {item.feedback_time}
                </p>

                <div
                  className="text-sm text-gray-700 leading-relaxed
                     break-all whitespace-pre-wrap
                     overflow-hidden w-full"
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap"
                  }}
                  
                  dangerouslySetInnerHTML={{
                    __html: item.feedback || "-",
                  }}
                />
                  {/* {item.feedback || "-"}
                </div> */}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No Feedback Found</p>
          )}
        </div>

        {/* Final Feedback */}
        <div>
          <h4 className="font-semibold text-red-500 mb-3">
            Assitences Feedback
          </h4>

          {row?.feedback?.length > 0 ? (
            row.feedback.map((item, index) => (
              <div
                key={index}
                className="mb-3 p-3 bg-red-50 rounded-md border"
              >
                <p className="text-xs text-gray-500 mb-1">
                  {item.date} | {item.time}
                </p>

                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                  {item.status}
                </p>

                <div
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: item.feedback || "-"
                  }}
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No Feedback Found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
