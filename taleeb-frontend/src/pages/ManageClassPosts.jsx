import { createElement, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  ClipboardList,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Link as LinkIcon,
  Megaphone,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const initialForm = {
  title: "",
  content: "",
  type: "announcement",
  external_link: "",
  is_published: true,
};

const filters = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "hidden", label: "Hidden" },
  { key: "course", label: "Courses" },
  { key: "td", label: "TD" },
  { key: "reminder", label: "Reminders" },
  { key: "link", label: "Links" },
];

export default function ManageClassPosts() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [attachment, setAttachment] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    let isActive = true;

    const loadPosts = async () => {
      try {
        const res = await api.get("/class-posts");

        if (isActive) {
          setPosts(res.data);
        }
      } catch {
        toast.error("Failed to load class posts.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      isActive = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((post) => post.is_published).length,
      hidden: posts.filter((post) => !post.is_published).length,
      files: posts.filter((post) => post.attachment_path).length,
    }),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    switch (activeFilter) {
      case "published":
        return posts.filter((post) => post.is_published);
      case "hidden":
        return posts.filter((post) => !post.is_published);
      case "course":
      case "td":
      case "reminder":
      case "link":
        return posts.filter((post) => post.type === activeFilter);
      default:
        return posts;
    }
  }, [activeFilter, posts]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openCreateModal = () => {
    setForm(initialForm);
    setAttachment(null);
    setEditingId(null);
    setOpen(true);
  };

  const openEditModal = (post) => {
    setForm({
      title: post.title,
      content: post.content || "",
      type: post.type,
      external_link: post.external_link || "",
      is_published: post.is_published,
    });

    setAttachment(null);
    setEditingId(post.id);
    setOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setOpen(false);
    setEditingId(null);
    setAttachment(null);
    setForm(initialForm);
  };

  const savePost = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content || "");
    formData.append("type", form.type);
    formData.append("external_link", form.external_link || "");
    formData.append("is_published", form.is_published ? "1" : "0");

    if (attachment) {
      formData.append("attachment", attachment);
    }

    try {
      setSubmitting(true);

      if (editingId) {
        const res = await api.post(`/class-posts/${editingId}?_method=PUT`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setPosts((prev) =>
          prev.map((post) => (post.id === editingId ? res.data.data : post))
        );

        toast.success("Class post updated.");
      } else {
        const res = await api.post("/class-posts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setPosts((prev) => [res.data.data, ...prev]);
        toast.success("Class post created.");
      }

      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save class post.");
    } finally {
      setSubmitting(false);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm("Delete this class post?")) return;

    try {
      await api.delete(`/class-posts/${id}`);
      setPosts((prev) => prev.filter((post) => post.id !== id));
      toast.success("Class post deleted.");
    } catch {
      toast.error("Failed to delete class post.");
    }
  };

  const togglePublish = async (post) => {
    const formData = new FormData();

    formData.append("title", post.title);
    formData.append("content", post.content || "");
    formData.append("type", post.type);
    formData.append("external_link", post.external_link || "");
    formData.append("is_published", post.is_published ? "0" : "1");

    try {
      const res = await api.post(`/class-posts/${post.id}?_method=PUT`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPosts((prev) =>
        prev.map((item) => (item.id === post.id ? res.data.data : item))
      );

      toast.success(res.data.data.is_published ? "Post visible." : "Post hidden.");
    } catch {
      toast.error("Failed to update visibility.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-4 pb-28 pt-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#1557A6] text-white">
              <ClipboardList size={22} />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">
              Manage Class Posts
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Create class updates, course files, TDs, reminders, and links.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1557A6] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0B3D7A]"
          >
            <Plus size={18} />
            New Post
          </button>
        </header>

        <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={ClipboardList} label="Total" value={stats.total} />
          <StatCard icon={Eye} label="Published" value={stats.published} tone="green" />
          <StatCard icon={EyeOff} label="Hidden" value={stats.hidden} tone="slate" />
          <StatCard icon={FileText} label="Files" value={stats.files} tone="blue" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-3 sm:p-4">
            <div className="flex gap-2 overflow-x-auto">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`h-9 shrink-0 rounded-lg px-3 text-xs font-extrabold transition ${
                    activeFilter === filter.key
                      ? "bg-[#1557A6] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((item) => (
                <PostSkeleton key={item} />
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredPosts.map((post) => (
                <PostRow
                  key={post.id}
                  post={post}
                  onDelete={deletePost}
                  onEdit={openEditModal}
                  onTogglePublish={togglePublish}
                />
              ))}
            </div>
          ) : (
            <EmptyState activeFilter={activeFilter} onCreate={openCreateModal} />
          )}
        </section>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-950">
                  {editingId ? "Edit Class Post" : "Create Class Post"}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Keep it short, clear, and ready for the class feed.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={savePost} className="space-y-5 p-5">
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-800">
                  Title
                </span>
                <input
                  className="input input-bordered w-full border-slate-200 bg-white text-slate-900 focus:border-[#1557A6]"
                  placeholder="Post title"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-800">
                    Type
                  </span>
                  <select
                    className="select select-bordered w-full border-slate-200 bg-white text-slate-900 focus:border-[#1557A6]"
                    value={form.type}
                    onChange={(e) => updateField("type", e.target.value)}
                  >
                    <option value="announcement">Announcement</option>
                    <option value="course">Cours</option>
                    <option value="td">TD</option>
                    <option value="reminder">Reminder</option>
                    <option value="link">Link</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-800">
                    External link
                  </span>
                  <input
                    className="input input-bordered w-full border-slate-200 bg-white text-slate-900 focus:border-[#1557A6]"
                    placeholder="Optional URL"
                    value={form.external_link}
                    onChange={(e) => updateField("external_link", e.target.value)}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-800">
                  Content
                </span>
                <textarea
                  className="textarea textarea-bordered min-h-32 w-full border-slate-200 bg-white text-slate-900 focus:border-[#1557A6]"
                  placeholder="Write the message students will read"
                  value={form.content}
                  onChange={(e) => updateField("content", e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-800">
                  Attachment
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/png,image/jpeg"
                  onChange={(e) => setAttachment(e.target.files[0])}
                  className="file-input file-input-bordered w-full border-slate-200 bg-white text-slate-900"
                />
              </label>

              <ToggleCard
                checked={form.is_published}
                icon={form.is_published ? Eye : EyeOff}
                label="Publish now"
                text="Visible in the class feed after saving."
                onChange={(checked) => updateField("is_published", checked)}
              />

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
                  {editingId ? "Update Post" : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function PostRow({ post, onDelete, onEdit, onTogglePublish }) {
  const hasAttachment = Boolean(post.attachment_path);
  const hasLink = Boolean(post.external_link);

  return (
    <article className="p-4 transition hover:bg-slate-50 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <div
            className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getTypeStyle(
              post.type
            )}`}
          >
            <PostTypeIcon type={post.type} size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase text-[#1557A6]">
                {formatType(post.type)}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {formatDate(post.created_at)}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase ${
                  post.is_published
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {post.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                {post.is_published ? "Published" : "Hidden"}
              </span>
            </div>

            <h2 className="mt-1 break-words text-lg font-extrabold leading-snug text-slate-950">
              {post.title}
            </h2>

            {post.content && (
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
                {post.content}
              </p>
            )}

            {(post.department || post.level) && (
              <p className="mt-3 text-xs font-bold text-slate-400">
                {[post.department, post.level].filter(Boolean).join(" - ")}
              </p>
            )}

            {(hasLink || hasAttachment) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {hasLink && (
                  <a
                    href={post.external_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 max-w-full items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:border-[#1557A6]/40 hover:text-[#1557A6]"
                  >
                    <ExternalLink size={16} />
                    Link
                  </a>
                )}

                {hasAttachment && <AttachmentButton post={post} />}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 lg:flex lg:shrink-0">
          <button
            type="button"
            onClick={() => onEdit(post)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 text-xs font-extrabold text-[#1557A6] transition hover:bg-blue-100"
          >
            <Pencil size={15} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onTogglePublish(post)}
            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-extrabold transition ${
              post.is_published
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {post.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
            {post.is_published ? "Hide" : "Show"}
          </button>

          <button
            type="button"
            onClick={() => onDelete(post.id)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-extrabold text-red-600 transition hover:bg-red-600 hover:text-white"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function AttachmentButton({ post }) {
  const [downloading, setDownloading] = useState(false);
  const fileName = post.attachment_name || getFileName(post.attachment_path);

  const downloadAttachment = async () => {
    try {
      setDownloading(true);

      const res = await api.get(`/class-posts/${post.id}/attachment`, {
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
      className="inline-flex h-9 max-w-full items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:border-[#1557A6]/40 hover:text-[#1557A6] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Download size={16} />
      <span className="truncate">{downloading ? "Downloading..." : fileName}</span>
    </button>
  );
}

function StatCard({ icon: Icon, label, value, tone = "navy" }) {
  const tones = {
    navy: "bg-[#EAF3FF] text-[#1557A6]",
    green: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-sky-50 text-sky-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-950">{value}</p>
    </div>
  );
}

function ToggleCard({ checked, icon: Icon, label, text, onChange }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
        checked
          ? "border-[#1557A6] bg-blue-50/70"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <input
        type="checkbox"
        className="checkbox checkbox-primary mt-1"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-extrabold text-slate-900">
          <Icon size={17} />
          {label}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-slate-500">
          {text}
        </span>
      </span>
    </label>
  );
}

function PostSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ activeFilter, onCreate }) {
  return (
    <div className="p-10 text-center sm:p-14">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3FF] text-[#1557A6]">
        <ClipboardList size={28} />
      </div>
      <h3 className="text-lg font-extrabold text-slate-950">
        No class posts found
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-sm font-medium text-slate-500">
        {activeFilter === "all"
          ? "Create the first post to start sharing updates with your class."
          : "No posts match this filter yet."}
      </p>
      {activeFilter === "all" && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1557A6] px-4 text-sm font-extrabold text-white transition hover:bg-[#0B3D7A]"
        >
          <Plus size={17} />
          New Post
        </button>
      )}
    </div>
  );
}

function PostTypeIcon({ type, size }) {
  return createElement(getTypeIcon(type), { size });
}

function getTypeIcon(type) {
  switch (type) {
    case "course":
      return BookOpen;
    case "td":
      return ClipboardList;
    case "reminder":
      return Bell;
    case "link":
      return LinkIcon;
    default:
      return Megaphone;
  }
}

function getTypeStyle(type) {
  switch (type) {
    case "course":
      return "bg-blue-50 text-[#1557A6]";
    case "td":
      return "bg-amber-50 text-amber-600";
    case "reminder":
      return "bg-red-50 text-red-600";
    case "link":
      return "bg-violet-50 text-violet-600";
    default:
      return "bg-emerald-50 text-emerald-600";
  }
}

function formatType(type) {
  switch (type) {
    case "course":
      return "Course";
    case "td":
      return "TD";
    case "reminder":
      return "Reminder";
    case "link":
      return "Link";
    default:
      return "Announcement";
  }
}

function formatDate(date) {
  if (!date) return "";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getFileName(path) {
  return path?.split("/").pop() || "Attachment";
}
