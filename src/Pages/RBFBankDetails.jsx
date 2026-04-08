import { Edit, Plus, Search, Trash2 } from "lucide-react";
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
            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
          />

          <input
            required
            placeholder="Account Holder Name"
            value={formData.account_holder_name}
            onChange={(e) =>
              setFormData({ ...formData, account_holder_name: e.target.value })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
          />

          <input
            placeholder="Branch Name"
            value={formData.branch_name}
            onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
          />

          <input
            placeholder="IFSC Code"
            value={formData.ifsc_code}
            onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
          />

          <input
            required
            placeholder="Account Number"
            value={formData.account_no}
            onChange={(e) => setFormData({ ...formData, account_no: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBanks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API}/api/banks`);
      if (!res.ok) throw new Error("Failed to fetch bank details");

      const data = await res.json();

      if (Array.isArray(data)) {
        setBanks(data);
      } else if (Array.isArray(data?.data)) {
        setBanks(data.data);
      } else if (Array.isArray(data?.banks)) {
        setBanks(data.banks);
      } else {
        setBanks([]);
      }
    } catch (err) {
      console.error(err);
      setBanks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleSave = async (formData) => {
    try {
      setIsSaving(true);

      const payload = {
        bank_name: String(formData?.bank_name || "").trim(),
        account_holder_name: String(formData?.account_holder_name || "").trim(),
        branch_name: String(formData?.branch_name || "").trim(),
        ifsc_code: String(formData?.ifsc_code || "").trim().toUpperCase(),
        account_no: String(formData?.account_no || "").trim(),
        status: normalizeStatusForApi(formData?.status),
      };

      if (!payload.bank_name || !payload.account_holder_name || !payload.account_no) {
        alert("Bank name, account holder name and account number are required.");
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
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
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
    </div>
  );
}

export default RBFBankDetails;
