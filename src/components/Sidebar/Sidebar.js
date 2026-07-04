import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Key,
  CreditCard,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  IndianRupee,
  Lock
} from 'lucide-react';
import './Sidebar.css';
import logo from './../../assets/img/logo.png';
import darkThemelogo from './../../assets/img/company-logo.png';
import { useLogout } from "../../hooks/useLogout";
import { secureStorage } from '../../utils/secureStorage';
import { useTheme } from '../../contexts/ThemeContext';
import { useScholar } from '../../hooks/useScholar';
import { getAssetUrl } from '../../utils/getCompanyUrl';

const Sidebar = ({ collapsed, onToggle, mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // const [mobileOpen, setMobileOpen] = useState(false);
  const { mutate: logout } = useLogout();

  const { theme } = useTheme();

  // const companyDetails = secureStorage.getCompany();
  const { data: scholarData } = useScholar();

  // console.log("Comny dtls", scholarData)

  const companyLogo = getAssetUrl(scholarData?.company?.com_logo) || logo;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/payment-history', icon: IndianRupee, label: 'Payment History' },
    { path: '/complaint-register', icon: FileText, label: 'Complaint Register' },
    { path: '/change-password', icon: Lock, label: 'Change Password' },

  ];

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const sidebarClasses = `sidebar ${collapsed && !isMobile ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''} ${mobileOpen ? 'mobile-open' : ''}`;

  return (
    <>
      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)}></div>
      )}

      <div className={sidebarClasses}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="logo-link">

          <div className="sidebar-logo-container">
            <div className="sidebar-logo-icon">
              <svg className="scholar-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3L1 9L12 15L23 9L12 3Z" />
                <path d="M5 12V16L12 20L19 16V12" />
                <path d="M19 12V19" />
                <circle cx="19" cy="16" r="2" />
                <path d="M9 9L12 11L15 9" />
              </svg>            </div>
            {/* {(!collapsed || isMobile) && <img src={theme  === "dark" ? darkThemelogo : logo} alt="Logo" className="logo-image" />} */}
            {(!collapsed || isMobile) && <img src={companyLogo} alt="Logo"
              className={`logo-image ${theme === "dark" ? "logo-white" : ""}`}
            />}
            {/* {(!collapsed || isMobile) && <h2 className="logo-text">Sea Sense Scholar</h2>} */}
          </div>
          </Link>

          {isMobile && (
            <button className="mobile-close" onClick={() => setMobileOpen(false)}>
              ✕
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={handleNavClick}
            >
              <item.icon size={22} />
              {(!collapsed || isMobile) && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => logout()} className="logout-btn">
            <LogOut size={22} />
            {(!collapsed || isMobile) && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;