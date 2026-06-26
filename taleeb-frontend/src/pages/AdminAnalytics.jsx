import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle,
  ClipboardList,
  Clock,
  FileText,
  HelpCircle,
  Megaphone,
  TrendingUp,
  UserCog,
  UsersRound,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

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

  const requestItems = useMemo(() => {
    if (!stats) return [];

    const statusTotals = Object.fromEntries(
      (stats.requests_by_status || []).map((item) => [item.status, item.total])
    );

    return [
      ["Pending", statusTotals.pending || 0, "bg-amber-500", Clock],
      ["Processing", statusTotals.processing || 0, "bg-sky-500", TrendingUp],
      ["Approved", statusTotals.approved || 0, "bg-[#1557A6]", CheckCircle],
      ["Ready", statusTotals.ready || 0, "bg-emerald-500", CheckCircle],
      ["Rejected", statusTotals.rejected || 0, "bg-red-500", XCircle],
    ];
  }, [stats]);

  const contentItems = useMemo(
    () =>
      stats
        ? [
        ["Announcements", stats.total_announcements, stats.published_announcements, Megaphone],
        ["FAQ Entries", stats.total_faq, stats.published_faq, HelpCircle],
        ["Class Posts", stats.total_class_posts, stats.published_class_posts, ClipboardList],
      ]
        : [],
    [stats]
  );

  const requestedDocuments =
    stats?.most_requested_documents?.map((item) => [
      item.document,
      item.total,
    ]) || [];

  const usersByRole =
    stats?.users_by_role?.map((item) => [
      formatRole(item.role),
      item.total,
    ]) || [];

  if (loading) return <DashboardSkeleton />;

  if (!stats) return <EmptyState />;

  return (
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
        <StatusOverviewPanel stats={stats} items={requestItems} />
        <RankedPanel
          title="Users by Role"
          icon={UserCog}
          items={usersByRole}
        />
        <HighlightCard stats={stats} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <RankedPanel
          title="Most Requested Documents"
          icon={FileText}
          items={requestedDocuments}
        />
        <ContentListPanel items={contentItems} />
      </section>
    </>
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
  const notReadyPercent = Math.max(0, 100 - readyPercent);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60">
      <PanelHeader title="Requests by Status" action={`${formatNumber(stats.total_requests)} total`} />

      <div className="grid gap-8 p-6 lg:grid-cols-[1fr_230px]">
        <div className="flex min-h-56 items-end gap-5 border-b border-slate-200 bg-[linear-gradient(to_bottom,transparent_0,transparent_31%,#e5e7eb_32%,transparent_33%,transparent_64%,#e5e7eb_65%,transparent_66%)] px-2 pb-0 pt-8">
          {items.map(([label, value, color]) => {
            const height = Math.max(16, Math.round((value / max) * 150));
            const percent = getPercent(value, stats.total_requests);

            return (
              <div key={label} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-40 items-end">
                  <div
                    className={`w-5 rounded-full ${color}`}
                    style={{ height: `${height}px` }}
                    title={`${label}: ${formatNumber(value)} (${percent}%)`}
                  />
                </div>
                <div className="text-center">
                  <span className="block text-xs font-bold text-slate-400">{label}</span>
                  <span className="block text-[11px] font-extrabold text-slate-700">
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center justify-center gap-5">
          <DonutChart
            value={readyPercent}
            primary="#1557A6"
            secondary="#e5e7eb"
            center={<UsersRound size={24} />}
          />
          <div className="flex flex-wrap justify-center gap-4 text-sm font-bold">
            <span className="inline-flex items-center gap-2 text-[#1557A6]">
              <span className="h-2 w-2 rounded-full bg-[#1557A6]" />
              Ready {readyPercent}%
            </span>
            <span className="inline-flex items-center gap-2 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-slate-200" />
              Not ready {notReadyPercent}%
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

function StatusOverviewPanel({ stats, items }) {
  const activeRequests = stats.total_requests - stats.ready_documents - stats.rejected_requests;
  const completionPercent = getPercent(stats.ready_documents, stats.total_requests);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60">
      <PanelHeader title="Request Composition" action={`${completionPercent}% complete`} />
      <div className="space-y-5 p-6">
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="Active" value={Math.max(0, activeRequests)} />
          <MiniStat label="Ready" value={stats.ready_documents} />
          <MiniStat label="Rejected" value={stats.rejected_requests} />
        </div>

        <div className="overflow-hidden rounded-full bg-slate-100">
          <div className="flex h-4">
            {items.map(([label, value, color]) => {
              const percent = getPercent(value, stats.total_requests);
              if (percent === 0) return null;

              return (
                <div
                  key={label}
                  className={color}
                  style={{ width: `${percent}%` }}
                  title={`${label}: ${formatNumber(value)} (${percent}%)`}
                />
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {items.map(([label, value, color]) => (
            <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                {label}
              </span>
              <span className="text-sm font-extrabold text-slate-950">
                {formatNumber(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-xl font-extrabold text-slate-950">
        {formatNumber(value)}
      </p>
      <p className="mt-1 text-xs font-bold uppercase text-slate-400">
        {label}
      </p>
    </div>
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
            No matching data.
          </p>
        )}
      </div>
    </section>
  );
}

function HighlightCard({ stats }) {
  const studentShare = getPercent(stats.total_students, stats.total_users);
  const staffUsers = Math.max(0, stats.total_users - stats.total_students);

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

        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-blue-100">
            <span>Student share</span>
            <span>{studentShare}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${studentShare}%` }}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-2xl font-extrabold">{formatNumber(stats.total_users)}</p>
            <p className="mt-1 text-xs font-bold text-blue-100">Total users</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-2xl font-extrabold">{formatNumber(staffUsers)}</p>
            <p className="mt-1 text-xs font-bold text-blue-100">Staff/admins</p>
          </div>
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
        {items.length > 0 ? (
          items.map(([label, total, published, Icon]) => {
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
          })
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-500">
            No matching content.
          </p>
        )}
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
