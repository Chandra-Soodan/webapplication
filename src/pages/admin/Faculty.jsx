import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import { Plus, Edit2, Trash2, Search, Users } from 'lucide-react';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const AdminFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [deptId, setDeptId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const facs = await db.getFaculty();
      const depts = await db.getDepartments();
      setFaculty(facs);
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
    setEditingFaculty(null);
    setName('');
    setEmail('');
    setDeptId(departments[0]?.id || '');
    setEmployeeId('');
    setDesignation('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (fac) => {
    setEditingFaculty(fac);
    setName(fac.profiles?.name || '');
    setEmail(fac.profiles?.email || '');
    setDeptId(fac.department_id || '');
    setEmployeeId(fac.employee_id || '');
    setDesignation(fac.designation || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (editingFaculty) {
        // Update Faculty
        await db.updateFaculty(
          editingFaculty.id,
          { department_id: deptId, employee_id: employeeId, designation },
          { name, email }
        );
      } else {
        // Create Faculty
        const profileId = generateUUID();
        await db.createFaculty(
          { department_id: deptId, employee_id: employeeId, designation },
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
    if (window.confirm("Are you sure you want to delete this faculty member?")) {
      try {
        await db.deleteFaculty(id);
        loadData();
      } catch (err) {
        alert(err.message || 'Failed to delete faculty member.');
      }
    }
  };

  const filteredFaculty = faculty.filter(fac => {
    const facName = fac.profiles?.name || '';
    const facEmpId = fac.employee_id || '';
    const matchesSearch = facName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          facEmpId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = deptFilter ? fac.department_id === deptFilter : true;

    return matchesSearch && matchesDept;
  });

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>Faculty Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage profiles and assignments for college professors</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Add Faculty
        </button>
      </div>

      {/* Filters */}
      <div className="filters-panel">
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Search Faculty</label>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by name or employee ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Department Filter</label>
          <select className="form-control" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.code}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredFaculty.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ marginBottom: '1rem', color: 'var(--border-color)' }} />
            <p>No faculty members found matching filters.</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.map(fac => (
                  <tr key={fac.id}>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{fac.employee_id}</td>
                    <td style={{ fontWeight: '500' }}>{fac.profiles?.name}</td>
                    <td>{fac.profiles?.email}</td>
                    <td>{fac.departments?.name} ({fac.departments?.code})</td>
                    <td>{fac.designation}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon" onClick={() => openEditModal(fac)} title="Edit faculty">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon" onClick={() => handleDelete(fac.id)} title="Delete faculty" style={{ color: 'var(--danger)' }}>
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

      {/* Add/Edit Faculty Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingFaculty ? "Edit Faculty Details" : "Register New Faculty"}
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
              placeholder="Prof. Alan Turing"
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
              placeholder="alan@college.edu"
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

          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <input 
              type="text" 
              required 
              className="form-control" 
              placeholder="FAC-CSE-001"
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Designation</label>
            <input 
              type="text" 
              required 
              className="form-control" 
              placeholder="e.g. Associate Professor"
              value={designation}
              onChange={e => setDesignation(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={formLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Saving...' : 'Save Faculty'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminFaculty;
