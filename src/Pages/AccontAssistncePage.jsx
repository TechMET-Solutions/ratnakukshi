import {
    AlertCircle,
    ClipboardList,
    Eye,
    Loader2,
    Search
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api/BaseURL";
import axios from "axios";
const initialBankForm = {
  account_type: "self",
  bank_name: "",
  account_holder_name: "",
  branch_name: "",
  account_no: "",
  ifsc_code: "",
};

const BankDetailsModal = ({ isOpen, onClose, selectedItem, onSaved }) => {
  const [formData, setFormData] = useState(initialBankForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    if (!isOpen || !selectedItem?.id) return;

    const fetchBankDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          `${API}/api/assistance/bank-details/${selectedItem.id}`,
        );
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data?.success === false) {
          throw new Error(data?.message || "Failed to fetch bank details");
        }

        const details = data?.data;
        if (details) {
          setFormData({
            account_type: details.account_type || "self",
            bank_name: details.bank_name || "",
            account_holder_name: details.account_holder_name || "",
            branch_name: details.branch_name || "",
            account_no: details.account_no || "",
            ifsc_code: details.ifsc_code || "",
          });
        } else {
          setFormData(initialBankForm);
        }
      } catch (err) {
        console.error("Error loading bank details:", err);
        setError(err?.message || "Failed to fetch bank details");
        setFormData(initialBankForm);
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, [isOpen, selectedItem?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ifsc_code" ? value.toUpperCase() : value,
    }));
  };

  const handleSave = async () => {
    if (!selectedItem?.id) return;
    try {
      setSaving(true);
      setError("");

      const payload = {
        diksharthi_id: selectedItem?.diksharthi_id || null,
        family_id:
          selectedItem?.family_member_id || selectedItem?.family_id || null,
        account_type: formData.account_type,
        bank_name: String(formData.bank_name || "").trim(),
        account_holder_name: String(formData.account_holder_name || "").trim(),
        branch_name: String(formData.branch_name || "").trim(),
        account_no: String(formData.account_no || "").trim(),
        ifsc_code: String(formData.ifsc_code || "")
          .trim()
          .toUpperCase(),
      };

      if (
        !payload.bank_name ||
        !payload.account_holder_name ||
        !payload.account_no
      ) {
        throw new Error(
          "Bank Name, Account Holder Name and Account Number are required",
        );
      }

      const res = await fetch(
        `${API}/api/assistance/bank-details/${selectedItem.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to save bank details");
      }

      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Error saving bank details:", err);
      setError(err?.message || "Failed to save bank details");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Bank Details</h2>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Loading bank details...
            </div>
          ) : (
            <>
              {/* RADIO BUTTON */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="account_type"
                    value="self"
                    checked={formData.account_type === "self"}
                    onChange={handleChange}
                  />
                  Self Account
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="account_type"
                    value="third"
                    checked={formData.account_type === "third"}
                    onChange={handleChange}
                  />
                  Third Party
                </label>
              </div>

              {/* FORM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Bank Name</label>
                  <input
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Account Holder Name
                  </label>
                  <input
                    name="account_holder_name"
                    value={formData.account_holder_name}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Branch Name</label>
                  <input
                    name="branch_name"
                    value={formData.branch_name}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Account Number</label>
                  <input
                    name="account_no"
                    value={formData.account_no}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">IFSC Code</label>
                  <input
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="px-4 py-2 bg-[#d94452] text-white rounded text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

function AccontAssistncePage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  // back model
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);
  // const [selectedItem, setSelectedItem] = useState(null);
  // const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const [verificationStatus, setVerificationStatus] = useState({});

  const [verificationData, setVerificationData] = useState({
    // AADHAR
    adharNumber: "",
    adharCard: null,

    // PAN
    panNumber: "",
    panCard: null,

    // BANK
    bankAccountNumber: "",
    bankAccount: null,

    // ADD THIS
    ifscCode: "",

    // EXTRA DOCUMENTS
    extraDocuments: [
      {
        title: "",
        file: null,
      },
    ],
  });
  console.log("VERIFICATION DATA =>", verificationData);

  const handleExtraDocumentChange = (index, field, value) => {
    const updatedDocuments = [...verificationData.extraDocuments];

    updatedDocuments[index][field] = value;

    setVerificationData({
      ...verificationData,
      extraDocuments: updatedDocuments,
    });
  };

  // ===============================
  // ADD EXTRA DOCUMENT
  // ===============================

  const addExtraDocument = () => {
    setVerificationData({
      ...verificationData,
      extraDocuments: [
        ...verificationData.extraDocuments,
        {
          title: "",
          file: null,
        },
      ],
    });
  };

  // const saveVerificationData = async (
  //     statusType
  // ) => {

  //     try {

  //         const formData = new FormData();

  //         formData.append(
  //             "assistance_id",
  //             selectedItem.id
  //         );

  //         formData.append(
  //             "adhar_number",
  //             verificationData.adharNumber
  //         );

  //         formData.append(
  //             "pan_number",
  //             verificationData.panNumber
  //         );

  //         formData.append(
  //             "bank_account_number",
  //             verificationData.bankAccountNumber
  //         );

  //         formData.append(
  //             "verification_status",
  //             statusType
  //         );

  //         // ==========================================
  //         // MAIN FILES
  //         // ==========================================

  //         if (verificationData.adharCard) {

  //             formData.append(
  //                 "adhar_card",
  //                 verificationData.adharCard
  //             );

  //         }

  //         if (verificationData.panCard) {

  //             formData.append(
  //                 "pan_card",
  //                 verificationData.panCard
  //             );

  //         }

  //         if (verificationData.bankAccount) {

  //             formData.append(
  //                 "bank_account_file",
  //                 verificationData.bankAccount
  //             );

  //         }

  //         // ==========================================
  //         // EXTRA DOCUMENTS
  //         // ==========================================

  //         verificationData.extraDocuments.forEach(
  //             (doc, index) => {

  //                 // TITLE
  //                 formData.append(
  //                     `extraDocuments[${index}][title]`,
  //                     doc.title
  //                 );

  //                 // FILE
  //                 if (doc.file) {

  //                     formData.append(
  //                         "extra_document_files",
  //                         doc.file
  //                     );

  //                 }

  //             }
  //         );

  //         const response = await fetch(
  //             "https://uat.ratnakukshi.org/api/assistance/document-verification",
  //             {
  //                 method: "POST",
  //                 body: formData,
  //             }
  //         );

  //         const data = await response.json();

  //         console.log("RESPONSE =>", data);

  //         if (data.success) {

  //             setVerificationStatus((prev) => ({
  //                 ...prev,
  //                 [selectedItem.id]: statusType,
  //             }));

  //             alert(data.message);

  //             setIsVerificationModalOpen(false);

  //         }

  //     } catch (error) {

  //         console.log(
  //             "SAVE VERIFICATION ERROR =>",
  //             error
  //         );

  //     }

  // };
  // const saveVerificationData = async (
  //     statusType
  // ) => {

  //     try {

  //         const formData = new FormData();

  //         // ==========================================
  //         // BASIC DATA
  //         // ==========================================

  //         formData.append(
  //             "assistance_id",
  //             selectedItem.id
  //         );

  //         formData.append(
  //             "adhar_number",
  //             verificationData.adharNumber
  //         );

  //         formData.append(
  //             "pan_number",
  //             verificationData.panNumber
  //         );

  //         formData.append(
  //             "bank_account_number",
  //             verificationData.bankAccountNumber
  //         );

  //         formData.append(
  //             "verification_status",
  //             statusType
  //         );

  //         // ==========================================
  //         // MAIN FILES
  //         // ==========================================

  //         // AADHAR
  //         if (
  //             verificationData.adharCard &&
  //             typeof verificationData
  //                 .adharCard !== "string"
  //         ) {

  //             formData.append(
  //                 "adhar_card",
  //                 verificationData.adharCard
  //             );

  //         }

  //         // PAN
  //         if (
  //             verificationData.panCard &&
  //             typeof verificationData
  //                 .panCard !== "string"
  //         ) {

  //             formData.append(
  //                 "pan_card",
  //                 verificationData.panCard
  //             );

  //         }

  //         // BANK
  //         if (
  //             verificationData.bankAccount &&
  //             typeof verificationData
  //                 .bankAccount !== "string"
  //         ) {

  //             formData.append(
  //                 "bank_account_file",
  //                 verificationData.bankAccount
  //             );

  //         }

  //         // ==========================================
  //         // EXTRA DOCUMENTS
  //         // ==========================================

  //         verificationData.extraDocuments.forEach(
  //             (doc, index) => {

  //                 // ONLY SEND NEW FILES
  //                 if (
  //                     doc.file &&
  //                     typeof doc.file !== "string"
  //                 ) {

  //                     // TITLE
  //                     formData.append(
  //                         `extraDocuments[${index}][title]`,
  //                         doc.title || ""
  //                     );

  //                     // FILE
  //                     formData.append(
  //                         "extra_document_files",
  //                         doc.file
  //                     );

  //                 }

  //             }
  //         );

  //         // ==========================================
  //         // DEBUG
  //         // ==========================================

  //         for (let pair of formData.entries()) {

  //             console.log(
  //                 pair[0],
  //                 pair[1]
  //             );

  //         }

  //         // ==========================================
  //         // API CALL
  //         // ==========================================

  //         const response = await fetch(
  //             "https://uat.ratnakukshi.org/api/assistance/document-verification",
  //             {
  //                 method: "POST",
  //                 body: formData,
  //             }
  //         );

  //         const data =
  //             await response.json();

  //         console.log(
  //             "RESPONSE =>",
  //             data
  //         );

  //         if (data.success) {

  //             setVerificationStatus(
  //                 (prev) => ({
  //                     ...prev,
  //                     [selectedItem.id]:
  //                         statusType,
  //                 })
  //             );

  //             alert(data.message);

  //             setIsVerificationModalOpen(
  //                 false
  //             );

  //         } else {

  //             alert(data.message);

  //         }

  //     } catch (error) {

  //         console.log(
  //             "SAVE VERIFICATION ERROR =>",
  //             error
  //         );

  //     }

  // };

  const saveVerificationData = async (statusType) => {
    try {
      const formData = new FormData();

      // =====================================================
      // BASIC DATA
      // =====================================================

      formData.append("assistance_id", selectedItem.id);

      formData.append("adhar_number", verificationData.adharNumber || "");

      formData.append("pan_number", verificationData.panNumber || "");

      formData.append(
        "bank_account_number",
        verificationData.bankAccountNumber || "",
      );

      formData.append("ifsc_code", verificationData.ifscCode || "");

      formData.append("verification_status", statusType);

      // =====================================================
      // AADHAR FILE
      // =====================================================

      if (
        verificationData.adharCard &&
        verificationData.adharCard instanceof File
      ) {
        formData.append("adhar_card", verificationData.adharCard);
      }

      // =====================================================
      // PAN FILE
      // =====================================================

      if (
        verificationData.panCard &&
        verificationData.panCard instanceof File
      ) {
        formData.append("pan_card", verificationData.panCard);
      }

      // =====================================================
      // BANK FILE
      // =====================================================

      if (
        verificationData.bankAccount &&
        verificationData.bankAccount instanceof File
      ) {
        formData.append("bank_account_file", verificationData.bankAccount);
      }

      // =====================================================
      // EXTRA DOCUMENTS
      // =====================================================

      let newDocumentIndex = 0;

      verificationData.extraDocuments.forEach((doc) => {
        if (doc.file && doc.file instanceof File) {
          // TITLE
          formData.append(
            `extraDocuments[${newDocumentIndex}][title]`,
            doc.title || "",
          );

          // FILE
          formData.append("extra_document_files", doc.file);

          newDocumentIndex++;
        }
      });

      // =====================================================
      // DEBUG
      // =====================================================

      console.log("========== FORMDATA ==========");

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // =====================================================
      // API CALL
      // =====================================================

      const response = await fetch(
        "https://uat.ratnakukshi.org/api/assistance/document-verification",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      console.log("RESPONSE =>", data);

      // =====================================================
      // SUCCESS
      // =====================================================

      if (data.success) {
        alert(data.message);

        // UPDATE STATUS
        setVerificationStatus((prev) => ({
          ...prev,
          [selectedItem.id]: statusType,
        }));

        // CLOSE MODAL
        setIsVerificationModalOpen(false);

        // REFRESH DATA
        fetchAssistance();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log("SAVE VERIFICATION ERROR =>", error);

      alert("Something went wrong");
    }
  };
  const handleVerified = () => {
    // AADHAR VALIDATION
    const isAdharValid =
      verificationData.adharNumber || verificationData.adharCard;

    // BANK VALIDATION
    const isBankValid =
      verificationData.bankAccountNumber || verificationData.bankAccount;

    // REQUIRED CHECK
    if (!isAdharValid || !isBankValid) {
      alert("Please add Aadhaar and Bank Details");

      return;
    }

    setVerificationStatus((prev) => ({
      ...prev,
      [selectedItem.id]: "verified",
    }));

    console.log("VERIFIED DATA =>", verificationData);

    alert("Document Verified Successfully");

    setIsVerificationModalOpen(false);
  };
  const fetchAssistance = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API}/api/assistance/allAssistance?page=1&limit=10&status=approve`,
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to fetch assistance list");
      }

      setRows(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error("Assistance fetch error:", err);
      setError(err?.message || "Failed to fetch assistance list");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAssistance();
  }, []);

  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return rows.filter((item) => {
      if (!q) return true;

      const familyFullName =
        `${item?.family_member_firstName || ""} ${item?.family_member_lastName || ""}`.trim();

      return [
        item?.sadhu_sadhvi_name,
        item?.diksharthi_id,
        familyFullName,
        item?.relation,
        item?.assistance_type,
        item?.case_id,
      ]
        .map((v) => String(v || "").toLowerCase())
        .some((v) => v.includes(q));
    });
  }, [rows, searchText]);

  const capitalizeFirst = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const handleDownload = async (id) => {
    try {
      const response = await fetch(`${API}/api/report/sanction-letters/${id}`);

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `sanction-letter-${id}.pdf`; // file name
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download sanction letter");
    }
  };

//   const handleDisbursePayments = async () => {
//     debugger;

//     try {
//       // =========================================
//       // GET SANCTION PAYMENTS
//       // =========================================
//       const sanctionPayments =
//         selectedItem?.monthly_payments?.filter(
//           (payment) => payment?.status === "Sanction",
//         ) || [];

//       // =========================================
//       // VALIDATION
//       // =========================================
//       if (!sanctionPayments.length) {
//         alert("No sanction payments found");
//         return;
//       }

//       // =========================================
//       // CREATE PAYLOAD
//       // =========================================
//       const payload = {
//         selectedPayments: sanctionPayments,
//         status: "Disbursed",
//       };

//       console.log("PAYLOAD :", payload);

//       // =========================================
//       // DIRECT API CALL
//       // =========================================
//       const response = await axios.put(
//         `${API}/api/assistance/disburse-monthly-payments/${selectedItem?.id}`,
//         payload,
        
//       );

//       console.log("DISBURSE RESPONSE :", response);

//       // =========================================
//       // SUCCESS
//       // =========================================
//       if (response?.data?.success) {

//     console.log("Payments disbursed successfully");

//     // CLOSE MODAL
//     setIsBankModalOpen(false);

//     // CLEAR SELECTED ITEM
//     setSelectedItem(null);

//     // REFRESH TABLE
//     getAllData();
// }
//     } catch (error) {
//       console.log("DISBURSE ERROR :", error);

//       toast.error(
//         error?.response?.data?.message || "Failed to disburse payments",
//       );
//     }
//   };
  
const handleDisbursePayments = async () => {
  try {
    // =========================================
    // GET SANCTION PAYMENTS
    // =========================================
    const sanctionPayments =
      selectedItem?.monthly_payments?.filter(
        (payment) => payment?.status === "Sanction"
      ) || [];

    // =========================================
    // VALIDATION
    // =========================================
    if (!sanctionPayments.length) {
      alert("No sanction payments found");
      return;
    }

    // =========================================
    // CURRENT DATE
    // =========================================
    const disbursedDate = new Date().toISOString();

    // =========================================
    // CREATE PAYLOAD
    // =========================================
    const payload = {
      selectedPayments: sanctionPayments,
      status: "Disbursed",
      disbursedDate,
    };

    console.log("PAYLOAD :", payload);

    // =========================================
    // API CALL
    // =========================================
    const response = await axios.put(
      `${API}/api/assistance/disburse-monthly-payments/${selectedItem?.id}`,
      payload
    );

    console.log("DISBURSE RESPONSE :", response);

    // =========================================
    // SUCCESS
    // =========================================
    if (response?.data?.success) {
      console.log("Payments disbursed successfully");

      // CLOSE MODAL
      setIsBankModalOpen(false);

      // CLEAR SELECTED ITEM
      setSelectedItem(null);

      // REFRESH TABLE
      fetchAssistance();
    }
  } catch (error) {
    console.log("DISBURSE ERROR :", error);

    alert(
      error?.response?.data?.message || "Failed to disburse payments"
    );
  }
};
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Account Assistance
        </h1>
        <p className="text-sm text-slate-500">
          View and manage member assistance applications and their statuses.
        </p>
      </div>

      {/* Main Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="relative w-full max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-slate-400"
            />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by Diksharthi or Family details..."
              className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-200"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#fdf2d7]">
                <th className="p-4 font-semibold text-slate-700 border-b">
                  M.S. ID
                </th>
                <th className="p-4 font-semibold text-slate-700 border-b">
                  M.S. Name
                </th>
                <th className="p-4 font-semibold text-slate-700 border-b">
                  Family Member
                </th>
                <th className="p-4 font-semibold text-slate-700 border-b">
                  Relation
                </th>
                <th className="p-4 font-semibold text-slate-700 border-b">
                  Assistance
                </th>
                <th className="p-4 font-semibold text-slate-700 border-b">
                  F.A.N ID
                </th>
                <th className="p-4 font-semibold text-slate-700 border-b">
                  Status
                </th>
                <th className="p-4 font-semibold text-slate-700 border-b text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                      <p className="text-sm text-slate-500 font-medium">
                        Fetching records...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-red-500">
                      <AlertCircle className="h-8 w-8" />
                      <p className="text-sm font-semibold">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <ClipboardList className="h-10 w-10 opacity-20" />
                      <p className="text-sm">No assistance records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((item) => (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">
                          {item?.diksharthi_id || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">
                          {item?.diksharthi_name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">
                          {item?.family_member_name || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">
                          {item?.relation_key ||
                            item?.relation ||
                            "Relation N/A"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-700">
                          {item?.assistance_type || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {item?.fan_id || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {capitalizeFirst(item?.status || "-")}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    navigate("/request-details", {
                                                        state: {
                                                            id: item?.id,
                                                            ...item,
                                                        },
                                                    });
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <Eye size={16} className="text-yellow-500" /> View Details
                                            </button>
                                            <button
                                                onClick={() => handleDownload(item?.id)}
                                                className="flex items-center gap-2 px-3 py-2 mt-2 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100"
                                            >
                                                <Download size={16} />
                                                Download
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setIsBankModalOpen(true);
                                                }}
                                                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                            >
                                                Bank Details
                                            </button>
                                        </td> */}

                    {/* <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={() =>
                                                    setOpenMenuId(openMenuId === item.id ? null : item.id)
                                                }
                                                className="p-2 rounded hover:bg-gray-100"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {openMenuId === item.id && (
                                                <div className="absolute right-6 mt-2 w-44 bg-white border rounded-lg shadow-lg z-50">

                                                    <button
                                                        onClick={() => {
                                                            navigate("/request-details", {
                                                                state: {
                                                                    id: item?.id,
                                                                    ...item,
                                                                },
                                                            });
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Eye size={16} />
                                                        View Details
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            handleDownload(item?.id);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Download size={16} />
                                                        Download
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setIsBankModalOpen(true);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        Bank Details
                                                    </button>

                                                </div>
                                            )}
                                        </td> */}

                    {/* <td className="px-6 py-4 text-right relative">

    <button
        onClick={() => {
            setSelectedItem(item);
            setIsBankModalOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all"
    >
        <Eye size={16} />
        Assign Bank
    </button>

</td> */}

                    <td className="px-2 flex gap-5 py-2">
                      <button
                        disabled={
                          item?.document_verification?.verification_status ===
                          "verified"
                        }
                        // onClick={() => {

                        //     setSelectedItem(item);

                        //     setVerificationData({

                        //         // =================================================
                        //         // AADHAR
                        //         // =================================================

                        //         adharNumber:
                        //             item?.family_member_details?.aadhar_number || "",

                        //         adharCard: null,

                        //         adharCardUrl:
                        //             item?.family_member_details?.aadhar_file_url || "",

                        //         panNumber:
                        //             item?.family_member_details?.pan_number || "",

                        //         panCard: null,

                        //         panCardUrl:
                        //             item?.family_member_details?.pan_file_url || "",

                        //         bankAccountNumber:
                        //             item?.document_verification?.bank_account_number || "",

                        //         bankAccount: null,

                        //         bankAccountFileUrl:
                        //             item?.document_verification?.bank_account_file_url || "",

                        //         extraDocuments:

                        //             item?.extra_documents?.length > 0

                        //                 ? item.extra_documents.map((doc) => ({

                        //                       title:
                        //                           doc?.title || "",

                        //                       file: null,

                        //                       fileUrl:
                        //                           doc?.file
                        //                               ? `https://uat.ratnakukshi.org/upload/documentverification/${doc.file}`
                        //                               : ""

                        //                   }))

                        //                 : [

                        //                       {

                        //                           title: "",

                        //                           file: null,

                        //                           fileUrl: ""

                        //                       }

                        //                   ]

                        //     });

                        //     // ====================================================
                        //     // OPEN MODAL
                        //     // ====================================================

                        //     setIsVerificationModalOpen(true);

                        // }}

                        onClick={() => {
                          setSelectedItem(item);
                          const formattedExtraDocuments =
                            item?.document_verification?.extra_documents
                              ?.length > 0
                              ? item.document_verification.extra_documents.map(
                                  (doc) => ({
                                    title: doc?.title || "",

                                    file: null,

                                    fileName: doc?.file || "",

                                    fileUrl: doc?.file_url || "",
                                  }),
                                )
                              : [
                                  {
                                    title: "",

                                    file: null,

                                    fileName: "",

                                    fileUrl: "",
                                  },
                                ];

                          setVerificationData({

                            adharNumber:
                              item?.family_member_details?.aadhar_number || "",

                            adharCard: null,

                            adharCardName:
                              item?.family_member_details?.aadhar_file || "",

                            adharCardUrl:
                              item?.family_member_details?.aadhar_file_url ||
                              "",
                            panNumber:
                              item?.family_member_details?.pan_number || "",

                            panCard: null,

                            panCardName:
                              item?.family_member_details?.pan_file || "",

                            panCardUrl:
                              item?.family_member_details?.pan_file_url || "",

                            bankAccountNumber:
                              item?.document_verification
                                ?.bank_account_number || "",

                            ifscCode:
                              item?.document_verification?.ifsc_code || "",

                            bankAccount: null,

                            bankAccountFileName:
                              item?.document_verification?.bank_account_file ||
                              "",

                            bankAccountFileUrl:
                              item?.document_verification
                                ?.bank_account_file_url || "",
 sanctionLetter: null,

  sanctionLetterName:
    item?.sanction_letter || "",

  sanctionLetterUrl:
                              item?.sanction_letter_url || "",
  
                            extraDocuments: formattedExtraDocuments,
                          });

                          setIsVerificationModalOpen(true);
                        }}
                        className={`inline-flex items-center gap-2 rounded-lg px-2 py-2 font-medium transition-all text-xs

    ${
      item?.document_verification?.verification_status === "verified"
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : item?.document_verification?.verification_status === "draft"
          ? "bg-yellow-500 text-white hover:bg-yellow-600"
          : "bg-blue-600 text-white hover:bg-blue-700"
    }`}
                      >
                        {item?.document_verification?.verification_status ===
                        "verified"
                          ? "Verified"
                          : item?.document_verification?.verification_status ===
                              "draft"
                            ? "Draft Saved"
                            : "Document Verification"}
                      </button>

                      <button
  disabled={
    item?.document_verification?.verification_status !==
      "verified" ||
    item?.ceo_status !== "approved"
  }
  onClick={() => {
    setSelectedItem(item);

    setIsBankModalOpen(true);
  }}
  className={`inline-flex items-center gap-2 rounded-lg px-2 py-2 font-medium transition-all text-xs
  ${
    item?.document_verification?.verification_status === "verified" &&
    item?.ceo_status === "approved"
      ? "bg-green-600 text-white hover:bg-green-700"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
>
  Disbursement
</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* <BankDetailsModal
                isOpen={isBankModalOpen}
                selectedItem={selectedItem}
                onClose={() => setIsBankModalOpen(false)}
                onSaved={() => {}}
            /> */}

     {isBankModalOpen && selectedItem && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Assigned Bank Details
          </h2>

          <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
            {/* <span>SL ID : {selectedItem?.sl_id}</span> */}

            {/* <span className="h-1 w-1 rounded-full bg-slate-400"></span> */}

            <span>{selectedItem?.diksharthi_name}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setIsBankModalOpen(false);
            setSelectedItem(null);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-slate-500 shadow hover:bg-red-50 hover:text-red-500 transition-all"
        >
          ×
        </button>
      </div>

      {/* BODY */}
      <div className="max-h-[80vh] overflow-y-auto p-6">
        {(() => {
          const sanctionPayments =
            selectedItem?.monthly_payments?.filter(
              (payment) => payment?.status === "Sanction",
            ) || [];

          const totalSanctionAmount = sanctionPayments.reduce(
            (total, item) => total + Number(item?.amount || 0),
            0,
          );

          return (
            <div className="space-y-6">
              {/* BANK DETAILS */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="border-b bg-slate-50 px-5 py-3">
                  <h3 className="text-lg font-semibold text-slate-700">
                    Bank Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
                  <div className="rounded-xl border bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Bank Name
                    </p>

                    <p className="font-semibold text-slate-800">
                      {selectedItem?.assigned_bank?.bank_name || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Account Holder
                    </p>

                    <p className="font-semibold text-slate-800">
                      {selectedItem?.assigned_bank
                        ?.account_holder_name || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Account Number
                    </p>

                    <p className="font-semibold text-slate-800 break-all">
                      {selectedItem?.assigned_bank?.account_no || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      IFSC Code
                    </p>

                    <p className="font-semibold text-slate-800">
                      {selectedItem?.assigned_bank?.ifsc_code || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Branch Name
                    </p>

                    <p className="font-semibold text-slate-800">
                      {selectedItem?.assigned_bank?.branch_name || "-"}
                    </p>
                  </div>

                  {/* APPROVED AMOUNT */}
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-green-600">
                      Approved Amount
                    </p>

                    <p className="text-xl font-bold text-green-700">
                      ₹{" "}
                      {Number(
                        selectedItem?.approve_amount || 0,
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* NO BANK MESSAGE */}
                {!selectedItem?.assigned_bank && (
                  <div className="border-t bg-yellow-50 px-5 py-4">
                    <p className="text-sm font-medium text-yellow-700">
                      Bank details are not assigned yet.
                    </p>
                  </div>
                )}
              </div>

              {/* SANCTION PAYMENT LIST */}
              <div className="overflow-hidden rounded-2xl border border-green-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b bg-green-50 px-5 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-green-700">
                      Sanction Monthly Payments
                    </h3>

                    <p className="text-sm text-green-600 mt-1">
                      Total sanctioned payment details
                    </p>
                  </div>

                  <div className="rounded-xl bg-white px-4 py-2 shadow-sm border border-green-200">
                    <p className="text-xs uppercase text-slate-500">
                      Total Sanction Amount
                    </p>

                    <p className="text-lg font-bold text-green-700">
                      ₹{" "}
                      {Number(totalSanctionAmount).toLocaleString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                </div>

                {sanctionPayments?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 text-slate-700">
                        <tr>
                          <th className="px-5 py-4 text-left font-semibold">
                            Month
                          </th>

                          <th className="px-5 py-4 text-left font-semibold">
                            Amount
                          </th>

                          <th className="px-5 py-4 text-left font-semibold">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {sanctionPayments?.map((payment, index) => (
                          <tr
                            key={index}
                            className="border-t hover:bg-slate-50 transition-all"
                          >
                            <td className="px-5 py-4 font-medium text-slate-700">
                              {payment?.month}
                            </td>

                            <td className="px-5 py-4 font-semibold text-slate-800">
                              ₹{" "}
                              {Number(
                                payment?.amount || 0,
                              ).toLocaleString("en-IN")}
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                {payment?.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <Eye size={28} className="text-slate-400" />
                    </div>

                    <h3 className="text-lg font-semibold text-slate-700">
                      No Sanction Payments
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      No sanction monthly payments available yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-4 border-t bg-slate-50 px-6 py-4">
        <button
          onClick={handleDisbursePayments}
          className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-700 transition-all"
        >
          Disburse
        </button>

        <button
          onClick={() => {
            setIsBankModalOpen(false);
            setSelectedItem(null);
          }}
          className="rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-900 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            {/* ===================================================== */}
            {/* HEADER */}
            {/* ===================================================== */}

            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Document Verification
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Upload required documents for verification
                </p>
              </div>

              <button
                onClick={() => setIsVerificationModalOpen(false)}
                className="text-2xl text-slate-500 hover:text-red-500"
              >
                ×
              </button>
            </div>

            {/* ===================================================== */}
            {/* BODY */}
            {/* ===================================================== */}

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="rounded-xl border p-5">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-800">Aadhaar Card</h3>

                  <p className="text-xs text-red-500">
                    * Aadhaar Number OR Upload Required
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* NUMBER */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Aadhaar Number
                    </label>

                    <input
                      type="text"
                      placeholder="Enter Aadhaar Number"
                      value={verificationData?.adharNumber || ""}
                      maxLength={12}
                      onChange={(e) => {
                        // Allow only numbers
                        const value = e.target.value.replace(/\D/g, "");

                        setVerificationData((prev) => ({
                          ...prev,
                          adharNumber: value,
                        }));
                      }}
                      disabled={verificationData?.isVerified === true}
                      className={`
    w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all
    focus:border-blue-500
    ${
      verificationData?.isVerified
        ? "cursor-not-allowed bg-slate-100 text-slate-500"
        : "bg-white text-slate-700"
    }
  `}
                    />
                  </div>

                  {/* FILE */}
                  <div>
                    {verificationData?.adharCardUrl && (
                      <div className="mt-3 flex items-center justify-between rounded-lg border bg-slate-50 p-3">
                        {/* File Name */}
                        <p className="max-w-[220px] truncate text-sm font-medium text-slate-700">
                          {verificationData?.adharCard?.name ||
                            verificationData?.adharCardName ||
                            "Aadhaar Card"}
                        </p>

                        {/* Preview Button */}
                        <button
                          type="button"
                          onClick={() =>
                            window.open(verificationData.adharCardUrl, "_blank")
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                          Preview
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-5">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-800">PAN Card</h3>

                  <p className="text-xs text-slate-500">Optional</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* PAN NUMBER */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      PAN Number
                    </label>

                    <input
                      type="text"
                      placeholder="Enter PAN Number"
                      value={verificationData.panNumber}
                      onChange={(e) =>
                        setVerificationData({
                          ...verificationData,
                          panNumber: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* PAN FILE */}
                  <div>
                    {verificationData?.panCardUrl && (
                      <div className="mt-3 flex items-center justify-between rounded-lg border bg-slate-50 p-3">
                        {/* File Name */}
                        <p className="max-w-[220px] truncate text-sm font-medium text-slate-700">
                          {verificationData?.panCard?.name ||
                            verificationData?.panCardName ||
                            "PAN Card"}
                        </p>

                        {/* Preview Button */}
                        <button
                          type="button"
                          onClick={() =>
                            window.open(verificationData.panCardUrl, "_blank")
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                          Preview
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
<div className="rounded-xl border p-5">
  <div className="mb-4">
    <h3 className="font-semibold text-slate-800">
      Sanction Letter
    </h3>

    <p className="text-xs text-slate-500">
      View uploaded sanction letter
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* FILE UPLOAD */}
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        Upload Sanction Letter
      </label>

      
    </div>

    {/* PREVIEW */}
    <div>
      {verificationData?.sanctionLetterUrl && (
        <div className="mt-3 flex items-center justify-between rounded-lg border bg-slate-50 p-3">
          {/* FILE NAME */}
          <p className="max-w-[220px] truncate text-sm font-medium text-slate-700">
            {verificationData?.sanctionLetter?.name ||
              verificationData?.sanctionLetterName ||
              "Sanction Letter"}
          </p>

          {/* PREVIEW BUTTON */}
          <button
            type="button"
            onClick={() =>
              window.open(
                verificationData.sanctionLetterUrl,
                "_blank"
              )
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Preview
          </button>
        </div>
      )}
    </div>
  </div>
</div>
              <div className="rounded-xl border p-5">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-800">
                    Bank Account Details
                  </h3>

                  <p className="text-xs text-red-500">
                    * Bank Account Number OR Upload Required
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ACCOUNT NUMBER */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Bank Account Number
                    </label>

                    <input
                      type="text"
                      placeholder="Enter Bank Account Number"
                      value={verificationData.bankAccountNumber}
                      onChange={(e) =>
                        setVerificationData({
                          ...verificationData,
                          bankAccountNumber: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* IFSC CODE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      IFSC Code
                    </label>

                    <input
                      type="text"
                      placeholder="Enter IFSC Code"
                      value={verificationData.ifscCode}
                      onChange={(e) =>
                        setVerificationData({
                          ...verificationData,
                          ifscCode: e.target.value.toUpperCase(),
                        })
                      }
                      maxLength={11}
                      className="w-full rounded-lg border px-4 py-3 text-sm uppercase outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* FILE */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Upload Bank Proof
                    </label>

                    <input
                      type="file"
                      onChange={(e) =>
                        setVerificationData({
                          ...verificationData,
                          bankAccount: e.target.files[0],
                        })
                      }
                      className="w-full rounded-lg border p-3 text-sm"
                    />

                    {verificationData?.bankAccountFileUrl && (
                      <div className="mt-3 flex items-center justify-between rounded-lg border bg-slate-50 p-3">
                        {/* File Name */}
                        <p className="max-w-[220px] truncate text-sm font-medium text-slate-700">
                          {verificationData?.bankAccount?.name ||
                            verificationData?.bankAccountFileName ||
                            "Bank Proof"}
                        </p>

                        {/* Preview Button */}
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              verificationData.bankAccountFileUrl,
                              "_blank",
                            )
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                          Preview
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Extra Documents
                    </h3>

                    <p className="text-xs text-slate-500">
                      Add additional documents if needed
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addExtraDocument}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-5">
                  {verificationData.extraDocuments.map((doc, index) => (
                    <div key={index} className="rounded-xl border p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* TITLE */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Document Title
                          </label>

                          <input
                            type="text"
                            placeholder="Enter document title"
                            value={doc.title}
                            onChange={(e) =>
                              handleExtraDocumentChange(
                                index,
                                "title",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* FILE */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Upload File
                          </label>

                          <input
                            type="file"
                            onChange={(e) =>
                              handleExtraDocumentChange(
                                index,
                                "file",
                                e.target.files[0],
                              )
                            }
                            className="w-full rounded-lg border p-3 text-sm"
                          />
                        </div>
                      </div>

                      {/* IMAGE */}
                      {doc?.fileUrl && (
                        <img
                          src={doc.fileUrl}
                          alt="Extra Document"
                          className="mt-4 h-32 w-48 rounded-lg border object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ===================================================== */}
            {/* FOOTER */}
            {/* ===================================================== */}

            <div className="flex items-center justify-end gap-4 border-t px-6 py-4 bg-slate-50">
              {/* DRAFT */}
              <button
                onClick={() => saveVerificationData("draft")}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Save As Draft
              </button>

              {/* VERIFIED */}
              <button
                onClick={() => saveVerificationData("verified")}
                className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
              >
                Verified
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccontAssistncePage;
