import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import MainLayout from "../components/layout/MainLayout";

// Pages
import Dashboard from "../pages/Dashboard";
import Courses from "../pages/Courses";
import CollegeHours from "../pages/CollegeHours";
import Syllabus from "../pages/Syllabus";
import StaffProfile from "../pages/StaffProfile";
import StaffSubjectManagement from "../pages/StaffSubjectManagement";
import StudentProfile from "../pages/StudentProfile";
import StaffLeave from "../pages/StaffLeave";
import AdminStaffProfile from "../pages/AdminStaffProfile";
import ExternalProfile from "../pages/ExternalStaffProfile";  
import ExternalSubjectManagement from "../pages/ExternalSubjectManagement"; 
import CollegeLeave from "../pages/CollegeLeave";
import ClinicalECA from "../pages/ClinicalECA";
import SessionalModelExamManagement from "../pages/SessionalModelExam";
import Reports from "../pages/Reports";
import Ranks from "../pages/Ranks";
import ExamMark from "../pages/ExamMark";
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<LoginPage />} />

        {/* ADMIN LAYOUT */}
        <Route path="/admin" element={<MainLayout />}>

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="college-courses" element={<Courses />} />
          <Route path="college-hours" element={<CollegeHours />} />
          <Route path="syllabus" element={<Syllabus />} />
          <Route path="staff-profile" element={<StaffProfile />} />
          <Route path="staff-subject-management" element={<StaffSubjectManagement />} />  
          <Route path="admin-staff-profile" element={<AdminStaffProfile />} />  
          <Route path="external-profile" element={<ExternalProfile />} /> 
          <Route path="external-subject-management" element={<ExternalSubjectManagement />} />  
          <Route path="student-profile" element={<StudentProfile />} />
          <Route path="staff-leave" element={<StaffLeave />} />
          <Route path="college-leave" element={<CollegeLeave />} />
          <Route path="clinical-eca" element={<ClinicalECA />} />
          <Route path="sessional-model-exam" element={<SessionalModelExamManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="ranks" element={<Ranks />} />
          <Route path="exam-mark" element={<ExamMark />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}