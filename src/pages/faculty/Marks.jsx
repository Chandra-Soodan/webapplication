import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import Loader from '../../components/Loader';
import { Check, Award, AlertCircle } from 'lucide-react';

export const FacultyMarks = ({ facultyDetails }) => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksState, setMarksState] = useState({}); // studentId -> { obtained: '', max: '100' }

  // Filters
  const [subjectId, setSubjectId] = useState('');
  const [year, setYear] = useState('3');
  const [section, setSection] = useState('A');
  const [examType, setExamType] = useState('Internal 1');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const loadSubjects = async () => {
      if (!facultyDetails) return;
      try {
        const allSubjects = await db.getSubjects();
        const deptSubs = allSubjects.filter(s => s.department_id === facultyDetails.department_id);
        setSubjects(deptSubs);
        if (deptSubs.length > 0) setSubjectId(deptSubs[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSubjects();
  }, [facultyDetails]);

  const loadStudentGrades = async () => {
    if (!subjectId) return;
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      // 1. Get student list
      const allStudents = await db.getStudents();
      const filtered = allStudents.filter(s => 
        s.department_id === facultyDetails.department_id &&
        s.year === parseInt(year) &&
        s.section.toUpperCase() === section.toUpperCase()
      );
      setStudents(filtered);

      // 2. Fetch existing marks for this subject & exam type
      const marksData = await db.getAcademicMarks();
      const loadedMarks = {};
      
      filtered.forEach(student => {
        const matched = marksData.find(m => 
          m.student_id === student.id &&
          m.subject_id === subjectId &&
          m.exam_type === examType
        );
        loadedMarks[student.id] = {
          obtained: matched ? matched.marks_obtained.toString() : '',
          max: matched ? matched.max_marks.toString() : (examType.startsWith('Internal') ? '25' : '100')
        };
      });

      setMarksState(loadedMarks);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load grade records.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId && facultyDetails) {
      loadStudentGrades();
    }
  }, [subjectId, year, section, examType]);

  const handleMarkChange = (studentId, field, val) => {
    setMarksState(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val
      }
    }));
  };

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    if (students.length === 0) return;

    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      for (const student of students) {
        const entry = marksState[student.id];
        if (entry && entry.obtained !== '') {
          const obtainedVal = parseFloat(entry.obtained);
          const maxVal = parseFloat(entry.max);

          if (isNaN(obtainedVal) || isNaN(maxVal)) {
            throw new Error(`Invalid marks input for ${student.profiles?.name}`);
          }
          if (obtainedVal > maxVal) {
            throw new Error(`Marks obtained cannot exceed max marks for ${student.profiles?.name}`);
          }

          await db.updateAcademicMark({
            student_id: student.id,
            subject_id: subjectId,
            exam_type: examType,
            marks_obtained: obtainedVal,
            max_marks: maxVal
          });
        }
      }

      setMessage({ text: 'Academic marks updated successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: err.message || 'Failed to save marks.', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  if (loading && subjects.length === 0) return <Loader />;

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>Academic Marks Ledger</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log and modify evaluation grades for classroom tests</p>
        </div>
      </div>

      {/* Roster Filters */}
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
          <label className="form-label">Exam Type</label>
          <select className="form-control" value={examType} onChange={e => setExamType(e.target.value)}>
            <option value="Internal 1">Internal Test 1</option>
            <option value="Internal 2">Internal Test 2</option>
            <option value="Internal 3">Internal Test 3</option>
            <option value="Semester">Semester Exam</option>
          </select>
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

      {loading ? (
        <Loader />
      ) : (
        <form onSubmit={handleSaveMarks}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Grade Logs ({students.length} Students)</h3>
            </div>

            {students.length === 0 ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Award size={48} style={{ marginBottom: '1rem', color: 'var(--border-color)' }} />
                <p>No students registered in Year {year} - Section {section} for your department.</p>
              </div>
            ) : (
              <div className="table-responsive" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Name</th>
                      <th style={{ width: '180px' }}>Marks Obtained</th>
                      <th style={{ width: '180px' }}>Max Marks</th>
                      <th>Completion Indicator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const rec = marksState[student.id] || { obtained: '', max: '25' };
                      const isComplete = rec.obtained !== '';
                      return (
                        <tr key={student.id}>
                          <td style={{ fontWeight: '600' }}>{student.roll_number}</td>
                          <td style={{ fontWeight: '500' }}>{student.profiles?.name}</td>
                          <td>
                            <input
                              type="number"
                              step="0.5"
                              className="form-control"
                              style={{ width: '120px' }}
                              placeholder="e.g. 21"
                              value={rec.obtained}
                              onChange={e => handleMarkChange(student.id, 'obtained', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              style={{ width: '120px' }}
                              placeholder="e.g. 25"
                              value={rec.max}
                              onChange={e => handleMarkChange(student.id, 'max', e.target.value)}
                            />
                          </td>
                          <td>
                            {isComplete ? (
                              <span className="badge badge-present" style={{ fontSize: '0.7rem' }}>Logged</span>
                            ) : (
                              <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
                disabled={saving}
              >
                {saving ? 'Saving grades...' : 'Save Marks'}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default FacultyMarks;
