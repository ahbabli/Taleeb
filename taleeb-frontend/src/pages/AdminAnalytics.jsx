import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Clock,
  FileText,
  HelpCircle,
  Megaphone,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCog,
  UsersRound,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import TaleebLogo from "../components/TaleebLogo";
import api from "../api/axios";

const sidebarItems = [
  { label: "Overview", icon: BarChart3, active: true },
  { label: "Requests", icon: FileText },
  { label: "Schedule", icon: CalendarDays },
  { label: "News", icon: Megaphone },
  { label: "FAQ", icon: HelpCircle },
  { label: "Users", icon: UsersRound },
  { label: "Settings", icon: Settings },
];

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadAnalytics = async () => {
      try {
        const res = await api.get("/admin/analytics");

        if (isActive) {
          setStats(res.data);
        }
      } catch {
        toast.error("Failed to load analytics.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isActive = false;
    };
  }, []);

  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  const metrics = useMemo(() => {
    if (!stats) return [];

    return [
      {
        label: "Total Users",
        value: stats.total_users,
        icon: UsersRound,
        tone: "bg-[#EAF3FF] text-[#1557A6]",
      },
      {
        label: "Total Requests",
        value: stats.total_requests,
        icon: FileText,
        tone: "bg-sky-50 text-sky-600",
      },
      {
        label: "Ready Documents",
        value: stats.ready_documents,
        icon: CheckCircle,
        tone: "bg-emerald-50 text-emerald-600",
      },
      {
        label: "Published Content",
        value: stats.published_announcements + stats.published_faq + stats.published_class_posts,
        icon: ClipboardList,
        tone: "bg-violet-50 text-violet-600",
      },
    ];
  }, [stats]);

  const requestItems = stats
    ? [
        ["Pending", stats.pending_requests, "bg-amber-500", Clock],
        ["Processing", stats.processing_requests, "bg-sky-500", TrendingUp],
        ["Ready", stats.ready_documents, "bg-emerald-500", CheckCircle],
        ["Rejected", stats.rejected_requests, "bg-red-500", XCircle],
      ]
    : [];

  const contentItems = stats
    ? [
        ["Announcements", stats.total_announcements, stats.published_announcements, Megaphone],
        ["FAQ Entries", stats.total_faq, stats.published_faq, HelpCircle],
        ["Class Posts", stats.total_class_posts, stats.published_class_posts, ClipboardList],
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#F4F7FB] pb-28 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1480px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-100 bg-white px-8 py-8 lg:block">
          <div className="mb-12 flex items-center gap-3">
            <TaleebLogo className="h-10 w-10" />
            <span className="text-lg font-extrabold text-slate-950">Taleeb</span>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold ${
                    item.active
                      ? "bg-[#EAF3FF] text-[#1557A6]"
                      : "text-slate-500"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </div>
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
            <label className="relative hidden w-full max-w-sm sm:block">
              <Search
                className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                className="h-11 w-full bg-transparent pl-8 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search..."
              />
            </label>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-slate-400 lg:hidden">
                Taleeb
              </p>
              <h1 className="truncate text-xl font-extrabold text-slate-950 sm:text-2xl">
                Admin Analytics
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-[#1557A6]"
                aria-label="Notifications"
              >
                <Bell size={19} />
              </button>
              <div className="hidden items-center gap-3 sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3FF] text-sm font-extrabold text-[#1557A6]">
                  {getInitials(user?.name)}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs font-medium text-slate-400">Administrator</p>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-10">
            {loading ? (
              <DashboardSkeleton />
            ) : stats ? (
              <>
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {metrics.map((metric) => (
                    <MetricCard key={metric.label} {...metric} />
                  ))}
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-[2fr_0.62fr]">
                  <RequestsTrendCard stats={stats} items={requestItems} />
                  <ContentDonutCard items={contentItems} />
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.8fr_0.62fr]">
                  <RequestsLineCard stats={stats} />
                  <RankedPanel
                    title="Users by Role"
                    icon={UserCog}
                    items={
                      stats.users_by_role?.map((item) => [
                        formatRole(item.role),
                        item.total,
                      ]) || []
                    }
                  />
                  <HighlightCard stats={stats} />
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
                  <RankedPanel
                    title="Most Requested Documents"
                    icon={FileText}
                    items={
                      stats.most_requested_documents?.map((item) => [
                        item.document,
                        item.total,
                      ]) || []
                    }
                  />
                  <ContentListPanel items={contentItems} />
                </section>
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value, icon: Icon, tone }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/60">
      <div className="flex items-center gap-5">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${tone}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-slate-950">
            {formatNumber(value)}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
        </div>
      </div>
    </article>
  );
}

function RequestsTrendCard({ stats, items }) {
  const max = Math.max(...items.map((item) => item[1]), 1);
  const readyPercent = getPercent(stats.ready_documents, stats.total_requests);
  const pendingPercent = getPercent(stats.pending_requests, stats.total_requests);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60">
      <PanelHeader title="Requests Status Trend" action="Show by status" />

      <div className="grid gap-8 p-6 lg:grid-cols-[1fr_230px]">
        <div className="flex min-h-56 items-end gap-5 border-b border-slate-200 bg-[linear-gradient(to_bottom,transparent_0,transparent_31%,#e5e7eb_32%,transparent_33%,transparent_64%,#e5e7eb_65%,transparent_66%)] px-2 pb-0 pt-8">
          {items.map(([label, value, color]) => {
            const height = Math.max(16, Math.round((value / max) * 150));
            const totalHeight = Math.max(22, Math.round(((value + max * 0.45) / (max * 1.45)) * 150));

            return (
              <div key={label} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-40 items-end gap-2">
                  <div
                    className="w-3 rounded-full bg-emerald-400"
                    style={{ height: `${Math.max(12, totalHeight - height / 3)}px` }}
                  />
                  <div
                    className={`w-3 rounded-full ${color}`}
                    style={{ height: `${height}px` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-400">{label}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center justify-center gap-5">
          <DonutChart
            value={readyPercent}
            primary="#1557A6"
            secondary="#34d399"
            center={<UsersRound size={24} />}
          />
          <div className="flex flex-wrap justify-center gap-4 text-sm font-bold">
            <span className="inline-flex items-center gap-2 text-[#1557A6]">
              <span className="h-2 w-2 rounded-full bg-[#1557A6]" />
              Ready {readyPercent}%
            </span>
            <span className="inline-flex items-center gap-2 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Pending {pendingPercent}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContentDonutCard({ items }) {
  const total = items.reduce((sum, item) => sum + item[1], 0);
  const published = items.reduce((sum, item) => sum + item[2], 0);
  const percent = getPercent(published, total);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60">
      <PanelHeader title="Content Published" />

      <div className="flex min-h-[238px] flex-col items-center justify-center gap-6 p-6">
        <DonutChart
          value={percent}
          primary="#1557A6"
          secondary="#38bdf8"
          center={<Megaphone size={24} />}
        />
        <div className="grid w-full grid-cols-2 gap-3 text-sm font-bold">
          <span className="inline-flex items-center gap-2 text-[#1557A6]">
            <span className="h-2 w-2 rounded-full bg-[#1557A6]" />
            Published
          </span>
          <span className="inline-flex items-center gap-2 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            Drafts
          </span>
        </div>
      </div>
    </section>
  );
}

function RequestsLineCard({ stats }) {
  const points = [
    stats.pending_requests,
    stats.processing_requests,
    stats.ready_documents,
    stats.rejected_requests,
    stats.total_requests,
  ];
  const max = Math.max(...points, 1);
  const coords = points.map((point, index) => {
    const x = 10 + index * 22;
    const y = 78 - (point / max) * 58;
    return `${x},${y}`;
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60">
      <PanelHeader title="Request Flow" action="Today" />
      <div className="p-6">
        <svg viewBox="0 0 100 88" className="h-44 w-full overflow-visible">
          {[20, 40, 60, 80].map((y) => (
            <line
              key={y}
              x1="8"
              x2="98"
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="3 4"
              strokeWidth="0.7"
            />
          ))}
          <polyline
            points={coords.join(" ")}
            fill="none"
            stroke="#1557A6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          {coords.map((coord, index) => {
            const [x, y] = coord.split(",");

            return (
              <circle
                key={coord}
                cx={x}
                cy={y}
                r={index === 2 ? "2.7" : "2"}
                fill={index === 2 ? "#34d399" : "#1557A6"}
                stroke="white"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold text-slate-400">
          <span>Pending</span>
          <span>Processing</span>
          <span>Ready</span>
          <span>Rejected</span>
          <span>Total</span>
        </div>
      </div>
    </section>
  );
}

function RankedPanel({ title, icon: Icon, items }) {
  const max = Math.max(...items.map((item) => item[1]), 1);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60">
      <PanelHeader title={title} />

      <div className="space-y-4 p-6">
        {items.length > 0 ? (
          items.slice(0, 5).map(([label, value]) => {
            const percent = Math.round((value / max) * 100);

            return (
              <div key={label} className="grid grid-cols-[28px_1fr_auto] items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-extrabold text-slate-700">
                      {label}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#1557A6]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-extrabold text-slate-900">
                  {formatNumber(value)}
                </span>
              </div>
            );
          })
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-500">
            No data available.
          </p>
        )}
      </div>
    </section>
  );
}

function HighlightCard({ stats }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#1557A6] p-6 text-white shadow-sm shadow-blue-900/20">
      <div className="absolute inset-y-0 right-0 w-28 bg-[#0B3D7A]" />
      <div className="relative">
        <p className="text-4xl font-extrabold">
          {formatNumber(stats.total_students)}
        </p>
        <p className="mt-2 text-sm font-bold text-blue-100">
          Students registered
        </p>

        <svg viewBox="0 0 220 90" className="mt-8 h-28 w-full">
          <path
            d="M2 52 C18 22, 26 86, 42 32 C55 -10, 62 84, 82 52 C100 24, 110 54, 128 70 C149 88, 164 42, 178 61 C190 80, 196 24, 214 48"
            fill="none"
            stroke="rgba(255,255,255,.42)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="178" cy="61" r="6" fill="white" opacity=".85" />
          <text x="166" y="30" fill="white" fontSize="14" fontWeight="800">
            {formatNumber(stats.total_users)}
          </text>
        </svg>

        <div className="mt-2 flex justify-between text-xs font-bold text-blue-100">
          <span>Users</span>
          <span>Students</span>
          <span>Content</span>
        </div>
      </div>
    </section>
  );
}

function ContentListPanel({ items }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60">
      <PanelHeader title="Content by Type" />

      <div className="space-y-4 p-6">
        {items.map(([label, total, published, Icon]) => {
          const percent = getPercent(published, total);

          return (
            <div key={label} className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#1557A6]">
                    <Icon size={18} />
                  </span>
                  <span className="font-extrabold text-slate-800">{label}</span>
                </div>
                <span className="text-sm font-bold text-slate-500">
                  {published}/{total}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[#1557A6]"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PanelHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
      <h2 className="text-base font-extrabold text-slate-950">{title}</h2>
      {action && (
        <span className="text-sm font-bold text-slate-500">{action}</span>
      )}
    </div>
  );
}

function DonutChart({ value, primary, secondary, center }) {
  return (
    <div
      className="relative flex h-28 w-28 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(${primary} 0 ${value}%, ${secondary} ${value}% 100%)`,
      }}
    >
      <div className="absolute inset-3 rounded-full bg-white" />
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
        {center}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-28 rounded-2xl border border-slate-100 bg-white p-6">
            <div className="h-12 w-12 animate-pulse rounded-full bg-slate-100" />
            <div className="ml-16 -mt-10 space-y-3">
              <div className="h-5 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[2fr_0.62fr]">
        <div className="h-80 animate-pulse rounded-2xl bg-white" />
        <div className="h-80 animate-pulse rounded-2xl bg-white" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl bg-white" />
        <div className="h-72 animate-pulse rounded-2xl bg-white" />
        <div className="h-72 animate-pulse rounded-2xl bg-white" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3FF] text-[#1557A6]">
        <BarChart3 size={28} />
      </div>
      <h2 className="text-lg font-extrabold text-slate-950">
        No analytics available
      </h2>
      <p className="mt-1 text-sm font-medium text-slate-500">
        Data will appear once the analytics endpoint returns metrics.
      </p>
    </div>
  );
}

function getPercent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}

function formatRole(role) {
  switch (role) {
    case "admin":
      return "Admin";
    case "department_head":
      return "Department Head";
    case "student_representative":
      return "Representative";
    default:
      return "Student";
  }
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
