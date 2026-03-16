import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { API } from "../api/BaseURL";
import axios from "axios";

function DonorPaymentHistory() {
  const location = useLocation();
  const donorId = location?.state?.id;
  const donorName = location?.state?.donorName || "Donor";

  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

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
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Recipt</th>
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
                      <button
                        onClick={() => downloadReceipt(donorId, payment.id, index)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Download
                      </button>
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
    </div>
  );
}

export default DonorPaymentHistory;
