import { useEffect, useState } from "react";
import { Download, FileText, Megaphone } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

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

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/announcements")
      .then((res) => setAnnouncements(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#EAF3FF] px-5 pt-8 pb-28">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#0B3D7A] flex items-center justify-center mb-4">
            <Megaphone className="text-white" size={32} />
          </div>

          <h1 className="text-4xl font-extrabold text-[#0B3D7A]">
            Announcements
          </h1>

          <p className="text-slate-500 mt-2">
            Latest university news and important notices.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <span className="loading loading-spinner loading-lg text-[#1557A6]"></span>
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6"
              >
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <h2 className="text-2xl font-extrabold text-[#102033]">
                    {item.title}
                  </h2>

                  {item.is_important && (
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase">
                      Important
                    </span>
                  )}
                </div>

                <p className="text-slate-600 leading-relaxed">
                  {item.content}
                </p>

                {item.attachment_path && <AttachmentLink item={item} />}

                <p className="text-xs text-slate-400 font-semibold mt-5">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-blue-100">
            No announcements yet.
          </div>
        )}
      </div>
    </div>
  );
}
