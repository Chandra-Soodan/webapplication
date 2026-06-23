// High-fidelity Mock Data for local fallback development

export const mockDepartments = [
  { id: "dept-cse", name: "Computer Science & Engineering", code: "CSE" },
  { id: "dept-ece", name: "Electronics & Communication Engineering", code: "ECE" },
  { id: "dept-me", name: "Mechanical Engineering", code: "ME" }
];

export const mockProfiles = [
  { id: "prof-admin", email: "admin@college.edu", role: "admin", name: "Dr. Sathish Kumar", avatar_url: "" },
  { id: "prof-faculty-1", email: "alan@college.edu", role: "faculty", name: "Prof. Alan Turing", avatar_url: "" },
  { id: "prof-faculty-2", email: "ada@college.edu", role: "faculty", name: "Dr. Ada Lovelace", avatar_url: "" },
  { id: "prof-student-1", email: "john@college.edu", role: "student", name: "John Doe", avatar_url: "" },
  { id: "prof-student-2", email: "jane@college.edu", role: "student", name: "Jane Smith", avatar_url: "" },
  { id: "prof-student-3", email: "alice@college.edu", role: "student", name: "Alice Johnson", avatar_url: "" },
  { id: "prof-student-4", email: "bob@college.edu", role: "student", name: "Bob Brown", avatar_url: "" }
];

export const mockFaculty = [
  { id: "fac-1", profile_id: "prof-faculty-1", department_id: "dept-cse", employee_id: "FAC-CSE-001", designation: "HOD / Professor" },
  { id: "fac-2", profile_id: "prof-faculty-2", department_id: "dept-cse", employee_id: "FAC-CSE-002", designation: "Assistant Professor" }
];

export const mockStudents = [
  { id: "stud-1", profile_id: "prof-student-1", department_id: "dept-cse", roll_number: "CSE2201", year: 3, section: "A", admission_year: 2023 },
  { id: "stud-2", profile_id: "prof-student-2", department_id: "dept-cse", roll_number: "CSE2202", year: 3, section: "A", admission_year: 2023 },
  { id: "stud-3", profile_id: "prof-student-3", department_id: "dept-ece", roll_number: "ECE2201", year: 3, section: "B", admission_year: 2023 },
  { id: "stud-4", profile_id: "prof-student-4", department_id: "dept-me", roll_number: "ME2301", year: 2, section: "A", admission_year: 2024 }
];

export const mockSubjects = [
  { id: "sub-ds", name: "Data Structures & Algorithms", code: "CSE301", department_id: "dept-cse", semester: 5 },
  { id: "sub-dbms", name: "Database Management Systems", code: "CSE302", department_id: "dept-cse", semester: 5 },
  { id: "sub-os", name: "Operating Systems", code: "CSE303", department_id: "dept-cse", semester: 5 },
  { id: "sub-ss", name: "Signals & Systems", code: "ECE301", department_id: "dept-ece", semester: 5 },
  { id: "sub-td", name: "Thermodynamics", code: "ME201", department_id: "dept-me", semester: 3 }
];

// Attendance logs
export const mockAttendance = [
  // John Doe (stud-1) DSA Attendance (Present/Absent/On Duty)
  { id: "att-1", student_id: "stud-1", subject_id: "sub-ds", date: "2026-06-01", status: "Present", marked_by: "fac-1" },
  { id: "att-2", student_id: "stud-1", subject_id: "sub-ds", date: "2026-06-02", status: "Present", marked_by: "fac-1" },
  { id: "att-3", student_id: "stud-1", subject_id: "sub-ds", date: "2026-06-03", status: "Absent", marked_by: "fac-1" },
  { id: "att-4", student_id: "stud-1", subject_id: "sub-ds", date: "2026-06-04", status: "On Duty", marked_by: "fac-1" },
  { id: "att-5", student_id: "stud-1", subject_id: "sub-ds", date: "2026-06-05", status: "Present", marked_by: "fac-1" },
  
  // John Doe (stud-1) DBMS Attendance
  { id: "att-6", student_id: "stud-1", subject_id: "sub-dbms", date: "2026-06-01", status: "Present", marked_by: "fac-2" },
  { id: "att-7", student_id: "stud-1", subject_id: "sub-dbms", date: "2026-06-02", status: "Present", marked_by: "fac-2" },
  { id: "att-8", student_id: "stud-1", subject_id: "sub-dbms", date: "2026-06-03", status: "Present", marked_by: "fac-2" },
  { id: "att-9", student_id: "stud-1", subject_id: "sub-dbms", date: "2026-06-04", status: "Present", marked_by: "fac-2" },

  // Jane Smith (stud-2) DSA Attendance
  { id: "att-10", student_id: "stud-2", subject_id: "sub-ds", date: "2026-06-01", status: "Present", marked_by: "fac-1" },
  { id: "att-11", student_id: "stud-2", subject_id: "sub-ds", date: "2026-06-02", status: "Present", marked_by: "fac-1" },
  { id: "att-12", student_id: "stud-2", subject_id: "sub-ds", date: "2026-06-03", status: "Present", marked_by: "fac-1" },
  { id: "att-13", student_id: "stud-2", subject_id: "sub-ds", date: "2026-06-04", status: "Present", marked_by: "fac-1" },
  { id: "att-14", student_id: "stud-2", subject_id: "sub-ds", date: "2026-06-05", status: "Present", marked_by: "fac-1" },
  
  // Alice Johnson (stud-3) Signals & Systems Attendance
  { id: "att-15", student_id: "stud-3", subject_id: "sub-ss", date: "2026-06-01", status: "Present", marked_by: "fac-1" },
  { id: "att-16", student_id: "stud-3", subject_id: "sub-ss", date: "2026-06-02", status: "Absent", marked_by: "fac-1" },
  { id: "att-17", student_id: "stud-3", subject_id: "sub-ss", date: "2026-06-03", status: "Absent", marked_by: "fac-1" },
  { id: "att-18", student_id: "stud-3", subject_id: "sub-ss", date: "2026-06-04", status: "Present", marked_by: "fac-1" }
];

// Academic Marks
export const mockAcademicMarks = [
  // John Doe (stud-1)
  { id: "m-1", student_id: "stud-1", subject_id: "sub-ds", exam_type: "Internal 1", marks_obtained: 22, max_marks: 25 },
  { id: "m-2", student_id: "stud-1", subject_id: "sub-ds", exam_type: "Internal 2", marks_obtained: 20, max_marks: 25 },
  { id: "m-3", student_id: "stud-1", subject_id: "sub-ds", exam_type: "Internal 3", marks_obtained: 24, max_marks: 25 },
  { id: "m-4", student_id: "stud-1", subject_id: "sub-ds", exam_type: "Semester", marks_obtained: 88, max_marks: 100 },

  { id: "m-5", student_id: "stud-1", subject_id: "sub-dbms", exam_type: "Internal 1", marks_obtained: 18, max_marks: 25 },
  { id: "m-6", student_id: "stud-1", subject_id: "sub-dbms", exam_type: "Internal 2", marks_obtained: 21, max_marks: 25 },
  { id: "m-7", student_id: "stud-1", subject_id: "sub-dbms", exam_type: "Semester", marks_obtained: 82, max_marks: 100 },

  // Jane Smith (stud-2)
  { id: "m-8", student_id: "stud-2", subject_id: "sub-ds", exam_type: "Internal 1", marks_obtained: 25, max_marks: 25 },
  { id: "m-9", student_id: "stud-2", subject_id: "sub-ds", exam_type: "Internal 2", marks_obtained: 24, max_marks: 25 },
  { id: "m-10", student_id: "stud-2", subject_id: "sub-ds", exam_type: "Semester", marks_obtained: 95, max_marks: 100 },

  // Alice Johnson (stud-3)
  { id: "m-11", student_id: "stud-3", subject_id: "sub-ss", exam_type: "Internal 1", marks_obtained: 15, max_marks: 25 },
  { id: "m-12", student_id: "stud-3", subject_id: "sub-ss", exam_type: "Internal 2", marks_obtained: 17, max_marks: 25 },
  { id: "m-13", student_id: "stud-3", subject_id: "sub-ss", exam_type: "Semester", marks_obtained: 71, max_marks: 100 }
];

// Sports Activities
export const mockSportsActivities = [
  { id: "sport-1", student_id: "stud-1", activity_name: "Football", tournament_name: "Inter-College Sports Meet 2026", date: "2026-05-15", achievement: "Winner", description: "Captain of the college team. Won the finals by 3-1 against XYZ College.", certificate_url: "" },
  { id: "sport-2", student_id: "stud-3", activity_name: "Athletics (100m)", tournament_name: "State Level Athletic Meet 2026", date: "2026-04-10", achievement: "Runner Up", description: "Finished second in the 100m sprint finals with a timing of 11.2 seconds.", certificate_url: "" }
];

// Certificates
export const mockCertificates = [
  { id: "cert-1", student_id: "stud-1", name: "Football Finals Winner Certificate", file_url: "https://example.com/certificates/football.pdf", category: "Sports", status: "Approved", upload_date: "2026-05-18", verified_by: "prof-admin" },
  { id: "cert-2", student_id: "stud-3", name: "State Sprint Runner Up Certificate", file_url: "https://example.com/certificates/sprint.pdf", category: "Sports", status: "Pending", upload_date: "2026-04-12", verified_by: null }
];

// Notifications
export const mockNotifications = [
  { id: "notif-1", user_id: "prof-student-1", title: "Attendance Low Alert", message: "Your attendance in DSA is currently 80%. Please maintain above 85% to be eligible for exams.", read: false, created_at: "2026-06-20T10:00:00Z" },
  { id: "notif-2", user_id: "prof-student-1", title: "New Sports Tournament Added", message: "Register for the upcoming basketball tournament before June 30.", read: true, created_at: "2026-06-18T14:30:00Z" },
  { id: "notif-3", user_id: "prof-student-3", title: "Certificate Pending Approval", message: "Your sports certificate upload is currently awaiting verification from Admin.", read: false, created_at: "2026-06-21T09:00:00Z" },
  { id: "notif-4", user_id: "prof-admin", title: "New Certificate Upload", message: "Student Alice Johnson uploaded a new sports certificate for approval.", read: false, created_at: "2026-06-21T09:00:00Z" }
];
