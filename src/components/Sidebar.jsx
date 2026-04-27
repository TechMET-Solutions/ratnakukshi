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
  Menu,
  Users,
  HeartHandshake,
  FileBadge,
  Globe,
  ShieldCheck,
  ReceiptText,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = String(user?.role || "").trim().toLowerCase();
  const isAdmin = role === "admin";
  const isStaff = role === "staff";
  const isAccount = role === "account"
  const isOperationsManager = role === "operations-manager";
  const isKaryakarta = role === "karyakarta";
  const isCaseCoordinator = role === "case-coordinator";
  const isExpertPanel =
    role === "expert-panel" || role.startsWith("expert-panel-");
  const isCommitteeMember = role === "committee-member";

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

  return (
    <div
      className={`relative bg-[#1e88e5] h-screen text-white flex flex-col min-h-screen sticky top-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
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
          <div className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full flex items-center gap-2 text-[10px]  uppercase tracking-wider border border-white/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {isAdmin
              ? "Admin"
              : isOperationsManager
                ? "Operations Manager"
                : isKaryakarta
                  ? "Karyakarta"
                  : isCaseCoordinator
                    ? "Case Coordinator"
                    : isExpertPanel
                      ? "Expert Panel"
                      : isCommitteeMember
                        ? "Committee Member"
                        : isAccount
                          ? "Account Panal"
                          : "Staff"}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <NavItem isCollapsed={isCollapsed} to="/" icon={<LayoutDashboard size={22} />} label="Dashboard" />
        {(isAdmin || isStaff || isOperationsManager || isKaryakarta || isCaseCoordinator || isExpertPanel || isCommitteeMember) && (
          <NavItem
            isCollapsed={isCollapsed}
            to="/diksharthi-details"
            icon={<FileBadge size={22} />}
            label="Ratnakukshi Family Info"
          />


        )}
        {(isAdmin || isStaff || isOperationsManager || isCaseCoordinator || isKaryakarta || isExpertPanel || isCommitteeMember) && (

          <>
            <NavItem isCollapsed={isCollapsed} to="/assistance" icon={<HeartHandshake size={22} />} label="Assistance" />

          </>
        )}
        {( isCaseCoordinator) && (

          <>
            <NavItem isCollapsed={isCollapsed} to="/meeting-schedule" icon={<CalendarDays size={22} />} label="Meeting Schedule" />

          </>
        )}

        {isAdmin || isAccount && (
          <NavItem isCollapsed={isCollapsed} to="/bank-details" icon={<Home size={22} />} label="Bank Details" />
        )}
        {isAccount && (
          <>
            <NavItem isCollapsed={isCollapsed} to="/account-assistnce" icon={<HeartHandshake size={22} />} label="Assistance" />
            <NavItem isCollapsed={isCollapsed} to="/account-transactions" icon={<ReceiptText size={22} />} label="Account Transactions " />
          </>
        )}

        {isKaryakarta && (
          <NavItem isCollapsed={isCollapsed} to="/profile" icon={<UserCircle size={22} />} label="Profile" />
        )}

        {(isAdmin || isStaff || isAccount) && (
          <NavItem
            isCollapsed={isCollapsed}
            to="/members-contributions"
            icon={<Users size={22} />}
            label="Members and Contributions"
          />
        )}


        {isAdmin && (
          <>
            <NavItem isCollapsed={isCollapsed} to="/user" icon={<Users size={22} />} label="User Management" />
            <NavItem isCollapsed={isCollapsed} to="/mother-tongue" icon={<Globe size={22} />} label="Mother Tongue" />
            <NavItem isCollapsed={isCollapsed} to="/res-proof" icon={<FileText size={22} />} label="Res. Proof" />
            {/* <NavItem isCollapsed={isCollapsed} to="/religious-practices" icon={<Home size={22} />} label="Religious" /> */}
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
