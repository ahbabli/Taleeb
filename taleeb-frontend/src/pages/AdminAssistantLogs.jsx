import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  FileQuestion,
  Link2,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const sourceOptions = [
  { value: "all", label: "All Sources" },
  { value: "personal", label: "Personal" },
  { value: "faq", label: "FAQ" },
  { value: "announcement", label: "Announcement" },
  { value: "fallback", label: "Fallback" },
];

export default function AdminAssistantLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    category: "Assistant",
    is_published: true,
  }); 

  useEffect(() => {
    let isActive = true;

    api
      .get("/admin/assistant-logs")
      .then((res) => {
        if (isActive) {
          setLogs(res.data);
        }
      })
      .catch(() => toast.error("Failed to load assistant logs."))
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalScore = logs.reduce((sum, log) => sum + Number(log.score || 0), 0);
    const averageScore = logs.length ? Math.round((totalScore / logs.length) * 10) / 10 : 0;

    return {
      total: logs.length,
      personal: logs.filter((log) => log.source === "personal").length,
      fallback: logs.filter((log) => log.source === "fallback").length,
      averageScore,
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      const studentText = [
        log.student?.student_code,
        log.student?.department,
        log.student?.level,
      ]
        .filter(Boolean)
        .join(" ");

      const text = `${log.question} ${log.answer} ${log.source} ${log.link || ""} ${studentText}`.toLowerCase();
      const matchesSearch = !query || text.includes(query);
      const matchesFilter = filter === "all" || log.source === filter;

      return matchesSearch && matchesFilter;
    });
  }, [filter, logs, search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Assistant Logs
          </h2>
          <p className="mt-1 max-w-2xl text-slate-500">
            Review student questions, answer sources, and fallback gaps.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Bot} label="Total Logs" value={stats.total} tone="blue" />
        <StatCard icon={Sparkles} label="Personal Answers" value={stats.personal} tone="purple" />
        <StatCard icon={AlertCircle} label="Fallback Gaps" value={stats.fallback} tone="amber" />
        <StatCard icon={CheckCircle2} label="Avg. Score" value={stats.averageScore} tone="green" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/30 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Questions History
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {filteredLogs.length} shown from {logs.length} total.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block w-full sm:w-80">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search logs..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1557A6] focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 outline-none transition focus:border-[#1557A6] focus:ring-4 focus:ring-blue-100"
              >
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-[#1557A6]" />
            <p className="mt-4 font-medium text-slate-500">Loading assistant logs...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <EmptyState hasSearch={Boolean(search.trim()) || filter !== "all"} />
        )}
      </section>
    </div>
  );
}

function LogRow({ log }) {
  return (
    <article className="p-5 transition hover:bg-blue-50/30">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SourceBadge source={log.source} />
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
              Score {log.score ?? 0}
            </span>
            {log.link && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#1557A6]">
                <Link2 size={12} />
                {log.link}
              </span>
            )}
            <span className="text-xs font-bold text-slate-400">
              {formatDate(log.created_at)}
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.2fr]">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">
                Question
              </p>
              <p className="whitespace-pre-line text-sm font-bold leading-6 text-slate-900">
                {log.question}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">
                Answer
              </p>
              <p className="whitespace-pre-line text-sm font-semibold leading-6 text-slate-600">
                {log.answer || "No answer recorded."}
              </p>
            </div>
          </div>

          {log.source === "fallback" && (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              This question was not answered. Consider adding a new FAQ entry.
            </div>
          )}
        </div>

        <StudentChip student={log.student} />
      </div>
    </article>
  );
}

function StudentChip({ student }) {
  if (!student) {
    return (
      <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-400 xl:shrink-0">
        <User size={17} />
        No student
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#EAF3FF] px-4 py-3 xl:min-w-52 xl:shrink-0">
      <div className="flex items-center gap-2 text-sm font-extrabold text-[#0B3D7A]">
        <User size={17} />
        {student.student_code || "Student"}
      </div>
      <p className="mt-1 text-xs font-bold text-slate-500">
        {[student.department, student.level].filter(Boolean).join(" - ") || "No class scope"}
      </p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    blue: "bg-[#EAF3FF] text-[#1557A6] border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1">
      <div className={`rounded-2xl border p-3.5 ${tones[tone]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-2xl font-black leading-none text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function SourceBadge({ source }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${getSourceBadge(source)}`}>
      {source || "unknown"}
    </span>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-4 rounded-2xl bg-slate-50 p-5">
        <FileQuestion size={42} className="text-slate-300" />
      </div>
      <h3 className="text-lg font-extrabold text-slate-900">
        No assistant logs found
      </h3>
      <p className="mt-1 max-w-sm text-sm font-medium text-slate-500">
        {hasSearch
          ? "Try changing the search text or source filter."
          : "Student assistant questions will appear here after they use the assistant."}
      </p>
    </div>
  );
}

function getSourceBadge(source) {
  switch (source) {
    case "personal":
      return "bg-purple-50 text-purple-700";
    case "faq":
      return "bg-blue-50 text-[#1557A6]";
    case "announcement":
      return "bg-emerald-50 text-emerald-700";
    case "fallback":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function formatDate(value) {
  if (!value) return "No date";

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
