import { supabase, isSupabaseConfigured } from './supabase';
import {
  mockDepartments,
  mockProfiles,
  mockFaculty,
  mockStudents,
  mockSubjects,
  mockAttendance,
  mockAcademicMarks,
  mockSportsActivities,
  mockCertificates,
  mockNotifications
} from './mockData';

// Initialize LocalStorage if empty
const initLocalStorage = () => {
  if (!localStorage.getItem('sm_initialized')) {
    localStorage.setItem('sm_departments', JSON.stringify(mockDepartments));
    localStorage.setItem('sm_profiles', JSON.stringify(mockProfiles));
    localStorage.setItem('sm_faculty', JSON.stringify(mockFaculty));
    localStorage.setItem('sm_students', JSON.stringify(mockStudents));
    localStorage.setItem('sm_subjects', JSON.stringify(mockSubjects));
    localStorage.setItem('sm_attendance', JSON.stringify(mockAttendance));
    localStorage.setItem('sm_academic_marks', JSON.stringify(mockAcademicMarks));
    localStorage.setItem('sm_sports_activities', JSON.stringify(mockSportsActivities));
    localStorage.setItem('sm_certificates', JSON.stringify(mockCertificates));
    localStorage.setItem('sm_notifications', JSON.stringify(mockNotifications));
    localStorage.setItem('sm_initialized', 'true');
  }
};

initLocalStorage();

// Helper helper functions to read/write mock database
const getStorageItem = (key) => JSON.parse(localStorage.getItem(key));
const setStorageItem = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Unified DB Service
export const db = {
  // ==========================================
  // DEPARTMENTS
  // ==========================================
  async getDepartments() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('departments').select('*').order('name');
      if (error) throw error;
      return data;
    } else {
      return getStorageItem('sm_departments');
    }
  },

  async createDepartment(dept) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('departments').insert([dept]).select().single();
      if (error) throw error;
      return data;
    } else {
      const depts = getStorageItem('sm_departments');
      const newDept = { id: 'dept-' + Math.random().toString(36).substr(2, 9), ...dept, created_at: new Date().toISOString() };
      depts.push(newDept);
      setStorageItem('sm_departments', depts);
      return newDept;
    }
  },

  async updateDepartment(id, deptUpdate) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('departments').update(deptUpdate).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const depts = getStorageItem('sm_departments');
      const idx = depts.findIndex(d => d.id === id);
      if (idx !== -1) {
        depts[idx] = { ...depts[idx], ...deptUpdate };
        setStorageItem('sm_departments', depts);
        return depts[idx];
      }
      throw new Error("Department not found");
    }
  },

  async deleteDepartment(id) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const depts = getStorageItem('sm_departments');
      const filtered = depts.filter(d => d.id !== id);
      setStorageItem('sm_departments', filtered);
      return true;
    }
  },

  // ==========================================
  // SUBJECTS
  // ==========================================
  async getSubjects() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('subjects').select('*, departments(name, code)').order('semester');
      if (error) throw error;
      return data;
    } else {
      const subjects = getStorageItem('sm_subjects');
      const departments = getStorageItem('sm_departments');
      return subjects.map(sub => ({
        ...sub,
        departments: departments.find(d => d.id === sub.department_id) || { name: 'Unknown', code: 'N/A' }
      }));
    }
  },

  async createSubject(subject) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('subjects').insert([subject]).select().single();
      if (error) throw error;
      return data;
    } else {
      const subjects = getStorageItem('sm_subjects');
      const newSub = { id: 'sub-' + Math.random().toString(36).substr(2, 9), ...subject, created_at: new Date().toISOString() };
      subjects.push(newSub);
      setStorageItem('sm_subjects', subjects);
      return newSub;
    }
  },

  async updateSubject(id, subjectUpdate) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('subjects').update(subjectUpdate).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const subjects = getStorageItem('sm_subjects');
      const idx = subjects.findIndex(s => s.id === id);
      if (idx !== -1) {
        subjects[idx] = { ...subjects[idx], ...subjectUpdate };
        setStorageItem('sm_subjects', subjects);
        return subjects[idx];
      }
      throw new Error("Subject not found");
    }
  },

  async deleteSubject(id) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const subjects = getStorageItem('sm_subjects');
      const filtered = subjects.filter(s => s.id !== id);
      setStorageItem('sm_subjects', filtered);
      return true;
    }
  },

  // ==========================================
  // STUDENTS
  // ==========================================
  async getStudents() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('students').select('*, profiles(*), departments(*)');
      if (error) throw error;
      return data;
    } else {
      const students = getStorageItem('sm_students');
      const profiles = getStorageItem('sm_profiles');
      const departments = getStorageItem('sm_departments');
      return students.map(stud => ({
        ...stud,
        profiles: profiles.find(p => p.id === stud.profile_id) || { name: 'Unknown Student', email: '', avatar_url: '' },
        departments: departments.find(d => d.id === stud.department_id) || { name: 'Unknown Department', code: 'N/A' }
      }));
    }
  },

  async createStudent(studentData, profileData) {
    if (isSupabaseConfigured) {
      // In Supabase, the profile is created automatically on Auth signup, 
      // or we manually create a profile row if admin creates it.
      // For this sample app's admin workflow, we insert into profiles and students:
      const { data: profile, error: pErr } = await supabase.from('profiles').insert([
        { id: profileData.id, name: profileData.name, email: profileData.email, role: 'student' }
      ]).select().single();
      if (pErr) throw pErr;

      const { data: student, error: sErr } = await supabase.from('students').insert([
        { ...studentData, profile_id: profile.id }
      ]).select().single();
      if (sErr) throw sErr;
      
      return { ...student, profiles: profile };
    } else {
      const profiles = getStorageItem('sm_profiles');
      const students = getStorageItem('sm_students');

      const profileId = profileData.id || 'prof-' + Math.random().toString(36).substr(2, 9);
      const studentId = 'stud-' + Math.random().toString(36).substr(2, 9);

      const newProfile = { id: profileId, name: profileData.name, email: profileData.email, role: 'student', avatar_url: '' };
      const newStudent = { id: studentId, profile_id: profileId, ...studentData };

      profiles.push(newProfile);
      students.push(newStudent);

      setStorageItem('sm_profiles', profiles);
      setStorageItem('sm_students', students);

      return { ...newStudent, profiles: newProfile };
    }
  },

  async updateStudent(id, studentUpdate, profileUpdate) {
    if (isSupabaseConfigured) {
      const { data: student, error: sErr } = await supabase.from('students').update(studentUpdate).eq('id', id).select().single();
      if (sErr) throw sErr;

      const { data: profile, error: pErr } = await supabase.from('profiles').update(profileUpdate).eq('id', student.profile_id).select().single();
      if (pErr) throw pErr;

      return { ...student, profiles: profile };
    } else {
      const students = getStorageItem('sm_students');
      const profiles = getStorageItem('sm_profiles');

      const sIdx = students.findIndex(s => s.id === id);
      if (sIdx === -1) throw new Error("Student not found");

      students[sIdx] = { ...students[sIdx], ...studentUpdate };
      setStorageItem('sm_students', students);

      const pId = students[sIdx].profile_id;
      const pIdx = profiles.findIndex(p => p.id === pId);
      if (pIdx !== -1) {
        profiles[pIdx] = { ...profiles[pIdx], ...profileUpdate };
        setStorageItem('sm_profiles', profiles);
      }

      return { ...students[sIdx], profiles: profiles[pIdx] };
    }
  },

  async deleteStudent(id) {
    if (isSupabaseConfigured) {
      // Find profile_id first
      const { data: stud } = await supabase.from('students').select('profile_id').eq('id', id).single();
      if (stud) {
        // Cascade will delete student entry if profile is deleted, or we delete profile
        const { error } = await supabase.from('profiles').delete().eq('id', stud.profile_id);
        if (error) throw error;
      }
      return true;
    } else {
      const students = getStorageItem('sm_students');
      const profiles = getStorageItem('sm_profiles');

      const stud = students.find(s => s.id === id);
      if (stud) {
        const filteredStudents = students.filter(s => s.id !== id);
        const filteredProfiles = profiles.filter(p => p.id !== stud.profile_id);

        setStorageItem('sm_students', filteredStudents);
        setStorageItem('sm_profiles', filteredProfiles);
      }
      return true;
    }
  },

  // ==========================================
  // FACULTY
  // ==========================================
  async getFaculty() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('faculty').select('*, profiles(*), departments(*)');
      if (error) throw error;
      return data;
    } else {
      const faculty = getStorageItem('sm_faculty');
      const profiles = getStorageItem('sm_profiles');
      const departments = getStorageItem('sm_departments');
      return faculty.map(fac => ({
        ...fac,
        profiles: profiles.find(p => p.id === fac.profile_id) || { name: 'Unknown Faculty', email: '', avatar_url: '' },
        departments: departments.find(d => d.id === fac.department_id) || { name: 'Unknown Department', code: 'N/A' }
      }));
    }
  },

  async createFaculty(facultyData, profileData) {
    if (isSupabaseConfigured) {
      const { data: profile, error: pErr } = await supabase.from('profiles').insert([
        { id: profileData.id, name: profileData.name, email: profileData.email, role: 'faculty' }
      ]).select().single();
      if (pErr) throw pErr;

      const { data: faculty, error: fErr } = await supabase.from('faculty').insert([
        { ...facultyData, profile_id: profile.id }
      ]).select().single();
      if (fErr) throw fErr;
      
      return { ...faculty, profiles: profile };
    } else {
      const profiles = getStorageItem('sm_profiles');
      const faculty = getStorageItem('sm_faculty');

      const profileId = profileData.id || 'prof-' + Math.random().toString(36).substr(2, 9);
      const facultyId = 'fac-' + Math.random().toString(36).substr(2, 9);

      const newProfile = { id: profileId, name: profileData.name, email: profileData.email, role: 'faculty', avatar_url: '' };
      const newFaculty = { id: facultyId, profile_id: profileId, ...facultyData };

      profiles.push(newProfile);
      faculty.push(newFaculty);

      setStorageItem('sm_profiles', profiles);
      setStorageItem('sm_faculty', faculty);

      return { ...newFaculty, profiles: newProfile };
    }
  },

  async updateFaculty(id, facultyUpdate, profileUpdate) {
    if (isSupabaseConfigured) {
      const { data: faculty, error: fErr } = await supabase.from('faculty').update(facultyUpdate).eq('id', id).select().single();
      if (fErr) throw fErr;

      const { data: profile, error: pErr } = await supabase.from('profiles').update(profileUpdate).eq('id', faculty.profile_id).select().single();
      if (pErr) throw pErr;

      return { ...faculty, profiles: profile };
    } else {
      const faculty = getStorageItem('sm_faculty');
      const profiles = getStorageItem('sm_profiles');

      const fIdx = faculty.findIndex(f => f.id === id);
      if (fIdx === -1) throw new Error("Faculty member not found");

      faculty[fIdx] = { ...faculty[fIdx], ...facultyUpdate };
      setStorageItem('sm_faculty', faculty);

      const pId = faculty[fIdx].profile_id;
      const pIdx = profiles.findIndex(p => p.id === pId);
      if (pIdx !== -1) {
        profiles[pIdx] = { ...profiles[pIdx], ...profileUpdate };
        setStorageItem('sm_profiles', profiles);
      }

      return { ...faculty[fIdx], profiles: profiles[pIdx] };
    }
  },

  async deleteFaculty(id) {
    if (isSupabaseConfigured) {
      const { data: fac } = await supabase.from('faculty').select('profile_id').eq('id', id).single();
      if (fac) {
        const { error } = await supabase.from('profiles').delete().eq('id', fac.profile_id);
        if (error) throw error;
      }
      return true;
    } else {
      const faculty = getStorageItem('sm_faculty');
      const profiles = getStorageItem('sm_profiles');

      const fac = faculty.find(f => f.id === id);
      if (fac) {
        const filteredFaculty = faculty.filter(f => f.id !== id);
        const filteredProfiles = profiles.filter(p => p.id !== fac.profile_id);

        setStorageItem('sm_faculty', filteredFaculty);
        setStorageItem('sm_profiles', filteredProfiles);
      }
      return true;
    }
  },

  // ==========================================
  // ATTENDANCE
  // ==========================================
  async getAttendance(filters = {}) {
    if (isSupabaseConfigured) {
      let query = supabase.from('attendance').select('*, students(*, profiles(*)), subjects(*)');
      
      if (filters.date) query = query.eq('date', filters.date);
      if (filters.subject_id) query = query.eq('subject_id', filters.subject_id);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      let attendance = getStorageItem('sm_attendance');
      const students = getStorageItem('sm_students');
      const profiles = getStorageItem('sm_profiles');
      const subjects = getStorageItem('sm_subjects');

      let result = attendance.map(att => {
        const student = students.find(s => s.id === att.student_id);
        const profile = student ? profiles.find(p => p.id === student.profile_id) : null;
        const subject = subjects.find(s => s.id === att.subject_id);

        return {
          ...att,
          students: student ? { ...student, profiles: profile } : null,
          subjects: subject
        };
      });

      if (filters.date) {
        result = result.filter(r => r.date === filters.date);
      }
      if (filters.subject_id) {
        result = result.filter(r => r.subject_id === filters.subject_id);
      }
      if (filters.department_id) {
        result = result.filter(r => r.students && r.students.department_id === filters.department_id);
      }
      if (filters.year) {
        result = result.filter(r => r.students && r.students.year === parseInt(filters.year));
      }
      if (filters.section) {
        result = result.filter(r => r.students && r.students.section === filters.section);
      }

      return result;
    }
  },

  async markAttendance(records, facultyId) {
    if (isSupabaseConfigured) {
      // Supabase supports upsert
      const upsertRecords = records.map(rec => ({
        student_id: rec.student_id,
        subject_id: rec.subject_id,
        date: rec.date,
        status: rec.status,
        marked_by: facultyId
      }));

      const { data, error } = await supabase.from('attendance').upsert(upsertRecords, {
        onConflict: 'student_id,subject_id,date'
      }).select();

      if (error) throw error;
      return data;
    } else {
      const attendance = getStorageItem('sm_attendance');

      records.forEach(rec => {
        const idx = attendance.findIndex(a => 
          a.student_id === rec.student_id && 
          a.subject_id === rec.subject_id && 
          a.date === rec.date
        );

        if (idx !== -1) {
          attendance[idx].status = rec.status;
          attendance[idx].marked_by = facultyId;
        } else {
          attendance.push({
            id: 'att-' + Math.random().toString(36).substr(2, 9),
            student_id: rec.student_id,
            subject_id: rec.subject_id,
            date: rec.date,
            status: rec.status,
            marked_by: facultyId,
            created_at: new Date().toISOString()
          });
        }
      });

      setStorageItem('sm_attendance', attendance);
      return records;
    }
  },

  async getStudentAttendanceSummary(studentId) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('attendance').select('*, subjects(*)').eq('student_id', studentId);
      if (error) throw error;
      return data;
    } else {
      const attendance = getStorageItem('sm_attendance');
      const subjects = getStorageItem('sm_subjects');
      
      const filtered = attendance.filter(a => a.student_id === studentId);
      return filtered.map(a => ({
        ...a,
        subjects: subjects.find(s => s.id === a.subject_id)
      }));
    }
  },

  // ==========================================
  // ACADEMICS (MARKS)
  // ==========================================
  async getAcademicMarks(studentId = null) {
    if (isSupabaseConfigured) {
      let query = supabase.from('academic_marks').select('*, students(*, profiles(*)), subjects(*)');
      if (studentId) query = query.eq('student_id', studentId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      const marks = getStorageItem('sm_academic_marks');
      const students = getStorageItem('sm_students');
      const profiles = getStorageItem('sm_profiles');
      const subjects = getStorageItem('sm_subjects');

      let result = marks.map(m => {
        const student = students.find(s => s.id === m.student_id);
        const profile = student ? profiles.find(p => p.id === student.profile_id) : null;
        return {
          ...m,
          students: student ? { ...student, profiles: profile } : null,
          subjects: subjects.find(s => s.id === m.subject_id)
        };
      });

      if (studentId) {
        result = result.filter(r => r.student_id === studentId);
      }
      return result;
    }
  },

  async updateAcademicMark(record) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('academic_marks').upsert([record], {
        onConflict: 'student_id,subject_id,exam_type'
      }).select().single();
      if (error) throw error;
      return data;
    } else {
      const marks = getStorageItem('sm_academic_marks');
      const idx = marks.findIndex(m => 
        m.student_id === record.student_id && 
        m.subject_id === record.subject_id && 
        m.exam_type === record.exam_type
      );

      if (idx !== -1) {
        marks[idx].marks_obtained = parseFloat(record.marks_obtained);
        marks[idx].max_marks = parseFloat(record.max_marks);
      } else {
        marks.push({
          id: 'm-' + Math.random().toString(36).substr(2, 9),
          student_id: record.student_id,
          subject_id: record.subject_id,
          exam_type: record.exam_type,
          marks_obtained: parseFloat(record.marks_obtained),
          max_marks: parseFloat(record.max_marks),
          created_at: new Date().toISOString()
        });
      }

      setStorageItem('sm_academic_marks', marks);
      return record;
    }
  },

  // ==========================================
  // SPORTS ACTIVITIES
  // ==========================================
  async getSportsActivities(studentId = null) {
    if (isSupabaseConfigured) {
      let query = supabase.from('sports_activities').select('*, students(*, profiles(*))');
      if (studentId) query = query.eq('student_id', studentId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      const sports = getStorageItem('sm_sports_activities');
      const students = getStorageItem('sm_students');
      const profiles = getStorageItem('sm_profiles');

      let result = sports.map(s => {
        const student = students.find(stud => stud.id === s.student_id);
        const profile = student ? profiles.find(p => p.id === student.profile_id) : null;
        return {
          ...s,
          students: student ? { ...student, profiles: profile } : null
        };
      });

      if (studentId) {
        result = result.filter(r => r.student_id === studentId);
      }
      return result;
    }
  },

  async createSportsActivity(activity) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('sports_activities').insert([activity]).select().single();
      if (error) throw error;
      return data;
    } else {
      const sports = getStorageItem('sm_sports_activities');
      const newActivity = {
        id: 'sport-' + Math.random().toString(36).substr(2, 9),
        ...activity,
        created_at: new Date().toISOString()
      };
      sports.push(newActivity);
      setStorageItem('sm_sports_activities', sports);
      return newActivity;
    }
  },

  // ==========================================
  // CERTIFICATES
  // ==========================================
  async getCertificates(studentId = null) {
    if (isSupabaseConfigured) {
      let query = supabase.from('certificates').select('*, students(*, profiles(*))');
      if (studentId) query = query.eq('student_id', studentId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      const certs = getStorageItem('sm_certificates');
      const students = getStorageItem('sm_students');
      const profiles = getStorageItem('sm_profiles');

      let result = certs.map(c => {
        const student = students.find(stud => stud.id === c.student_id);
        const profile = student ? profiles.find(p => p.id === student.profile_id) : null;
        return {
          ...c,
          students: student ? { ...student, profiles: profile } : null
        };
      });

      if (studentId) {
        result = result.filter(r => r.student_id === studentId);
      }
      return result;
    }
  },

  async uploadCertificate(certData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('certificates').insert([certData]).select().single();
      if (error) throw error;
      return data;
    } else {
      const certs = getStorageItem('sm_certificates');
      const newCert = {
        id: 'cert-' + Math.random().toString(36).substr(2, 9),
        ...certData,
        status: 'Pending',
        upload_date: new Date().toISOString().split('T')[0],
        verified_by: null
      };
      certs.push(newCert);
      setStorageItem('sm_certificates', certs);

      // Trigger admin notification
      const adminNotif = {
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        user_id: 'prof-admin',
        title: 'New Certificate Upload',
        message: `Student uploaded a new ${certData.category} certificate: "${certData.name}".`,
        read: false,
        created_at: new Date().toISOString()
      };
      const notifications = getStorageItem('sm_notifications');
      notifications.push(adminNotif);
      setStorageItem('sm_notifications', notifications);

      return newCert;
    }
  },

  async updateCertificateStatus(id, status, verifierProfileId) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('certificates').update({
        status,
        verified_by: verifierProfileId
      }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const certs = getStorageItem('sm_certificates');
      const idx = certs.findIndex(c => c.id === id);
      if (idx !== -1) {
        certs[idx].status = status;
        certs[idx].verified_by = verifierProfileId;
        setStorageItem('sm_certificates', certs);

        // Send notification to student
        const student = getStorageItem('sm_students').find(s => s.id === certs[idx].student_id);
        if (student) {
          const studentNotif = {
            id: 'notif-' + Math.random().toString(36).substr(2, 9),
            user_id: student.profile_id,
            title: `Certificate ${status}`,
            message: `Your certificate "${certs[idx].name}" has been ${status.toLowerCase()} by Admin.`,
            read: false,
            created_at: new Date().toISOString()
          };
          const notifications = getStorageItem('sm_notifications');
          notifications.push(studentNotif);
          setStorageItem('sm_notifications', notifications);
        }
        return certs[idx];
      }
      throw new Error("Certificate not found");
    }
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  async getNotifications(profileId) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', profileId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      const notifs = getStorageItem('sm_notifications');
      return notifs.filter(n => n.user_id === profileId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async markNotificationAsRead(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const notifs = getStorageItem('sm_notifications');
      const idx = notifs.findIndex(n => n.id === id);
      if (idx !== -1) {
        notifs[idx].read = true;
        setStorageItem('sm_notifications', notifs);
        return notifs[idx];
      }
      return null;
    }
  },

  async createNotification(userId, title, message) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('notifications').insert([{
        user_id: userId,
        title,
        message
      }]).select().single();
      if (error) throw error;
      return data;
    } else {
      const notifs = getStorageItem('sm_notifications');
      const newNotif = {
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        title,
        message,
        read: false,
        created_at: new Date().toISOString()
      };
      notifs.push(newNotif);
      setStorageItem('sm_notifications', notifs);
      return newNotif;
    }
  }
};
