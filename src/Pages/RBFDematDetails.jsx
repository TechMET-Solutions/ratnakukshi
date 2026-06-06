// import { Edit, Plus, Search, Trash2 } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import { API } from "../api/BaseURL";
// import axios from "axios";

// const normalizeStatusForForm = (value) => {
//     if (value === 1 || value === "1" || value === true) return "active";
//     if (value === 0 || value === "0" || value === false) return "inactive";

//     const normalized = String(value || "").trim().toLowerCase();

//     if (normalized === "active") return "active";
//     if (normalized === "inactive") return "inactive";

//     return "active";
// };

// const normalizeStatusForApi = (value) =>
//     normalizeStatusForForm(value) === "active" ? 1 : 0;

// const getStatusBadge = (value) => {
//     const status = normalizeStatusForForm(value);

//     return {
//         label: status === "active" ? "Active" : "Inactive",
//         className:
//             status === "active"
//                 ? "bg-green-100 text-green-700"
//                 : "bg-gray-100 text-gray-700",
//     };
// };

// const EMPTY_FORM = {
//     broker_name: "",
//     account_holder_name: "",
//     client_id: "",
//     status: "active",
// };

// const DeleteModal = ({ isOpen, onClose, onConfirm, brokerName, loading }) => {
//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//             <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
//                 <h2 className="mb-3 text-xl font-bold text-gray-800">
//                     Delete Demat Account
//                 </h2>

//                 <p className="text-sm text-gray-600">
//                     Are you sure you want to delete{" "}
//                     <strong>{brokerName || "this account"}</strong>?
//                 </p>

//                 <div className="mt-6 flex justify-end gap-3">
//                     <button
//                         onClick={onClose}
//                         className="rounded border px-4 py-2 text-sm"
//                         disabled={loading}
//                     >
//                         Cancel
//                     </button>

//                     <button
//                         onClick={onConfirm}
//                         className="rounded bg-red-500 px-4 py-2 text-sm text-white"
//                         disabled={loading}
//                     >
//                         {loading ? "Deleting..." : "Delete"}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const DematModal = ({ isOpen, onClose, onSave, initialData, loading }) => {
//     const [formData, setFormData] = useState(EMPTY_FORM);

//     useEffect(() => {
//         if (!isOpen) return;

//         if (initialData) {
//             setFormData({
//                 broker_name: initialData.broker_name || "",
//                 account_holder_name: initialData.account_holder_name || "",
//                 client_id: initialData.client_id || "",
//                 status: normalizeStatusForForm(initialData.status),
//             });
//             return;
//         }

//         setFormData(EMPTY_FORM);
//     }, [isOpen, initialData]);

//     if (!isOpen) return null;

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const saved = await onSave(formData);
//         if (saved) onClose();
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//             <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
//                 <div className="border-b p-6">
//                     <h2 className="text-xl font-bold text-gray-800">
//                         {initialData ? "Edit Demat Account" : "Add Demat Account"}
//                     </h2>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-4 p-6">
//                     <input
//                         required
//                         placeholder="Broker Name"
//                         value={formData.broker_name}
//                         onChange={(e) =>
//                             setFormData({ ...formData, broker_name: e.target.value })
//                         }
//                         className="w-full rounded-md border px-3 py-2"
//                     />

//                     <input
//                         required
//                         placeholder="Account Holder Name"
//                         value={formData.account_holder_name}
//                         onChange={(e) =>
//                             setFormData({
//                                 ...formData,
//                                 account_holder_name: e.target.value,
//                             })
//                         }
//                         className="w-full rounded-md border px-3 py-2"
//                     />

//                     {/* <input
//                         placeholder="DP ID"
//                         value={formData.dp_id}
//                         onChange={(e) =>
//                             setFormData({ ...formData, dp_id: e.target.value })
//                         }
//                         className="w-full rounded-md border px-3 py-2"
//                     /> */}

//                     <input
//                         placeholder="Client ID"
//                         value={formData.client_id}
//                         onChange={(e) =>
//                             setFormData({ ...formData, client_id: e.target.value })
//                         }
//                         className="w-full rounded-md border px-3 py-2"
//                     />

//                     {/* <input
//                         required
//                         placeholder="Demat Number"
//                         value={formData.demat_no}
//                         onChange={(e) =>
//                             setFormData({ ...formData, demat_no: e.target.value })
//                         }
//                         className="w-full rounded-md border px-3 py-2"
//                     /> */}

//                     <select
//                         value={formData.status}
//                         onChange={(e) =>
//                             setFormData({ ...formData, status: e.target.value })
//                         }
//                         className="w-full rounded-md border px-3 py-2"
//                     >
//                         <option value="active">Active</option>
//                         <option value="inactive">Inactive</option>
//                     </select>

//                     <div className="flex justify-end gap-3 pt-4">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="rounded px-4 py-2 text-sm"
//                         >
//                             Cancel
//                         </button>

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="rounded bg-[#d94452] px-4 py-2 text-sm text-white"
//                         >
//                             {loading ? "Saving..." : "Save"}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>

// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
// //   <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
// //     <div className="border-b p-6">
// //       <h2 className="text-xl font-bold text-gray-800">
// //         {initialData ? "Edit Demat Account" : "Add Demat Account"}
// //       </h2>
// //     </div>

// //     <form onSubmit={handleSubmit} className="space-y-4 p-6">
// //       <input
// //         required
// //         placeholder="Broker Name"
// //         value={formData.broker_name}
// //         onChange={(e) =>
// //           setFormData({ ...formData, broker_name: e.target.value })
// //         }
// //         className="w-full rounded-md border px-3 py-2"
// //       />

// //       <input
// //         required
// //         placeholder="Account Holder Name"
// //         value={formData.account_holder_name}
// //         onChange={(e) =>
// //           setFormData({
// //             ...formData,
// //             account_holder_name: e.target.value,
// //           })
// //         }
// //         className="w-full rounded-md border px-3 py-2"
// //       />

// //       <input
// //         placeholder="Client ID"
// //         value={formData.client_id}
// //         onChange={(e) =>
// //           setFormData({ ...formData, client_id: e.target.value })
// //         }
// //         className="w-full rounded-md border px-3 py-2"
// //       />

// //       {/* FD Create Checkbox */}
// //       <div>
// //         <label className="flex items-center gap-2">
// //           <input
// //             type="checkbox"
// //             checked={formData.is_fd}
// //             onChange={(e) =>
// //               setFormData({
// //                 ...formData,
// //                 is_fd: e.target.checked,
// //               })
// //             }
// //           />
// //           <span className="text-sm font-medium">FD Create</span>
// //         </label>
// //       </div>

// //       {/* Show FD Fields */}
// //       {formData.is_fd && (
// //         <div className="space-y-4 rounded-md border p-4">
// //           <input
// //             required
// //             placeholder="FD Account Number"
// //             value={formData.fd_account_number}
// //             onChange={(e) =>
// //               setFormData({
// //                 ...formData,
// //                 fd_account_number: e.target.value,
// //               })
// //             }
// //             className="w-full rounded-md border px-3 py-2"
// //           />

// //           <input
// //             required
// //             type="number"
// //             placeholder="FD Amount"
// //             value={formData.fd_amount}
// //             onChange={(e) =>
// //               setFormData({
// //                 ...formData,
// //                 fd_amount: e.target.value,
// //               })
// //             }
// //             className="w-full rounded-md border px-3 py-2"
// //           />

// //           <input
// //             required
// //             placeholder="Bank Name"
// //             value={formData.fd_bank_name}
// //             onChange={(e) =>
// //               setFormData({
// //                 ...formData,
// //                 fd_bank_name: e.target.value,
// //               })
// //             }
// //             className="w-full rounded-md border px-3 py-2"
// //           />
// //         </div>
// //       )}

// //       <select
// //         value={formData.status}
// //         onChange={(e) =>
// //           setFormData({ ...formData, status: e.target.value })
// //         }
// //         className="w-full rounded-md border px-3 py-2"
// //       >
// //         <option value="active">Active</option>
// //         <option value="inactive">Inactive</option>
// //       </select>

// //       <div className="flex justify-end gap-3 pt-4">
// //         <button
// //           type="button"
// //           onClick={onClose}
// //           className="rounded px-4 py-2 text-sm"
// //         >
// //           Cancel
// //         </button>

// //         <button
// //           type="submit"
// //           disabled={loading}
// //           className="rounded bg-[#d94452] px-4 py-2 text-sm text-white"
// //         >
// //           {loading ? "Saving..." : "Save"}
// //         </button>
// //       </div>
// //     </form>
// //   </div>
// // </div>
//     );
// };

// function RBFDematDetails() {
//     const [accounts, setAccounts] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedAccount, setSelectedAccount] = useState(null);

//     const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//      const [isAddModalOpenFD, setIsAddModalOpenFD] = useState(false);
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [fdData, setFdData] = useState({
//     fdAccountNumber: "",
//     fdAmount: "",
//     bankName: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFdData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSaveFD = async () => {
//   try {
//     const response = await axios.post(
//       `${API}/api/banks/createFd`,
//       fdData
//     );

//     if (response.data.success) {
//       alert("FD Added Successfully");

//       setIsAddModalOpenFD(false);

//       setFdData({
//         fdAccountNumber: "",
//         fdAmount: "",
//         bankName: ""
//       });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };
//     const [isLoading, setIsLoading] = useState(false);
//     const [isSaving, setIsSaving] = useState(false);
//     const [isDeleting, setIsDeleting] = useState(false);

//     const fetchAccounts = async () => {
//         try {
//             setIsLoading(true);

//             const res = await fetch(`${API}/api/demat`);
//             const data = await res.json();

//             if (Array.isArray(data)) setAccounts(data);
//             else if (Array.isArray(data?.data)) setAccounts(data.data);
//             else setAccounts([]);
//         } catch (error) {
//             console.error(error);
//             setAccounts([]);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchAccounts();
//     }, []);

//     const handleSave = async (formData) => {
//         try {
//             setIsSaving(true);

//             const payload = {
//                 broker_name: formData.broker_name.trim(),
//                 account_holder_name: formData.account_holder_name.trim(),
//                 client_id: formData.client_id.trim(),
//                 status: normalizeStatusForApi(formData.status),
//             };

//             const endpoint = selectedAccount
//                 ? `${API}/api/demat/${selectedAccount.id}`
//                 : `${API}/api/demat/create`;

//             const method = selectedAccount ? "PUT" : "POST";

//             const res = await fetch(endpoint, {
//                 method,
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload),
//             });

//             if (!res.ok) throw new Error("Failed to save");

//             await fetchAccounts();
//             return true;
//         } catch (error) {
//             alert(error.message);
//             return false;
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     const handleDelete = async () => {
//         try {
//             setIsDeleting(true);

//             await fetch(`${API}/api/demat/${selectedAccount.id}`, {
//                 method: "DELETE",
//             });

//             await fetchAccounts();
//             setIsDeleteModalOpen(false);
//             setSelectedAccount(null);
//         } finally {
//             setIsDeleting(false);
//         }
//     };

//     const filteredAccounts = useMemo(() => {
//         const q = searchTerm.toLowerCase();

//         return accounts.filter((item) =>
//             `${item.broker_name} ${item.account_holder_name} ${item.demat_no}`
//                 .toLowerCase()
//                 .includes(q)
//         );
//     }, [accounts, searchTerm]);

//     return (
//         <div className="min-h-screen bg-gray-50 p-8">
//             <div className="mb-6 flex items-center justify-between">
//                 <h1 className="text-2xl font-bold text-slate-700">
//                     Demat Account Details
//                 </h1>
//                 <div className="flex gap-5">
//                   <button
//                     onClick={() => {
//                         setSelectedAccount(null);
//                         setIsAddModalOpen(true);
//                     }}
//                     className="flex items-center gap-2 rounded-md bg-[#d94452] px-4 py-2 text-sm text-white"
//                 >
//                     <Plus size={18} /> Add Demat
//                 </button>
//                   <button
//                     onClick={() => {
//                         setSelectedAccount(null);
//                         setIsAddModalOpenFD(true);
//                     }}
//                     className="flex items-center gap-2 rounded-md bg-[#d94452] px-4 py-2 text-sm text-white"
//                 >
//                     <Plus size={18} /> Add FD
//                 </button>
// </div>
               
//             </div>

//             <div className="rounded-lg bg-white shadow">
//                 <div className="flex justify-between border-b p-4">
//                     <div className="relative w-80">
//                         <Search className="absolute left-3 top-3 text-gray-400" size={16} />
//                         <input
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             placeholder="Search..."
//                             className="w-full rounded-md border py-2 pl-9 pr-3"
//                         />
//                     </div>

//                     <p className="text-sm text-gray-500">
//                         Showing {filteredAccounts.length} result(s)
//                     </p>
//                 </div>

//                 <table className="w-full text-left">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="px-6 py-4">Broker Name</th>
//                             <th className="px-6 py-4">Holder Name</th>
//                             <th className="px-6 py-4">Client ID</th>
//                             <th className="px-6 py-4">Status</th>
//                             <th className="px-6 py-4 text-right">Actions</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {filteredAccounts.map((item) => {
//                             const badge = getStatusBadge(item.status);

//                             return (
//                                 <tr key={item.id} className="border-t">
//                                     <td className="px-6 py-4">{item.broker_name}</td>
//                                     <td className="px-6 py-4">{item.account_holder_name}</td>
//                                     <td className="px-6 py-4">{item.client_id}</td>
//                                     <td className="px-6 py-4">
//                                         <span
//                                             className={`rounded-full px-2 py-1 text-xs ${badge.className}`}
//                                         >
//                                             {badge.label}
//                                         </span>
//                                     </td>

//                                     <td className="px-6 py-4">
//                                         <div className="flex justify-end gap-3">
//                                             <button
//                                                 onClick={() => {
//                                                     setSelectedAccount(item);
//                                                     setIsEditModalOpen(true);
//                                                 }}
//                                                 className="text-blue-500"
//                                             >
//                                                 <Edit size={18} />
//                                             </button>

//                                             <button
//                                                 onClick={() => {
//                                                     setSelectedAccount(item);
//                                                     setIsDeleteModalOpen(true);
//                                                 }}
//                                                 className="text-red-500"
//                                             >
//                                                 <Trash2 size={18} />
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                     </tbody>
//                 </table>
//             </div>

//             <DematModal
//                 isOpen={isAddModalOpen || isEditModalOpen}
//                 initialData={selectedAccount}
//                 onClose={() => {
//                     setIsAddModalOpen(false);
//                     setIsEditModalOpen(false);
//                     setSelectedAccount(null);
//                 }}
//                 onSave={handleSave}
//                 loading={isSaving}
//             />
//  {isAddModalOpenFD && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            
//             {/* Header */}
//             <div className="flex items-center justify-between border-b p-4">
//               <h2 className="text-xl font-semibold">
//                 Add FD Details
//               </h2>

//               <button
//                 onClick={() => setIsAddModalOpenFD(false)}
//                 className="text-2xl text-gray-500"
//               >
//                 ×
//               </button>
//             </div>

//             {/* Body */}
//             <div className="space-y-4 p-4">

//               {/* FD Account Number */}
//               <div>
//                 <label className="mb-1 block text-sm font-medium">
//                   FD Account Number
//                 </label>

//                 <input
//                   type="text"
//                   name="fdAccountNumber"
//                   value={fdData.fdAccountNumber}
//                   onChange={handleChange}
//                   placeholder="Enter FD Account Number"
//                   className="w-full rounded border p-2 outline-none focus:border-blue-500"
//                 />
//               </div>

//               {/* FD Amount */}
//               <div>
//                 <label className="mb-1 block text-sm font-medium">
//                   FD Amount
//                 </label>

//                 <input
//                   type="number"
//                   name="fdAmount"
//                   value={fdData.fdAmount}
//                   onChange={handleChange}
//                   placeholder="Enter FD Amount"
//                   className="w-full rounded border p-2 outline-none focus:border-blue-500"
//                 />
//               </div>

//               {/* Bank Name */}
//               <div>
//                 <label className="mb-1 block text-sm font-medium">
//                   Bank Name
//                 </label>

//                 <input
//                   type="text"
//                   name="bankName"
//                   value={fdData.bankName}
//                   onChange={handleChange}
//                   placeholder="Enter Bank Name"
//                   className="w-full rounded border p-2 outline-none focus:border-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="flex justify-end gap-3  p-4">
//               <button
//                 onClick={() => setIsAddModalOpenFD(false)}
//                 className="  px-3 py-2"
//               >
//                 Cancel
//               </button>

//               <button
//                                 className="rounded bg-red-600 px-3 py-2 text-white"
//                                 onClick={()=>handleSaveFD()}
//               >
//                 Save
//               </button>
//             </div>

//           </div>
//         </div>
//       )}
//             <DeleteModal
//                 isOpen={isDeleteModalOpen}
//                 brokerName={selectedAccount?.broker_name}
//                 onClose={() => setIsDeleteModalOpen(false)}
//                 onConfirm={handleDelete}
//                 loading={isDeleting}
//             />
//         </div>
//     );
// }

// export default RBFDematDetails;


import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { API } from "../api/BaseURL";
import axios from "axios";

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
    broker_name: "",
    account_holder_name: "",
    client_id: "",
     dp_id: "",
    status: "active",
};

const DeleteModal = ({ isOpen, onClose, onConfirm, brokerName, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-3 text-xl font-bold text-gray-800">
                    Delete Demat Account
                </h2>

                <p className="text-sm text-gray-600">
                    Are you sure you want to delete{" "}
                    <strong>{brokerName || "this account"}</strong>?
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded border px-4 py-2 text-sm"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
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

const DeleteFDModal = ({ isOpen, onClose, onConfirm, fdAccountNumber, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-3 text-xl font-bold text-gray-800">
                    Delete FD Record
                </h2>

                <p className="text-sm text-gray-600">
                    Are you sure you want to delete FD for account{" "}
                    <strong>{fdAccountNumber || "this account"}</strong>?
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded border px-4 py-2 text-sm"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
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

const DematModal = ({ isOpen, onClose, onSave, initialData, loading }) => {
    const [formData, setFormData] = useState(EMPTY_FORM);

    useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            setFormData({
                broker_name: initialData.broker_name || "",
                account_holder_name: initialData.account_holder_name || "",
                dp_id: initialData.dp_id || "",
                client_id: initialData.client_id || "",
                status: normalizeStatusForForm(initialData.status),
            });
            return;
        }

        setFormData(EMPTY_FORM);
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
       debugger
    e.preventDefault();

    console.log(formData); // Check dp_id is present

    const saved = await onSave(formData);
    if (saved) onClose();
};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
                <div className="border-b p-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? "Edit Demat Account" : "Add Demat Account"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <input
                        required
                        placeholder="Broker Name"
                        value={formData.broker_name}
                        onChange={(e) =>
                            setFormData({ ...formData, broker_name: e.target.value })
                        }
                        className="w-full rounded-md border px-3 py-2"
                    />

                    <input
                        required
                        placeholder="Account Holder Name"
                        value={formData.account_holder_name}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                account_holder_name: e.target.value,
                            })
                        }
                        className="w-full rounded-md border px-3 py-2"
                    />

                    <input
                        placeholder="Client ID"
                        value={formData.client_id}
                        onChange={(e) =>
                            setFormData({ ...formData, client_id: e.target.value })
                        }
                        className="w-full rounded-md border px-3 py-2"
                    />
<input
    placeholder="DP ID"
    value={formData.dp_id}
    onChange={(e) =>
        setFormData({ ...formData, dp_id: e.target.value })
    }
    className="w-full rounded-md border px-3 py-2"
/>
                    <select
                        value={formData.status}
                        onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full rounded-md border px-3 py-2"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded px-4 py-2 text-sm"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded bg-[#d94452] px-4 py-2 text-sm text-white"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

function RBFDematDetails() {
    const [accounts, setAccounts] = useState([]);
    const [fdRecords, setFdRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [fdSearchTerm, setFdSearchTerm] = useState("");
    const [selectedAccount, setSelectedAccount] = useState(null);
    console.log("Selected Account:", selectedAccount);
    const [selectedFD, setSelectedFD] = useState(null);
const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
// const [selectedFD, setSelectedFD] = useState(null);
const [isScriptModalOpen, setIsScriptModalOpen] =
    useState(false);

const [isSellModalOpen, setIsSellModalOpen] =
    useState(false);

 const [scriptData, setScriptData] = useState([
    {
        scriptName: "",
        expiryDate: "",
        buyPrice: "",
        qty: "",
        total: "",
    },
]);
console.log(scriptData ,"scriptData");
const [sellData, setSellData] = useState({
    sellPrice: "",
    qty: "",
    total: "",
});

    
const [redeemData, setRedeemData] = useState({
    amount: "",
    type: "redeem", // redeem OR add
});

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddModalOpenFD, setIsAddModalOpenFD] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleteFDModalOpen, setIsDeleteFDModalOpen] = useState(false);
     const [banks, setBanks] = useState([]);
const addNewScript = () => {

    setScriptData([
        ...scriptData,
        {
            scriptName: "",
            expiryDate: "",
            buyPrice: "",
            qty: "",
            total: "",
        },
    ]);

};

// const saveScripts = async () => {

//     try {

//         const payload = {
//             demat_account_id: selectedAccount?.id,
//             scripts: scriptData,
//         };

//         console.log(payload);

//         const response = await axios.post(
//             `${API}/api/demat-script/create`,
//             payload
//         );

//         console.log(response.data);

//         // SUCCESS
//         if (response.data.success) {

//             // CLOSE MODAL
//             setIsScriptModalOpen(false);

//             // RESET FORM
//             setScriptData([
//                 {
//                     scriptName: "",
//                     expiryDate: "",
//                     buyPrice: "",
//                     qty: "",
//                     total: "",
//                 },
//             ]);

//             // RESET SELECTED ACCOUNT (OPTIONAL)
//             setSelectedAccount(null);

//         }

//     } catch (error) {

//         console.log(error);

//     }

// };
const saveScripts = async () => {

    try {

        // FORMAT DATA
        const formattedScripts = scriptData.map((item) => ({

            scriptName: item.scriptName,
            INEINumber: item.INEINumber, 
            // FIX DATE
            expiryDate: item.expiryDate
                ? item.expiryDate.split("T")[0]
                : "",

            buyPrice: parseFloat(item.buyPrice || 0),

            qty: parseInt(item.qty || 0),

            total: parseFloat(item.total || 0),

        }));

        const payload = {

            demat_account_id: selectedAccount?.id,

            scripts: formattedScripts,

        };

        console.log("PAYLOAD =>", payload);

        const response = await axios.post(
            `${API}/api/demat-script/create`,
            payload
        );

        console.log(response.data);

        if (response.data.success) {

            // CLOSE MODAL
            setIsScriptModalOpen(false);

            // RESET FORM
            setScriptData([
                {
                    scriptName: "",
                    expiryDate: "",
                    buyPrice: "",
                    qty: "",
                    total: "",
                },
            ]);

            // RESET ACCOUNT
            setSelectedAccount(null);

        }

    } catch (error) {

        console.log(error);

    }

    };
    
const getScripts = async (dematId) => {

    try {

        const response = await axios.get(
            `${API}/api/demat-script/get/${dematId}`
        );

        console.log(response.data);

        if (
            response.data.success &&
            response.data.data.length > 0
        ) {

            const formattedData =
                response.data.data.map((item) => ({
                    scriptName: item.script_name || "",
                    expiryDate: item.expiry_date || "",
                    buyPrice: item.buy_price || "",
                    qty: item.qty || "",
                    total: item.total || "",
                    INEINumber: item.INEI_number || "",
                }));

            setScriptData(formattedData);

        } else {

            // EMPTY DATA
            setScriptData([
                {
                    scriptName: "",
                    expiryDate: "",
                    buyPrice: "",
                    qty: "",
                    total: "",
                },
            ]);

        }

    } catch (error) {

        console.log(error);

    }

};
const removeScript = (index) => {

    const updatedData =
        scriptData.filter(
            (_, i) => i !== index
        );

    setScriptData(updatedData);

};

const handleSellScripts = async () => {

    try {

        const sellPayload = {
            demat_account_id: selectedAccount.id,
            scripts: scriptData.filter(
                (item) => item.sellQty > 0
            ),
        };

        const response = await axios.post(
            `${API}/api/demat-script/sell`,
            sellPayload
        );

        console.log(response.data);

        if (response.data.success) {

            alert("Scripts sold successfully");

            setIsSellModalOpen(false);

        }

    } catch (error) {

        console.log(error);

    }

};
    const getBanks = async () => {

        try {

            const response = await axios.get(
                "https://uat.ratnakukshi.org/api/banks"
            );

            if (response?.data) {

                // only active banks
                const activeBanks = response.data.filter(
                    (item) => item.status === 1
                );

                setBanks(activeBanks);

            }

        } catch (error) {

            console.log("Bank API Error", error);

        }

    };
 
// const handleSaveRedeem = async () => {

//     try {

//         const response = await axios.put(
//             `${API}/api/banks/redeemFd/${selectedFD.id}`,
//             {
//                 amount: redeemData.amount,
//             }
//         );

//         if (response.data.success) {

//             alert("FD Redeemed Successfully");

//             fetchFdRecords();

//             setIsRedeemModalOpen(false);

//             setRedeemData({
//                 amount: "",
//                 type: "redeem",
//             });

//         }

//     } catch (error) {

//         console.log(error);

//         alert(
//             error.response?.data?.message ||
//             "Something went wrong"
//         );

//     }

// };
const handleSaveRedeem = async () => {

    try {

        const fdAmount = parseFloat(selectedFD?.fdAmount || 0);

        const enteredAmount = parseFloat(
            redeemData.amount || 0
        );

        // VALIDATION
        if (enteredAmount < fdAmount) {

            alert(
                `Amount should be greater than or equal to FD Amount ₹${fdAmount}`
            );

            return;

        }

        const response = await axios.put(
            `${API}/api/banks/redeemFd/${selectedFD.id}`,
            {
                amount: redeemData.amount,
            }
        );

        if (response.data.success) {

            alert("FD Redeemed Successfully");

            fetchFdRecords();

            setIsRedeemModalOpen(false);

            setRedeemData({
                amount: "",
                type: "redeem",
            });

        }

    } catch (error) {

        console.log(error);

        alert(
            error.response?.data?.message ||
            "Something went wrong"
        );

    }

};
    useEffect(() => {

        getBanks();

    }, []);
    const [fdData, setFdData] = useState({
        fdAccountNumber: "",
        fdAmount: "",
        bankName: "",
        bankId: "",
    });

    const handleChange = (e) => {
    const { name, value } = e.target;

    // For Bank Select
    if (name === "bankName") {

        const selectedBank = banks.find(
            (bank) => bank.bank_name === value
        );

        setFdData((prev) => ({
            ...prev,
            bankName: value,
            bankId: selectedBank?.id || "",
        }));

    } else {

        setFdData((prev) => ({
            ...prev,
            [name]: value,
        }));

    }
};

    const handleSaveFD = async () => {
        try {
            setIsSaving(true);
            const response = await axios.post(
                `${API}/api/banks/createFd`,
                fdData
            );

            if (response.data.success) {
                alert("FD Added Successfully");
                setIsAddModalOpenFD(false);
                fetchFdRecords();
                setFdData({
                    fdAccountNumber: "",
                    fdAmount: "",
                    bankName: ""
                });
            }
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Failed to add FD");
        } finally {
            setIsSaving(false);
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchAccounts = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API}/api/demat`);
            const data = await res.json();

            if (Array.isArray(data)) setAccounts(data);
            else if (Array.isArray(data?.data)) setAccounts(data.data);
            else setAccounts([]);
        } catch (error) {
            console.error(error);
            setAccounts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFdRecords = async () => {
        try {
            setIsLoading(true);
            const res = await fetch( `${API}/api/demat/GetFdList`);
            const data = await res.json();

            if (data.success && Array.isArray(data.data)) {
                setFdRecords(data.data);
            } else if (Array.isArray(data)) {
                setFdRecords(data);
            } else {
                setFdRecords([]);
            }
        } catch (error) {
            console.error(error);
            setFdRecords([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
        fetchFdRecords();
    }, []);

    const handleSave = async (formData) => {
        try {
            setIsSaving(true);

            const payload = {
                broker_name: formData.broker_name.trim(),
                account_holder_name: formData.account_holder_name.trim(),
                client_id: formData.client_id.trim(),
                  dp_id: formData.dp_id,
                status: normalizeStatusForApi(formData.status),
            };

            const endpoint = selectedAccount
                ? `${API}/api/demat/${selectedAccount.id}`
                : `${API}/api/demat/create`;

            const method = selectedAccount ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save");

            await fetchAccounts();
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);

            await fetch(`${API}/api/demat/${selectedAccount.id}`, {
                method: "DELETE",
            });

            await fetchAccounts();
            setIsDeleteModalOpen(false);
            setSelectedAccount(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRedeemChange = (e) => {

    const { name, value } = e.target;

    setRedeemData((prev) => ({
        ...prev,
        [name]: value,
    }));

};
    const handleDeleteFD = async () => {
        try {
            setIsDeleting(true);

            await fetch(`${API}/api/demat/delete/${selectedFD.id}`, {
                method: "DELETE",
            });

            await fetchFdRecords();
            setIsDeleteFDModalOpen(false);
            setSelectedFD(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredAccounts = useMemo(() => {
        const q = searchTerm.toLowerCase();

        return accounts.filter((item) =>
            `${item.broker_name} ${item.account_holder_name} ${item.client_id}`
                .toLowerCase()
                .includes(q)
        );
    }, [accounts, searchTerm]);

    const filteredFdRecords = useMemo(() => {
        const q = fdSearchTerm.toLowerCase();

        return fdRecords.filter((item) =>
            `${item.fdAccountNumber} ${item.bankName}`
                .toLowerCase()
                .includes(q)
        );
    }, [fdRecords, fdSearchTerm]);


  const handleScriptChange = (
    index,
    field,
    value
) => {

    const updatedData = [...scriptData];

    updatedData[index][field] = value;

    // AUTO CALCULATE ONLY
    // WHEN buyPrice OR qty CHANGES
    if (
        field === "buyPrice" ||
        field === "qty"
    ) {

        const buyPrice =
            Number(updatedData[index].buyPrice) || 0;

        const qty =
            Number(updatedData[index].qty) || 0;

        updatedData[index].total =
            buyPrice * qty;

    }

    setScriptData(updatedData);

};

// ==========================================
// SELL CHANGE
// ==========================================

const handleSellChange = (e) => {

    const { name, value } = e.target;

    const updatedData = {
        ...sellData,
        [name]: value,
    };

    // TOTAL CALCULATION
    updatedData.total =
        (
            Number(updatedData.sellPrice || 0) *
            Number(updatedData.qty || 0)
        ).toFixed(2);

    setSellData(updatedData);

};

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Bank Section - Demat Account Details */}
            <div className="mb-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-700">
                         Demat Account
                    </h1>
                    <div className="flex gap-5">
                        <button
                            onClick={() => {
                                setSelectedAccount(null);
                                setIsAddModalOpen(true);
                            }}
                            className="flex items-center gap-2 rounded-md bg-[#d94452] px-4 py-2 text-sm text-white"
                        >
                            <Plus size={18} /> Add Demat
                        </button>
                    </div>
                </div>

                <div className="rounded-lg bg-white shadow">
                    <div className="flex justify-between border-b p-4">
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search demat accounts..."
                                className="w-full rounded-md border py-2 pl-9 pr-3"
                            />
                        </div>

                        <p className="text-sm text-gray-500">
                            Showing {filteredAccounts.length} result(s)
                        </p>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4">Broker Name</th>
                                <th className="px-6 py-4">DP ID</th>
                                <th className="px-6 py-4">Holder Name</th>
                                <th className="px-6 py-4">Client ID</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        No demat accounts found
                                    </td>
                                </tr>
                            ) : (
                                filteredAccounts.map((item) => {
                                    const badge = getStatusBadge(item.status);

                                    return (
                                        <tr key={item.id} className="border-t cursor-pointer hover:bg-gray-100 transition-all duration-200"  onClick={async () => {

                setSelectedAccount(item);

                setSellData({
                    sellPrice: "",
                    qty: "",
                    total: "",
                });
                                                            
                await getScripts(item.id);
               
                                                            setIsSellModalOpen(true);

            }}>
                                            <td className="px-6 py-4">{item.broker_name}</td>
                                            <td className="px-6 py-4">{item.dp_id || "-"}</td>
                                            <td className="px-6 py-4">{item.account_holder_name}</td>
                                            <td className="px-6 py-4">{item.client_id}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs ${badge.className}`}
                                                >
                                                    {badge.label}
                                                </span>
                                            </td>
{/* 
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAccount(item);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="text-blue-500"
                                                    >
                                                        <Edit size={18} />
                                                    </button>

                                                   

                                                     <button
                                                        onClick={() => {
                                                            setSelectedAccount(item);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="text-red-500"
                                                    >
                                                        Script
                                                    </button>
                                                </div>
                                            </td> */}

                                            <td className="px-6 py-4">

    <div className="flex justify-end gap-3">

        {/* SCRIPT */}
      <button
    onClick={async (e) => {

        // STOP ROW CLICK
        e.stopPropagation();

        setSelectedAccount(item);

        // GET OLD DATA
        await getScripts(item.id);

        // OPEN ONLY SCRIPT MODAL
        setIsScriptModalOpen(true);

    }}
    className="rounded bg-blue-500 px-3 py-1 text-white"
>
    Script
</button>

        {/* SELL */}
        {/* <button
           
            className="rounded bg-red-500 px-3 py-1 text-white"
        >
            Sell
        </button> */}

    </div>

</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-700">
                        Fixed Deposit (FD) Records
                    </h1>
                    <div className="flex gap-5">
                        <button
                            onClick={() => {
                                setIsAddModalOpenFD(true);
                            }}
                            className="flex items-center gap-2 rounded-md bg-[#d94452] px-4 py-2 text-sm text-white"
                        >
                            <Plus size={18} /> Add FD
                        </button>
                    </div>
                </div>

                <div className="rounded-lg bg-white shadow">
                    <div className="flex justify-between border-b p-4">
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                            <input
                                value={fdSearchTerm}
                                onChange={(e) => setFdSearchTerm(e.target.value)}
                                placeholder="Search FD records..."
                                className="w-full rounded-md border py-2 pl-9 pr-3"
                            />
                        </div>

                        <p className="text-sm text-gray-500">
                            Showing {filteredFdRecords.length} result(s)
                        </p>
                    </div>

                    <table className="w-full text-left">

    <thead className="bg-gray-50">

        <tr>
            <th className="px-6 py-4">
                ID
            </th>

            <th className="px-6 py-4">
                FD Account Number
            </th>

            <th className="px-6 py-4">
                FD Amount
            </th>

            <th className="px-6 py-4">
                Bank Name
            </th>

            <th className="px-6 py-4">
                Created At
            </th>

            <th className="px-6 py-4">
                Status
            </th>

            <th className="px-6 py-4 text-right">
                Actions
            </th>
        </tr>

    </thead>

    <tbody>

        {filteredFdRecords.length === 0 ? (

            <tr>

                <td
                    colSpan="7"
                    className="py-8 text-center text-gray-500"
                >
                    No FD records found
                </td>

            </tr>

        ) : (

            filteredFdRecords.map((item) => (

                <tr
                    key={item.id}
                    className="border-t"
                >

                    <td className="px-6 py-4">
                        {item.id}
                    </td>

                    <td className="px-6 py-4">
                        {item.fdAccountNumber}
                    </td>

                    <td className="px-6 py-4">
                        ₹
                        {parseFloat(
                            item.fdAmount
                        ).toLocaleString(
                            "en-IN",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )}
                    </td>

                    <td className="px-6 py-4">
                        {item.bankName}
                    </td>

                    <td className="px-6 py-4">
                        {new Date(
                            item.createdAt
                        ).toLocaleString()}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">

                        {item.isRedeemed === 1 ? (

                            <span className="rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                Already Redeemed
                            </span>

                        ) : (

                            <span className="rounded bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                                Active
                            </span>

                        )}

                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4">

                        <div className="flex justify-end gap-3">

                            {item.isRedeemed === 0 ? (

                                <button
                                    onClick={() => {

                                        setSelectedFD(item);

                                        setRedeemData({
                                            amount: "",
                                            type: "redeem",
                                        });

                                        setIsRedeemModalOpen(true);

                                    }}
                                    className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                                >
                                    Redeem
                                </button>

                            ) : (

                                <button
                                    disabled
                                    className="cursor-not-allowed rounded bg-gray-300 px-3 py-1 text-gray-600"
                                >
                                    Redeemed
                                </button>

                            )}

                        </div>

                    </td>

                </tr>

            ))

        )}

    </tbody>

</table>
                </div>
            </div>
{
    isScriptModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">

            <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b p-4">

                    <h2 className="text-xl font-semibold">
                        Add Scripts
                    </h2>

                    <button
                        onClick={() =>
                            setIsScriptModalOpen(false)
                        }
                        className="text-2xl"
                    >
                        ×
                    </button>

                </div>

                {/* BODY */}
                <div className="max-h-[70vh] overflow-y-auto p-4">

                    {
                        scriptData.map((item, index) => (

                            <div
                                key={index}
                                className="mb-6 rounded-lg border p-4"
                            >

                                {/* TOP */}
                                <div className="mb-4 flex items-center justify-between">

                                    <h3 className="text-lg font-semibold">
                                        Script {index + 1}
                                    </h3>

                                    {
                                        scriptData.length > 1 && (
                                            <button
                                                onClick={() =>
                                                    removeScript(index)
                                                }
                                                className="rounded bg-red-500 px-3 py-1 text-sm text-white"
                                            >
                                                Remove
                                            </button>
                                        )
                                    }

                                </div>

                                {/* FORM */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                    {/* SCRIPT NAME */}
                                    <div>

                                        <label className="mb-1 block text-sm font-medium">
                                            Script Name
                                        </label>

                                        <input
                                            type="text"
                                            value={item.scriptName}
                                            onChange={(e) =>
                                                handleScriptChange(
                                                    index,
                                                    "scriptName",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded border p-2 outline-none focus:border-blue-500"
                                        />

                                    </div>
<div>
    <label className="mb-1 block text-sm font-medium">
        INEI Number
    </label>

    <input
        type="text"
        value={item.INEINumber}
        onChange={(e) =>
            handleScriptChange(
                index,
                "INEINumber",
                e.target.value
            )
        }
        className="w-full rounded border p-2 outline-none focus:border-blue-500"
    />
</div>
                                    {/* EXPIRY DATE */}
                                    <div>

                                        <label className="mb-1 block text-sm font-medium">
                                            Expiry Date
                                        </label>

                                        <input
                                            type="date"
                                            min={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            value={item.expiryDate}
                                            onChange={(e) =>
                                                handleScriptChange(
                                                    index,
                                                    "expiryDate",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded border p-2 outline-none focus:border-blue-500"
                                        />

                                    </div>

                                    {/* BUY PRICE */}
                                    <div>

                                        <label className="mb-1 block text-sm font-medium">
                                            Buy Price
                                        </label>

                                        <input
                                            type="number"
                                            value={item.buyPrice}
                                            onChange={(e) =>
                                                handleScriptChange(
                                                    index,
                                                    "buyPrice",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded border p-2 outline-none focus:border-blue-500"
                                        />

                                    </div>

                                    {/* QTY */}
                                    <div>

                                        <label className="mb-1 block text-sm font-medium">
                                            Qty
                                        </label>

                                        <input
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) =>
                                                handleScriptChange(
                                                    index,
                                                    "qty",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded border p-2 outline-none focus:border-blue-500"
                                        />

                                    </div>
{/* IEAI NUMBER */}

                                    {/* TOTAL */}
                                    <div className="md:col-span-2">

    <label className="mb-1 block text-sm font-medium">
        Total
    </label>

    <input
        type="number"
        value={item.total}
        onChange={(e) =>
            handleScriptChange(
                index,
                "total",
                e.target.value
            )
        }
        className="w-full rounded border bg-gray-100 p-2"
    />

</div>

                                </div>

                            </div>

                        ))
                    }

                    {/* ADD MORE BUTTON */}
                    <button
                        onClick={addNewScript}
                        className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white"
                    >
                        + Add More Script
                    </button>

                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 border-t p-4">

                    <button
                        onClick={() =>
                            setIsScriptModalOpen(false)
                        }
                        className="rounded border px-4 py-2"
                    >
                        Cancel
                    </button>

                    <button
    onClick={saveScripts}
    className="rounded bg-blue-600 px-4 py-2 text-white"
>
    Save
</button>

                </div>

            </div>

        </div>

    )
}

          {
    isSellModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-6xl rounded-2xl bg-white shadow-2xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b p-5">

                    <div>

                        <h2 className="text-2xl font-bold text-slate-800">
                            Final Share Settlement
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Sell and settle selected scripts
                        </p>

                    </div>

                    <button
                        onClick={() => setIsSellModalOpen(false)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl transition hover:bg-red-100 hover:text-red-600"
                    >
                        ×
                    </button>

                </div>

                {/* BODY */}
                <div className="max-h-[550px] overflow-auto p-5">

                    <table className="w-full border-collapse overflow-hidden rounded-xl">

                        <thead>

                            <tr className="bg-slate-100 text-sm uppercase text-slate-700">

                                <th className="border p-3 text-left">
                                    Script Name
                                </th>

                                <th className="border p-3 text-center">
                                    Buy Price
                                </th>

                                <th className="border p-3 text-center">
                                    Available Qty
                                </th>

                                <th className="border p-3 text-center">
                                    Sell Price
                                </th>

                                <th className="border p-3 text-center">
                                    Sell Qty
                                </th>

                                <th className="border p-3 text-center">
                                    Invested
                                </th>

                                <th className="border p-3 text-center">
                                    Settlement
                                </th>

                                <th className="border p-3 text-center">
                                    Profit / Loss
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {scriptData?.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="border p-6 text-center text-gray-500"
                                    >
                                        No scripts found
                                    </td>

                                </tr>

                            ) : (

                                scriptData?.map((item, index) => {

                                    const buyPrice =
                                        Number(item.buyPrice || 0);

                                    const qty =
                                        Number(item.qty || 0);

                                    const sellPrice =
                                        Number(item.sellPrice || 0);

                                    const sellQty =
                                        Number(item.sellQty || 0);

                                    const investedAmount =
                                        buyPrice * sellQty;

                                    const settlementAmount =
                                        sellPrice * sellQty;

                                    const profitLoss =
                                        settlementAmount - investedAmount;

                                    return (

                                        <tr
                                            key={index}
                                            className="transition hover:bg-slate-50"
                                        >

                                            {/* SCRIPT NAME */}
                                            <td className="border p-3 font-medium text-slate-700">
                                                {item.scriptName}
                                            </td>

                                            {/* BUY PRICE */}
                                            <td className="border p-3 text-center font-semibold">
                                                ₹ {buyPrice}
                                            </td>

                                            {/* AVAILABLE QTY */}
                                            <td className="border p-3 text-center">
                                                {qty}
                                            </td>

                                            {/* SELL PRICE */}
                                            <td className="border p-3">

                                                <input
                                                    type="number"
                                                    placeholder="Enter Price"
                                                    value={item.sellPrice || ""}
                                                    onChange={(e) => {

                                                        const value =
                                                            Number(e.target.value);

                                                        const updated =
                                                            [...scriptData];

                                                        updated[index].sellPrice =
                                                            value;

                                                        setScriptData(updated);

                                                    }}
                                                    className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-blue-500"
                                                />

                                            </td>

                                            {/* SELL QTY */}
                                            <td className="border p-3">

                                                <input
                                                    type="number"
                                                    placeholder="Enter Qty"
                                                    min="0"
                                                    max={qty}
                                                    value={item.sellQty || ""}
                                                    onChange={(e) => {

                                                        const value =
                                                            Number(e.target.value);

                                                        if (value > qty) {

                                                            alert(
                                                                "Sell qty cannot exceed available qty"
                                                            );

                                                            return;

                                                        }

                                                        const updated =
                                                            [...scriptData];

                                                        updated[index].sellQty =
                                                            value;

                                                        setScriptData(updated);

                                                    }}
                                                    className="w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-blue-500"
                                                />

                                            </td>

                                            {/* INVESTED */}
                                            <td className="border p-3 text-center font-semibold text-orange-600">
                                                ₹ {investedAmount}
                                            </td>

                                            {/* SETTLEMENT */}
                                            <td className="border p-3 text-center font-semibold text-blue-600">
                                                ₹ {settlementAmount}
                                            </td>

                                            {/* PROFIT LOSS */}
                                            <td
                                                className={`border p-3 text-center font-bold ${
                                                    profitLoss >= 0
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }`}
                                            >
                                                ₹ {profitLoss}
                                            </td>

                                        </tr>

                                    );

                                })

                            )}

                        </tbody>

                    </table>

                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between border-t bg-slate-50 p-5">

                    {/* OVERALL SUMMARY */}
                    <div>

                        <h3 className="text-lg font-semibold text-slate-700">
                            Overall Settlement
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Final total after selling selected shares
                        </p>

                    </div>

                    <div className="flex gap-3">

                        {/* CANCEL */}
                        <button
                            onClick={() => setIsSellModalOpen(false)}
                            className="rounded-lg border border-gray-300 px-5 py-2 font-medium transition hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        {/* FINAL SETTLEMENT */}
                        <button
                            onClick={handleSellScripts}
                            className="rounded-lg bg-green-600 px-6 py-2 font-semibold text-white transition hover:bg-green-700"
                        >
                            Final Settlement
                        </button>

                    </div>

                </div>

            </div>

        </div>

    )
}
            {/* Modals */}
            <DematModal
                isOpen={isAddModalOpen || isEditModalOpen}
                initialData={selectedAccount}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setSelectedAccount(null);
                }}
                onSave={handleSave}
                loading={isSaving}
            />

            {isRedeemModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

        <div className="w-full max-w-md rounded-lg bg-white shadow-xl">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b p-4">

                <h2 className="text-xl font-semibold">
                    FD Transaction
                </h2>

                <button
                    onClick={() => setIsRedeemModalOpen(false)}
                    className="text-2xl text-gray-500"
                >
                    ×
                </button>

            </div>

            {/* BODY */}
            <div className="space-y-4 p-4">

                {/* FD DETAILS */}
                <div className="rounded bg-gray-100 p-3">

                    <p>
                        <span className="font-semibold">
                            FD Account:
                        </span>{" "}
                        {selectedFD?.fdAccountNumber}
                    </p>

                    <p>
                        <span className="font-semibold">
                            FD Amount:
                        </span>{" "}
                        ₹
                        {parseFloat(
                            selectedFD?.fdAmount || 0
                        ).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </p>

                </div>

               

                   

                  <div>

    <label className="mb-1 block text-sm font-medium">
        Transaction Type
    </label>

    <input
        type="text"
        value="Redeem Amount"
        disabled
        className="w-full rounded border p-2 outline-none bg-gray-100 cursor-not-allowed"
    />

</div>

               

                {/* AMOUNT */}
               {/* AMOUNT */}
<div>
  <label className="mb-1 block text-sm font-medium">
    Amount
  </label>

  <input
    type="number"
    name="amount"
    value={redeemData.amount}
    onChange={(e) => {
      setRedeemData({
        ...redeemData,
        amount: e.target.value,
      });
    }}
    placeholder="Enter Amount"
    className="w-full rounded border p-2 outline-none focus:border-blue-500"
  />

  {/* VALIDATION MESSAGE */}
  {parseFloat(redeemData.amount || 0) <
    parseFloat(selectedFD?.fdAmount || 0) && (
    <p className="mt-1 text-sm text-red-500">
      Amount should be greater than or equal to FD Amount ₹
      {selectedFD?.fdAmount}
    </p>
  )}
</div>

            </div>

       
            <div className="flex justify-end gap-3 p-4">

                <button
                    onClick={() => setIsRedeemModalOpen(false)}
                    className="px-3 py-2"
                >
                    Cancel
                </button>

                <button
                    onClick={handleSaveRedeem}
                    className="rounded bg-red-600 px-4 py-2 text-white"
                >
                    Redeem
                </button>

            </div>

        </div>

    </div>
)}

            {/* {isAddModalOpenFD && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b p-4">
                            <h2 className="text-xl font-semibold">
                                Add FD Details
                            </h2>

                            <button
                                onClick={() => setIsAddModalOpenFD(false)}
                                className="text-2xl text-gray-500"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4 p-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    FD Account Number
                                </label>

                                <input
                                    type="text"
                                    name="fdAccountNumber"
                                    value={fdData.fdAccountNumber}
                                    onChange={handleChange}
                                    placeholder="Enter FD Account Number"
                                    className="w-full rounded border p-2 outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    FD Amount
                                </label>

                                <input
                                    type="number"
                                    name="fdAmount"
                                    value={fdData.fdAmount}
                                    onChange={handleChange}
                                    placeholder="Enter FD Amount"
                                    className="w-full rounded border p-2 outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Bank Name
                                </label>

                                <input
                                    type="text"
                                    name="bankName"
                                    value={fdData.bankName}
                                    onChange={handleChange}
                                    placeholder="Enter Bank Name"
                                    className="w-full rounded border p-2 outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-4">
                            <button
                                onClick={() => setIsAddModalOpenFD(false)}
                                className="px-3 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                className="rounded bg-red-600 px-3 py-2 text-white"
                                onClick={handleSaveFD}
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )} */}
            {isAddModalOpenFD && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-md rounded-lg bg-white shadow-xl">

                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b p-4">

                            <h2 className="text-xl font-semibold">
                                Add FD Details
                            </h2>

                            <button
                                onClick={() => setIsAddModalOpenFD(false)}
                                className="text-2xl text-gray-500"
                            >
                                ×
                            </button>

                        </div>

                        {/* BODY */}
                        <div className="space-y-4 p-4">

                            {/* FD ACCOUNT NUMBER */}
                            <div>

                                <label className="mb-1 block text-sm font-medium">
                                    FD Account Number
                                </label>

                                <input
                                    type="text"
                                    name="fdAccountNumber"
                                    value={fdData.fdAccountNumber}
                                    onChange={handleChange}
                                    placeholder="Enter FD Account Number"
                                    className="w-full rounded border p-2 outline-none focus:border-blue-500"
                                />

                            </div>

                            {/* FD AMOUNT */}
                            <div>

                                <label className="mb-1 block text-sm font-medium">
                                    FD Amount
                                </label>

                                <input
                                    type="number"
                                    name="fdAmount"
                                    value={fdData.fdAmount}
                                    onChange={handleChange}
                                    placeholder="Enter FD Amount"
                                    className="w-full rounded border p-2 outline-none focus:border-blue-500"
                                />

                            </div>

                            {/* BANK DROPDOWN */}
                            <div>

    <label className="mb-1 block text-sm font-medium">
        Select Bank
    </label>

    <select
  name="bankName"
  value={fdData.bankName}
  onChange={handleChange}
  className="w-full rounded border p-2 outline-none focus:border-blue-500 custom-select"
>
  <option value="">Select Bank</option>

  {banks.map((bank) => (
    <option
      key={bank.id}
      value={bank.bank_name}
      className="hover:bg-blue-500 hover:text-white"
    >
      {bank.bank_name} {bank.account_no} {bank.branch_name}
    </option>
  ))}
</select>

</div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex justify-end gap-3 p-4">

                            <button
                                onClick={() => setIsAddModalOpenFD(false)}
                                className="px-3 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                className="rounded bg-red-600 px-3 py-2 text-white"
                                onClick={handleSaveFD}
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            <DeleteModal
                isOpen={isDeleteModalOpen}
                brokerName={selectedAccount?.broker_name}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={isDeleting}
            />

            <DeleteFDModal
                isOpen={isDeleteFDModalOpen}
                fdAccountNumber={selectedFD?.fdAccountNumber}
                onClose={() => setIsDeleteFDModalOpen(false)}
                onConfirm={handleDeleteFD}
                loading={isDeleting}
            />
        </div>
    );
}

export default RBFDematDetails;