import { useEffect, useState } from "react";
import { HelpCircle, Search, X } from "lucide-react";
import api from "../api/axios";

export default function StudentFAQ() {
  const [faqEntries, setFaqEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    api
      .get("/faq")
      .then((res) => setFaqEntries(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(faqEntries.map((item) => item.category).filter(Boolean))];

  const filteredFAQ = faqEntries.filter((item) => {
    const question = item.question || "";
    const answer = item.answer || "";
    const matchesSearch =
      question.toLowerCase().includes(search.toLowerCase()) ||
      answer.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white px-4 pt-5 pb-28 sm:px-5 sm:pt-8">
      <div className="max-w-4xl mx-auto">
        <section className="mb-5 rounded-[1.5rem] bg-[#1557A6] p-5 text-white shadow-xl shadow-blue-900/10 sm:mb-6 sm:rounded-[2rem] sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <HelpCircle className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                FAQ
              </h1>
              <p className="mt-1 text-sm font-medium text-blue-50 sm:text-base">
                Quick answers for student questions.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-[1.5rem] border border-blue-100 bg-[#F8FAFF] p-4 sm:rounded-[2rem] sm:p-5">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />

            <input
              type="text"
              placeholder="Search questions or answers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-2xl border border-blue-100 bg-white pl-12 pr-12 text-sm font-semibold text-[#102033] outline-none transition placeholder:text-slate-400 focus:border-[#1557A6] focus:ring-4 focus:ring-blue-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-[#1557A6]"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-extrabold transition ${
                  activeCategory === category
                    ? "bg-[#1557A6] text-white"
                    : "border border-blue-100 bg-white text-[#1557A6] hover:bg-blue-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="rounded-[1.5rem] border border-blue-100 bg-[#F8FAFF] p-12 text-center">
            <span className="loading loading-spinner loading-lg text-[#1557A6]"></span>
          </div>
        ) : filteredFAQ.length > 0 ? (
          <div className="space-y-3">
            {filteredFAQ.map((item) => (
              <div
                key={item.id}
                className="collapse collapse-arrow rounded-[1.25rem] border border-blue-100 bg-white shadow-sm transition hover:border-blue-200 hover:bg-[#F8FAFF]"
              >
                <input type="radio" name="student-faq" />

                <div className="collapse-title pr-12 text-base font-extrabold leading-snug text-[#102033] sm:text-lg">
                  {item.question}
                </div>

                <div className="collapse-content">
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-blue-100 bg-[#F8FAFF] p-10 text-center sm:p-12">
            <h2 className="text-xl font-extrabold text-[#102033]">
              No answers found
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Try another search term or choose a different category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
