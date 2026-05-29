import { Routes, Route } from "react-router";
import { Sidebar } from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Enrollments from "./pages/Enrollments";
import Transcripts from "./pages/Transcripts";

export default function App() {
  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="flex-1 ml-16">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/enrollments" element={<Enrollments />} />
          <Route path="/transcripts" element={<Transcripts />} />
        </Routes>
      </main>
    </div>
  );
}
