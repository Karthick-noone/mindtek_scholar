import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  User,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  Award,
  PanelLeft,
  Lock,
  X,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Info
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import './Header.css';
import { Link } from 'react-router-dom';
import { secureStorage } from '../../utils/secureStorage';
import { useScholar } from '../../hooks/useScholar';
import { useLogout } from "../../hooks/useLogout";

const Header = ({ onToggleSidebar, sidebarCollapsed,  setMobileOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [scrolled, setScrolled] = useState(false);

  const scholar = secureStorage.getScholar();
    const { mutate: logout } = useLogout();

  const { data: scholarData } = useScholar();
  const scholarImage = scholarData?.scholar_profile
    ? `http://scholarapi.seasense.in/${scholarData.scholar_profile}`
    : null;

  const notificationRef = useRef();
  const profileRef = useRef();


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const notifications = [
    { id: 1, message: 'Your profile has been updated', time: '2 hours ago', read: false, type: 'success' },
    { id: 2, message: 'New scholarship application deadline', time: '1 day ago', read: false, type: 'warning' },
    { id: 3, message: 'Payment successful', time: '2 days ago', read: true, type: 'info' },
    { id: 4, message: 'New course available', time: '3 days ago', read: true, type: 'info' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMobileMenu = () => {
    setMobileOpen(true);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-left">
        {isMobile ? (
          <button className="icon-btn mobile-menu-btn" onClick={handleMobileMenu}>
            <PanelLeft size={18} />
          </button>
        ) : (
          <button className="icon-btn toggle-btn" onClick={onToggleSidebar}>
            <PanelLeft size={18} />
          </button>
        )}

      </div>

      <div className="header-right">
        {/* <div className="search-bar">
          <input type="text" placeholder="Search..." />
          <kbd>⌘K</kbd>
        </div> */}

        {/* Theme Toggle */}
        <button className="icon-btn theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications */}
        <div className="notification-wrapper" ref={notificationRef}>
          {/* <button
            className="icon-btn notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button> */}

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <div className="header-title">
                  <h4>Notifications</h4>
                  <span className="notification-count">{notifications.filter(n => !n.read).length}</span>
                </div>
                <button className="mark-all-btn">
                  Mark all read
                </button>
              </div>

              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                      <div className={`notification-icon ${notif.type}`}>
                        {notif.type === 'success' && <CheckCircle size={16} />}
                        {notif.type === 'warning' && <AlertCircle size={16} />}
                        {notif.type === 'info' && <Info size={16} />}
                        {notif.type === 'error' && <XCircle size={16} />}
                      </div>
                      <div className="notification-content">
                        <p className="notification-message">{notif.message}</p>
                        <div className="notification-meta">
                          <span className="notification-time">
                            <Clock size={12} />
                            {notif.time}
                          </span>
                          {!notif.read && <span className="unread-badge">New</span>}
                        </div>
                      </div>
                      {/* <button className="notification-close" 
            
            onClick={() => markAsRead(notif.id)}
            >
              <X size={14} />
            </button> */}
                    </div>
                  ))
                ) : (
                  <div className="empty-notifications">
                    <Bell size={48} />
                    <p>No notifications</p>
                    <span>You're all caught up!</span>
                  </div>
                )}
              </div>

              {/* <div className="dropdown-footer">
      <button className="view-all-btn">
        View All Notifications
      </button>
    </div> */}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="user-menu-wrapper" ref={profileRef}>
          <button
            className="user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              <div className="avatar-initials">
                {scholarImage ? (
                  <img src={scholarImage} alt="Profile" className='header-prof-img1' />
                ) : (
                  <div className="user-glass-avatar">
                    <span>{scholar?.user_name?.charAt(0) || 'S'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="user-info">
              <span className="user-name">{scholar?.user_name || 'Scholar'}</span>
              <span className="user-role">Scholar</span>
            </div>
            <ChevronDown size={16} className="chevron-icon" />
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-user-info">
                <div className="dropdown-avatar">
                  <div className="avatar-initials large">
                    {scholarImage ? (
                      <img src={scholarImage} alt="Profile" className='header-prof-img2' />
                    ) : (
                      <div className="user-glass-avatar2">
                        <span>{scholar?.user_name?.charAt(0) || 'S'}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="dropdown-user-details">
                  <span className="dropdown-name">{scholar?.user_name || 'Scholar'}</span>
                  <p className="dropdown-email">{scholar?.email || 'scholar@example.com'}</p>
                </div>
              </div>
              {/* <div className="dropdown-divider"></div> */}
              <Link to="/profile" className='nav-links'
                onClick={() => setShowUserMenu(!showUserMenu)}

              > <button className="dropdown-item">
                  <User size={16} />
                  <span>Profile</span>
                </button></Link>
              <Link to="/change-password" className='nav-links'
                onClick={() => setShowUserMenu(!showUserMenu)}

              ><button className="dropdown-item">
                  <Lock size={16} />
                  <span>Change Password</span>
                </button>
              </Link>

              <div className="dropdown-divider"></div>
              <button onClick={() => logout()} className="dropdown-item logout-item">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;