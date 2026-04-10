import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, CreditCard, Filter, X } from 'lucide-react'
import { API } from "../api/BaseURL";

const initialForm = {
  credit_type: "",
  amount: "",
  account_holder_name: "",
  fund_date: "",
  payment_mode: "",
  utr_no: "",
  from_rbf_bank_account: "",
  status: "Completed",
};

const StatusBadge = ({ status }) => {
    const styles = {
        Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
        Pending: "bg-amber-50 text-amber-700 border-amber-100",
        Failed: "bg-red-50 text-red-700 border-red-100",
        Cancelled: "bg-slate-50 text-slate-700 border-slate-100",
    };

    return (
        <span className={`rounded-md border px-2 py-1 text-[11px] font-bold uppercase tracking-tight ${styles[status] || styles.Pending}`}>
            {status || "Unknown"}
        </span>
    );
};

function CreditModal({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    activeBanks,
    isEdit,
}) {
    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const labelStyle = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500";
    const inputStyle = "w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm transition-all focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200/50 disabled:opacity-50";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-8 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{isEdit ? "Edit Credit Entry" : "Add New Credit"}</h2>
                        <p className="text-xs text-gray-500">Please fill in the details below to record the transaction.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    className="p-8"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="space-y-6">
                        {/* Section: Basic Info */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className={labelStyle}>Credit Type</label>
                                <select
                                    name="credit_type"
                                    value={formData.credit_type}
                                    onChange={handleChange}
                                    className={inputStyle}
                                    required
                                >
                                    <option value="" disabled>Select Credit Type</option>
                                    <option value="Tax Refund">Tax Refund</option>
                                    
                                    <option value="Share">Share</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                    <input
                                        name="amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className={`${inputStyle} pl-7 font-medium text-gray-900`}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Holder & Date */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className={labelStyle}>Account Holder Name</label>
                                <input
                                    name="account_holder_name"
                                    value={formData.account_holder_name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>Transaction Date</label>
                                <input
                                    name="fund_date"
                                    type="date"
                                    value={formData.fund_date}
                                    onChange={handleChange}
                                    className={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Section: Payment Details */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className={labelStyle}>Payment Mode</label>
                                <select
                                    name="payment_mode"
                                    value={formData.payment_mode}
                                    onChange={handleChange}
                                    className={inputStyle}
                                >
                                    <option value="">Select Mode</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Card">Card</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>UTR / Transaction ID</label>
                                <input
                                    name="utr_no"
                                    value={formData.utr_no}
                                    onChange={handleChange}
                                    placeholder="Reference number"
                                    className={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Section: Bank & Status */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className={labelStyle}>To RBF Bank Account</label>
                                <select
                                    name="from_rbf_bank_account"
                                    value={formData.from_rbf_bank_account}
                                    onChange={handleChange}
                                    className={inputStyle}
                                >
                                    <option value="">Select Bank Account</option>
                                    {activeBanks.map((bank) => (
                                        <option key={bank.id} value={bank.id}>
                                            {bank.bank_name} (***{String(bank.account_no).slice(-4)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className={`${inputStyle} font-semibold ${formData.status === 'Completed' ? 'text-green-600' :
                                            formData.status === 'Pending' ? 'text-amber-600' : 'text-red-600'
                                        }`}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Failed">Failed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-10 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-red-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 hover:shadow-red-300 active:scale-[0.98]"
                        >
                            {isEdit ? "Update Record" : "Save Transaction"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


function DeleteModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-2 text-lg font-semibold text-gray-800">Delete Credit</h2>
        <p className="text-sm text-gray-600">Are you sure you want to delete this credit record?</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded border px-4 py-2 text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="rounded bg-red-600 px-4 py-2 text-sm text-white">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function CreditPage() {
  const [credits, setCredits] = useState([]);
  const [activeBanks, setActiveBanks] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const loadCredits = async () => {
    try {
      const res = await fetch(`${API}/api/credit-account/list`);
      const data = await res.json();
      setCredits(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error("Error loading credit data:", error);
      setCredits([]);
    }
  };

  const loadBanks = async () => {
    try {
      const res = await fetch(`${API}/api/banks`);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      const bankRows = rows.filter((bank) => {
        const normalized = String(bank?.status ?? "").toLowerCase();
        return bank?.status === 1 || bank?.status === "1" || bank?.status === true || normalized === "active";
      });
      setActiveBanks(bankRows);
    } catch (error) {
      console.error("Error loading bank list:", error);
      setActiveBanks([]);
    }
  };

  useEffect(() => {
    loadCredits();
    loadBanks();
  }, []);

  const filteredCredits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return credits;
    return credits.filter((item) =>
      [
        item?.credit_type,
        item?.amount,
        item?.account_holder_name,
        item?.payment_mode,
        item?.utr_no,
        item?.bank_name,
        item?.account_no,
        item?.status,
      ]
        .map((v) => String(v || "").toLowerCase())
        .some((v) => v.includes(q))
    );
  }, [credits, search]);

  const resetModalState = () => {
    setEditingRow(null);
    setFormData(initialForm);
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount || 0),
      };

      const isEdit = Boolean(editingRow?.id);
      const url = isEdit
        ? `${API}/api/credit-account/update/${editingRow.id}`
        : `${API}/api/credit-account/create`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to save credit");
      }

      resetModalState();
      await loadCredits();
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to save credit");
    }
  };

  const openEditModal = (row) => {
    setEditingRow(row);
    setFormData({
      credit_type: row?.credit_type || "",
      amount: row?.amount || "",
      account_holder_name: row?.account_holder_name || "",
      fund_date: row?.fund_date ? String(row.fund_date).slice(0, 10) : "",
      payment_mode: row?.payment_mode || "",
      utr_no: row?.utr_no || "",
      from_rbf_bank_account: row?.from_rbf_bank_account || "",
      status: row?.status || "Completed",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`${API}/api/credit-account/delete/${deletingId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to delete credit");
      }

      setIsDeleteOpen(false);
      setDeletingId(null);
      await loadCredits();
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to delete credit");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
          <div className="mx-auto max-w-7xl">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Credit Account</h1>
                      
                  </div>
                  <button
                      onClick={() => {
                          setEditingRow(null);
                          setFormData(initialForm);
                          setIsModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 active:scale-95"
                  >
                      <Plus size={18} /> Add New Credit
                  </button>
              </div>

              {/* Table Card */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {/* Table Toolbar */}
                  <div className="flex flex-col border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between gap-4">
                      <div className="relative w-full max-w-sm">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <Search size={17} />
                          </span>
                          <input
                              type="text"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              placeholder="Search by name, UTR, or bank..."
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
                          />
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Records: {filteredCredits.length}</span>
                      </div>
                  </div>

                  {/* Table Data */}
                  <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                          <thead>
                              <tr className="bg-slate-50/50">
                                  <th className="border-b border-slate-100 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Transaction Date</th>
                                  <th className="border-b border-slate-100 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Credit Type</th>
                                  <th className="border-b border-slate-100 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Amount</th>
                                  <th className="border-b border-slate-100 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Payment Details</th>
                                  <th className="border-b border-slate-100 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Target Bank</th>
                                  <th className="border-b border-slate-100 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                                  <th className="border-b border-slate-100 px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                              {filteredCredits.length === 0 ? (
                                  <tr>
                                      <td colSpan="7" className="px-6 py-12 text-center">
                                          <div className="flex flex-col items-center justify-center text-slate-400">
                                              <CreditCard size={48} className="mb-2 opacity-20" />
                                              <p className="text-sm">No credit records found matching your search.</p>
                                          </div>
                                      </td>
                                  </tr>
                              ) : (
                                  filteredCredits.map((item) => (
                                      <tr key={item.id} className="group transition-colors hover:bg-slate-50/50">
                                          <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                              {item?.fund_date ? new Date(item.fund_date).toLocaleDateString('en-GB') : "-"}
                                          </td>
                                          <td className="px-6 py-4">
                                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                  {item?.credit_type || "-"}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                              ₹{Number(item?.amount).toLocaleString('en-IN')}
                                          </td>
                                          <td className="px-6 py-4">
                                              <div className="text-sm font-medium text-slate-700">{item?.account_holder_name || "-"}</div>
                                              <div className="text-[11px] text-slate-400">{item?.payment_mode} • {item?.utr_no || "No UTR"}</div>
                                          </td>
                                          <td className="px-6 py-4">
                                              <div className="text-sm text-slate-600">{item?.bank_name || "-"}</div>
                                              <div className="text-[11px] font-mono text-slate-400">{item?.account_no ? `****${String(item.account_no).slice(-4)}` : ""}</div>
                                          </td>
                                          <td className="px-6 py-4">
                                              <StatusBadge status={item?.status} />
                                          </td>
                                          <td className="px-6 py-4">
                                              <div className="flex justify-end gap-2">
                                                  <button
                                                      onClick={() => openEditModal(item)}
                                                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                  >
                                                      <Edit size={16} />
                                                  </button>
                                                  <button
                                                      onClick={() => {
                                                          setDeletingId(item.id);
                                                          setIsDeleteOpen(true);
                                                      }}
                                                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                  >
                                                      <Trash2 size={16} />
                                                  </button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      <CreditModal
        isOpen={isModalOpen}
        onClose={resetModalState}
        onSubmit={handleSave}
        formData={formData}
        setFormData={setFormData}
        activeBanks={activeBanks}
        isEdit={Boolean(editingRow)}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default CreditPage;

