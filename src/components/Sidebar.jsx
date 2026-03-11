// import React from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import {
//   LayoutDashboard,
//   UserCircle,
//   Handshake,
//   Home,
//   FileText,
//   Settings,
//   LogOut
// } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const { user, logout } = useAuth();
//   const role = String(user?.role || "").toLowerCase();

//   const handleLogout = (e) => {
//     e.preventDefault();
//     logout();
//     navigate("/login");
//   };

//   return (
//     <div className="w-64 bg-[#1e88e5] text-white flex flex-col min-h-screen sticky top-0">

//       {/* Profile */}
//       <div className="p-6 flex flex-col items-center">
//         {user?.profilePhoto ? (
//           <img
//             src={user.profilePhoto}
//             alt={user?.name || "User"}
//             className="w-16 h-16 rounded-full object-cover mb-4 border border-white/40"
//           />
//         ) : (
//           <div className="w-16 h-16 bg-gray-300 rounded-sm mb-4"></div>
//         )}

//         <div className="bg-white text-[#1e88e5] px-4 py-1 rounded-md flex items-center gap-2 text-sm font-medium shadow-sm">
//           <UserCircle size={16} />
//           {role === "admin" ? "Admin" : "Staff"}
//         </div>
//       </div>

//       <nav className="flex-1 mt-4">

//         {/* Dashboard */}
//         <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />

//         {/* Diksharthi Details */}
//         <NavItem to="/diksharthi-details" icon={<FileText size={18} />} label="Diksharthi Details" />

//         {/* Admin Only Menus */}
//         {role === "admin" && (
//           <>
//             <NavItem to="/user" icon={<FileText size={18} />} label="User List" />
//             <NavItem to="/assistance" icon={<Handshake size={18} />} label="Assistance" />
//             <NavItem to="/religious-practices" icon={<Home size={18} />} label="Family religious Practices" />
//             <NavItem to="/donor" icon={<FileText size={18} />} label="Donor List" />
//             <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" />
//           </>
//         )}

//         {/* Logout */}
//         <NavItem
//           to="/login"
//           icon={<LogOut size={18} />}
//           label="Log Out"
//           onClick={handleLogout}
//         />

//       </nav>
//     </div>
//   );
// };

// const NavItem = ({ icon, label, to, onClick }) => (
//   <NavLink
//     to={to}
//     onClick={onClick}
//     className={({ isActive }) =>
//       `flex items-center gap-3 px-6 py-3 cursor-pointer transition-all duration-200 ${isActive
//         ? 'bg-[#fbc02d] text-white shadow-inner'
//         : 'text-white hover:bg-[#1976d2]'
//       }`
//     }
//   >
//     {icon}
//     <span className="text-sm font-medium">{label}</span>
//   </NavLink>
// );

// export default Sidebar;


import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCircle,
  Handshake,
  Home,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = String(user?.role || "").toLowerCase();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

  return (
    <div
      className={`relative bg-[#1e88e5] text-white flex flex-col min-h-screen sticky top-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-[#fbc02d] text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform z-50"
      >
        {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Profile Section */}
      <div className={`p-6 flex flex-col items-center border-b border-white/10 ${isCollapsed ? 'px-2' : ''}`}>
        <div className="relative">
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user?.name || "User"}
              className={`${isCollapsed ? 'w-10 h-10' : 'w-16 h-16'} rounded-full object-cover mb-4 border-2 border-white/40 transition-all`}
            />
          ) : (
            <div className={`${isCollapsed ? 'w-10 h-10' : 'w-16 h-16'} bg-blue-400 rounded-full mb-4 flex items-center justify-center`}>
              <UserCircle size={isCollapsed ? 24 : 32} />
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider border border-white/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {role === "admin"
              ? "Admin"
              : role === "operations-manager"
                ? "Operations Manager"
                : "Staff"}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <NavItem isCollapsed={isCollapsed} to="/" icon={<LayoutDashboard size={22} />} label="Dashboard" />
        <NavItem isCollapsed={isCollapsed} to="/diksharthi-details" icon={<FileText size={22} />} label="Diksharthi Details" />

        {role === "admin" && (
          <>
            {/* <div className={`px-6 py-2 text-[10px] font-bold text-blue-200 uppercase tracking-widest ${isCollapsed ? 'hidden' : 'block'}`}>
              
            </div> */}
            <NavItem isCollapsed={isCollapsed} to="/user" icon={<UserCircle size={22} />} label="User List" />
            <NavItem isCollapsed={isCollapsed} to="/assistance" icon={<Handshake size={22} />} label="Assistance" />
            <NavItem isCollapsed={isCollapsed} to="/religious-practices" icon={<Home size={22} />} label="Religious" />
            <NavItem isCollapsed={isCollapsed} to="/donor" icon={<FileText size={22} />} label="Donor List" />
            <NavItem isCollapsed={isCollapsed} to="/settings" icon={<Settings size={22} />} label="Settings" />
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t border-white/10">
        <NavItem
          isCollapsed={isCollapsed}
          to="/login"
          icon={<LogOut size={22} />}
          label="Log Out"
          onClick={handleLogout}
          variant="logout"
        />
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, to, onClick, isCollapsed, variant }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center gap-4 px-6 py-4 cursor-pointer transition-all duration-200 group
      ${isActive
      ? 'bg-[#fbc02d] text-white font-bold'
        : 'text-white'
      }
      ${isCollapsed ? 'justify-center px-0' : ''}
      ${variant === 'logout' ? 'hover:bg-red-500 hover:text-white' : ''}
    `}
  >
    <div className={`${isCollapsed ? 'scale-110' : ''} transition-transform`}>
      {icon}
    </div>

    {!isCollapsed && (
      <span className="text-sm tracking-wide whitespace-nowrap">{label}</span>
    )}

    {/* Tooltip for collapsed state */}
    {isCollapsed && (
      <div className="absolute left-20 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] whitespace-nowrap">
        {label}
      </div>
    )}
  </NavLink>
);

export default Sidebar;
