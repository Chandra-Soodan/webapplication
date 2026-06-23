import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Building, 
  FileSpreadsheet, 
  CalendarCheck, 
  Award, 
  Search, 
  Trophy, 
  User,
  ChevronLeft,
  ChevronRight,
  School
} from 'lucide-react';

export const Sidebar = ({ role, currentPage, setCurrentPage, collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  
  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return [
          { id: 'admin-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { id: 'admin-students', label: 'Students', icon: <GraduationCap size={20} /> },
          { id: 'admin-faculty', label: 'Faculty', icon: <Users size={20} /> },
          { id: 'admin-departments', label: 'Depts & Subjects', icon: <Building size={20} /> },
          { id: 'admin-reports', label: 'Reports', icon: <FileSpreadsheet size={20} /> }
        ];
      case 'faculty':
        return [
          { id: 'faculty-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { id: 'faculty-attendance', label: 'Mark Attendance', icon: <CalendarCheck size={20} /> },
          { id: 'faculty-marks', label: 'Academics', icon: <Award size={20} /> },
          { id: 'faculty-search', label: 'Search Students', icon: <Search size={20} /> }
        ];
      case 'student':
        return [
          { id: 'student-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { id: 'student-attendance', label: 'Attendance History', icon: <CalendarCheck size={20} /> },
          { id: 'student-academics', label: 'Academics & CGPA', icon: <Award size={20} /> },
          { id: 'student-sports', label: 'Sports & Certificates', icon: <Trophy size={20} /> },
          { id: 'student-profile', label: 'Edit Profile', icon: <User size={20} /> }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-logo">
            <School size={24} />
            <span>SmartEdu</span>
          </div>
        )}
        {collapsed && (
          <div className="sidebar-logo" style={{ justifyContent: 'center', width: '100%' }}>
            <School size={24} />
          </div>
        )}
        <button 
          className="btn-icon" 
          onClick={() => setCollapsed(!collapsed)}
          style={{ color: 'var(--sidebar-text)', marginLeft: collapsed ? 0 : 'auto' }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map(item => (
          <li key={item.id}>
            <button
              className={`sidebar-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => { setCurrentPage(item.id); setMobileOpen(false); }}
              style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}
            >
              {item.icon}
              <span className="sidebar-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {!collapsed ? '© 2026 SmartEdu Portal' : 'v1.0'}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
