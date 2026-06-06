import { Edit, Plus, Search, Trash2,FileText  } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { API } from "../api/BaseURL";

const normalizeStatusForForm = (value) => {
  if (value === 1 || value === "1" || value === true) return "active";
  if (value === 0 || value === "0" || value === false) return "inactive";
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "active") return "active";
  if (normalized === "inactive") return "inactive";
  return "active";
};

const normalizeStatusForApi = (value) =>
  normalizeStatusForForm(value) === "active" ? 1 : 0;

const getStatusBadge = (value) => {
  const status = normalizeStatusForForm(value);
  return {
    label: status === "active" ? "Active" : "Inactive",
    className:
      status === "active"
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-700",
  };
};

const EMPTY_FORM = {
  bank_name: "",
  account_holder_name: "",
  branch_name: "",
  ifsc_code: "",
  account_type:"",
  account_no: "",
  status: "active",
};

const DeleteModal = ({ isOpen, onClose, onConfirm, bankName, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-3 text-xl font-bold text-gray-800">Delete Bank</h2>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <strong>{bankName || "this bank"}</strong>?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border px-4 py-2 text-sm"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded bg-red-500 px-4 py-2 text-sm text-white"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const BankModal = ({ isOpen, onClose, onSave, initialData, loading }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        bank_name: initialData.bank_name || "",
        account_holder_name: initialData.account_holder_name || "",
        branch_name: initialData.branch_name || "",
        ifsc_code: initialData.ifsc_code || "",
        account_no: initialData.account_no || "",
        status: normalizeStatusForForm(initialData.status),
      });
      return;
    }

    setFormData(EMPTY_FORM);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const saved = await onSave(formData);
    if (saved) onClose();
  };

  return (
    // <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    //   <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
    //     <div className="border-b p-6">
    //       <h2 className="text-xl font-bold text-gray-800">
    //         {initialData ? "Edit Bank" : "Add Bank"}
    //       </h2>
    //     </div>

    //     <form onSubmit={handleSubmit} className="space-y-4 p-6">
    //       <input
    //         required
    //         placeholder="Bank Name"
    //         value={formData.bank_name}
    //         onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
    //         className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
    //       />

    //       <input
    //         required
    //         placeholder="Account Holder Name"
    //         value={formData.account_holder_name}
    //         onChange={(e) =>
    //           setFormData({ ...formData, account_holder_name: e.target.value })
    //         }
    //         className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
    //       />

    //       <input
    //         placeholder="Branch Name"
    //         value={formData.branch_name}
    //         onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
    //         className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
    //       />

    //       <input
    //         placeholder="IFSC Code"
    //         value={formData.ifsc_code}
    //         onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
    //         className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
    //       />

    //       <input
    //         required
    //         placeholder="Account Number"
    //         value={formData.account_no}
    //         onChange={(e) => setFormData({ ...formData, account_no: e.target.value })}
    //         className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
    //       />

    //       <select
    //         value={formData.status}
    //         onChange={(e) => setFormData({ ...formData, status: e.target.value })}
    //         className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
    //       >
    //         <option value="active">Active</option>
    //         <option value="inactive">Inactive</option>
    //       </select>

    //       <div className="mt-6 flex justify-end gap-3">
    //         <button
    //           type="button"
    //           onClick={onClose}
    //           className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
    //           disabled={loading}
    //         >
    //           Cancel
    //         </button>
    //         <button
    //           type="submit"
    //           className="rounded bg-[#d94452] px-4 py-2 text-sm text-white hover:bg-[#c13946]"
    //           disabled={loading}
    //         >
    //           {loading ? "Saving..." : "Save"}
    //         </button>
    //       </div>
    //     </form>
    //   </div>
    // </div>

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
  <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
    <div className="border-b p-6">
      <h2 className="text-xl font-bold text-gray-800">
        {initialData ? "Edit Bank" : "Add Bank"}
      </h2>
    </div>

    <form onSubmit={handleSubmit} className="space-y-4 p-6">
     <input
  required
  placeholder="Bank Name"
  value={formData.bank_name}
  onChange={(e) =>
    setFormData({
      ...formData,
      bank_name: e.target.value.toUpperCase(),
    })
  }
  className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
/>

      <input
        required
        placeholder="Account Holder Name"
        value={formData.account_holder_name}
        onChange={(e) =>
          setFormData({
            ...formData,
            account_holder_name: e.target.value.toUpperCase(),
          })
        }
        className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
      />

      <input
        placeholder="Branch Name"
        value={formData.branch_name}
        onChange={(e) =>
          setFormData({ ...formData, branch_name: e.target.value.toUpperCase()   })
        }
        className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
      />

      <input
        placeholder="IFSC Code"
        value={formData.ifsc_code}
        onChange={(e) =>
          setFormData({
            ...formData,
            ifsc_code: e.target.value.toUpperCase(),
          })
        }
        className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
      />

      <input
        required
        placeholder="Account Number"
        value={formData.account_no}
        onChange={(e) =>
          setFormData({ ...formData, account_no: e.target.value })
        }
        className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
      />

      {/* Credit / Debit Checkbox */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Account Type
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.account_type === "credit"}
              onChange={() =>
                setFormData({
                  ...formData,
                  account_type: "credit",
                })
              }
              className="h-4 w-4"
            />
            <span>Credit</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.account_type === "debit"}
              onChange={() =>
                setFormData({
                  ...formData,
                  account_type: "debit",
                })
              }
              className="h-4 w-4"
            />
            <span>Debit</span>
          </label>
        </div>
      </div>

      <select
        value={formData.status}
        onChange={(e) =>
          setFormData({ ...formData, status: e.target.value })
        }
        className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded bg-[#d94452] px-4 py-2 text-sm text-white hover:bg-[#c13946]"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  </div>
</div>
  );
};

function RBFBankDetails() {
  const [banks, setBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
const [ledgerData, setLedgerData] = useState([]);

const [isLedgerModalOpen, setIsLedgerModalOpen] =
  useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [bankSummary, setBankSummary] = useState({
  total_banks: 0,
  total_balance: 0,
  total_credit_balance: 0,
  total_debit_balance: 0,
});

const [totalBankBalance, setTotalBankBalance] = useState(0);
  const getTodayDate = () => {
  return new Date()
    .toISOString()
    .split("T")[0];
};



const [ledgerSummary,
  setLedgerSummary] =
  useState({});



// CURRENT FINANCIAL YEAR DATE FUNCTION
const getFinancialYearDates = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // January = 0

  let fromDate;
  let toDate = today.toISOString().split("T")[0];

  // Financial Year: 1 April → 31 March
  if (currentMonth >= 4) {
    // Current FY started this year
    fromDate = `${currentYear}-04-01`;
  } else {
    // Current FY started previous year
    fromDate = `${currentYear - 1}-04-01`;
  }

  return {
    from_date: fromDate,
    to_date: toDate,
  };
};

// STATE
const [ledgerFilters, setLedgerFilters] = useState(
  getFinancialYearDates()
);

const [selectedBankId,
  setSelectedBankId] =
  useState(null);

 const fetchBanks = async () => {
  try {
    setIsLoading(true);

    const res = await fetch(
      `${API}/api/banks/get-all-banks-total-balance`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch bank details");
    }

    const response = await res.json();

    // SET BANK LIST
    if (Array.isArray(response?.data)) {
      setBanks(response.data);
    } else {
      setBanks([]);
    }

    // SET SUMMARY
    setBankSummary({
      total_banks: response?.summary?.total_banks || 0,
      total_balance: response?.summary?.total_balance || 0,
      total_credit_balance:
        response?.summary?.total_credit_balance || 0,
      total_debit_balance:
        response?.summary?.total_debit_balance || 0,
    });

  } catch (err) {
    console.error(err);

    setBanks([]);

    setBankSummary({
      total_banks: 0,
      total_balance: 0,
      total_credit_balance: 0,
      total_debit_balance: 0,
    });

  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchBanks();
  }, []);
const getBankLedger = async (
  bankId,
  fromDate =
    ledgerFilters.from_date,
  toDate =
    ledgerFilters.to_date
) => {
  try {
    setSelectedBankId(bankId);

    const response = await fetch(
      `https://uat.ratnakukshi.org/api/InComming/get-bank-ledger/${bankId}?from_date=${fromDate}&to_date=${toDate}`
    );

    const data =
      await response.json();

    console.log(
      "LEDGER =>",
      data
    );

    if (data.success) {
      setLedgerData(data.data);

      setLedgerSummary(
        data.summary
      );

      setLedgerFilters({
        from_date:
          data.filters
            .from_date,

        to_date:
          data.filters.to_date,
      });

      setIsLedgerModalOpen(true);
    }
  } catch (error) {
    console.log(
      "GET LEDGER ERROR",
      error
    );
  }
};
  const handleSave = async (formData) => {
    try {
      setIsSaving(true);

      const payload = {
        bank_name: String(formData?.bank_name || "").trim(),
        account_holder_name: String(formData?.account_holder_name || "").trim(),
        branch_name: String(formData?.branch_name || "").trim(),
        ifsc_code: String(formData?.ifsc_code || "").trim().toUpperCase(),
        account_no: String(formData?.account_no || "").trim(),
        account_type: String(formData?.account_type || "").trim(),
        status: normalizeStatusForApi(formData?.status),
      };

      if (!payload.bank_name || !payload.account_holder_name || !payload.account_no) {
        alert("Bank name, account holder name and account number are required.");
        return false;
      }
if (!payload.account_type) {

  alert("Account type is required");

  return false;

}
      const endpoint = selectedBank
        ? `${API}/api/banks/${selectedBank.id}`
        : `${API}/api/banks/create`;
      const method = selectedBank ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to save bank details");
      }

      await fetchBanks();
      return true;
    } catch (err) {
      console.error(err);
      alert(err?.message || "Unable to save bank details.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBank?.id) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`${API}/api/banks/${selectedBank.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to delete bank");
      }

      await fetchBanks();
      setIsDeleteModalOpen(false);
      setSelectedBank(null);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Unable to delete bank.");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeAllModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedBank(null);
  };

  const filteredBanks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return banks;

    return banks.filter((bank) => {
      const bankName = String(bank?.bank_name || "").toLowerCase();
      const holder = String(bank?.account_holder_name || "").toLowerCase();
      const ifsc = String(bank?.ifsc_code || "").toLowerCase();

      return bankName.includes(query) || holder.includes(query) || ifsc.includes(query);
    });
  }, [banks, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-700">Bank Details</h1>
        <button
          onClick={() => {
            setSelectedBank(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-md bg-[#d94452] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#c13946]"
        >
          <Plus size={18} /> Add Bank
        </button>
      </div>
      {/* SUMMARY CARDS */}
<div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

  {/* TOTAL BANKS */}
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
      Total Banks
    </p>

    <h2 className="mt-2 text-3xl font-black text-slate-800">
      {bankSummary.total_banks}
    </h2>
  </div>

  {/* TOTAL BALANCE */}
  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
      Total Balance
    </p>

    <h2
      className={`mt-2 text-3xl font-black ${
        Number(bankSummary.total_balance) >= 0
          ? "text-emerald-700"
          : "text-rose-700"
      }`}
    >
      ₹
      {Number(bankSummary.total_balance).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}
    </h2>
  </div>

  {/* TOTAL CREDIT */}
  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
      Total Credit
    </p>

    <h2 className="mt-2 text-3xl font-black text-emerald-700">
      ₹
      {Number(bankSummary.total_credit_balance).toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
        }
      )}
    </h2>
  </div>

  {/* TOTAL DEBIT */}
  <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-rose-600">
      Total Debit
    </p>

    <h2 className="mt-2 text-3xl font-black text-rose-700">
      ₹
      {Number(bankSummary.total_debit_balance).toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
        }
      )}
    </h2>
  </div>
</div>

      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by bank, holder or IFSC..."
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <p className="text-sm text-gray-600">Showing {filteredBanks.length} result(s)</p>
        </div>

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Bank Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Bank Holder Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Branch Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Account No</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">IFSC Code</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredBanks.length > 0 ? (
              filteredBanks.map((bank) => {
                const badge = getStatusBadge(bank?.status);
                return (
                  <tr key={bank.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{bank.bank_name || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{bank.account_holder_name || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{bank.branch_name || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{bank.account_no || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{bank.ifsc_code || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4 text-right text-sm text-gray-600">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBank(bank);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                          aria-label={`Edit ${bank.bank_name}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBank(bank);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Delete ${bank.bank_name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td> */}

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
  <div className="flex justify-end gap-3">

    {/* LEDGER BUTTON */}
   <button
  type="button"
  onClick={() => {
    getBankLedger(bank.id);
  }}
  className="flex items-center gap-2 rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-200"
>
                          <FileText size={16} title="View Statement" />
  
</button>
    {/* EDIT BUTTON */}
    <button
      type="button"
      onClick={() => {
        setSelectedBank(bank);
        setIsEditModalOpen(true);
      }}
      className="text-blue-500 hover:text-blue-700"
      aria-label={`Edit ${bank.bank_name}`}
    >
      <Edit size={18} />
    </button>

    {/* DELETE BUTTON */}
    <button
      type="button"
      onClick={() => {
        setSelectedBank(bank);
        setIsDeleteModalOpen(true);
      }}
      className="text-red-500 hover:text-red-700"
      aria-label={`Delete ${bank.bank_name}`}
    >
      <Trash2 size={18} />
    </button>

  </div>
</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                  No bank details found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <BankModal
        isOpen={isAddModalOpen || isEditModalOpen}
        initialData={selectedBank}
        onClose={closeAllModals}
        onSave={handleSave}
        loading={isSaving}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        bankName={selectedBank?.bank_name}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBank(null);
        }}
        onConfirm={handleDelete}
        loading={isDeleting}
      />

    {isLedgerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-opacity duration-300">
          
          <div className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
            
            {/* ===================================== */}
            {/* HEADER */}
            {/* ===================================== */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 px-8 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white shadow-inner">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                    Bank Ledger Statement
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-indigo-200 sm:text-sm">
                    Review and filter systematic real-time transaction history
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsLedgerModalOpen(false)}
                className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-all duration-200 hover:bg-red-500 hover:text-white hover:scale-105 active:scale-95"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ===================================== */}
            {/* FILTER SECTION */}
            {/* ===================================== */}
            <div className="grid grid-cols-1 gap-4 border-b border-slate-100 bg-slate-50/70 px-8 py-5 sm:grid-cols-2 md:grid-cols-4">
              
              {/* FROM DATE */}
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide uppercase text-slate-600">
                  From Date
                </label>
                <input
                  type="date"
                  value={ledgerFilters.from_date}
                  onChange={(e) =>
                    setLedgerFilters({
                      ...ledgerFilters,
                      from_date: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
                />
              </div>

              {/* TO DATE */}
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide uppercase text-slate-600">
                  To Date
                </label>
                <input
                  type="date"
                  value={ledgerFilters.to_date}
                  onChange={(e) =>
                    setLedgerFilters({
                      ...ledgerFilters,
                      to_date: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
                />
              </div>

              {/* SEARCH BUTTON */}
              <div className="flex items-end">
                <button
                  onClick={() =>
                    getBankLedger(
                      selectedBankId,
                      ledgerFilters.from_date,
                      ledgerFilters.to_date
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-[0.99]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607w" />
                  </svg>
                  Search Statement
                </button>
              </div>

              {/* TOTAL RECORDS CARD */}
              <div className="flex items-end">
                <div className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-2.5 shadow-sm">
                  <div>
                    <p className="text-xs font-semibold tracking-wide uppercase text-slate-400">
                      Total Records
                    </p>
                    <h3 className="text-xl font-black text-slate-800 mt-0.5">
                      {ledgerData?.length || 0}
                    </h3>
                  </div>
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>

            {/* ===================================== */}
            {/* SUMMARY CARDS SECTION */}
            {/* ===================================== */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 bg-white px-8 py-6 md:grid-cols-5">
              
              {/* CURRENT BALANCE */}
              <div className="col-span-2 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/70 to-blue-50/20 p-5 shadow-sm md:col-span-1">
                <p className="text-xs font-bold tracking-wide uppercase text-blue-600">Current Balance</p>
                <h2 className={`mt-2.5 text-2xl font-black tracking-tight ${
                  Number(ledgerSummary?.current_balance || 0) >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}>
                  ₹{Number(ledgerSummary?.current_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
              </div>

              {/* OPENING BALANCE */}
              <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-transparent p-5 shadow-sm">
                <p className="text-xs font-bold tracking-wide uppercase text-slate-500">Opening Balance</p>
                <h2 className="mt-2.5 text-2xl font-bold tracking-tight text-slate-800">
                  ₹{Number(ledgerSummary?.opening_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
              </div>

              {/* TOTAL CREDIT */}
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/60 to-transparent p-5 shadow-sm">
                <p className="text-xs font-bold tracking-wide uppercase text-emerald-600">Total Credit (+)</p>
                <h2 className="mt-2.5 text-2xl font-bold tracking-tight text-emerald-700">
                  ₹{Number(ledgerSummary?.total_credit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
              </div>

              {/* TOTAL DEBIT */}
              <div className="rounded-2xl border border-rose-100 bg-gradient-to-b from-rose-50/60 to-transparent p-5 shadow-sm">
                <p className="text-xs font-bold tracking-wide uppercase text-rose-600">Total Debit (-)</p>
                <h2 className="mt-2.5 text-2xl font-bold tracking-tight text-rose-700">
                  ₹{Number(ledgerSummary?.total_debit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
              </div>

              {/* CLOSING BALANCE */}
              <div className="col-span-2 rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-transparent p-5 shadow-sm md:col-span-1">
                <p className="text-xs font-bold tracking-wide uppercase text-indigo-600">Closing Balance</p>
                <h2 className={`mt-2.5 text-2xl font-black tracking-tight ${
                  Number(ledgerSummary?.closing_balance || 0) >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}>
                  ₹{Number(ledgerSummary?.closing_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
              </div>

            </div>

            {/* ===================================== */}
            {/* DATA TABLE SECTION */}
            {/* ===================================== */}
            <div className="flex-1 overflow-auto px-8 py-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wider uppercase text-slate-500">
                    <th className="px-5 py-3.5 rounded-l-xl">ID</th>
                    <th className="px-5 py-3.5">Transaction Type</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Description</th>
                    <th className="px-5 py-3.5 rounded-r-xl">Date & Time</th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-slate-100">
                  {ledgerData?.length > 0 ? (
                    ledgerData.map((item, index) => {
                      const isCredit = item.transaction_type === "Credit";
                      return (
                        <tr
                          key={item.id}
                          className="group transition-colors duration-150 hover:bg-slate-50/80"
                        >
                          {/* ID */}
                          <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-500">
                            #{item.id}
                          </td>

                          {/* TYPE BADGE */}
                          <td className="whitespace-nowrap px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
                                isCredit
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10"
                                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-600/10"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${isCredit ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {item.transaction_type}
                            </span>
                          </td>

                          {/* AMOUNT */}
                          <td className={`whitespace-nowrap px-5 py-4 text-sm font-bold ${
                            isCredit ? "text-emerald-600" : "text-rose-600"
                          }`}>
                            {isCredit ? "+" : "-"} ₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          {/* DESCRIPTION */}
                          <td className="max-w-xs truncate px-5 py-4 text-sm font-medium text-slate-600" title={item.description}>
                            {item.description || <span className="text-slate-300 italic">No description available</span>}
                          </td>

                          {/* DATE */}
                          <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-500">
                            {new Date(item.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                            <span className="ml-2 text-xs font-normal text-slate-400">
                              {new Date(item.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    /* EMPTY STATE */
                    <tr>
                      <td colSpan="5" className="px-5 py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 shadow-inner">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18a2.25 2.25 0 012.25 2.25v4.25a2.25 2.25 0 01-2.25 2.25H2.25A2.25 2.25 0 010 19.75V15.75a2.25 2.25 0 012.25-2.25z" />
                            </svg>
                          </div>
                          <h3 className="mt-4 text-base font-bold text-slate-700">
                            No Ledger Records Found
                          </h3>
                          <p className="mt-1 text-xs font-medium text-slate-400">
                            Try broadening your date configuration filters to view historical statement rows.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default RBFBankDetails;
