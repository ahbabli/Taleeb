import {
  BarChart3,
  Bot,
  CalendarDays,
  FileText,
  HelpCircle,
  Megaphone,
  Settings,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { cloneElement, isValidElement, useMemo } from "react";
import TaleebLogo from "./TaleebLogo";

const adminLinks = [
  { key: "admin-analytics", label: "Overview", icon: BarChart3 },
  { key: "admin-requests", label: "Requests", icon: FileText },
  { key: "admin-schedule", label: "Schedule", icon: CalendarDays },
  { key: "admin-announcements", label: "News", icon: Megaphone },
  { key: "admin-faq", label: "FAQ", icon: HelpCircle },
  { key: "admin-users", label: "Users", icon: UsersRound },
  { key: "admin-assistant-logs", label: "AI Logs", icon: Bot },
  { key: "admin-academic-settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ children, currentPage, setCurrentPage }) {
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  const pageTitle =
    adminLinks.find((item) => item.key === currentPage)?.label || "Admin";

  const enhancedChildren = isValidElement(children)
    ? cloneElement(children)
    : children;

  return (
    <main className="min-h-screen bg-[#F4F7FB] pb-10 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1480px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-100 bg-white px-8 py-8 lg:block">
          <div className="mb-12 flex items-center gap-3">
            <TaleebLogo className="h-10 w-10" />
            <span className="text-lg font-extrabold text-slate-950">Taleeb</span>
          </div>

          <nav className="space-y-2">
            {adminLinks.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCurrentPage(item.key)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${
                    active
                      ? "bg-[#EAF3FF] text-[#1557A6]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#1557A6]"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-12 rounded-3xl bg-[#EAF3FF] p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#1557A6]">
              <ShieldCheck size={22} />
            </div>
            <p className="text-sm font-extrabold text-slate-950">
              Admin Workspace
            </p>
            <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
              Analytics, users, requests, and content at a glance.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between gap-4 border-b border-slate-100 bg-white px-4 sm:px-6 lg:px-10">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-slate-400 lg:hidden">
                Taleeb Admin
              </p>
              <h1 className="truncate text-xl font-extrabold text-slate-950 sm:text-2xl">
                {pageTitle}
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <div className="hidden items-center gap-3 sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3FF] text-sm font-extrabold text-[#1557A6]">
                  {getInitials(user?.name)}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs font-medium text-slate-400">
                    Administrator
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-10">
            {enhancedChildren}
          </div>
        </section>
      </div>
    </main>
  );
}

function getInitials(name) {
  if (!name) return "A";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
