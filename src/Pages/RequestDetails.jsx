import axios from "axios";
import { ChevronLeft, Eye, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const RequestDetails = () => {
  const location = useLocation();
  const row = location.state;
  const [assistanceData, setAssistanceData] = useState(null);
  console.log(assistanceData, "assistanceData");
  const [loading, setLoading] = useState(true);

  //   const data = assistanceData?.[row.relation]?.[row.type];
  //   console.log(data, data);

  useEffect(() => {
    if (!row) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const payload = {
          diksharthi_id: row.diksharthi_id,
          relation: row.relation,
          type: row.type,
        };

        const res = await axios.post(
          "http://localhost:5000/api/get-family-assistance",
          payload,
        );

        const data = res.data?.[row.relation]?.[row.type] || {};

        setAssistanceData(data);
      } catch (error) {
        console.log("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [row]);
  console.log(row);

  const labelStyle = "text-gray-500 font-semibold text-sm";
  const valueStyle = "text-gray-800 font-bold text-sm";

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header Actions */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-red-500 font-bold text-lg">Request Details</h1>
          <button className="flex items-center text-gray-600 text-sm mt-1 hover:underline">
            <ChevronLeft size={18} /> Back to Requests
          </button>
        </div>
        {/* <div className="flex gap-3">
          <button className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-1.5 rounded text-sm font-medium hover:bg-yellow-100">
            <MessageSquare size={16} /> Raise Query
          </button>
          <button className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 px-4 py-1.5 rounded text-sm font-medium hover:bg-green-100">
            <Check size={16} /> Approve Request
          </button>
          <button className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 px-4 py-1.5 rounded text-sm font-medium hover:bg-red-100">
            <X size={16} /> Reject Request
          </button>
        </div> */}
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="flex justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/50">
          <span className="text-sm text-gray-600">
            Family Head : <span className="font-bold">{row.head}</span>
          </span>
          <span className="text-sm text-gray-600">
            Karyakarta : <span className="font-bold">KR123 - Suresh Jain</span>{" "}
            +91 9876543210
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
              <h2 className="text-xl font-bold text-gray-800">Ravi Shah</h2>
              <p className="text-sm text-gray-500">
                Diksharthi :{" "}
                <span className="font-semibold text-gray-700">
                  {row.diksharthi}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Relation :{" "}
                <span className="font-semibold text-gray-700">
                  {row.relation}
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-1 border-l pl-8 border-gray-100">
              {/* <p className={labelStyle}>
                Adhaar Card Number :{" "}
                <span className={valueStyle}>8th May 1998</span>
              </p>
              <p className={labelStyle}>
                Pan Card Number : <span className={valueStyle}>25</span>
              </p> */}
              {/* <p className={labelStyle}>
                Education : <span className={valueStyle}>Graduation</span>
              </p>
              <p className={labelStyle}>
                Mobile number : <span className={valueStyle}>99999 99999</span>
              </p> */}
            </div>
          </div>
        </div>
      </div>

      {/* {row.type === "Medical" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-red-500 font-bold mb-4">Medical Assistance</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>Type of Medical Issue :</span>{" "}
                <span className={valueStyle}>Heart Disease</span>
              </div>
              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>Disease Name :</span>{" "}
                <span className={valueStyle}>Coronary artery disease</span>
              </div>
              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>Major Surgery Expected :</span>{" "}
                <span className={valueStyle}>Yes</span>
              </div>
              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>
                  Repeated Medical Assistance Required :
                </span>{" "}
                <span className={valueStyle}>Yes</span>
              </div>
              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>Urgency Level :</span>{" "}
                <span className={valueStyle}>High</span>
              </div>
            </div>

            <div className="space-y-3 border-l pl-8 border-gray-200">
              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>Any Permanent Issue :</span>{" "}
                <span className={valueStyle}>No</span>
              </div>
              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>Treatment Ongoing :</span>{" "}
                <span className={valueStyle}>Yes</span>
              </div>
              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>
                  Any Insurance / Ayushman Card :
                </span>{" "}
                <span className={valueStyle}>No</span>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {row.type === "Medical" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-red-500 font-bold mb-4">Medical Assistance</h3>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>Type of Medical Issue :</span>
                <span className={valueStyle}>{assistanceData?.issueType}</span>
              </div>

              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>Disease Name :</span>
                <span className={valueStyle}>
                  {assistanceData?.diseaseName}
                </span>
              </div>

              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>Major Surgery Expected :</span>
                <span className={valueStyle}>
                  {assistanceData?.majorSurgery}
                </span>
              </div>

              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>
                  Repeated Medical Assistance Required :
                </span>
                <span className={valueStyle}>{assistanceData?.isOngoing}</span>
              </div>

              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>Urgency Level :</span>
                <span className={valueStyle}>{assistanceData?.urgency}</span>
              </div>
            </div>

            <div className="space-y-3 border-l pl-8 border-gray-200">
              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>Any Permanent Issue :</span>
                <span className={valueStyle}>
                  {assistanceData?.isPermanent}
                </span>
              </div>

              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>Treatment Ongoing :</span>
                <span className={valueStyle}>{assistanceData?.isOngoing}</span>
              </div>

              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>
                  Any Insurance / Ayushman Card :
                </span>
                <span className={valueStyle}>
                  {assistanceData?.hasInsurance}
                </span>
              </div>

              <div className="flex justify-between w-3/4">
                <span className={labelStyle}>Total Amount Requested :</span>
                <span className={valueStyle}>
                  {assistanceData?.amountRequired}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-red-500 font-bold mb-4">Previous Assistance</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#ECB0004D]/80">
              <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">
                Family Member
              </th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">
                Family Head
              </th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">
                Date
              </th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">
                Assistance
              </th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">
                Amount
              </th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 border-b">
                Renewal
              </th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 border-b text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="p-3 text-sm text-gray-700">Prakash Shah</td>
              <td className="p-3 text-sm text-gray-700">Ravi Shah</td>
              <td className="p-3 text-sm text-gray-700">05/02/2026</td>
              <td className="p-3 text-sm text-gray-700">Medical</td>
              <td className="p-3 text-sm text-gray-700 font-semibold">
                ₹ 50,000
              </td>
              <td className="p-3 text-sm text-gray-700">₹ 50,000</td>
              <td className="p-3 text-center">
                <button className="text-yellow-600 hover:scale-110 transition-transform">
                  <Eye size={18} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Uploaded Documents */}
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
                <p className="text-xs font-semibold text-gray-700">
                  Ravi_Shah_{doc}
                </p>
                <button className="text-blue-500 text-[10px] flex items-center gap-0.5 hover:underline uppercase font-bold">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Documents */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-red-500 font-bold mb-4">
          Additional Uploaded Documents
        </h3>
        <div className="flex items-center gap-3 border border-gray-200 rounded p-3 w-fit min-w-[280px]">
          <div className="bg-red-50 p-2 rounded">
            <FileText className="text-red-500" size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">
              Ravi_Shah_IncomeCer.pdf
            </p>
            <button className="text-blue-500 text-[10px] flex items-center gap-0.5 hover:underline uppercase font-bold">
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Remark Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-red-500 font-bold mb-2">Remark</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Ravi Shah had a Heart Attack and requires immediate Hospitalization
          and surgery. Family is seeking urgent Financial help for his treatment
        </p>
      </div>
    </div>
  );
};

export default RequestDetails;
