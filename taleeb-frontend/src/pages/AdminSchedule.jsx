import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, MapPin, Pencil, PlusCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const semesterFilters = ["S1", "S2", "S3", "S4", "S5", "S6"];
const sectionFilters = ["Informatique", "Mathématiques", "Physique", "Chimie"];

const initialForm = {
  department: "Informatique",
  level: "S1",
  day: "Monday",
  subject: "",
  type: "cours",
  teacher: "",
  room: "",
  start_time: "08:30",
  end_time: "10:00",
};

const buildInitialForm = (department = "Informatique") => ({
  ...initialForm,
  department,
});

export default function AdminSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState("S1");
  const [sectionFilter, setSectionFilter] = useState("Informatique");
  const [sectionOptions, setSectionOptions] = useState(sectionFilters);

  useEffect(() => {
    let isActive = true;

    const loadPageData = async () => {
      try {
        const [scheduleRes, sectionRes] = await Promise.all([
          api.get("/schedule"),
          api.get("/academic-sections"),
        ]);

        if (isActive) {
          const scheduleData = scheduleRes.data;
          const sections = normalizeSections(sectionRes.data);
          const nextSectionOptions = sections.length ? sections : sectionFilters;

          setSchedules(scheduleData);
          setSectionOptions(nextSectionOptions);

          setSectionFilter((currentSection) =>
            nextSectionOptions.includes(currentSection) ? currentSection : nextSectionOptions[0]
          );
        }
      } catch {
        toast.error("Failed to load schedule data.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredSchedules = useMemo(
    () =>
      schedules.filter((item) => item.level === levelFilter && item.department === sectionFilter),
    [levelFilter, schedules, sectionFilter]
  );

  const stats = useMemo(
    () => ({
      total: schedules.length,
      courses: schedules.filter((item) => item.type === "cours").length,
      td: schedules.filter((item) => item.type === "td").length,
      rooms: new Set(schedules.map((item) => item.room).filter(Boolean)).size,
    }),
    [schedules]
  );

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openCreateModal = () => {
    setForm(buildInitialForm(sectionFilter || sectionOptions[0]));
    setEditingId(null);
    setOpen(true);
  };

  const openEditModal = (item) => {
    setForm({
      department: item.department,
      level: item.level,
      day: item.day,
      subject: item.subject,
      type: item.type,
      teacher: item.teacher || "",
      room: item.room || "",
      start_time: item.start_time?.slice(0, 5),
      end_time: item.end_time?.slice(0, 5),
    });

    setEditingId(item.id);
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.subject.trim()) {
      toast.error("Subject is required.");
      return;
    }

    try {
      if (editingId) {
        const res = await api.put(`/schedule/${editingId}`, form);

        setSchedules((prev) =>
          prev.map((item) => (item.id === editingId ? res.data.data : item))
        );

        toast.success("Schedule updated.");
      } else {
        const res = await api.post("/schedule", form);

        setSchedules((prev) => [res.data.data, ...prev]);
        toast.success("Schedule created.");
      }

      setOpen(false);
      setForm(buildInitialForm(sectionFilter || sectionOptions[0]));
      setEditingId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save schedule.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this schedule session?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/schedule/${id}`);
      setSchedules((prev) => prev.filter((item) => item.id !== id));
      toast.success("Schedule deleted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete schedule.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Schedule Management
          </h2>
          <p className="mt-1 text-slate-500">
            Create, update, and filter course and TD sessions by semester.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1557A6] px-5 py-3 font-extrabold text-white shadow-sm transition hover:bg-[#0B3D7A]"
        >
          <PlusCircle size={20} />
          Add Session
        </button>
      </div>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Sessions" count={stats.total} icon={<CalendarDays size={22} />} color="indigo" />
        <StatCard label="Courses" count={stats.courses} icon={<CalendarDays size={22} />} color="sky" />
        <StatCard label="TD Sessions" count={stats.td} icon={<Clock size={22} />} color="amber" />
        <StatCard label="Rooms" count={stats.rooms} icon={<MapPin size={22} />} color="emerald" />
      </section>

      <SemesterCards
        activeLevel={levelFilter}
        activeSection={sectionFilter}
        items={schedules}
        getLevel={(item) => item.level}
        getSection={(item) => item.department}
        noun="session"
        onSelect={setLevelFilter}
      />

      <SectionCards
        activeSection={sectionFilter}
        activeLevel={levelFilter}
        items={schedules}
        sections={sectionOptions}
        getLevel={(item) => item.level}
        getSection={(item) => item.department}
        noun="session"
        onSelect={setSectionFilter}
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/30 p-5">
          <h3 className="text-xl font-extrabold text-slate-900">
            Weekly Sessions
          </h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-[#1557A6]" />
            <p className="mt-4 font-medium text-slate-500">Loading schedule...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] table-fixed text-left">
              <colgroup>
                <col className="w-[11%]" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
                <col className="w-[10%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[17%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-7 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Day</th>
                  <th className="px-7 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Time</th>
                  <th className="px-7 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Subject</th>
                  <th className="px-7 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Type</th>
                  <th className="px-7 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Teacher</th>
                  <th className="px-7 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Group</th>
                  <th className="px-7 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSchedules.map((item) => (
                  <tr key={item.id} className="transition hover:bg-blue-50/30">
                    <td className="px-7 py-6 text-base font-extrabold text-slate-900">{item.day}</td>
                    <td className="whitespace-nowrap px-7 py-6 text-sm font-bold text-slate-600">
                      {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}
                    </td>
                    <td className="truncate px-7 py-6 text-base font-bold text-slate-700">{item.subject}</td>
                    <td className="px-7 py-6">
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                        item.type === "td"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-[#1557A6]"
                      }`}>
                        {item.type === "td" ? "TD" : "Cours"}
                      </span>
                    </td>
                    <td className="truncate px-7 py-6 text-sm font-semibold text-slate-600">
                      {item.teacher || "No teacher"} {item.room ? ` - ${item.room}` : ""}
                    </td>
                    <td className="px-7 py-6">
                      <div className="flex items-center gap-2">
                        <span className="max-w-[130px] truncate rounded-xl bg-[#EAF3FF] px-3 py-1.5 text-xs font-black text-[#0B3D7A]">
                          {item.department}
                        </span>
                        <span className="shrink-0 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                          {item.level}
                        </span>
                      </div>
                    </td>
                    <td className="px-7 py-6">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-4 py-2 text-xs font-bold text-[#1557A6] transition hover:bg-blue-100"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSchedules.length === 0 && (
              <div className="py-16 text-center text-slate-500">
                No schedule sessions found for this semester.
              </div>
            )}
          </div>
        )}
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-[#0B3D7A]">
              {editingId ? "Edit Session" : "Add Session"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-slate-800 md:grid-cols-2">
              <select className="select select-bordered border-slate-200 bg-white" value={form.department} onChange={(e) => updateField("department", e.target.value)}>
                {sectionOptions.map((section) => <option key={section} value={section}>{section}</option>)}
              </select>
              <select className="select select-bordered border-slate-200 bg-white" value={form.level} onChange={(e) => updateField("level", e.target.value)}>
                {semesterFilters.map((semester) => <option key={semester}>{semester}</option>)}
              </select>
              <select className="select select-bordered border-slate-200 bg-white" value={form.day} onChange={(e) => updateField("day", e.target.value)}>
                <option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option>
              </select>
              <select className="select select-bordered border-slate-200 bg-white" value={form.type} onChange={(e) => updateField("type", e.target.value)}>
                <option value="cours">Cours</option>
                <option value="td">TD</option>
              </select>
              <input className="input input-bordered border-slate-200 bg-white md:col-span-2" placeholder="Subject" value={form.subject} onChange={(e) => updateField("subject", e.target.value)} />
              <input className="input input-bordered border-slate-200 bg-white" placeholder="Teacher" value={form.teacher} onChange={(e) => updateField("teacher", e.target.value)} />
              <input className="input input-bordered border-slate-200 bg-white" placeholder="Room" value={form.room} onChange={(e) => updateField("room", e.target.value)} />
              <input type="time" className="input input-bordered border-slate-200 bg-white" value={form.start_time} onChange={(e) => updateField("start_time", e.target.value)} />
              <input type="time" className="input input-bordered border-slate-200 bg-white" value={form.end_time} onChange={(e) => updateField("end_time", e.target.value)} />

              <div className="mt-4 flex justify-end gap-3 md:col-span-2">
                <button type="button" onClick={() => setOpen(false)} className="btn border-none bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button>
                <button type="submit" className="btn border-none bg-[#1557A6] text-white hover:bg-[#0B3D7A]">
                  {editingId ? "Update Session" : "Create Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, count, color, icon }) {
  const themes = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1">
      <div className={`rounded-2xl border p-3.5 ${themes[color]}`}>{icon}</div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-black leading-none text-slate-800">{count}</p>
      </div>
    </div>
  );
}

function SemesterCards({ activeLevel, activeSection, items, getLevel, getSection, noun, onSelect }) {
  const cards = semesterFilters.map((semester) => ({
      key: semester,
      label: semester,
      count: items.filter((item) => getLevel(item) === semester && getSection(item) === activeSection).length,
    }));

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-xl font-extrabold text-slate-900">Filter by Semester</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">Choose S1, S2, S3, S4, S5, or S6 to view its schedule.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => {
          const active = activeLevel === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => onSelect(card.key)}
              className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                active
                  ? "border-[#1557A6] bg-[#1557A6] text-white shadow-lg shadow-blue-900/15"
                  : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-100 hover:bg-blue-50"
              }`}
            >
              <span className={`text-xs font-bold uppercase ${active ? "text-blue-100" : "text-slate-400"}`}>Semester</span>
              <span className="mt-2 block text-2xl font-black">{card.label}</span>
              <span className={`mt-2 block text-sm font-bold ${active ? "text-blue-100" : "text-slate-500"}`}>
                {card.count} {noun}{card.count === 1 ? "" : "s"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SectionCards({ activeSection, activeLevel, items, sections: availableSections, getLevel, getSection, noun, onSelect }) {
  const sections = availableSections;

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-xl font-extrabold text-slate-900">Filter by Section</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">Choose a section such as Informatique to view its schedule.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => {
          const active = activeSection === section;
          const count = items.filter((item) => getSection(item) === section && getLevel(item) === activeLevel).length;
          return (
            <button
              key={section}
              type="button"
              onClick={() => onSelect(section)}
              className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                active
                  ? "border-[#1557A6] bg-[#1557A6] text-white shadow-lg shadow-blue-900/15"
                  : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-100 hover:bg-blue-50"
              }`}
            >
              <span className={`text-xs font-bold uppercase ${active ? "text-blue-100" : "text-slate-400"}`}>Section</span>
              <span className="mt-2 block text-2xl font-black">{section}</span>
              <span className={`mt-2 block text-sm font-bold ${active ? "text-blue-100" : "text-slate-500"}`}>
                {count} {noun}{count === 1 ? "" : "s"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function normalizeSections(sections) {
  return Array.from(
    new Set(
      sections
        .filter(Boolean)
        .map((section) => String(section).trim())
        .filter(Boolean)
    )
  ).sort((first, second) => first.localeCompare(second));
}
