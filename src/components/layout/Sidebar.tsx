import { NavLink } from "react-router";
import { Database, Users, BookOpen, GraduationCap, FileText } from "lucide-react";

const navItems = [
  { to: "/", icon: Database, label: "DASHBOARD" },
  { to: "/students", icon: Users, label: "STUDENTS" },
  { to: "/courses", icon: BookOpen, label: "COURSES" },
  { to: "/enrollments", icon: GraduationCap, label: "ENROLLMENTS" },
  { to: "/transcripts", icon: FileText, label: "TRANSCRIPTS" },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-[#111111] border-r border-[#2A2A2A] flex flex-col items-center py-6 z-50">
      <div className="mb-8">
        <div className="w-8 h-8 bg-white flex items-center justify-center">
          <Database className="w-4 h-4 text-black" />
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `w-10 h-10 flex items-center justify-center transition-all duration-100 ${
                isActive
                  ? "bg-white text-black"
                  : "text-[#4B5563] hover:text-[#9CA3AF] hover:bg-[#1A1A1A]"
              }`
            }
            title={item.label}
          >
            <item.icon className="w-4 h-4" />
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </aside>
  );
}
