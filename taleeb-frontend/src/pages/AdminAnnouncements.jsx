import { useEffect, useMemo, useState } from "react";
import {
AlertTriangle,
Building2,
CalendarClock,
Download,
Eye,
EyeOff,
FileText,
Megaphone,
PlusCircle,
Send,
Trash2,
UsersRound,
Pencil,
X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const initialForm = {
title: "",
content: "",
department: "",
level: "",
is_important: false,
is_published: true,
};

const filters = [
{ key: "all", label: "All" },
{ key: "published", label: "Published" },
{ key: "important", label: "Important" },
{ key: "hidden", label: "Hidden" },
];

function formatDate(value) {
if (!value) {
return "No date";
}

return new Date(value).toLocaleString([], {
month: "short",
day: "numeric",
hour: "2-digit",
minute: "2-digit",
});
}
export default function AdminAnnouncements() {
const [announcements, setAnnouncements] = useState([]);
const [form, setForm] = useState(initialForm);
const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(true);
const [activeFilter, setActiveFilter] = useState("all");
const [submitting, setSubmitting] = useState(false);
const [editingId, setEditingId] = useState(null);
const [attachment, setAttachment] = useState(null);

useEffect(() => {
let isActive = true;

const fetchAnnouncements = async () => {
try {
const res = await api.get("/announcements");

if (isActive) {
setAnnouncements(res.data);
}
} catch {
toast.error("Failed to load announcements.");
} finally {
if (isActive) {
setLoading(false);
}
}
};

fetchAnnouncements();

return () => {
isActive = false;
};
}, []);

const stats = useMemo(
() => ({
total: announcements.length,
published: announcements.filter((item) => item.is_published).length,
important: announcements.filter((item) => item.is_important).length,
targeted: announcements.filter((item) => item.department || item.level).length,
}),
[announcements]
);

const filteredAnnouncements = useMemo(() => {
switch (activeFilter) {
case "published":
return announcements.filter((item) => item.is_published);
case "important":
return announcements.filter((item) => item.is_important);
case "hidden":
return announcements.filter((item) => !item.is_published);
default:
return announcements;
}
}, [activeFilter, announcements]);

const updateField = (key, value) => {
setForm((prev) => ({ ...prev, [key]: value }));
};

const openCreateModal = () => {
setForm(initialForm);
setEditingId(null);
setOpen(true);
setAttachment(null);
};

const openEditModal = (item) => {
setForm({
title: item.title,
content: item.content,
department: item.department || "",
level: item.level || "",
is_important: item.is_important,
is_published: item.is_published,
});

setEditingId(item.id);
setOpen(true);
setAttachment(null);
};

const closeModal = () => {
if (submitting) {
return;
}

setOpen(false);
setForm(initialForm);
setEditingId(null);
setAttachment(null);
};

const togglePublish = async (item) => {
try {
const payload = {
title: item.title,
content: item.content,
department: item.department || null,
level: item.level || null,
is_important: item.is_important,
is_published: !item.is_published,
};

const res = await api.put(`/announcements/${item.id}`, payload);

setAnnouncements((prev) =>
prev.map((ann) => (ann.id === item.id ? res.data.data : ann))
);

toast.success(
res.data.data.is_published ? "Announcement is visible." : "Announcement hidden."
);
} catch {
toast.error("Failed to update visibility.");
}
};

const saveAnnouncement = async (e) => {
e.preventDefault();

if (!form.title.trim() || !form.content.trim()) {
toast.error("Title and content are required.");
return;
}

try {
setSubmitting(true);

const formData = new FormData();

formData.append("title", form.title);
formData.append("content", form.content);
formData.append("department", form.department || "");
formData.append("level", form.level || "");
formData.append("is_important", form.is_important ? "1" : "0");
formData.append("is_published", form.is_published ? "1" : "0");

if (attachment) {
formData.append("attachment", attachment);
}
	
if (editingId) {
const res = await api.post(`/announcements/${editingId}?_method=PUT`, formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

setAnnouncements((prev) =>
prev.map((item) =>
item.id === editingId ? res.data.data : item
)
);

toast.success("Announcement updated.");
} else {
const res = await api.post("/announcements", formData, {
headers: { "Content-Type": "multipart/form-data" },
});

setAnnouncements((prev) => [res.data.data, ...prev]);
toast.success("Announcement published.");
}

setForm(initialForm);
setEditingId(null);
setAttachment(null);
setOpen(false);
} catch (err) {
toast.error(err.response?.data?.message || "Failed to save announcement.");
} finally {
setSubmitting(false);
}
};

const deleteAnnouncement = async (id) => {
if (!window.confirm("Delete this announcement?")) {
return;
}

try {
await api.delete(`/announcements/${id}`);
setAnnouncements((prev) => prev.filter((item) => item.id !== id));
toast.success("Announcement deleted.");
} catch {
toast.error("Failed to delete announcement.");
}
};

return (
<div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    News Management
                </h2>
                <p className="mt-1 text-slate-500">
                    Publish, target, and monitor student-facing announcements.
                </p>
            </div>

            <button onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1557A6] px-5 py-3 font-extrabold text-white shadow-sm transition hover:bg-[#0B3D7A]">
                <PlusCircle size={20} />
                New Announcement
            </button>
        </div>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Megaphone} label="Total Posts" value={stats.total} />
            <StatCard icon={Eye} label="Published" value={stats.published} tone="green" />
            <StatCard icon={AlertTriangle} label="Important" value={stats.important} tone="red" />
            <StatCard icon={UsersRound} label="Targeted" value={stats.targeted} tone="blue" />
        </section>

        <section
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/30 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold text-[#0B3D7A] sm:text-2xl">
                            Announcement Center
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 sm:text-base">
                            Review posts by status before students see them.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter) => (
                        <button key={filter.key} onClick={()=> setActiveFilter(filter.key)}
                            className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                            activeFilter === filter.key
                            ? "bg-[#1557A6] text-white shadow-sm"
                            : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-[#1557A6]"
                            }`}
                            >
                            {filter.label}
                        </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
            <div className="flex justify-center p-20">
                <span className="loading loading-spinner loading-lg text-[#1557A6]"></span>
            </div>
            ) : filteredAnnouncements.length > 0 ? (
            <div className="divide-y divide-slate-100">
                {filteredAnnouncements.map((item) => (
                <AnnouncementRow key={item.id} item={item} onDelete={deleteAnnouncement} onEdit={openEditModal}
                    onTogglePublish={togglePublish} />
                    
                ))}
            </div>
            ) : (
            <EmptyState activeFilter={activeFilter} />
            )}
        </section>
    {open && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
        <div
            className="w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4 border-b border-blue-100 p-5 sm:p-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-[#0B3D7A]">
                        {editingId ? "Edit Announcement" : "Create Announcement"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Choose the audience and publication status.
                    </p>
                </div>

                <button type="button" onClick={closeModal}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={saveAnnouncement} className="space-y-5 p-5 sm:p-6">
                <label className="block">
                    <span className="mb-2 block text-sm font-extrabold text-[#102033]">
                        Title
                    </span>
                    <input
                        className="input input-bordered w-full border-blue-100 bg-white text-[#102033] focus:border-[#1557A6]"
                        placeholder="Short, clear announcement title" value={form.title} onChange={(e)=>
                    updateField("title", e.target.value)}
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm font-extrabold text-[#102033]">
                        Message
                    </span>
                    <textarea
                        className="textarea textarea-bordered min-h-36 w-full border-blue-100 bg-white text-[#102033] focus:border-[#1557A6]"
                        placeholder="Write the announcement students will read" value={form.content} onChange={(e)=> updateField("content", e.target.value)}
                />
              </label>
              <input
  type="file"
  accept=".pdf,image/png,image/jpeg"
  onChange={(e) => setAttachment(e.target.files[0])}
  className="file-input file-input-bordered text-[#102033] bg-white border-blue-100 w-full"
/>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-[#102033]">
                    Department
                  </span>
                  <input
                    className="input input-bordered w-full border-blue-100 bg-white text-[#102033] focus:border-[#1557A6]"
                    placeholder="All departments"
                    value={form.department}
                    onChange={(e) => updateField("department", e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-[#102033]">
                    Level
                  </span>
                  <select
                    className="select select-bordered w-full border-blue-100 bg-white text-[#102033] focus:border-[#1557A6]"
                    value={form.level}
                    onChange={(e) => updateField("level", e.target.value)}
                  >
                    <option value="">All Levels</option>
                    <option>S1</option>
                    <option>S2</option>
                    <option>S3</option>
                    <option>S4</option>
                    <option>S5</option>
                    <option>S6</option>
                  </select>
                </label>
              </div>
                          
              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleCard
                  checked={form.is_important}
                  icon={AlertTriangle}
                  label="Mark as important"
                  text="Adds an urgent label in the feed."
                  onChange={(checked) => updateField("is_important", checked)}
                />
                <ToggleCard
                  checked={form.is_published}
                  icon={form.is_published ? Eye : EyeOff}
                  label="Publish immediately"
                  text="Visible to the selected audience."
                  onChange={(checked) => updateField("is_published", checked)}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn border-none bg-slate-100 text-slate-600 hover:bg-slate-200"
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn border-none bg-[#1557A6] text-white hover:bg-[#0B3D7A]"
                  disabled={submitting}
                >
                  <Send size={18} />
                  {editingId ? "Update" : "Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone = "navy" }) {
  const tones = {
    navy: "bg-[#EAF3FF] text-[#1557A6]",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-sky-50 text-sky-600",
  };

  return (
    <div className="rounded-[1.25rem] border border-blue-100 bg-white p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
        <Icon size={22} />
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-3xl font-extrabold text-[#102033]">
        {value}
      </p>
    </div>
  );
}

function AttachmentLink({ item }) {
  const [downloading, setDownloading] = useState(false);
  const fileName = item.attachment_name || "Download attachment";
  const extension = fileName.includes(".")
    ? fileName.split(".").pop().toUpperCase()
    : "FILE";

  const downloadAttachment = async () => {
    try {
      setDownloading(true);

      const res = await api.get(`/announcements/${item.id}/attachment`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download attachment.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={downloadAttachment}
      disabled={downloading}
      className="mt-4 inline-flex max-w-full items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#1557A6]/30 hover:bg-blue-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FF] text-[#1557A6]">
        <FileText size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold text-[#102033]">
          {fileName}
        </span>
        <span className="mt-0.5 block text-xs font-bold uppercase text-slate-400">
          {downloading ? "Downloading..." : `Download ${extension} file`}
        </span>
      </span>
      <Download className="shrink-0 text-[#1557A6]" size={18} />
    </button>
  );
}

function AnnouncementRow({ item, onDelete, onEdit, onTogglePublish }) {
  const target = [
    item.department || "All Departments",
    item.level || "All Levels",
  ].join(" - ");

  return (
    <article className="p-4 transition hover:bg-blue-50/40 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold leading-tight text-[#102033] sm:text-xl">
              {item.title}
            </h3>

            {item.is_important && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-extrabold uppercase text-red-700">
                <AlertTriangle size={13} />
                Important
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold uppercase ${
                item.is_published
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {item.is_published ? <Eye size={13} /> : <EyeOff size={13} />}
              {item.is_published ? "Published" : "Hidden"}
            </span>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {item.content}
          </p>

          {item.attachment_path && <AttachmentLink item={item} />}

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFF] px-3 py-1.5 text-[#0B3D7A]">
              <Building2 size={14} />
              {target}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFF] px-3 py-1.5">
              <CalendarClock size={14} />
              {formatDate(item.created_at)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
  <button
    onClick={() => onEdit(item)}
    className="btn btn-sm bg-blue-50 text-[#1557A6] border-none hover:bg-blue-100"
  >
    <Pencil size={16} />
    Edit
  </button>

  <button
    onClick={() => onTogglePublish(item)}
    className={`btn btn-sm border-none ${
      item.is_published
        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
        : "bg-green-50 text-green-700 hover:bg-green-100"
    }`}
  >
    {item.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
    {item.is_published ? "Hide" : "Show"}
  </button>

  <button
    onClick={() => onDelete(item.id)}
    className="btn btn-sm bg-red-50 text-red-600 border-none hover:bg-red-600 hover:text-white"
  >
    <Trash2 size={16} />
    Delete
  </button>
</div>
      </div>
    </article>
  );
}

function ToggleCard({ checked, icon: Icon, label, text, onChange }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
        checked
          ? "border-[#1557A6] bg-blue-50/60"
          : "border-blue-100 bg-white hover:bg-[#F8FAFF]"
      }`}
    >
      <input
        type="checkbox"
        className="checkbox checkbox-primary mt-1"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 font-extrabold text-[#102033]">
          <Icon size={17} />
          {label}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          {text}
        </p>
      </div>
    </label>
  );
}

function EmptyState({ activeFilter }) {
  return (
    <div className="p-12 text-center sm:p-16">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3FF] text-[#1557A6]">
        <Megaphone size={30} />
      </div>
      <h3 className="text-xl font-extrabold text-[#0B3D7A]">
        No announcements found
      </h3>
      <p className="mt-2 text-sm text-slate-500 sm:text-base">
        {activeFilter === "all"
          ? "Create the first announcement to start notifying students."
          : "No posts match this filter yet."}
      </p>
    </div>
  );
}
