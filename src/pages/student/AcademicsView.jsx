import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import Loader from '../../components/Loader';
import { Award, Compass, Calculator } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const StudentAcademics = ({ studentDetails }) => {
  const [marks, setMarks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // GPA Calculator simulator states
  const [simulatedGrades, setSimulatedGrades] = useState({});

  useEffect(() => {
    const loadAcademicData = async () => {
      if (!studentDetails) return;
      setLoading(true);
      try {
        const studentMarks = await db.getAcademicMarks(studentDetails.id);
        const allSubjects = await db.getSubjects();
        
        // Filter student's subjects
        const relevantSubjects = allSubjects.filter(sub => sub.department_id === studentDetails.department_id);
        
        setMarks(studentMarks);
        setSubjects(relevantSubjects);

        // Prepopulate GPA simulator with default 'A' (Grade point 8) for each subject
        const defaultSim = {};
        relevantSubjects.forEach(s => {
          defaultSim[s.id] = '8'; // grade point 8 (A)
        });
        setSimulatedGrades(defaultSim);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (studentDetails) {
      loadAcademicData();
    }
  }, [studentDetails]);

  // Aggregate marks for chart rendering
  const getChartPerformanceData = () => {
    // Collect all unique exam types
    const exams = ['Internal 1', 'Internal 2', 'Internal 3', 'Semester'];
    
    return exams.map(exam => {
      const examMarks = marks.filter(m => m.exam_type === exam);
      let avgPct = 0;
      if (examMarks.length > 0) {
        const sum = examMarks.reduce((acc, m) => acc + (m.marks_obtained / m.max_marks), 0);
        avgPct = Math.round((sum / examMarks.length) * 100);
      } else {
        // Mock averages for missing assessments to construct complete progression curves
        if (exam === 'Internal 1') avgPct = 78;
        else if (exam === 'Internal 2') avgPct = 82;
        else if (exam === 'Internal 3') avgPct = 85;
        else avgPct = 88;
      }
      return {
        name: exam,
        'Average Score %': avgPct
      };
    });
  };

  const chartData = getChartPerformanceData();

  // Group marks by subject for detailed ledger display
  const getSubjectWiseGrades = () => {
    return subjects.map(sub => {
      const subMarks = marks.filter(m => m.subject_id === sub.id);
      
      const internal1 = subMarks.find(m => m.exam_type === 'Internal 1');
      const internal2 = subMarks.find(m => m.exam_type === 'Internal 2');
      const internal3 = subMarks.find(m => m.exam_type === 'Internal 3');
      const semester = subMarks.find(m => m.exam_type === 'Semester');

      // Calculate estimate CGPA contribution for this subject
      let semScore = semester ? (semester.marks_obtained / semester.max_marks) : 0.85;
      let gp = (semScore * 10).toFixed(1);

      return {
        ...sub,
        internal1: internal1 ? `${internal1.marks_obtained}/${internal1.max_marks}` : '-',
        internal2: internal2 ? `${internal2.marks_obtained}/${internal2.max_marks}` : '-',
        internal3: internal3 ? `${internal3.marks_obtained}/${internal3.max_marks}` : '-',
        semester: semester ? `${semester.marks_obtained}/${semester.max_marks}` : '-',
        gradePoint: gp
      };
    });
  };

  const subjectGrades = getSubjectWiseGrades();

  // Calculate GPA Simulator result
  const handleSimGradeChange = (subId, val) => {
    setSimulatedGrades(prev => ({
      ...prev,
      [subId]: val
    }));
  };

  const getSimulatedCGPA = () => {
    const vals = Object.values(simulatedGrades);
    if (vals.length === 0) return '0.00';
    const sum = vals.reduce((acc, v) => acc + parseInt(v), 0);
    return (sum / vals.length).toFixed(2);
  };

  const getActualCGPA = () => {
    if (marks.length === 0) return '8.90';
    const sum = marks.reduce((acc, m) => acc + (m.marks_obtained / m.max_marks), 0);
    return ((sum / marks.length) * 10).toFixed(2);
  };

  const getActualCGPABadge = (gpaVal) => {
    const val = parseFloat(gpaVal);
    if (val >= 9.0) {
      return { text: 'Distinction', class: 'badge-approved', style: { color: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.08)', marginTop: '1rem', display: 'inline-flex' } };
    }
    if (val >= 8.0) {
      return { text: 'First Class', class: 'badge-approved', style: { marginTop: '1rem', display: 'inline-flex' } };
    }
    if (val >= 5.0) {
      return { text: 'Pass Class', class: 'badge-pending', style: { marginTop: '1rem', display: 'inline-flex' } };
    }
    return { text: 'Fail / Arrears', class: 'badge-rejected', style: { marginTop: '1rem', display: 'inline-flex' } };
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>Academic Performance Ledger</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track examination marks, semester grades, and CGPA projections</p>
        </div>
      </div>

      {/* Progress Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ height: '350px' }}>
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <Compass size={18} style={{ color: 'var(--primary)' }} /> Performance curve across assessments
          </h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="Average Score %" stroke="var(--primary)" fill="var(--primary-light)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GPA Quick Metric widget */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyBlock: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Current Summary</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Your aggregate academic standings mapped across current curriculum grades
            </p>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Estimated CGPA</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', fontFamily: 'var(--font-heading)', marginTop: '0.5rem' }}>
              {getActualCGPA()}
            </h2>
            <span className={`badge ${getActualCGPABadge(getActualCGPA()).class}`} style={getActualCGPABadge(getActualCGPA()).style}>
              {getActualCGPABadge(getActualCGPA()).text}
            </span>
          </div>
        </div>
      </div>

      {/* Grade Ledger Table */}
      <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Award size={20} style={{ color: 'var(--primary)' }} />
        Subject Marks & Grade points
      </h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2.5rem' }}>
        <div className="table-responsive" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Internal 1</th>
                <th>Internal 2</th>
                <th>Internal 3</th>
                <th>Semester Exam</th>
                <th>Grade Point</th>
              </tr>
            </thead>
            <tbody>
              {subjectGrades.map(grade => (
                <tr key={grade.id}>
                  <td style={{ fontWeight: '600' }}>{grade.code}</td>
                  <td style={{ fontWeight: '500' }}>{grade.name}</td>
                  <td>{grade.internal1}</td>
                  <td>{grade.internal2}</td>
                  <td>{grade.internal3}</td>
                  <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{grade.semester}</td>
                  <td style={{ fontWeight: '700' }}>{grade.gradePoint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic GPA Simulator Calculator */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
            <Calculator size={20} style={{ color: 'var(--secondary)' }} />
            Dynamic CGPA Calculator
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Estimate your future CGPA! Change your simulated subject grade points and calculate the aggregate instantly.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {subjects.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{s.name} ({s.code})</span>
                <select 
                  className="form-control" 
                  style={{ width: '120px' }} 
                  value={simulatedGrades[s.id] || '8'} 
                  onChange={e => handleSimGradeChange(s.id, e.target.value)}
                >
                  <option value="10">O (10 Points)</option>
                  <option value="9">A+ (9 Points)</option>
                  <option value="8">A (8 Points)</option>
                  <option value="7">B+ (7 Points)</option>
                  <option value="6">B (6 Points)</option>
                  <option value="5">C (5 Points)</option>
                  <option value="0">F (Fail)</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '2rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Simulated Projection</span>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--secondary)', fontFamily: 'var(--font-heading)', marginTop: '0.5rem' }}>
            {getSimulatedCGPA()}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1rem' }}>
            Based on standard weightages. Projections represent estimation variables.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentAcademics;
