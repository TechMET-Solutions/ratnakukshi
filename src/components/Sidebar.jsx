// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import {
//   LayoutDashboard,
//   UserCircle,
//   Users,
//   Handshake,
//   Home,
//   FileText,
//   Settings,
//   LogOut
// } from 'lucide-react';

// const Sidebar = () => {
//   return (
//     <div className="w-64 bg-[#1e88e5] text-white flex flex-col min-h-screen sticky top-0">
//       {/* Profile Section */}
//       <div className="p-6 flex flex-col items-center">
//         <div className="w-16 h-16 bg-gray-300 rounded-sm mb-4"></div>
//         <div className="bg-white text-[#1e88e5] px-4 py-1 rounded-md flex items-center gap-2 text-sm font-medium shadow-sm">
//           <UserCircle size={16} />
//           Mr. Karyakarta
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 mt-4">
//         <NavItem to="/dashboard" icon={<LayoutDashboard size={18}/>} label="Dashboard" />
//         <NavItem to="/diksharthi-details" icon={<FileText size={18}/>} label="Diksharthi Details" />
//         <NavItem to="/family-details" icon={<Users size={18}/>} label="Family details" />
//         <NavItem to="/assistance" icon={<Handshake size={18}/>} label="Assistance" />
//         <NavItem to="/religious-practices" icon={<Home size={18}/>} label="Family religious Practices" />
//         <NavItem to="/review" icon={<FileText size={18}/>} label="Review & Submit" />
//         <NavItem to="/settings" icon={<Settings size={18}/>} label="Settings" />
//         <NavItem to="/logout" icon={<LogOut size={18}/>} label="Log Out" />
//       </nav>
//     </div>
//   );
// };

// // Helper component for Nav Items
// const NavItem = ({ icon, label, to }) => (
//   <NavLink
//     to={to}
//     className={({ isActive }) =>
//       `flex items-center gap-3 px-6 py-3 cursor-pointer transition-all duration-200 ${
//         isActive
//           ? 'bg-[#fbc02d] text-white shadow-inner'
//           : 'text-white hover:bg-[#1976d2]'
//       }`
//     }
//   >
//     {icon}
//     <span className="text-sm font-medium">{label}</span>
//   </NavLink>
// );

// export default Sidebar;


import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCircle,
  Users,
  Handshake,
  Home,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    // Prevent NavLink from just changing the URL
    e.preventDefault();

    // 1. Clear the auth token
    localStorage.removeItem("token");

    // 2. Redirect to Login page
    navigate("/login");
  };

  return (
    <div className="w-64 bg-[#1e88e5] text-white flex flex-col min-h-screen sticky top-0">
      {/* Profile Section */}
      <div className="p-6 flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-300 rounded-sm mb-4"></div>
        <div className="bg-white text-[#1e88e5] px-4 py-1 rounded-md flex items-center gap-2 text-sm font-medium shadow-sm">
          <UserCircle size={16} />
          Mr. Karyakarta
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4">
        <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <NavItem to="/diksharthi-details" icon={<FileText size={18} />} label="Diksharthi Details" />
        {/* <NavItem to="/family-details" icon={<Users size={18} />} label="Family details" /> */}
        <NavItem to="/assistance" icon={<Handshake size={18} />} label="Assistance" />
        <NavItem to="/religious-practices" icon={<Home size={18} />} label="Family religious Practices" />
        <NavItem to="/donor" icon={<FileText size={18} />} label="Donor List" />
        <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" />

        {/* Logout Button: We pass the onClick handler here */}
        <NavItem
          to="/login"
          icon={<LogOut size={18} />}
          label="Log Out"
          onClick={handleLogout}
        />
      </nav>
    </div>
  );
};

// Helper component for Nav Items
const NavItem = ({ icon, label, to, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-6 py-3 cursor-pointer transition-all duration-200 ${isActive
        ? 'bg-[#fbc02d] text-white shadow-inner'
        : 'text-white hover:bg-[#1976d2]'
      }`
    }
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </NavLink>
);

export default Sidebar;