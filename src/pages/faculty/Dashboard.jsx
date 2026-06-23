import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import Loader from '../../components/Loader';
import StatCard from '../../components/StatCard';
import { GraduationCap, BookOpen, Clock, Calendar, CheckSquare } from 'lucide-react';

export const FacultyDashboard = ({ facultyDetails, profile }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    deptStudents: 0,
    deptSubjects: 0,
    pendingAttendance: 2
  });
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const loadFacultyData = async () => {
      setLoading(true);
      try {
        const students = await db.getStudents();
        const allSubjects = await db.getSubjects();
        
        // Filter by faculty department
        const deptStudents = students.filter(s => s.department_id === facultyDetails?.department_id).length;
        const deptSubjects = allSubjects.filter(sub => sub.department_id === facultyDetails?.department_id);
        
        setStats({
          deptStudents,
          deptSubjects: deptSubjects.length,
          pendingAttendance: 1
        });
        setSubjects(deptSubjects);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (facultyDetails) {
      loadFacultyData();
    }
  }, [facultyDetails]);

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)',
        color: '#ffffff',
        padding: '2.5rem',
        marginBottom: '2rem',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <h1 style={{ color: '#ffffff', fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>
          Welcome back, {profile?.name}!
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.5rem', fontSize: '1rem', fontWeight: '500' }}>
          {facultyDetails?.designation} • Faculty Portal
        </p>
      </div>

      {/* Quick Metrics */}
      <div className="stat-card-grid">
        <StatCard 
          title="Students in Department" 
          value={stats.deptStudents} 
          icon={<GraduationCap size={24} />} 
          color="var(--primary)" 
          lightColor="var(--primary-light)" 
        />
        <StatCard 
          title="Subjects Configured" 
          value={stats.deptSubjects} 
          icon={<BookOpen size={24} />} 
          color="var(--secondary)" 
          lightColor="var(--secondary-light)" 
        />
        <StatCard 
          title="Pending Attendance" 
          value={stats.pendingAttendance} 
          icon={<CheckSquare size={24} />} 
          color="var(--warning)" 
          lightColor="var(--warning-light)" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        {/* Subjects list */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} style={{ color: 'var(--primary)' }} />
            Your Departmental Subjects
          </h3>
          {subjects.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No subjects assigned to your department.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {subjects.map(sub => (
                <div key={sub.id} style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>{sub.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{sub.code}</span>
                  </div>
                  <span className="badge badge-role" style={{ fontSize: '0.7rem' }}>Semester {sub.semester}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} style={{ color: 'var(--secondary)' }} />
            Today's Schedule
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              padding: '1rem',
              borderLeft: '4px solid var(--primary)',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '0 8px 8px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>09:30 AM - 10:30 AM</span>
                <h4 style={{ fontSize: '0.95rem', marginTop: '0.15rem' }}>Data Structures (Sem 5)</h4>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Room 302</span>
            </div>

            <div style={{
              padding: '1rem',
              borderLeft: '4px solid var(--secondary)',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '0 8px 8px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--secondary)' }}>11:30 AM - 12:30 PM</span>
                <h4 style={{ fontSize: '0.95rem', marginTop: '0.15rem' }}>Database Systems Lab (Sem 5)</h4>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lab 3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
