// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Bar } from "react-chartjs-2";
// import {
//     Chart as ChartJS,
//     BarElement,
//     CategoryScale,
//     LinearScale,
//     Tooltip,
//     Legend,
// } from "chart.js";
// import { API } from "../../api/BaseURL";
// import BirthdayItem from "../../components/BirthdayItem"
// import { Users, UserCheck, Clock, XCircle, Gift, BarChart3 } from "lucide-react";

// ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// const API_BASE = `${API}/api/dashboard`;

// function StaffDashboard() {
//     const [counts, setCounts] = useState({});
//     const [ageChart, setAgeChart] = useState([]);
//     const [karyakartaBirthdays, setKaryakartaBirthdays] = useState([]);
//     const [donorBirthdays, setDonorBirthdays] = useState([]);

//     useEffect(() => {
//         fetchDashboard();
//     }, []);

//     const fetchDashboard = async () => {
//         try {
//             const [countRes, ageRes, karyakartaRes, donorRes] = await Promise.all([
//                 axios.get(`${API_BASE}/count`),
//                 axios.get(`${API_BASE}/diksharthi/age-chart`),
//                 axios.get(`${API_BASE}/karyakarta-birthdays`),
//                 axios.get(`${API_BASE}/donors/upcoming-birthdays`),
//             ]);

//             setCounts(countRes.data.data);
//             setAgeChart(ageRes.data.data);
//             setKaryakartaBirthdays(karyakartaRes.data.data);
//             setDonorBirthdays(donorRes.data.data);
//         } catch (err) {
//             console.error("Dashboard Error:", err);
//         }
//     };

//     const chartData = {
//         labels: ageChart.map((item) => item.age_group),
//         datasets: [
//             {
//                 label: "Diksharthi Distribution",
//                 data: ageChart.map((item) => item.count),
//                 backgroundColor: "rgba(59, 130, 246, 0.8)",
//                 borderRadius: 6,
//             },
//         ],
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 p-6 flex flex-col lg:flex-row gap-6">
//             {/* LEFT CONTENT: Stats & Charts */}
//             <div className="flex-1 space-y-6">
//                 <header className="flex items-center gap-2">
//                     <BarChart3 className="text-blue-600" size={28} />
//                     <h2 className="text-2xl font-bold text-gray-800">Staff Overview</h2>
//                 </header>

//                 {/* Stats Grid */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
//                     <StatCard title="M.S." value={counts?.dikshari_count} icon={<Users className="text-blue-500" size={20} />} color="blue" />
//                     <StatCard title="Members and Contributions" value={counts?.donor_count} icon={<UserCheck className="text-green-500" size={20} />} color="green" />
//                     <StatCard title="Approved Assistance" value={counts?.assistance?.approved} icon={<UserCheck className="text-indigo-500" size={20} />} color="indigo" />
//                     <StatCard title="Pending Assistance" value={counts?.assistance?.pending} icon={<Clock className="text-yellow-500" size={20} />} color="yellow" />
//                     <StatCard title="Rejected Assistance" value={counts?.assistance?.rejected} icon={<XCircle className="text-red-500" size={20} />} color="red" />
//                 </div>

//                 {/* Main Chart Section */}
//                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//                     <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
//                         📊 Age Distribution
//                     </h3>
//                     <div className="h-[350px] flex items-center justify-center">
//                         <Bar data={chartData} options={{ maintainAspectRatio: false }} />
//                     </div>
//                 </div>
//             </div>

//             {/* RIGHT SIDEBAR: Birthdays */}
//             <aside className="w-full lg:w-80 space-y-6">
//                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
//                     <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3">
//                         <Gift className="text-pink-500" size={20} />
//                         Birthdays
//                     </h3>

//                     <div className="space-y-8">
//                         {/* Karyakarta Section */}
//                         <section>
//                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Karyakarta</h4>
//                             {karyakartaBirthdays.map((item, i) => (
//                                 <BirthdayItem
//                                     key={i}
//                                     name={item.fullName}
//                                     date={item.dateOfBirth}
//                                     type="Karyakarta"
//                                 />
//                             ))}
//                         </section>

//                         {/* Donors Section */}
//                         <section>
//                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Members and Contributions</h4>
//                             {donorBirthdays.map((item, i) => (
//                                 <BirthdayItem
//                                     key={i}
//                                     name={`${item.firstName || ""} ${item.lastName || ""}`.trim() || "Unknown Donor"}
//                                     date={item.dob}
//                                     type="donor"
//                                 />
//                             ))}
//                         </section>
//                     </div>
//                 </div>
//             </aside>
//         </div>
//     );
// }

// // Sub-components for cleaner code
// const StatCard = ({ title, value, icon, color }) => (
//   <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group overflow-hidden relative">
//     {/* Subtle Background Icon Decoration */}
//     <div className="absolute -right-2 -bottom-2 text-slate-50 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
//       {React.cloneElement(icon, { size: 80 })}
//     </div>
    
//     <div className="relative z-10">
//       <div className="flex items-center justify-between mb-4">
//         <div className="p-2.5 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">
//           {icon}
//         </div>
//       </div>
//       <p className="text-2xl font-black text-slate-800 mb-1">{value || 0}</p>
//       <p className="text-xs font-bold text-slate-400 uppercase tracking-tight line-clamp-1">{title}</p>
//     </div>
//   </div>
// );

// export default StaffDashboard;


import React from 'react'

function StaffDashboard() {
  return (
    <div>Dashboard</div>
  )
}

export default StaffDashboard