import {
  Home,
  FileText,
  CalendarDays,
  HelpCircle,
  Megaphone,
  CalendarClock
} from "lucide-react";

export default function Navbar({ currentPage, setCurrentPage, role }) {
  const studentLinks = [
    { key: "home", label: "Home", icon: Home },
    { key: "announcements", label: "News", icon: Megaphone },
    { key: "schedule", label: "Schedule", icon: CalendarDays },
    { key: "requests", label: "Requests", icon: FileText },
    // { key: "faq", label: "FAQ", icon: HelpCircle },
    // { key: "assistant", label: "Assistant", icon: Bot },
  ];

  const adminLinks = [
    { key: "admin-requests", label: "Requests", icon: FileText },
    { key: "admin-schedule", label: "Schedule", icon: CalendarDays },
    { key: "admin-faq", label: "FAQ", icon: HelpCircle },
    { key: "admin-announcements", label: "News", icon: Megaphone },
    { key: "admin-academic-settings", label: "Settings", icon: CalendarClock },
  ];

  const links = role === "admin" ? adminLinks : studentLinks;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] max-w-xl sm:bottom-4 sm:w-[calc(100%-2rem)]">
      <div className="bg-white/95 backdrop-blur-xl border border-blue-100 shadow-2xl rounded-[1.5rem] px-1.5 py-2 flex items-center justify-between gap-1 sm:rounded-[2rem] sm:px-3 sm:py-3">
        {links.map((link) => {
          const Icon = link.icon;
          const active = currentPage === link.key;

          return (
            <button
              key={link.key}
              onClick={() => setCurrentPage(link.key)}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 rounded-2xl transition-all sm:gap-1 sm:px-3 ${
                active
                  ? "bg-[#1557A6] text-white"
                  : "text-slate-400 hover:text-[#1557A6] hover:bg-blue-50"
              }`}
            >
              <Icon className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              <span className="max-w-full truncate text-[9px] font-bold leading-tight sm:text-[11px]">{link.label}</span>
            </button>
          );
        })}

        {/* <button
          onClick={handleLogout}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 rounded-2xl text-red-500 hover:bg-red-50 transition-all sm:gap-1 sm:px-3"
        >
          <LogOut className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
          <span className="max-w-full truncate text-[9px] font-bold leading-tight sm:text-[11px]">Logout</span>
        </button> */}
      </div>
    </div>
  );
}
