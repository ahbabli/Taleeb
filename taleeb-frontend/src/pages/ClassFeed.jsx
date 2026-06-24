import { createElement, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  ClipboardList,
  Download,
  ExternalLink,
  Link as LinkIcon,
  Megaphone,
  RefreshCcw,
  Search,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const filters = [
  { key: "all", label: "All" },
  { key: "course", label: "Courses" },
  { key: "td", label: "TD" },
  { key: "reminder", label: "Reminders" },
  { key: "link", label: "Links" },
];

export default function ClassFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [query, setQuery] = useState("");

  const fetchPosts = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/class-posts");
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;

    api
      .get("/class-posts")
      .then((res) => {
        if (active) setPosts(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const visiblePosts = useMemo(() => {
    const search = query.trim().toLowerCase();

    return posts
      .filter((post) => {
        switch (activeFilter) {
          case "course":
          case "td":
          case "reminder":
          case "link":
            return post.type === activeFilter;
          default:
            return true;
        }
      })
      .filter((post) => {
        if (!search) return true;

        return `${post.title || ""} ${post.content || ""} ${
          post.author?.name || ""
        }`
          .toLowerCase()
          .includes(search);
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [activeFilter, posts, query]);

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-4 pb-28 pt-6 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">
              Class Feed
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Latest posts shared with your class.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPosts}
            disabled={refreshing}
            aria-label="Refresh feed"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-[#1557A6] disabled:opacity-50"
          >
            <RefreshCcw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
        </header>

        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-3">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts"
              className="h-10 w-full rounded-xl bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-800 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:bg-white focus:ring-[#1557A6]/40"
            />
          </label>

          <div className="mt-3 flex gap-2 overflow-x-auto">
            {filters.map((filter) => {
              const active = activeFilter === filter.key;

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`h-9 shrink-0 rounded-lg px-3 text-xs font-extrabold transition ${
                    active
                      ? "bg-[#1557A6] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </section>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <PostSkeleton key={item} />
            ))}
          </div>
        ) : visiblePosts.length ? (
          <div className="space-y-3">
            {visiblePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-lg font-extrabold text-slate-900">
              {posts.length ? "No posts found" : "No posts yet"}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {posts.length
                ? "Try another search or filter."
                : "New class updates will appear here."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function PostCard({ post }) {
  const hasAttachment = Boolean(post.attachment_path);
  const hasLink = Boolean(post.external_link);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex gap-3">
        <div
          className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getTypeStyle(
            post.type
          )}`}
        >
          <PostTypeIcon type={post.type} size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-[#1557A6]">
              {formatType(post.type)}
            </span>
            <span className="text-xs text-slate-400">
              {formatDate(post.created_at)}
            </span>
          </div>

          <h2 className="mt-1 text-lg font-extrabold leading-snug text-slate-950">
            {post.title}
          </h2>

          {post.content && (
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
              {post.content}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-slate-700 ring-1 ring-slate-200">
              <UserRound size={14} className="text-[#1557A6]" />
              <span className="font-bold">
                {post.author?.name || "Class representative"}
              </span>
              <span className="rounded-md bg-[#1557A6]/10 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-[#1557A6]">
                Responsable
              </span>
            </span>
            {[post.department, post.level].filter(Boolean).length > 0 && (
              <span>{[post.department, post.level].filter(Boolean).join(" - ")}</span>
            )}
          </div>

          {(hasLink || hasAttachment) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {hasLink && (
                <a
                  href={post.external_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:border-[#1557A6]/40 hover:text-[#1557A6]"
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

function PostSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
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
