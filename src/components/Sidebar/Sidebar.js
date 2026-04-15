import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Key,
  CreditCard,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import './Sidebar.css';
import logo from './../../assets/img/logo.png';
import darkThemelogo from './../../assets/img/company-logo.png';
import { useLogout } from "../../hooks/useLogout";
import { secureStorage } from '../../utils/secureStorage';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar = ({ collapsed, onToggle, mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // const [mobileOpen, setMobileOpen] = useState(false);
  const { mutate: logout } = useLogout();

const { theme } = useTheme();

  const companyDetails = secureStorage.getCompany();
  const companyLogo = `http://scholarapi.seasense.in/${companyDetails?.com_logo}`;

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
    { path: '/payment-history', icon: CreditCard, label: 'Payment History' },
    { path: '/complain-register', icon: FileText, label: 'Complain Register' },
    { path: '/change-password', icon: Key, label: 'Change Password' },

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
          <div className="logo-container">
            <div className="logo-icon">
              <GraduationCap size={28} />
            </div>
            {(!collapsed || isMobile) && <img src={theme  === "dark" ? darkThemelogo : logo} alt="Logo" className="logo-image" />}
            {/* {(!collapsed || isMobile) && <img src={companyLogo || logo} alt="Logo" className="logo-image" />} */}
            {/* {(!collapsed || isMobile) && <h2 className="logo-text">Sea Sense Scholar</h2>} */}
          </div>

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