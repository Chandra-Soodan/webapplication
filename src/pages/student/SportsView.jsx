import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import { Plus, Trophy, FileText, Check, Upload, Clock, ShieldAlert } from 'lucide-react';

export const StudentSports = ({ studentDetails }) => {
  const [activities, setActivities] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Form fields: Activity
  const [activityName, setActivityName] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [achievement, setAchievement] = useState('Participation');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  // Form fields: Certificate Upload
  const [certName, setCertName] = useState('');
  const [category, setCategory] = useState('Sports');
  const [selectedFile, setSelectedFile] = useState(null);

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const loadSportsData = async () => {
    if (!studentDetails) return;
    setLoading(true);
    try {
      const acts = await db.getSportsActivities(studentDetails.id);
      const certs = await db.getCertificates(studentDetails.id);
      setActivities(acts);
      setCertificates(certs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSportsData();
  }, [studentDetails]);

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await db.createSportsActivity({
        student_id: studentDetails.id,
        activity_name: activityName,
        tournament_name: tournamentName,
        date: date,
        achievement: achievement,
        description: description,
        certificate_url: ''
      });
      setIsActivityModalOpen(false);
      
      // Reset
      setActivityName('');
      setTournamentName('');
      setAchievement('Participation');
      setDescription('');

      loadSportsData();
    } catch (err) {
      setFormError(err.message || 'Failed to log sports activity.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFileUploadChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!certName) {
        setCertName(e.target.files[0].name.split('.')[0]); // Autofill name
      }
    }
  };

  const handleUploadCertificate = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setFormError('Please select a file to upload.');
      return;
    }

    setFormError('');
    setFormLoading(true);

    try {
      // Simulate file upload (create object URL or mock string)
      // If live Supabase storage is active, it would upload to Supabase bucket.
      const simulatedUrl = `https://supabase-sim.college.edu/storage/v1/object/public/certificates/${Date.now()}_${selectedFile.name}`;

      await db.uploadCertificate({
        student_id: studentDetails.id,
        name: certName,
        file_url: simulatedUrl,
        category: category
      });

      setIsUploadModalOpen(false);
      setCertName('');
      setSelectedFile(null);
      loadSportsData();
    } catch (err) {
      setFormError(err.message || 'Failed to submit certificate.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>Sports & Certificates Manager</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log athletic tournament achievements and submit certificates for administrative verification</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => { setFormError(''); setIsUploadModalOpen(true); }}>
            <Upload size={16} /> Upload Certificate
          </button>
          <button className="btn btn-primary" onClick={() => { setFormError(''); setIsActivityModalOpen(true); }}>
            <Plus size={16} /> Log Sports Activity
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        {/* Left column: Activities logs */}
        <div>
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={20} style={{ color: 'var(--warning)' }} />
            Tournament Participations
          </h3>

          {activities.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Trophy size={48} style={{ marginBottom: '1rem', color: 'var(--border-color)' }} />
              <p>No sports activities logged yet. Click "Log Sports Activity" to add one.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activities.map(act => (
                <div key={act.id} className="card" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{act.activity_name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', marginTop: '0.15rem' }}>
                        {act.tournament_name}
                      </p>
                    </div>
                    <span className="badge badge-approved" style={{ color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.08)', fontSize: '0.75rem' }}>
                      {act.achievement}
                    </span>
                  </div>

                  <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {act.description}
                  </p>

                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Tournament Date: {act.date}</span>
                    <span>Logged in System</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Certificates submissions */}
        <div>
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} style={{ color: 'var(--primary)' }} />
            Verification Center
          </h3>

          {certificates.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ marginBottom: '1rem', color: 'var(--border-color)' }} />
              <p>No certificates uploaded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {certificates.map(cert => {
                const statusClass = `badge-${cert.status.toLowerCase()}`;
                return (
                  <div key={cert.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="stat-icon-wrapper" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                          <a href={cert.file_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>{cert.name}</a>
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cert.category} • {cert.upload_date}</span>
                      </div>
                    </div>

                    <span className={`badge ${statusClass}`} style={{ display: 'inline-flex', gap: '0.25rem', fontSize: '0.7rem' }}>
                      {cert.status === 'Pending' && <Clock size={10} />}
                      {cert.status === 'Approved' && <Check size={10} />}
                      {cert.status === 'Rejected' && <ShieldAlert size={10} />}
                      {cert.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Log Activity Modal */}
      <Modal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} title="Log Sports Activity">
        {formError && <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</div>}
        
        <form onSubmit={handleCreateActivity}>
          <div className="form-group">
            <label className="form-label">Sport / Activity Title</label>
            <input type="text" placeholder="e.g. Basketball, Track 100m" required className="form-control" value={activityName} onChange={e => setActivityName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Tournament Name</label>
            <input type="text" placeholder="e.g. Annual Inter-College Meet 2026" required className="form-control" value={tournamentName} onChange={e => setTournamentName(e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Achievement Placement</label>
              <select className="form-control" value={achievement} onChange={e => setAchievement(e.target.value)}>
                <option value="Winner">Winner (1st Place)</option>
                <option value="Runner Up">Runner Up (2nd Place)</option>
                <option value="Third Place">Third Place (3rd Place)</option>
                <option value="Participation">Participation Only</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date Completed</label>
              <input type="date" required className="form-control" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Activity Description</label>
            <textarea rows="3" placeholder="Briefly describe the match results, goals scored, or rules played..." className="form-control" value={description} onChange={e => setDescription(e.target.value)} style={{ resize: 'none' }}></textarea>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsActivityModalOpen(false)} disabled={formLoading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>Log Achievement</button>
          </div>
        </form>
      </Modal>

      {/* Upload Certificate Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Credentials Certificate">
        {formError && <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</div>}
        
        <form onSubmit={handleUploadCertificate}>
          <div className="form-group">
            <label className="form-label">Document Name</label>
            <input type="text" placeholder="e.g. Football Finals Certificate" required className="form-control" value={certName} onChange={e => setCertName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Credentials Category</label>
            <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Sports">Sports Achievement</option>
              <option value="Academic">Academic Achievement</option>
              <option value="Other">Other Certificate</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Upload File (PDF, Image)</label>
            <input type="file" required accept=".pdf, image/*" className="form-control" onChange={handleFileUploadChange} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Select your credentials certificate. Maximum size 5MB.</span>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0 0', borderTop: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsUploadModalOpen(false)} disabled={formLoading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>Submit Document</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentSports;
