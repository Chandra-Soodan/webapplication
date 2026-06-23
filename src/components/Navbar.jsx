import React, { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, Menu, User, Check } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { db } from '../services/db';

export const Navbar = ({ user, profile, onLogout, toggleSidebar, toggleMobileSidebar }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    if (!profile) return;
    try {
      const data = await db.getNotifications(profile.id);
      setNotifications(data);
    } catch (e) {
      console.error("Error loading notifications:", e);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 15 seconds to simulate real-time updates
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [profile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await db.markNotificationAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-icon mobile-menu-btn" onClick={toggleMobileSidebar}>
          <Menu size={20} />
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Smart College Portal</h2>
      </div>

      <div className="nav-actions">
        <ThemeToggle />

        {/* Notifications */}
        <div className="notification-bell-btn" ref={dropdownRef}>
          <button className="btn-icon" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
          </button>

          {showNotifDropdown && (
            <div className="notifications-dropdown">
              <div className="notif-header">
                <span>Notifications</span>
                {unreadCount > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{unreadCount} unread</span>}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notif-item ${!notif.read ? 'unread' : ''}`}
                      onClick={(e) => !notif.read && handleMarkRead(notif.id, e)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="notif-title">{notif.title}</span>
                        {!notif.read && (
                          <button 
                            className="btn-icon" 
                            style={{ padding: 2 }}
                            onClick={(e) => handleMarkRead(notif.id, e)}
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                      <p className="notif-msg">{notif.message}</p>
                      <span className="notif-time">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Details & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
          <div className="nav-profile">
            <div className="avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="avatar" style={{ border: 'none' }} />
              ) : (
                getInitials(profile?.name)
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }} className="sidebar-label">
              <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{profile?.name}</span>
              <span className="badge badge-role" style={{ fontSize: '0.65rem', padding: '0px 6px', marginTop: 2 }}>{profile?.role}</span>
            </div>
          </div>

          <button className="btn-icon" onClick={onLogout} title="Log Out" style={{ color: 'var(--danger)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
