// import React, { useEffect, useState } from "react";

// const InComing = () => {
//     const [showModal, setShowModal] = useState(false);

//     const [incomingData, setIncomingData] = useState({
//         incomingName: "",
//         amount: "",
//         bank: "",
//     });

//     const [incomingList, setIncomingList] = useState([]);

//     // BANK STATES
//     const [bankOptions, setBankOptions] = useState([]);
//     const [loadingBanks, setLoadingBanks] = useState(false);

//     // ==========================================
//     // GET BANK LIST
//     // ==========================================
//     useEffect(() => {
//         getBanks();
//     }, []);

//     const getBanks = async () => {
//         try {
//             setLoadingBanks(true);

//             const response = await fetch(
//                 "https://uat.ratnakukshi.org/api/banks"
//             );

//             const data = await response.json();

//             console.log("Bank Data", data);

//             setBankOptions(data || []);
//         } catch (error) {
//             console.log("Bank Fetch Error", error);
//         } finally {
//             setLoadingBanks(false);
//         }
//     };

//     // ==========================================
//     // HANDLE INPUT
//     // ==========================================
//     const handleChange = (e) => {
//         const { name, value } = e.target;

//         setIncomingData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     // ==========================================
//     // ADD INCOMING
//     // ==========================================
//     const handleAddIncoming = () => {
//         if (
//             !incomingData.incomingName ||
//             !incomingData.amount ||
//             !incomingData.bank
//         ) {
//             alert("Please fill all fields");
//             return;
//         }

//         const newIncoming = {
//             id: Date.now(),
//             ...incomingData,
//         };

//         setIncomingList((prev) => [...prev, newIncoming]);

//         // RESET FORM
//         setIncomingData({
//             incomingName: "",
//             amount: "",
//             bank: "",
//         });

//         setShowModal(false);
//     };

//     return (
//         <div className="min-h-screen bg-[#F6F3EE] p-6">
//             {/* HEADER */}
//             <div className="mb-6 flex items-center justify-between">
//                 <h1 className="text-2xl font-bold text-gray-800">
//                     Incoming Management
//                 </h1>

//                 <button
//                     onClick={() => setShowModal(true)}
//                     className="rounded-lg bg-black px-5 py-2 text-white transition hover:bg-gray-800"
//                 >
//                     + Add Incoming
//                 </button>
//             </div>

//             {/* TABLE */}
//             <div className="overflow-x-auto rounded-xl bg-white shadow-md">
//                 <table className="min-w-full">
//                     <thead className="bg-gray-100">
//                         <tr>
//                             <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
//                                 Sr No
//                             </th>

//                             <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
//                                 Incoming Name
//                             </th>

//                             <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
//                                 Amount
//                             </th>

//                             <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
//                                 Bank
//                             </th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {incomingList.length > 0 ? (
//                             incomingList.map((item, index) => (
//                                 <tr
//                                     key={item.id}
//                                     className="border-b hover:bg-gray-50"
//                                 >
//                                     <td className="px-6 py-4">
//                                         {index + 1}
//                                     </td>

//                                     <td className="px-6 py-4">
//                                         {item.incomingName}
//                                     </td>

//                                     <td className="px-6 py-4">
//                                         ₹ {item.amount}
//                                     </td>

//                                     <td className="px-6 py-4">
//                                         {item.bank}
//                                     </td>
//                                 </tr>
//                             ))
//                         ) : (
//                             <tr>
//                                 <td
//                                     colSpan="4"
//                                     className="py-10 text-center text-gray-500"
//                                 >
//                                     No Incoming Records Found
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* MODAL */}
//             {showModal && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//                     <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
//                         {/* TITLE */}
//                         <div className="mb-5 flex items-center justify-between">
//                             <h2 className="text-xl font-bold">
//                                 Add Incoming
//                             </h2>

//                             <button
//                                 onClick={() => setShowModal(false)}
//                                 className="text-xl text-gray-500 hover:text-black"
//                             >
//                                 ×
//                             </button>
//                         </div>

//                         {/* FORM */}
//                         <div className="space-y-4">
//                             {/* INCOMING NAME */}
//                             <div>
//                                 <label className="mb-1 block text-sm font-medium text-gray-700">
//                                     Incoming Name
//                                 </label>

//                                 <input
//                                     type="text"
//                                     name="incomingName"
//                                     value={incomingData.incomingName}
//                                     onChange={handleChange}
//                                     placeholder="Enter incoming name"
//                                     className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
//                                 />
//                             </div>

//                             {/* AMOUNT */}
//                             <div>
//                                 <label className="mb-1 block text-sm font-medium text-gray-700">
//                                     Amount
//                                 </label>

//                                 <input
//                                     type="number"
//                                     name="amount"
//                                     value={incomingData.amount}
//                                     onChange={handleChange}
//                                     placeholder="Enter amount"
//                                     className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
//                                 />
//                             </div>

//                             {/* BANK DROPDOWN */}
//                             <div>
//                                 <label className="mb-1 block text-sm font-medium text-gray-700">
//                                     Select Bank
//                                 </label>

//                                 <select
//                                     name="bank"
//                                     value={incomingData.bank}
//                                     onChange={handleChange}
//                                     className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
//                                 >
//                                     <option value="">
//                                         {loadingBanks
//                                             ? "Loading Banks..."
//                                             : "Select Bank"}
//                                     </option>

//                                     {bankOptions.map((bank) => (
//                                         <option
//                                             key={bank.id}
//                                             value={bank.bank_name}
//                                         >
//                                             {bank.bank_name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* BUTTON */}
//                             <button
//                                 onClick={handleAddIncoming}
//                                 className="mt-3 w-full rounded-lg bg-black py-3 text-white transition hover:bg-gray-800"
//                             >
//                                 Save Incoming
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default InComing;
import { useEffect, useState } from "react";

const InComing = () => {
  const [showModal, setShowModal] = useState(false);
const [selectedBankData, setSelectedBankData] = useState(null);
 const [incomingData, setIncomingData] = useState({
  incomingName: "",
  amount: "",
  bank: "",
   bank_id: "",
  Payee_Name: "",
});

  const [incomingList, setIncomingList] = useState([]);

  // BANK STATES
  const [bankOptions, setBankOptions] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  // ==========================================
  // PAGE LOAD
  // ==========================================
  useEffect(() => {
    getBanks();
    getIncoming();
  }, []);

  // ==========================================
  // GET BANKS
  // ==========================================
  const getBanks = async () => {
    try {
      setLoadingBanks(true);

      const response = await fetch("https://uat.ratnakukshi.org/api/demat/credit");

      const data = await response.json();

      console.log("Bank Data", data);

       if (data.success) {

      setBankOptions(data.data || []);

    }
    } catch (error) {
      console.log("Bank Fetch Error", error);
    } finally {
      setLoadingBanks(false);
    }
  };

  // ==========================================
  // GET INCOMING
  // ==========================================
  const getIncoming = async () => {
    try {
      const response = await fetch(
        "https://uat.ratnakukshi.org/api/InComming/get-incoming",
      );

      const data = await response.json();

      console.log("Incoming Data", data);

      if (data.success) {
        setIncomingList(data.data);
      }
    } catch (error) {
      console.log("Get Incoming Error", error);
    }
  };

  // ==========================================
  // HANDLE INPUT
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setIncomingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // ADD INCOMING
  // ==========================================
  const handleAddIncoming = async () => {
    try {
      if (
        !incomingData.incomingName ||
        !incomingData.amount ||
        !incomingData.bank
      ) {
        alert("Please fill all fields");
        return;
      }

    const payload = {
  incoming_name: incomingData.incomingName,
  amount: incomingData.amount,

  payee_name: incomingData.Payee_Name,

  bank_name: selectedBankData.bank_name,
  bank_id: selectedBankData.id,

  account_no: selectedBankData.account_no,
  branch_name: selectedBankData.branch_name,
  ifsc_code: selectedBankData.ifsc_code,
  account_holder_name:
    selectedBankData.account_holder_name,
};

      const response = await fetch(
        "https://uat.ratnakukshi.org/api/InComming/add-incoming",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      console.log("Add Incoming Response", data);

      if (data.success) {
        alert("Incoming Added Successfully");

        // REFRESH TABLE
        getIncoming();
setSelectedBankData(null);
        // RESET FORM
        setIncomingData({
  incomingName: "",
  amount: "",
  bank: "",
  bank_id: "",
});
        // CLOSE MODAL
        setShowModal(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log("Add Incoming Error", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Incoming Management
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-black px-5 py-2 text-white transition hover:bg-gray-800"
        >
          + Add Incoming
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-md">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Sr No
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Payee Name
              </th>
 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
               Description
              </th>
              

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Amount
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Bank
              </th>
            </tr>
          </thead>

          <tbody>
            {incomingList.length > 0 ? (
              incomingList.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{index + 1}</td>
 <td className="px-6 py-4">{item.payee_name}</td>
                  <td className="px-6 py-4">{item.incoming_name}</td>

                  <td className="px-6 py-4">₹ {item.amount}</td>

                  <td className="px-6 py-4">
  <div className="space-y-1">
    <p className="font-semibold text-gray-800">
      {item.bank_name}
    </p>

    <p className="text-sm text-gray-500">
      Acc No: {item.account_no || "-"}
    </p>

    <p className="text-sm text-gray-500">
      IFSC: {item.ifsc_code || "-"}
    </p>

    
  </div>
</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-10 text-center text-gray-500">
                  No Incoming Records Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {/* TITLE */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Incoming</h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-xl text-gray-500 hover:text-black"
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <div className="space-y-2">
              {/* NAME */}

              <div>
                <label className=" block text-sm font-medium text-gray-700">
                  Payee Name
                </label>

                <input
                  type="text"
                  name="Payee_Name"
                  value={incomingData.Payee_Name}
                  onChange={handleChange}
                  placeholder="Enter incoming name"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
                />
              </div>
              

              {/* AMOUNT */}
              <div>
                <label className=" block text-sm font-medium text-gray-700">
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  value={incomingData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className=" block text-sm font-medium text-gray-700">
                   Description
                </label>

                <input
                  type="text"
                  name="incomingName"
                  value={incomingData.incomingName}
                  onChange={handleChange}
                  placeholder="Enter incoming name"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
                />
              </div>

              {/* BANK */}
             <div>
  <label className=" block text-sm font-medium text-gray-700">
    Select Bank
  </label>

  <select
    value={incomingData.bank_id}
    onChange={(e) => {

      const selectedBank = bankOptions.find(
        (bank) => bank.id == e.target.value
      );

      setIncomingData({
        ...incomingData,
        bank: selectedBank.bank_name,
        bank_id: selectedBank.id,
      });
      setSelectedBankData(selectedBank);

    }}
    className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
  >
    <option value="">
      {loadingBanks ? "Loading Banks..." : "Select Bank"}
    </option>

    {bankOptions.map((bank) => (
      <option key={bank.id} value={bank.id}>
        {bank.bank_name} {bank.account_no} {bank.branch_name}
      </option>
    ))}
  </select>
</div>

 {selectedBankData && (
            <div className="rounded-xl border border-gray-200 bg-gray-100 p-4">

              <h3 className="mb-3 text-lg font-semibold text-blue-600">
                Selected Bank Details
              </h3>

              <div className="space-y-2 text-sm">

                <div className="flex justify-between gap-3">
                  <span className="font-medium text-gray-600">
                    Bank Name
                  </span>

                  <span className="text-right font-semibold">
                    {selectedBankData.bank_name}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="font-medium text-gray-600">
                    Account Holder
                  </span>

                  <span className="text-right font-semibold">
                    {selectedBankData.account_holder_name}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="font-medium text-gray-600">
                    Account Number
                  </span>

                  <span className="text-right font-semibold">
                    {selectedBankData.account_no}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="font-medium text-gray-600">
                    Branch
                  </span>

                  <span className="text-right font-semibold">
                    {selectedBankData.branch_name}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="font-medium text-gray-600">
                    IFSC Code
                  </span>

                  <span className="text-right font-semibold">
                    {selectedBankData.ifsc_code}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="font-medium text-gray-600">
                    Account Type
                  </span>

                  <span className="text-right font-semibold capitalize">
                    {selectedBankData.account_type}
                  </span>
                </div>

                <div className="flex justify-between gap-3  pt-2">
                  <span className="font-medium text-gray-600">
                    Current Balance
                  </span>

                  <span
                    className={`text-right text-lg font-bold ${
                      Number(selectedBankData.balance) < 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    ₹{selectedBankData.balance}
                  </span>
                </div>

                     {incomingData.amount && (
        <div className="flex justify-between gap-3  pt-3">
          <span className="font-medium text-gray-700">
            Balance After Transaction
          </span>

          <span
            className={`text-right text-lg font-bold ${
              Number(selectedBankData.balance) +
                Number(incomingData.amount) <
              0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            ₹
            {(
              Number(selectedBankData.balance) +
              Number(incomingData.amount)
            ).toFixed(2)}
          </span>
        </div>
      )}

              </div>

            </div>
          )}
              {/* BUTTON */}
              <button
                onClick={handleAddIncoming}
                className="mt-1 w-full rounded-lg bg-black py-3 text-white transition hover:bg-gray-800"
              >
                Save Incoming
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InComing;
