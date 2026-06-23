import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import { Plus, Edit2, Trash2, Search, GraduationCap } from 'lucide-react';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [deptId, setDeptId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [year, setYear] = useState('1');
  const [section, setSection] = useState('A');

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const studs = await db.getStudents();
      const depts = await db.getDepartments();
      setStudents(studs);
      setDepartments(depts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingStudent(null);
    setName('');
    setEmail('');
    setDeptId(departments[0]?.id || '');
    setRollNumber('');
    setYear('1');
    setSection('A');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setName(student.profiles?.name || '');
    setEmail(student.profiles?.email || '');
    setDeptId(student.department_id || '');
    setRollNumber(student.roll_number || '');
    setYear(student.year?.toString() || '1');
    setSection(student.section || 'A');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (editingStudent) {
        // Update Student
        await db.updateStudent(
          editingStudent.id,
          { department_id: deptId, roll_number: rollNumber, year: parseInt(year), section },
          { name, email }
        );
      } else {
        // Create Student
        const profileId = generateUUID();
        await db.createStudent(
          { department_id: deptId, roll_number: rollNumber, year: parseInt(year), section, admission_year: new Date().getFullYear() },
          { id: profileId, name, email }
        );
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student profile?")) {
      try {
        await db.deleteStudent(id);
        loadData();
      } catch (err) {
        alert(err.message || 'Failed to delete student.');
      }
    }
  };

  // Apply filters
  const filteredStudents = students.filter(student => {
    const studentName = student.profiles?.name || '';
    const studentRoll = student.roll_number || '';
    const matchesSearch = studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          studentRoll.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = deptFilter ? student.department_id === deptFilter : true;
    const matchesYear = yearFilter ? student.year === parseInt(yearFilter) : true;

    return matchesSearch && matchesDept && matchesYear;
  });

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>Student Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View, add, and manage college students</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="filters-panel">
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Search Students</label>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Department</label>
          <select className="form-control" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.code}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Year</label>
          <select className="form-control" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredStudents.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <GraduationCap size={48} style={{ marginBottom: '1rem', color: 'var(--border-color)' }} />
            <p>No students found matching the filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Year / Section</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{student.roll_number}</td>
                    <td style={{ fontWeight: '500' }}>{student.profiles?.name}</td>
                    <td>{student.profiles?.email}</td>
                    <td>{student.departments?.name} ({student.departments?.code})</td>
                    <td>Year {student.year} - Sec {student.section}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon" onClick={() => openEditModal(student)} title="Edit student">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon" onClick={() => handleDelete(student.id)} title="Delete student" style={{ color: 'var(--danger)' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Student Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingStudent ? "Edit Student Details" : "Register New Student"}
      >
        {formError && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              required 
              className="form-control" 
              placeholder="John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              required 
              className="form-control" 
              placeholder="john@college.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-control" value={deptId} onChange={e => setDeptId(e.target.value)}>
              {departments.map(d => (
                <option key={d.id} value={d.id}>[{d.code}] {d.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input 
                type="text" 
                required 
                className="form-control" 
                placeholder="CSE2201"
                value={rollNumber}
                onChange={e => setRollNumber(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Current Year</label>
              <select className="form-control" value={year} onChange={e => setYear(e.target.value)}>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Section</label>
            <input 
              type="text" 
              required 
              className="form-control" 
              placeholder="e.g. A"
              value={section}
              onChange={e => setSection(e.target.value.toUpperCase())}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={formLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Saving...' : 'Save Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStudents;
