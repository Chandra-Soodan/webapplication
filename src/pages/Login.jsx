import React, { useState, useEffect } from 'react';
import { auth } from '../services/auth';
import { db } from '../services/db';
import { School, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export const Login = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student'); // student, faculty
  
  // Extra fields for signup
  const [departments, setDepartments] = useState([]);
  const [deptId, setDeptId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [year, setYear] = useState('1');
  const [section, setSection] = useState('A');
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await db.getDepartments();
        setDepartments(data);
        if (data.length > 0) setDeptId(data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const session = await auth.login(email, password);
        onLoginSuccess(session);
      } else {
        const additionalData = role === 'student' 
          ? { department_id: deptId, roll_number: rollNumber, year: parseInt(year), section, admission_year: new Date().getFullYear() }
          : role === 'faculty'
            ? { department_id: deptId, employee_id: employeeId, designation }
            : {};

        await auth.signup(email, password, name, role, additionalData);
        setSuccess('Signup successful! Please log in.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick login helper for demonstration
  const handleQuickLogin = async (mockEmail) => {
    setError('');
    setLoading(true);
    try {
      const session = await auth.login(mockEmail, 'password123');
      onLoginSuccess(session);
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: 'var(--bg-primary)',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <ThemeToggle />
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            marginBottom: '1rem'
          }}>
            <School size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>SmartEdu Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {isLogin ? 'Sign in to access your dashboard' : 'Create an account to get started'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            border: '1px solid rgba(239, 68, 68, 0.1)'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'var(--success-light)',
            color: 'var(--success)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            border: '1px solid rgba(16, 185, 129, 0.1)'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                required 
                className="form-control" 
                placeholder="e.g. John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              required 
              className="form-control" 
              placeholder="e.g. user@college.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              required 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">User Role</label>
                <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty Member</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {role !== 'admin' && (
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-control" value={deptId} onChange={e => setDeptId(e.target.value)}>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>[{d.code}] {d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {role === 'student' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Roll Number</label>
                      <input 
                        type="text" 
                        required 
                        className="form-control" 
                        placeholder="e.g. CSE2201"
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
                </>
              )}

              {role === 'faculty' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input 
                      type="text" 
                      required 
                      className="form-control" 
                      placeholder="e.g. FAC-CSE-003"
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
                      placeholder="e.g. Assistant Professor"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                    />
                  </div>
                </>
              )}
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', height: '44px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              fontWeight: '600', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>

        {/* Quick Demo Logins Section */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', textAlign: 'center' }}>
            Quick Demo Login Toggles
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '0.5rem 0.25rem' }} 
              onClick={() => handleQuickLogin('admin@college.edu')}
              disabled={loading}
            >
              Principal Admin
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '0.5rem 0.25rem' }} 
              onClick={() => handleQuickLogin('alan@college.edu')}
              disabled={loading}
            >
              Prof. Turing (Faculty)
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '0.5rem 0.25rem' }} 
              onClick={() => handleQuickLogin('john@college.edu')}
              disabled={loading}
            >
              John Doe (Student)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
