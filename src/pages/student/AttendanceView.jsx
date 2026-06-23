import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import Loader from '../../components/Loader';
import { Calendar, Filter, FileText } from 'lucide-react';

export const StudentAttendance = ({ studentDetails }) => {
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const loadAttendanceData = async () => {
      if (!studentDetails) return;
      setLoading(true);
      try {
        const logs = await db.getStudentAttendanceSummary(studentDetails.id);
        const allSubjects = await db.getSubjects();
        
        // Filter subjects that belong to the student's department and semester (mock sem: 5)
        const relevantSubjects = allSubjects.filter(sub => sub.department_id === studentDetails.department_id);
        
        setAttendance(logs);
        setSubjects(relevantSubjects);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (studentDetails) {
      loadAttendanceData();
    }
  }, [studentDetails]);

  // Aggregate metrics per subject
  const getSubjectAttendanceStats = () => {
    return subjects.map(sub => {
      const logs = attendance.filter(a => a.subject_id === sub.id);
      const total = logs.length;
      const present = logs.filter(a => a.status === 'Present' || a.status === 'On Duty').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      return {
        ...sub,
        total,
        present,
        percentage
      };
    });
  };

  const subjectStats = getSubjectAttendanceStats();

  const filteredLogs = attendance.filter(log => {
    const matchesSub = subjectFilter ? log.subject_id === subjectFilter : true;
    const matchesStatus = statusFilter ? log.status === statusFilter : true;
    return matchesSub && matchesStatus;
  });

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>My Attendance Record</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View your class attendance averages and logs</p>
        </div>
      </div>

      {/* Grid of Subject Averages with progress indicators */}
      <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileText size={20} style={{ color: 'var(--primary)' }} />
        Subject Wise Performance
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {subjectStats.map(stat => {
          const isLow = stat.percentage < 75 && stat.total > 0;
          return (
            <div key={stat.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyBlock: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{stat.name}</h4>
                  <span className="badge badge-role" style={{ fontSize: '0.65rem' }}>{stat.code}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {stat.present} attended out of {stat.total} classes
                </p>
              </div>

              <div>
                {/* Progress bar container */}
                <div style={{
                  height: '8px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    width: `${stat.total > 0 ? stat.percentage : 75}%`, // mock display minimum if no logs
                    height: '100%',
                    backgroundColor: isLow ? 'var(--danger)' : 'var(--success)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Attendance Rate:</span>
                  <span style={{ fontWeight: '750', color: isLow ? 'var(--danger)' : 'var(--success)' }}>
                    {stat.total > 0 ? `${stat.percentage}%` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Logs list */}
      <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calendar size={20} style={{ color: 'var(--secondary)' }} />
        Daily Attendance History
      </h3>

      <div className="filters-panel">
        <div className="form-group" style={{ flex: 1.5 }}>
          <label className="form-label">Filter Subject</label>
          <select className="form-control" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Filter Status</label>
          <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="On Duty">On Duty</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredLogs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No attendance entries logged.</p>
        ) : (
          <div className="table-responsive" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject Code</th>
                  <th>Subject Title</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: '600' }}>{log.date}</td>
                    <td>
                      <span className="badge badge-role" style={{ fontSize: '0.65rem' }}>{log.subjects?.code}</span>
                    </td>
                    <td style={{ fontWeight: '500' }}>{log.subjects?.name}</td>
                    <td>
                      <span className={`badge ${log.status === 'On Duty' ? 'badge-od' : `badge-${log.status.toLowerCase()}`}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
