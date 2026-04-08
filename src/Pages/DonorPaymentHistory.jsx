import axios from "axios";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { API } from "../api/BaseURL";

function DonorPaymentHistory() {
  const location = useLocation();
  const donorId = location?.state?.id;
  const donorName = location?.state?.donorName || "Donor";

  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeBanks, setActiveBanks] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [formData, setFormData] = useState({
    amount: "",
    dueDate: "",
    fundDate: "",
    paymentMode: "",
    utrNo: "",
    status: "Completed",
    payFrom: "",
    accountName: "",
    fromRbfBankAccount: "",
  });

  const openEditModal = (payment) => {
    setSelectedPayment(payment);

    setFormData({
      amount: payment.amount || "",
      dueDate: payment.dueDate || payment.due_date || "",
      fundDate: payment.fundDate || "",
      paymentMode: payment.paymentMode || "",
      utrNo: payment.utrNo || "",
      status: payment.status || "Completed",
      payFrom: payment.payFrom || "",
      accountName: payment.accountName || "",
      fromRbfBankAccount:
        payment.fromRbfBankAccount || payment.rbfBankAccount || payment.rbfBankId || "",
    });

    setShowModal(true);
  };

  useEffect(() => {
    if (!donorId) return;

    const fetchInstallments = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API}/api/donor/get-installments/${donorId}`,
        );
        const data = await response.json();
        const list = Array.isArray(data?.installments)
          ? data.installments
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.installment)
              ? data.installment
              : Array.isArray(data?.rows)
                ? data.rows
                : Array.isArray(data?.result)
                  ? data.result
                  : Array.isArray(data?.payments)
                    ? data.payments
                    : Array.isArray(data?.records)
                      ? data.records
                      : Array.isArray(data?.items)
                        ? data.items
                        : Array.isArray(data?.list)
                          ? data.list
                          : Array.isArray(data?.history)
                            ? data.history
                            : Array.isArray(data?.paymentHistory)
                              ? data.paymentHistory
                              : Array.isArray(data?.payment_history)
                                ? data.payment_history
                                : Array.isArray(data?.installments_data)
                                  ? data.installments_data
                                  : Array.isArray(data?.installment_data)
                                    ? data.installment_data
                                    : Array.isArray(data?.installmentList)
                                      ? data.installmentList
                                      : Array.isArray(data?.installment_list)
                                        ? data.installment_list
                                        : Array.isArray(data?.recordsData)
                                          ? data.recordsData
                                          : Array.isArray(data?.records_data)
                                            ? data.records_data
                                            : Array.isArray(data)
                                              ? data
                                              : [];
        setPayments(list);
      } catch (error) {
        console.log("Error fetching installments:", error);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstallments();
  }, [donorId]);

  useEffect(() => {
    const isActiveBank = (status) => {
      const normalized = String(status ?? "").trim().toLowerCase();
      return (
        status === 1 ||
        status === "1" ||
        status === true ||
        normalized === "active"
      );
    };

    const fetchActiveBanks = async () => {
      try {
        const response = await fetch(`${API}/api/banks`);
        const data = await response.json();

        const bankList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.banks)
              ? data.banks
              : [];

        setActiveBanks(bankList.filter((bank) => isActiveBank(bank?.status)));
      } catch (error) {
        console.error("Error fetching active banks:", error);
        setActiveBanks([]);
      }
    };

    fetchActiveBanks();
  }, []);

  const filteredPayments = payments.filter((payment, index) => {
    const installmentLabel =
      payment.installment ||
      payment.installment_name ||
      `${index + 1} Installment`;
    const mode = payment.paymentMode || payment.mode || "";
    const utr = payment.utrNo || payment.utr || "";

    return (
      installmentLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      utr.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const updateInstallment = async () => {
    try {
      await axios.put(
        `${API}/api/donor/update-installment/${donorId}/${selectedPayment.id}`,
        formData
      );

      setShowModal(false);
      window.location.reload(); // simple refresh
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // const downloadReceipt = async (id) => {
  //   try {
  //     const response = await axios.get(
  //       `${API}/api/donor/donation-receipt/${id}`,
  //       { responseType: "blob" }
  //     );

  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement("a");

  //     link.href = url;
  //     link.download = `donation-receipt-${id}.pdf`;

  //     document.body.appendChild(link);
  //     link.click();

  //     link.remove();
  //   } catch (error) {
  //     console.error("Download error:", error);
  //   }
  // };

  const downloadReceipt = async (donorId, installmentId, index) => {
    try {
      const response = await axios.get(
        `${API}/api/donor/donation-receipt/${donorId}/${installmentId}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.download = `donation-receipt-${index + 1}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();

    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-700">Donor Payment History</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="text-lg font-semibold text-gray-800">{donorName}</div>
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by installment, mode, or UTR..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Sr. No.</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Installment</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Installment Due Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date Installment Received</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Mode of Payment</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">UTR Number</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-10 text-center text-gray-400">
                  Loading payment records...
                </td>
              </tr>
            ) : filteredPayments.length > 0 ? (
              filteredPayments.map((payment, index) => {
                const installmentLabel =
                  payment.installment ||
                  payment.installment_name ||
                  `${index + 1} Installment`;
                const amount = payment.amount || payment.installmentAmount || "0";
                const dueDate = payment.dueDate || payment.due_date || "-";
                const receivedDate =
                  payment.fundDate || payment.receivedDate || payment.received_date || "-";
                const mode = payment.paymentMode || payment.mode || "-";
                const utr = payment.utrNo || payment.utr || "-";

                return (
                  <tr
                    key={payment.id || `${installmentLabel}-${index}`}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{installmentLabel}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">Rs {amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dueDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{receivedDate}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500 uppercase tracking-tight">
                      {utr}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {payment.status === "Completed" ? (
                        <button
                          onClick={() => downloadReceipt(donorId, payment.id, index)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Download
                        </button>
                      ) : (
                        <button
                          onClick={() => openEditModal(payment)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-10 text-center text-gray-400">
                  No payment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] overflow-hidden border border-slate-200">

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-semibold text-slate-800">Pay Installment</h2>
            </div>

            {/* Form Body */}
            <div className="px-6 space-y-4">

              {/* Amount Field */}
              <div className="grid grid-cols-1 gap-1.5">
                <label className="text-sm font-medium text-slate-700">Amount</label>
                <input
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {/* Date Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Fund Date</label>
                  <input
                    type="date"
                    name="fundDate"
                    value={formData.fundDate}
                    onChange={handleChange}
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Pay From
                </label>

                <select
                  name="payFrom"
                  value={formData.payFrom}
                  onChange={handleChange}
                  className="w-full border border-slate-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select</option>
                  <option value="self">Self</option>
                  <option value="third-party">Third Party</option>
                </select>
              </div>

              {formData.payFrom === "third-party" && (
                <div className="grid grid-cols-1 gap-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Account Name<span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                    placeholder="Enter Account Holder Name"
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              {/* Payment Info Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Payment Mode</label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    className="w-full border border-slate-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <label className="text-sm font-medium text-slate-700">UTR Number</label>
                  <input
                    type="text"
                    name="utrNo"
                    placeholder="Transaction ID"
                    value={formData.utrNo}
                    onChange={handleChange}
                    className="w-ll border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  From RBF Bank Account
                </label>

                <select
                  name="fromRbfBankAccount"
                  value={formData.fromRbfBankAccount}
                  onChange={handleChange}
                  className="w-full border border-slate-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select</option>
                  {activeBanks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.bank_name} - {bank.account_no}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Field */}
              <div className="grid grid-cols-1 gap-1.5">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-slate-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="">Select</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={updateInstallment}
                className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm shadow-blue-200 transition-all active:scale-95"
              >
                Pay Installment
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default DonorPaymentHistory;
