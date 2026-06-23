import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import Loader from '../../components/Loader';
import { Search as SearchIcon, User, Calendar, Award, Trophy, ArrowLeft, Mail } from 'lucide-react';

export const FacultySearch = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Student specific details
  const [studAttendance, setStudAttendance] = useState([]);
  const [studMarks, setStudMarks] = useState([]);
  const [studSports, setStudSports] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await db.getStudents();
        setStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setDetailsLoading(true);
    try {
      const att = await db.getStudentAttendanceSummary(student.id);
      const marks = await db.getAcademicMarks(student.id);
      const sports = await db.getSportsActivities(student.id);

      setStudAttendance(att);
      setStudMarks(marks);
      setStudSports(sports);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getFilteredStudents = () => {
    if (!searchQuery.trim()) return [];
    return students.filter(s => 
      (s.profiles?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roll_number || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Group attendance by subject
  const getSubjectAttendanceList = () => {
    const subjectsMap = {};
    studAttendance.forEach(att => {
      const subId = att.subject_id;
      const subName = att.subjects?.name || 'Unknown';
      const subCode = att.subjects?.code || 'N/A';
      
      if (!subjectsMap[subId]) {
        subjectsMap[subId] = { name: subName, code: subCode, total: 0, present: 0 };
      }
      subjectsMap[subId].total++;
      if (att.status === 'Present' || att.status === 'On Duty') {
        subjectsMap[subId].present++;
      }
    });

    return Object.values(subjectsMap).map(s => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
    }));
  };

  const subjectAttendance = getSubjectAttendanceList();
  
  // Calculate dynamic GPA
  const getCalculatedGPA = () => {
    if (studMarks.length === 0) return '8.50 (Est.)';
    const sum = studMarks.reduce((acc, m) => acc + (m.marks_obtained / m.max_marks), 0);
    return ((sum / studMarks.length) * 10).toFixed(2);
  };

  const filtered = getFilteredStudents();

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      {selectedStudent ? (
        /* Detailed Student Diagnostics View */
        <div>
          <button 
            className="btn btn-secondary" 
            style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            onClick={() => setSelectedStudent(null)}
          >
            <ArrowLeft size={16} /> Back to Search
          </button>

          {detailsLoading ? <Loader /> : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              {/* Profile Card & Stats summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', borderRadius: '50%', marginBottom: '1rem' }}>
                    {selectedStudent.profiles?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                  </div>
                  <h2 style={{ fontSize: '1.25rem' }}>{selectedStudent.profiles?.name}</h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '0.15rem' }}>
                    Roll No: {selectedStudent.roll_number}
                  </span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'left', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Department:</span>
                      <span style={{ fontWeight: '600' }}>{selectedStudent.departments?.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Class Section:</span>
                      <span style={{ fontWeight: '600' }}>Year {selectedStudent.year} - Sec {selectedStudent.section}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                      <a href={`mailto:${selectedStudent.profiles?.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>
                        <Mail size={12} /> Email
                      </a>
                    </div>
                  </div>
                </div>

                {/* Score Summary */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={18} style={{ color: 'var(--primary)' }} /> Academic Summary
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Calculated CGPA</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '850', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                      {getCalculatedGPA()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed logs Tabs/Accordion */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Attendance details */}
                <div className="card">
                  <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={20} style={{ color: 'var(--success)' }} />
                    Subject Attendance Statistics
                  </h3>
                  {subjectAttendance.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No attendance logs registered.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {subjectAttendance.map(sub => (
                        <div key={sub.code} style={{
                          padding: '1rem',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <h4 style={{ fontSize: '0.9rem' }}>{sub.name}</h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.code}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{sub.present}/{sub.total} classes</span>
                            <span 
                              style={{ fontWeight: '750', fontSize: '1rem', color: sub.percentage < 75 ? 'var(--danger)' : 'var(--success)' }}
                            >
                              {sub.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grade book details */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={20} style={{ color: 'var(--primary)' }} />
                      Evaluations & Grades
                    </h3>
                  </div>

                  {studMarks.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No evaluations logged.</p>
                  ) : (
                    <div className="table-responsive" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Exam Type</th>
                            <th>Marks Obtained</th>
                            <th>Max Marks</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studMarks.map(mark => {
                            const pct = Math.round((mark.marks_obtained / mark.max_marks) * 100);
                            return (
                              <tr key={mark.id}>
                                <td style={{ fontWeight: '600' }}>{mark.subjects?.name} ({mark.subjects?.code})</td>
                                <td>{mark.exam_type}</td>
                                <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{mark.marks_obtained}</td>
                                <td>{mark.max_marks}</td>
                                <td style={{ fontWeight: '700', color: pct < 40 ? 'var(--danger)' : 'var(--text-primary)' }}>{pct}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Sports logs */}
                <div className="card">
                  <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={20} style={{ color: 'var(--warning)' }} />
                    Sports Activities & Achievements
                  </h3>

                  {studSports.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No sports participations logged.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {studSports.map(activity => (
                        <div key={activity.id} style={{
                          padding: '1rem',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h4 style={{ fontSize: '0.95rem' }}>{activity.activity_name} ({activity.tournament_name})</h4>
                            <span className="badge badge-approved" style={{ color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.08)' }}>{activity.achievement}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activity.description}</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>Date: {activity.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Student search listing view */
        <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              marginBottom: '1rem'
            }}>
              <User size={28} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: '750' }}>Analyze Students</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Lookup full student dossiers across Attendance, Academics, and Sports</p>
          </div>

          <div style={{ position: 'relative', marginBottom: '2rem' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Type student name or roll number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '3rem', height: '48px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}
            />
            <SearchIcon size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {searchQuery.trim() && (
            <div className="card" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No students found matching your query
                </div>
              ) : (
                filtered.map(student => (
                  <button
                    key={student.id}
                    className="sidebar-link"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '8px'
                    }}
                    onClick={() => handleSelectStudent(student)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600' }}>{student.profiles?.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Roll: {student.roll_number} • Sem {student.year * 2 - 1}</span>
                    </div>
                    <span className="badge badge-role" style={{ fontSize: '0.65rem' }}>{student.departments?.code}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacultySearch;
