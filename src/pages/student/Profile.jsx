import React, { useState } from 'react';
import { auth } from '../../services/auth';
import Loader from '../../components/Loader';
import { User, Check, AlertCircle } from 'lucide-react';

export const StudentProfile = ({ profile }) => {
  const [name, setName] = useState(profile?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await auth.updateProfile(profile.id, {
        name,
        avatar_url: avatarUrl
      });
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: err.message || 'Failed to update profile.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>Edit Profile Details</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your personal details and settings</p>
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

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div className="avatar" style={{ width: '90px', height: '90px', fontSize: '2.25rem', borderRadius: '50%', marginBottom: '1rem' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="avatar" style={{ width: '100%', height: '100%', border: 'none' }} />
              ) : (
                name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
              )}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role Account: {profile?.role?.toUpperCase()}</span>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read Only)</label>
            <input 
              type="text" 
              className="form-control" 
              value={profile?.email || ''} 
              disabled 
              style={{ backgroundColor: 'var(--bg-primary)', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              required
              className="form-control" 
              value={name} 
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Profile Avatar Image Link (URL)</label>
            <input 
              type="url" 
              className="form-control" 
              placeholder="https://example.com/photo.jpg"
              value={avatarUrl} 
              onChange={e => setAvatarUrl(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', height: '44px', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
