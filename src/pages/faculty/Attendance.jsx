import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import Loader from '../../components/Loader';
import { Check, Calendar, AlertCircle } from 'lucide-react';

export const FacultyAttendance = ({ facultyDetails }) => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // studentId -> status

  // Filters
  const [subjectId, setSubjectId] = useState('');
  const [year, setYear] = useState('3');
  const [section, setSection] = useState('A');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!facultyDetails) return;
      try {
        const allSubjects = await db.getSubjects();
        const deptSubjects = allSubjects.filter(s => s.department_id === facultyDetails.department_id);
        setSubjects(deptSubjects);
        if (deptSubjects.length > 0) setSubjectId(deptSubjects[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [facultyDetails]);

  const handleSearchRoster = async () => {
    if (!subjectId) return;
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      // 1. Fetch students matching Department, Year, Section
      const allStudents = await db.getStudents();
      const filteredStudents = allStudents.filter(s => 
        s.department_id === facultyDetails.department_id &&
        s.year === parseInt(year) &&
        s.section.toUpperCase() === section.toUpperCase()
      );
      setStudents(filteredStudents);

      // 2. Fetch existing attendance logs for this subject & date to pre-populate
      const logs = await db.getAttendance({ date, subject_id: subjectId });
      
      const prefilled = {};
      filteredStudents.forEach(student => {
        const existing = logs.find(l => l.student_id === student.id);
        prefilled[student.id] = existing ? existing.status : 'Present'; // default to Present if not marked
      });
      setAttendanceRecords(prefilled);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load roster.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId && facultyDetails) {
      handleSearchRoster();
    }
  }, [subjectId, year, section, date]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSelectAll = (status) => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceRecords(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (students.length === 0) return;
    
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const recordsToMark = students.map(student => ({
        student_id: student.id,
        subject_id: subjectId,
        date: date,
        status: attendanceRecords[student.id] || 'Present'
      }));

      await db.markAttendance(recordsToMark, facultyDetails.id);
      
      // Notify students of absences in mock environment
      recordsToMark.forEach(async (rec) => {
        if (rec.status === 'Absent') {
          const student = students.find(s => s.id === rec.student_id);
          const subject = subjects.find(s => s.id === rec.subject_id);
          if (student && subject) {
            await db.createNotification(
              student.profile_id,
              'Attendance Marked: Absent',
              `You were marked Absent for ${subject.name} (${subject.code}) on ${date}.`
            );
          }
        }
      });

      setMessage({ text: 'Attendance logged successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: err.message || 'Failed to submit attendance.', type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && subjects.length === 0) return <Loader />;

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>Mark Student Attendance</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Select criteria to view roster and log daily class statuses</p>
        </div>
      </div>

      {/* Roster Criteria Filters */}
      <div className="filters-panel">
        <div className="form-group" style={{ flex: 1.5 }}>
          <label className="form-label">Subject</label>
          <select className="form-control" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Year</label>
          <select className="form-control" value={year} onChange={e => setYear(e.target.value)}>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Section</label>
          <select className="form-control" value={section} onChange={e => setSection(e.target.value)}>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input 
            type="date" 
            className="form-control" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
          />
        </div>
      </div>

      {message.text && (
        <div style={{
          padding: '1rem',
          backgroundColor: message.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
          color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          borderRadius: '10px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Roster table / grid */}
      {loading ? (
        <Loader />
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Roster ({students.length} Students)</h3>
              {students.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleSelectAll('Present')}>
                    All Present
                  </button>
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleSelectAll('Absent')}>
                    All Absent
                  </button>
                </div>
              )}
            </div>

            {students.length === 0 ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Calendar size={48} style={{ marginBottom: '1rem', color: 'var(--border-color)' }} />
                <p>No students registered in Year {year} - Section {section} for your department.</p>
              </div>
            ) : (
              <div className="table-responsive" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status Selection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td style={{ fontWeight: '600' }}>{student.roll_number}</td>
                        <td style={{ fontWeight: '500' }}>{student.profiles?.name}</td>
                        <td>{student.profiles?.email}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {[
                              { label: 'Present', val: 'Present', class: 'badge-present' },
                              { label: 'Absent', val: 'Absent', class: 'badge-absent' },
                              { label: 'On Duty', val: 'On Duty', class: 'badge-od' }
                            ].map(opt => {
                              const isSelected = attendanceRecords[student.id] === opt.val;
                              return (
                                <button
                                  key={opt.val}
                                  type="button"
                                  className={`btn`}
                                  style={{
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.8rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: isSelected ? `var(--${opt.val === 'Present' ? 'success' : opt.val === 'Absent' ? 'danger' : 'secondary'})` : 'var(--bg-secondary)',
                                    color: isSelected ? '#ffffff' : 'var(--text-secondary)'
                                  }}
                                  onClick={() => handleStatusChange(student.id, opt.val)}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {students.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ padding: '0.75rem 2rem', height: '46px' }}
                disabled={submitting}
              >
                {submitting ? 'Saving roster...' : 'Submit Attendance'}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default FacultyAttendance;
