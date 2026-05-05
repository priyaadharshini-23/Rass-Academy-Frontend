import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarDays,
  Clock,
  FileText,
  Users,
  UserCheck,
  BarChart3,
  Trophy,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BriefcaseBusiness,
  CalendarMinus,
  Stethoscope
} from "lucide-react";

const menu = [
  {
    title: "MAIN",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" }
    ]
  },
  {
    title: "ACADEMIC",
    items: [
      { name: "College Courses", icon: BookOpen, path: "/admin/college-courses" },
      { name: "College Hours", icon: Clock, path: "/admin/college-hours" },
      { name: "Syllabus", icon: ClipboardList, path: "/admin/syllabus" },
      { name: "Timetable", icon: CalendarDays, path: "/admin/timetable" }
    ]
  },
  {
    title: "STAFF MANAGEMENT",
    items: [
      { name: "Staff Profile", icon: UserCheck, path: "/admin/staff-profile" },
      { name: "Staff Subject Management", icon: BookOpen, path: "/admin/staff-subject-management" },
      { name: "Staff Leave Management", icon: BriefcaseBusiness, path: "/admin/staff-leave" },
      { name: "Admin Staff Profile", icon: UserCheck, path: "/admin/admin-staff-profile" }
    ]
  },
  {
    title: "EXTERNAL MANAGEMENT",
    items: [
      { name: "External Profile", icon: Users, path: "/admin/external-profile" },
      { name: "External Subject Management", icon: BookOpen, path: "/admin/external-subject-management" }
    ]
  },
  {
    title: "LEAVE & ACTIVITIES",
    items: [
      { name: "College Leave Management", icon: CalendarMinus, path: "/admin/college-leave" },
      { name: "Clinical & ECA Management", icon: Stethoscope, path: "/admin/clinical-eca" }
    ]
  },
  {
    title: "STUDENT",
    items: [
      { name: "Student Profile", icon: Users, path: "/admin/student-profile" }
    ]
  },
  {
    title: "EXAMS & REPORTS",
    items: [
      { name: "Exam Management", icon: FileText, path: "/admin/exam-management" },  
      { name: "Exam Mark Entry", icon: FileText, path: "/admin/exam-mark" },
      { name: "Reports", icon: BarChart3, path: "/admin/reports" }
    ]
  }
];

export default function Sidebar({ collapsed, setCollapsed, mobileClose }) {
  return (
    <div
      className={`
        ${collapsed ? "w-[85px]" : "w-[250px]"}
        h-screen flex flex-col
        bg-[#0f172a]
        text-white
        shadow-xl
        transition-all duration-300
      `}
    >
      {/* HEADER */}
      <div className="px-5 py-5 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-semibold">RASS</h1>
            <p className="text-xs text-white/50">Admin</p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* MENU */}
      <div className="flex-1 px-3 space-y-6 overflow-y-auto">
        {menu.map((section, i) => (
          <div key={i}>
            {!collapsed && (
              <p className="text-[11px] text-white/40 px-2 mb-2">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item, idx) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={idx}
                    to={item.path}
                    onClick={mobileClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                      ${isActive
                        ? "bg-white/10 text-white shadow-inner"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <Icon
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                    {!collapsed && item.name}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full">
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}