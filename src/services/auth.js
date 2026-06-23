import { supabase, isSupabaseConfigured } from './supabase';
import { db } from './db';

const getStorageItem = (key) => JSON.parse(localStorage.getItem(key));
const setStorageItem = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Maintain standard callbacks for session changes
let authCallbacks = [];

const triggerAuthChange = (session) => {
  authCallbacks.forEach(cb => cb(session));
};

export const auth = {
  async login(email, password) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Fetch profile to get role
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (pErr) throw pErr;

      let roleDetails = null;
      if (profile.role === 'student') {
        const { data: stud } = await supabase.from('students').select('*').eq('profile_id', profile.id).single();
        roleDetails = stud;
      } else if (profile.role === 'faculty') {
        const { data: fac } = await supabase.from('faculty').select('*').eq('profile_id', profile.id).single();
        roleDetails = fac;
      }

      const session = { user: data.user, profile, roleDetails };
      triggerAuthChange(session);
      return session;
    } else {
      // Mock Login: check profiles in LocalStorage
      const profiles = getStorageItem('sm_profiles');
      const profile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      
      if (!profile) {
        throw new Error("Invalid credentials or user does not exist.");
      }

      // Check specific role details
      let roleDetails = null;
      if (profile.role === 'student') {
        const students = getStorageItem('sm_students');
        roleDetails = students.find(s => s.profile_id === profile.id) || null;
      } else if (profile.role === 'faculty') {
        const faculty = getStorageItem('sm_faculty');
        roleDetails = faculty.find(f => f.profile_id === profile.id) || null;
      }

      const mockUser = {
        id: profile.id,
        email: profile.email,
        user_metadata: { name: profile.name, role: profile.role }
      };

      const session = { user: mockUser, profile, roleDetails };
      setStorageItem('sm_session', session);
      triggerAuthChange(session);
      return session;
    }
  },

  async signup(email, password, name, role, additionalData = {}) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role }
        }
      });
      if (error) throw error;

      // Note: Triggers on Supabase will copy meta data to profiles.
      // But if there's any delay or we create them from admin, we might manually link them.
      // For this full-stack project, we simulate profiles check:
      let profile = null;
      let retries = 5;
      while (retries > 0) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
        if (p) {
          profile = p;
          break;
        }
        await new Promise(r => setTimeout(r, 500));
        retries--;
      }

      if (!profile) {
        // Fallback profile insert in case trigger didn't run
        const { data: newP, error: pErr } = await supabase.from('profiles').insert([
          { id: data.user.id, email, name, role }
        ]).select().single();
        if (pErr) throw pErr;
        profile = newP;
      }

      let roleDetails = null;
      if (role === 'student') {
        const { data: stud, error: sErr } = await supabase.from('students').insert([
          {
            profile_id: profile.id,
            department_id: additionalData.department_id,
            roll_number: additionalData.roll_number,
            year: parseInt(additionalData.year),
            section: additionalData.section,
            admission_year: parseInt(additionalData.admission_year || new Date().getFullYear())
          }
        ]).select().single();
        if (sErr) throw sErr;
        roleDetails = stud;
      } else if (role === 'faculty') {
        const { data: fac, error: fErr } = await supabase.from('faculty').insert([
          {
            profile_id: profile.id,
            department_id: additionalData.department_id,
            employee_id: additionalData.employee_id,
            designation: additionalData.designation
          }
        ]).select().single();
        if (fErr) throw fErr;
        roleDetails = fac;
      }

      return { user: data.user, profile, roleDetails };
    } else {
      // Mock signup
      const profiles = getStorageItem('sm_profiles');
      const profileId = 'prof-' + Math.random().toString(36).substr(2, 9);
      
      if (profiles.some(p => p.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email already in use.");
      }

      const newProfile = { id: profileId, email, role, name, avatar_url: '' };
      profiles.push(newProfile);
      setStorageItem('sm_profiles', profiles);

      let roleDetails = null;
      if (role === 'student') {
        const students = getStorageItem('sm_students');
        const studentId = 'stud-' + Math.random().toString(36).substr(2, 9);
        roleDetails = {
          id: studentId,
          profile_id: profileId,
          department_id: additionalData.department_id,
          roll_number: additionalData.roll_number,
          year: parseInt(additionalData.year),
          section: additionalData.section,
          admission_year: parseInt(additionalData.admission_year || new Date().getFullYear())
        };
        students.push(roleDetails);
        setStorageItem('sm_students', students);
      } else if (role === 'faculty') {
        const faculty = getStorageItem('sm_faculty');
        const facultyId = 'fac-' + Math.random().toString(36).substr(2, 9);
        roleDetails = {
          id: facultyId,
          profile_id: profileId,
          department_id: additionalData.department_id,
          employee_id: additionalData.employee_id,
          designation: additionalData.designation
        };
        faculty.push(roleDetails);
        setStorageItem('sm_faculty', faculty);
      }

      // Add a notification for new user
      const notifs = getStorageItem('sm_notifications');
      notifs.push({
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        user_id: profileId,
        title: "Welcome!",
        message: `Hello ${name}, welcome to the Smart College Portal!`,
        read: false,
        created_at: new Date().toISOString()
      });
      setStorageItem('sm_notifications', notifs);

      const mockUser = {
        id: profileId,
        email: email,
        user_metadata: { name, role }
      };

      return { user: mockUser, profile: newProfile, roleDetails };
    }
  },

  async logout() {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      triggerAuthChange(null);
    } else {
      localStorage.removeItem('sm_session');
      triggerAuthChange(null);
    }
  },

  async getCurrentSession() {
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Get profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (!profile) return null;

      let roleDetails = null;
      if (profile.role === 'student') {
        const { data: stud } = await supabase.from('students').select('*').eq('profile_id', profile.id).maybeSingle();
        roleDetails = stud;
      } else if (profile.role === 'faculty') {
        const { data: fac } = await supabase.from('faculty').select('*').eq('profile_id', profile.id).maybeSingle();
        roleDetails = fac;
      }

      return { user: session.user, profile, roleDetails };
    } else {
      return getStorageItem('sm_session') || null;
    }
  },

  onAuthStateChange(callback) {
    authCallbacks.push(callback);
    
    // If Supabase, hook into auth listener
    let unsubscribe = () => {};
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          try {
            const current = await this.getCurrentSession();
            callback(current);
          } catch (e) {
            callback(null);
          }
        } else {
          callback(null);
        }
      });
      unsubscribe = () => subscription.unsubscribe();
    } else {
      // Return local session if exists
      const session = getStorageItem('sm_session') || null;
      callback(session);
    }

    return () => {
      unsubscribe();
      authCallbacks = authCallbacks.filter(cb => cb !== callback);
    };
  },

  async updateProfile(profileId, updateData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('profiles').update(updateData).eq('id', profileId).select().single();
      if (error) throw error;
      return data;
    } else {
      const profiles = getStorageItem('sm_profiles');
      const idx = profiles.findIndex(p => p.id === profileId);
      if (idx !== -1) {
        profiles[idx] = { ...profiles[idx], ...updateData };
        setStorageItem('sm_profiles', profiles);

        // Update session if it's the current user
        const session = getStorageItem('sm_session');
        if (session && session.profile.id === profileId) {
          session.profile = { ...session.profile, ...updateData };
          setStorageItem('sm_session', session);
          triggerAuthChange(session);
        }

        return profiles[idx];
      }
      throw new Error("Profile not found");
    }
  }
};
