import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import { Plus, Trash2, Building, BookOpen } from 'lucide-react';

export const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  // Form fields
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');

  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subDeptId, setSubDeptId] = useState('');
  const [subSem, setSubSem] = useState('1');

  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const depts = await db.getDepartments();
      const subs = await db.getSubjects();
      setDepartments(depts);
      setSubjects(subs);
      if (depts.length > 0) setSubDeptId(depts[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);
    try {
      await db.createDepartment({ name: deptName, code: deptCode.toUpperCase() });
      setDeptName('');
      setDeptCode('');
      setIsDeptModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Error creating department.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateSub = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);
    try {
      await db.createSubject({ 
        name: subName, 
        code: subCode.toUpperCase(), 
        department_id: subDeptId, 
        semester: parseInt(subSem) 
      });
      setSubName('');
      setSubCode('');
      setIsSubModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Error creating subject.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteDept = async (id) => {
    if (window.confirm("Are you sure you want to delete this department? This might affect linked students and faculty.")) {
      try {
        await db.deleteDepartment(id);
        loadData();
      } catch (err) {
        alert(err.message || 'Failed to delete department.');
      }
    }
  };

  const handleDeleteSub = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await db.deleteSubject(id);
        loadData();
      } catch (err) {
        alert(err.message || 'Failed to delete subject.');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>Academic Structures</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage college departments and subject curricula</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        {/* Left Column: Departments */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
              <Building size={20} style={{ color: 'var(--primary)' }} />
              Departments
            </h3>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => { setError(''); setIsDeptModalOpen(true); }}>
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="card" style={{ padding: '1rem' }}>
            {departments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No departments defined yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {departments.map(d => (
                  <div key={d.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <span style={{ fontWeight: '700', color: 'var(--primary)', marginRight: '0.5rem' }}>{d.code}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{d.name}</span>
                    </div>
                    <button className="btn-icon" onClick={() => handleDeleteDept(d.id)} style={{ color: 'var(--danger)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Subjects */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
              <BookOpen size={20} style={{ color: 'var(--secondary)' }} />
              Subject Curriculum
            </h3>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => { setError(''); setIsSubModalOpen(true); }} disabled={departments.length === 0}>
              <Plus size={14} /> Add Subject
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {subjects.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No subjects added to curriculum.</p>
            ) : (
              <div className="table-responsive" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Subject Name</th>
                      <th>Dept</th>
                      <th>Sem</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(sub => (
                      <tr key={sub.id}>
                        <td style={{ fontWeight: '600' }}>{sub.code}</td>
                        <td style={{ fontWeight: '500' }}>{sub.name}</td>
                        <td>
                          <span className="badge badge-role" style={{ fontSize: '0.65rem' }}>{sub.departments?.code}</span>
                        </td>
                        <td>Sem {sub.semester}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn-icon" onClick={() => handleDeleteSub(sub.id)} style={{ color: 'var(--danger)' }}>
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
        </div>
      </div>

      {/* Add Dept Modal */}
      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title="Create Department">
        {error && <div style={{ color: 'var(--danger)', padding: '0.5rem 0', fontSize: '0.85rem' }}>{error}</div>}
        <form onSubmit={handleCreateDept}>
          <div className="form-group">
            <label className="form-label">Department Code</label>
            <input type="text" placeholder="e.g. CSE" required className="form-control" value={deptCode} onChange={e => setDeptCode(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Department Name</label>
            <input type="text" placeholder="e.g. Computer Science & Eng" required className="form-control" value={deptName} onChange={e => setDeptName(e.target.value)} />
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDeptModalOpen(false)} disabled={formLoading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>Create</button>
          </div>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} title="Add Subject">
        {error && <div style={{ color: 'var(--danger)', padding: '0.5rem 0', fontSize: '0.85rem' }}>{error}</div>}
        <form onSubmit={handleCreateSub}>
          <div className="form-group">
            <label className="form-label">Subject Code</label>
            <input type="text" placeholder="e.g. CSE301" required className="form-control" value={subCode} onChange={e => setSubCode(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Subject Name</label>
            <input type="text" placeholder="e.g. Data Structures" required className="form-control" value={subName} onChange={e => setSubName(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-control" value={subDeptId} onChange={e => setSubDeptId(e.target.value)}>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <select className="form-control" value={subSem} onChange={e => setSubSem(e.target.value)}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s.toString()}>Sem {s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSubModalOpen(false)} disabled={formLoading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>Add Subject</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDepartments;
