import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const initialForm = {
  question: "",
  answer: "",
  category: "",
  is_published: true,
};

const filters = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "hidden", label: "Hidden" },
];

export default function AdminFAQ() {
  const [faqEntries, setFaqEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    let isActive = true;

    const fetchFAQ = async () => {
      try {
        const res = await api.get("/faq");

        if (isActive) {
          setFaqEntries(res.data);
        }
      } catch {
        toast.error("Failed to load FAQ.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchFAQ();

    return () => {
      isActive = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: faqEntries.length,
      published: faqEntries.filter((item) => item.is_published).length,
      hidden: faqEntries.filter((item) => !item.is_published).length,
      categories: new Set(faqEntries.map((item) => item.category).filter(Boolean)).size,
    }),
    [faqEntries]
  );

  const categories = useMemo(() => {
    const uniqueCategories = faqEntries
      .map((item) => item.category)
      .filter(Boolean);

    return ["all", ...Array.from(new Set(uniqueCategories))];
  }, [faqEntries]);

  const filteredFAQ = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faqEntries.filter((item) => {
      const matchesSearch = `${item.question} ${item.answer} ${item.category || ""}`
        .toLowerCase()
        .includes(query);

      const matchesStatus =
        activeFilter === "all" ||
        (activeFilter === "published" && item.is_published) ||
        (activeFilter === "hidden" && !item.is_published);

      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [activeCategory, activeFilter, faqEntries, search]);

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category || "",
      is_published: Boolean(item.is_published),
    });
    setOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const saveFAQ = async (e) => {
    e.preventDefault();

    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      category: form.category.trim() || null,
      is_published: form.is_published,
    };

    if (!payload.question || !payload.answer) {
      toast.error("Question and answer are required.");
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        const res = await api.put(`/faq/${editingId}`, payload);

        setFaqEntries((prev) =>
          prev.map((item) => (item.id === editingId ? res.data.data : item))
        );

        toast.success("FAQ updated.");
      } else {
        const res = await api.post("/faq", payload);

        setFaqEntries((prev) => [res.data.data, ...prev]);
        toast.success("FAQ created.");
      }

      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save FAQ.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteFAQ = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;

    try {
      await api.delete(`/faq/${id}`);
      setFaqEntries((prev) => prev.filter((item) => item.id !== id));
      toast.success("FAQ deleted.");
    } catch {
      toast.error("Failed to delete FAQ.");
    }
  };

  const togglePublish = async (item) => {
    const previousEntries = faqEntries;

    const updatedItem = {
      ...item,
      is_published: !item.is_published,
    };

    setFaqEntries((prev) =>
      prev.map((faq) => (faq.id === item.id ? updatedItem : faq))
    );

    try {
      const res = await api.put(`/faq/${item.id}`, {
        question: item.question,
        answer: item.answer,
        category: item.category || null,
        is_published: !item.is_published,
      });

      setFaqEntries((prev) =>
        prev.map((faq) => (faq.id === item.id ? res.data.data : faq))
      );

      toast.success(res.data.data.is_published ? "FAQ visible." : "FAQ hidden.");
    } catch {
      setFaqEntries(previousEntries);
      toast.error("Failed to update FAQ.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            FAQ Management
          </h2>
          <p className="mt-1 text-slate-500">
            Create, search, publish, and manage student help answers.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1557A6] px-5 py-3 font-extrabold text-white shadow-sm transition hover:bg-[#0B3D7A]"
        >
          <PlusCircle size={20} />
          New FAQ
        </button>
      </div>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Published" value={stats.published} tone="green" />
          <StatCard label="Hidden" value={stats.hidden} tone="slate" />
          <StatCard label="Categories" value={stats.categories} tone="blue" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/30 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[#0B3D7A] sm:text-2xl">
                  FAQ Entries
                </h2>
                <p className="mt-1 text-sm text-slate-500 sm:text-base">
                  Search, filter, publish, and edit answers.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search FAQ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-blue-100 bg-white pl-11 pr-4 text-[#102033] outline-none transition focus:border-[#1557A6] focus:ring-4 focus:ring-blue-50 md:w-72"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setActiveFilter(filter.key)}
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

            {categories.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition ${
                      activeCategory === category
                        ? "bg-[#EAF3FF] text-[#0B3D7A]"
                        : "bg-slate-50 text-slate-500 hover:bg-blue-50"
                    }`}
                  >
                    {category === "all" ? "All categories" : category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center p-20">
              <span className="loading loading-spinner loading-lg text-[#1557A6]"></span>
            </div>
          ) : filteredFAQ.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredFAQ.map((item) => (
                <FAQRow
                  key={item.id}
                  item={item}
                  onEdit={openEditModal}
                  onDelete={deleteFAQ}
                  onTogglePublish={togglePublish}
                />
              ))}
            </div>
          ) : (
            <EmptyState hasSearch={Boolean(search || activeFilter !== "all" || activeCategory !== "all")} />
          )}
        </section>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4 border-b border-blue-100 p-5 sm:p-6">
              <div>
                <h2 className="text-2xl font-extrabold text-[#0B3D7A]">
                  {editingId ? "Edit FAQ" : "Create FAQ"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Write a clear question and a useful answer.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveFAQ} className="space-y-5 p-5 sm:p-6">
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-[#102033]">
                  Question
                </span>
                <input
                  className="h-12 w-full rounded-2xl border border-blue-100 bg-white px-4 text-[#102033] outline-none transition focus:border-[#1557A6] focus:ring-4 focus:ring-blue-50"
                  placeholder="Example: How do I track my request?"
                  value={form.question}
                  onChange={(e) => updateField("question", e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-[#102033]">
                  Answer
                </span>
                <textarea
                  className="min-h-36 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-[#102033] outline-none transition focus:border-[#1557A6] focus:ring-4 focus:ring-blue-50"
                  placeholder="Write the answer students will see."
                  value={form.answer}
                  onChange={(e) => updateField("answer", e.target.value)}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-[#102033]">
                    Category
                  </span>
                  <input
                    className="h-12 w-full rounded-2xl border border-blue-100 bg-white px-4 text-[#102033] outline-none transition focus:border-[#1557A6] focus:ring-4 focus:ring-blue-50"
                    placeholder="Optional"
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                  />
                </label>

                <label className="flex h-12 items-center gap-3 rounded-2xl bg-[#F8FAFF] px-4 font-extrabold text-[#102033]">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={form.is_published}
                    onChange={(e) => updateField("is_published", e.target.checked)}
                  />
                  Published
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-2xl bg-slate-100 px-5 py-3 font-extrabold text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-2xl bg-[#1557A6] px-5 py-3 font-extrabold text-white transition hover:bg-[#0B3D7A] disabled:opacity-60"
                >
                  {submitting ? "Saving..." : editingId ? "Update FAQ" : "Create FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FAQRow({ item, onEdit, onDelete, onTogglePublish }) {
  return (
    <div className="p-5 transition hover:bg-blue-50/40 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                item.is_published
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {item.is_published ? "Published" : "Hidden"}
            </span>

            {item.category && (
              <span className="rounded-full bg-[#EAF3FF] px-3 py-1 text-xs font-extrabold text-[#0B3D7A]">
                {item.category}
              </span>
            )}
          </div>

          <h3 className="text-lg font-extrabold leading-snug text-[#102033] sm:text-xl">
            {item.question}
          </h3>

          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            {item.answer}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <ActionButton icon={Pencil} label="Edit" onClick={() => onEdit(item)} />

          <ActionButton
            icon={item.is_published ? EyeOff : Eye}
            label={item.is_published ? "Hide" : "Show"}
            tone={item.is_published ? "slate" : "green"}
            onClick={() => onTogglePublish(item)}
          />

          <ActionButton
            icon={Trash2}
            label="Delete"
            tone="red"
            onClick={() => onDelete(item.id)}
          />
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, tone = "blue", onClick }) {
  const tones = {
    blue: "bg-blue-50 text-[#1557A6] hover:bg-blue-100",
    slate: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    green: "bg-green-50 text-green-700 hover:bg-green-100",
    red: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold transition ${tones[tone]}`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function StatCard({ label, value, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-[#1557A6]",
    green: "bg-green-50 text-green-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
        <HelpCircle size={22} />
      </div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <h2 className="mt-1 text-3xl font-black text-[#102033]">{value}</h2>
    </div>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div className="p-14 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EAF3FF] text-[#1557A6]">
        {hasSearch ? <Search size={30} /> : <AlertCircle size={30} />}
      </div>
      <h3 className="text-xl font-extrabold text-[#102033]">
        {hasSearch ? "No matching FAQ" : "No FAQ entries yet"}
      </h3>
      <p className="mt-2 text-slate-500">
        {hasSearch ? "Try a different search or filter." : "Create the first help answer for students."}
      </p>
    </div>
  );
}
