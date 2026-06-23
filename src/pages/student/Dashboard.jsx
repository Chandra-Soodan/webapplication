import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import Loader from '../../components/Loader';
import StatCard from '../../components/StatCard';
import { Calendar, Award, Trophy, Bell, ShieldAlert } from 'lucide-react';

export const StudentDashboard = ({ studentDetails, profile }) => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [summary, setSummary] = useState({
    attendancePct: 0,
    cgpa: '0.00',
    sportsCount: 0,
    totalClasses: 0
  });
  const [recentMarks, setRecentMarks] = useState([]);

  useEffect(() => {
    const loadStudentSummary = async () => {
      if (!studentDetails) return;
      setLoading(true);
      try {
        const depts = await db.getDepartments();
        setDepartments(depts);

        // 1. Attendance percentage
        const attLogs = await db.getStudentAttendanceSummary(studentDetails.id);
        const total = attLogs.length;
        const present = attLogs.filter(a => a.status === 'Present' || a.status === 'On Duty').length;
        const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;

        // 2. CGPA
        const marks = await db.getAcademicMarks(studentDetails.id);
        let cgpa = '0.00';
        if (marks.length > 0) {
          const sum = marks.reduce((acc, m) => acc + (m.marks_obtained / m.max_marks), 0);
          cgpa = ((sum / marks.length) * 10).toFixed(2);
        } else {
          cgpa = '8.90'; // default mockup
        }

        // 3. Sports
        const sports = await db.getSportsActivities(studentDetails.id);

        setSummary({
          attendancePct,
          cgpa,
          sportsCount: sports.length,
          totalClasses: total
        });

        // 4. Sort marks for recent evaluations
        const recent = marks.slice(-3).reverse();
        setRecentMarks(recent);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (studentDetails) {
      loadStudentSummary();
    }
  }, [studentDetails]);

  if (loading) return <Loader />;

  const isAttendanceLow = summary.totalClasses > 0 && summary.attendancePct < 75;

  const dept = departments.find(d => d.id === studentDetails?.department_id);
  const deptCode = dept ? dept.code : 'CSE';
  const semester = studentDetails ? studentDetails.year * 2 - 1 : 5;

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--secondary) 0%, #0284c7 100%)',
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
          Roll Number: {studentDetails?.roll_number} • {deptCode} Sem {semester} • Sec {studentDetails?.section}
        </p>
      </div>

      {isAttendanceLow && (
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          fontWeight: '550'
        }}>
          <ShieldAlert size={20} style={{ flexShrink: 0 }} />
          <span>Attendance Warning: Your aggregate attendance is {summary.attendancePct}%, which falls below the mandatory 75% requirement.</span>
        </div>
      )}

      {/* Metrics widgets */}
      <div className="stat-card-grid">
        <StatCard 
          title="Attendance Rate" 
          value={`${summary.attendancePct}%`} 
          icon={<Calendar size={24} />} 
          color={isAttendanceLow ? 'var(--danger)' : 'var(--success)'} 
          lightColor={isAttendanceLow ? 'var(--danger-light)' : 'var(--success-light)'} 
        />
        <StatCard 
          title="Cumulative CGPA" 
          value={summary.cgpa} 
          icon={<Award size={24} />} 
          color="var(--primary)" 
          lightColor="var(--primary-light)" 
        />
        <StatCard 
          title="Sports Participations" 
          value={summary.sportsCount} 
          icon={<Trophy size={24} />} 
          color="#a855f7" 
          lightColor="rgba(168, 85, 247, 0.08)" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        {/* Recent marks */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} style={{ color: 'var(--primary)' }} />
            Recent Test Grades
          </h3>
          {recentMarks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>No academic marks logged yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentMarks.map(m => {
                const pct = Math.round((m.marks_obtained / m.max_marks) * 100);
                return (
                  <div key={m.id} style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem' }}>{m.subjects?.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{m.exam_type}</span>
                    </div>
                    <div style={{ textItems: 'right' }}>
                      <span style={{ fontWeight: '750', color: 'var(--primary)' }}>{m.marks_obtained}/{m.max_marks}</span>
                      <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--text-secondary)' }}>Score: {pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info widgets */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={20} style={{ color: 'var(--warning)' }} />
              Quick Academic Notices
            </h3>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>Semester End examination registration starts from June 25, 2026.</li>
              <li>Ensure all sports certificates are submitted for evaluation by June 30.</li>
              <li>Students with less than 75% attendance must contact HOD immediately.</li>
            </ul>
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            College Administration Office
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
