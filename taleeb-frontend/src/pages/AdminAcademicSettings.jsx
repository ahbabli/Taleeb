import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  Clock3,
  GraduationCap,
  Save,
  TimerReset,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const initialForm = {
  academic_year: "2025-2026",
  semester_start_date: "",
  semester_end_date: "",
  exams_start_date: "",
  exams_end_date: "",
};

const dayMs = 1000 * 60 * 60 * 24;

function normalizeDate(value) {
  if (!value) return null;

  const date = new Date(value);
  date.setHours(0, 0, 0, 0);

  return date;
}

function daysUntil(value) {
  const today = normalizeDate(new Date());
  const target = normalizeDate(value);

  if (!target) return null;

  return Math.ceil((target - today) / dayMs);
}

function daysBetween(startValue, endValue) {
  const start = normalizeDate(startValue);
  const end = normalizeDate(endValue);

  if (!start || !end || end < start) return 0;

  return Math.ceil((end - start) / dayMs) + 1;
}

function semesterProgress(startValue, endValue) {
  const start = normalizeDate(startValue);
  const end = normalizeDate(endValue);
  const today = normalizeDate(new Date());

  if (!start || !end || end <= start) return 0;

  const progress = Math.round(((today - start) / (end - start)) * 100);

  return Math.min(Math.max(progress, 0), 100);
}

function currentSemesterWeek(startValue) {
  const start = normalizeDate(startValue);
  const today = normalizeDate(new Date());

  if (!start) return 1;

  return Math.max(Math.ceil((today - start) / (dayMs * 7)), 1);
}

function totalSemesterWeeks(startValue, endValue) {
  const totalDays = daysBetween(startValue, endValue);

  if (!totalDays) return 0;

  return Math.ceil(totalDays / 7);
}

function formatDate(value) {
  if (!value) return "Not set";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminAcademicSettings() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    api
      .get("/academic-settings")
      .then((res) => {
        if (res.data && isActive) {
          setForm({
            academic_year: res.data.academic_year || "",
            semester_start_date: res.data.semester_start_date || "",
            semester_end_date: res.data.semester_end_date || "",
            exams_start_date: res.data.exams_start_date || "",
            exams_end_date: res.data.exams_end_date || "",
          });
        }
      })
      .catch(() => toast.error("Failed to load academic settings."))
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const summary = useMemo(() => {
    const examDaysLeft = daysUntil(form.exams_start_date);
    const progress = semesterProgress(
      form.semester_start_date,
      form.semester_end_date
    );
    const currentWeek = currentSemesterWeek(form.semester_start_date);
    const totalWeeks = totalSemesterWeeks(
      form.semester_start_date,
      form.semester_end_date
    );

    return {
      examDaysLeft,
      progress,
      currentWeek,
      totalWeeks,
      semesterDays: daysBetween(form.semester_start_date, form.semester_end_date),
      examDays: daysBetween(form.exams_start_date, form.exams_end_date),
    };
  }, [form]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async (e) => {
    e.preventDefault();

    if (!form.academic_year.trim()) {
      toast.error("Academic year is required.");
      return;
    }

    try {
      setSaving(true);

      const res = await api.put("/academic-settings", form);
      const data = res.data.data;

      setForm({
        academic_year: data.academic_year || "",
        semester_start_date: data.semester_start_date || "",
        semester_end_date: data.semester_end_date || "",
        exams_start_date: data.exams_start_date || "",
        exams_end_date: data.exams_end_date || "",
      });

      toast.success("Academic settings updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAF3FF] pb-24">
      <div className="bg-[#0B3D7A] px-4 pb-24 pt-10 sm:px-6 sm:pt-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <CalendarClock className="text-white" size={34} />
            </div>

            <div>
              <p className="font-bold text-blue-100">Admin Settings</p>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                Academic Calendar
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/80 sm:text-lg">
                Set the semester and exam dates that drive the student dashboard.
              </p>
            </div>
          </div>

          <button
            type="submit"
            form="academic-settings-form"
            disabled={saving || loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-[#0B3D7A] shadow-lg transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Save size={20} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="mx-auto -mt-14 max-w-6xl px-4 sm:px-6">
        {loading ? (
          <div className="rounded-3xl border border-blue-100 bg-white p-20 shadow-sm">
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-lg text-[#1557A6]"></span>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <section className="grid gap-4 sm:grid-cols-3">
                <SummaryCard
                  icon={GraduationCap}
                  iconClass="bg-green-50 text-green-600"
                  label="Semester Progress"
                  value={`${summary.progress}%`}
                  meta={`Week ${summary.currentWeek} of ${summary.totalWeeks || 0}`}
                />

                <SummaryCard
                  icon={TimerReset}
                  iconClass="bg-red-50 text-red-600"
                  label="Exams Countdown"
                  value={summary.examDaysLeft !== null ? summary.examDaysLeft : "Not set"}
                  meta="Days remaining"
                />

                <SummaryCard
                  icon={CalendarDays}
                  iconClass="bg-blue-50 text-[#1557A6]"
                  label="Academic Year"
                  value={form.academic_year || "Not set"}
                  meta={`${summary.semesterDays || 0} semester days`}
                />
              </section>

              <form
                id="academic-settings-form"
                onSubmit={saveSettings}
                className="rounded-3xl border border-blue-100 bg-white shadow-sm"
              >
                <div className="border-b border-blue-100 p-5 sm:p-6">
                  <h2 className="text-2xl font-extrabold text-[#0B3D7A]">
                    Calendar Details
                  </h2>
                  <p className="mt-1 text-slate-500">
                    Keep the current academic year, semester window, and exam window aligned.
                  </p>
                </div>

                <div className="grid gap-6 p-5 sm:p-6">
                  <div>
                    <label className="mb-2 block font-bold text-[#0B3D7A]">
                      Academic Year
                    </label>
                    <input
                      className="input input-bordered h-12 w-full border-blue-100 bg-white font-semibold text-[#102033] focus:border-[#1557A6]"
                      value={form.academic_year}
                      onChange={(e) => updateField("academic_year", e.target.value)}
                      placeholder="2025-2026"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <DateField
                      icon={GraduationCap}
                      label="Semester Start"
                      value={form.semester_start_date}
                      onChange={(value) => updateField("semester_start_date", value)}
                    />

                    <DateField
                      icon={CalendarClock}
                      label="Semester End"
                      value={form.semester_end_date}
                      onChange={(value) => updateField("semester_end_date", value)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <DateField
                      icon={TimerReset}
                      label="Exams Start"
                      value={form.exams_start_date}
                      onChange={(value) => updateField("exams_start_date", value)}
                    />

                    <DateField
                      icon={Clock3}
                      label="Exams End"
                      value={form.exams_end_date}
                      onChange={(value) => updateField("exams_end_date", value)}
                    />
                  </div>
                </div>
              </form>
            </div>

            <aside className="space-y-5">
              <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#0B3D7A]">
                      Student Card Preview
                    </h2>
                    <p className="text-sm text-slate-500">
                      Values update as you edit the dates.
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF3FF] text-[#1557A6]">
                    <CalendarDays size={22} />
                  </div>
                </div>

                <div className="space-y-4">
                  <PreviewRow label="Final Exams">
                    <span className="text-3xl font-extrabold text-[#102033]">
                      {summary.examDaysLeft !== null ? summary.examDaysLeft : "Not set"}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      days remaining
                    </span>
                  </PreviewRow>

                  <div className="rounded-2xl border border-blue-100 bg-[#F8FAFF] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-500">
                          Semester Progress
                        </p>
                        <p className="mt-1 text-3xl font-extrabold text-[#102033]">
                          {summary.progress}%
                        </p>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        Week {summary.currentWeek}
                      </span>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{ width: `${summary.progress}%` }}
                      ></div>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-500">
                      Week {summary.currentWeek} of {summary.totalWeeks || 0}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <AlertCircle size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0B3D7A]">
                      Date Summary
                    </h2>
                    <p className="text-sm text-slate-500">
                      Current configured ranges
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <DetailLine label="Semester starts" value={formatDate(form.semester_start_date)} />
                  <DetailLine label="Semester ends" value={formatDate(form.semester_end_date)} />
                  <DetailLine label="Exams start" value={formatDate(form.exams_start_date)} />
                  <DetailLine label="Exams end" value={formatDate(form.exams_end_date)} />
                  <DetailLine label="Exam window" value={`${summary.examDays || 0} days`} />
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function DateField({ icon: Icon, label, value, onChange }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-[#F8FAFF] p-4">
      <label className="mb-3 flex items-center gap-2 font-bold text-[#0B3D7A]">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#1557A6]">
          <Icon size={18} />
        </span>
        {label}
      </label>
      <input
        type="date"
        className="input input-bordered h-12 w-full border-blue-100 bg-white font-semibold text-[#102033] focus:border-[#1557A6]"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SummaryCard({ icon: Icon, iconClass, label, value, meta }) {
  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}>
        <Icon size={24} />
      </div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <h2 className="mt-1 break-words text-3xl font-extrabold text-[#102033]">
        {value}
      </h2>
      <p className="mt-2 text-sm font-semibold text-slate-500">{meta}</p>
    </div>
  );
}

function PreviewRow({ label, children }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-[#F8FAFF] p-4">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <div className="mt-1 flex flex-wrap items-end gap-x-2 gap-y-1">
        {children}
      </div>
    </div>
  );
}

function DetailLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F8FAFF] px-4 py-3">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-right font-extrabold text-[#102033]">{value}</span>
    </div>
  );
}
