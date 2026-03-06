import React from 'react';
import { Users, Home, ClipboardList, TrendingUp, Search, Bell, PieChart } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans">
     
     
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">Records Overview</h2>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg px-3 py-1.5 items-center gap-2">
              <Search size={16} className="text-gray-400" />
              <input className="bg-transparent border-none text-sm focus:outline-none" placeholder="Search records..." />
            </div>
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Main KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Total Dikshahi" 
              value="1,284" 
              subtitle="Newly initiated this year" 
              color="text-blue-600"
              icon={<Users className="text-blue-600" />}
            />
            <StatCard 
              title="Total Families" 
              value="452" 
              subtitle="Registered households" 
              color="text-emerald-600"
              icon={<Home className="text-emerald-600" />}
            />
            <StatCard 
              title="Summary Records" 
              value="8,902" 
              subtitle="Total activities logged" 
              color="text-amber-600"
              icon={<ClipboardList className="text-amber-600" />}
            />
          </div>

          {/* Detailed Summary Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Recent Summary Records</h3>
              <button className="text-sm text-indigo-600 font-semibold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Record ID</th>
                    <th className="px-6 py-4 font-semibold">Family Name</th>
                    <th className="px-6 py-4 font-semibold">Dikshahi Status</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  <TableRow id="#REC-9920" family="Sharma Family" status="Completed" date="Oct 24, 2023" />
                  <TableRow id="#REC-9921" family="Patel Family" status="Pending" date="Oct 25, 2023" />
                  <TableRow id="#REC-9922" family="Mehta Family" status="Completed" date="Oct 26, 2023" />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable Sub-Components
const NavItem = ({ icon, label, active = false }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-200 hover:bg-indigo-900 hover:text-white'}`}>
    {icon} <span className="text-sm font-medium">{label}</span>
  </button>
);

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className={`text-3xl font-bold mt-1 ${color}`}>{value}</h3>
      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
        <TrendingUp size={12} className="text-green-500" /> {subtitle}
      </p>
    </div>
    <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
  </div>
);

const TableRow = ({ id, family, status, date }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4 font-mono text-xs text-gray-400">{id}</td>
    <td className="px-6 py-4 font-medium">{family}</td>
    <td className="px-6 py-4">
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
        {status}
      </span>
    </td>
    <td className="px-6 py-4 text-gray-500">{date}</td>
    <td className="px-6 py-4">
      <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold">Edit</button>
    </td>
  </tr>
);

export default Dashboard;