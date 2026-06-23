import React, { useState, useEffect } from 'react';
import { auth } from './services/auth';
import Loader from './components/Loader';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';

// Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminFaculty from './pages/admin/Faculty';
import AdminDepartments from './pages/admin/Departments';
import AdminReports from './pages/admin/Reports';

import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyAttendance from './pages/faculty/Attendance';
import FacultyMarks from './pages/faculty/Marks';
import FacultySearch from './pages/faculty/Search';

import StudentDashboard from './pages/student/Dashboard';
import StudentAttendance from './pages/student/AttendanceView';
import StudentAcademics from './pages/student/AcademicsView';
import StudentSports from './pages/student/SportsView';
import StudentProfile from './pages/student/Profile';

import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  function setDefaultPageForRole(role) {
    if (role === 'admin') setCurrentPage('admin-dashboard');
    else if (role === 'faculty') setCurrentPage('faculty-dashboard');
    else if (role === 'student') setCurrentPage('student-dashboard');
  }

  useEffect(() => {
    // Check initial session
    const checkInitialSession = async () => {
      try {
        const current = await auth.getCurrentSession();
        setSession(current);
        if (current) {
          // Set default page based on role
          setDefaultPageForRole(current.profile?.role);
        }
      } catch (e) {
        console.error("Session check error:", e);
      } finally {
        setLoading(false);
      }
    };

    checkInitialSession();

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChange((newSession) => {
      setSession(newSession);
      if (newSession) {
        setDefaultPageForRole(newSession.profile?.role);
      } else {
        setCurrentPage('');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);



  const handleLogout = async () => {
    setLoading(true);
    try {
      await auth.logout();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Render the active view based on currentPage state
  const renderPage = () => {
    if (!session) return null;

    switch (currentPage) {
      // Admin Pages
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-students':
        return <AdminStudents />;
      case 'admin-faculty':
        return <AdminFaculty />;
      case 'admin-departments':
        return <AdminDepartments />;
      case 'admin-reports':
        return <AdminReports adminProfile={session.profile} />;

      // Faculty Pages
      case 'faculty-dashboard':
        return <FacultyDashboard facultyDetails={session.roleDetails} profile={session.profile} />;
      case 'faculty-attendance':
        return <FacultyAttendance facultyDetails={session.roleDetails} />;
      case 'faculty-marks':
        return <FacultyMarks facultyDetails={session.roleDetails} />;
      case 'faculty-search':
        return <FacultySearch />;

      // Student Pages
      case 'student-dashboard':
        return <StudentDashboard studentDetails={session.roleDetails} profile={session.profile} />;
      case 'student-attendance':
        return <StudentAttendance studentDetails={session.roleDetails} />;
      case 'student-academics':
        return <StudentAcademics studentDetails={session.roleDetails} />;
      case 'student-sports':
        return <StudentSports studentDetails={session.roleDetails} />;
      case 'student-profile':
        return <StudentProfile profile={session.profile} />;

      default:
        return <div style={{ padding: '2rem' }}>Page not found</div>;
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!session) {
    return <Login onLoginSuccess={setSession} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <Sidebar 
        role={session.profile?.role} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Workspace Frame */}
      <div className="main-content">
        <Navbar 
          user={session.user} 
          profile={session.profile} 
          onLogout={handleLogout} 
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          toggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
