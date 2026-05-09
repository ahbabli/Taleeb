import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import {
  FileText,
  Clock,
  ArrowRight,
  PlusCircle,
  Inbox,
  Trash2,
  Download,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Layers,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = "http://127.0.0.1:8000/api";
const STORAGE_BASE_URL = "http://127.0.0.1:8000/storage";
const HIDDEN_REQUESTS_KEY = "hiddenDocumentRequestIds";

export default function MyRequests() {
  const [open, setOpen] = useState(false);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [noteRequest, setNoteRequest] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });
  const [hiddenRequestIds, setHiddenRequestIds] = useState(() => {
    const storedIds = localStorage.getItem(HIDDEN_REQUESTS_KEY);
    return storedIds ? JSON.parse(storedIds) : [];
  });

  const fetchRequests = useCallback(async (pageNumber = page) => {
    try {
      setLoading(true);
      setPage(pageNumber);
      const res = await api.get(`/document-requests?page=${pageNumber}`);
      setRequests(res.data.data.filter((req) => !hiddenRequestIds.includes(req.id)));
      setPagination({
        currentPage: res.data.current_page,
        lastPage: res.data.last_page,
        total: res.data.total,
      });
    } catch (err) {
      console.error(err);
      setError("Could not load your document requests.");
      toast.error("Could not load your document requests.");
    } finally {
      setLoading(false);
    }
  }, [hiddenRequestIds, page]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/document-types`)
      .then(res => setDocumentTypes(res.data))
      .catch((err) => {
        console.error(err);
        setError("Could not load available document types.");
        toast.error("Could not load available document types.");
      });
  }, []);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        const storedIds = localStorage.getItem(HIDDEN_REQUESTS_KEY);
        const hiddenIds = storedIds ? JSON.parse(storedIds) : [];
        const res = await api.get("/document-requests?page=1");
        setRequests(res.data.data.filter((req) => !hiddenIds.includes(req.id)));
        setPagination({
          currentPage: res.data.current_page,
          lastPage: res.data.last_page,
          total: res.data.total,
        });
      } catch (err) {
        console.error(err);
        setError("Could not load your document requests.");
        toast.error("Could not load your document requests.");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error("Please select a document.");
      return;
    }

    try {
      const res = await api.post("/document-requests", {
        document_type_id: selectedType
      });

      setRequests(prev => [
        {
          ...res.data.data,
          document_type: documentTypes.find(d => d.id == selectedType)
        },
        ...prev
      ]);

      setOpen(false);
      setSelectedType("");
      fetchRequests(1);
      toast.success("Request sent successfully.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleCancel = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this request?"
    );

    if (!confirmCancel || deletingId) return;

    setDeletingId(id);
    setError("");

    try {
      await api.delete(`${API_BASE_URL}/document-requests/${id}`);
      setRequests((prev) => prev.filter((req) => req.id !== id));
      toast.success("Request cancelled successfully.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to cancel request.");
      toast.error(err.response?.data?.message || "Failed to cancel request.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRemoveFromView = (id) => {
    setHiddenRequestIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      localStorage.setItem(HIDDEN_REQUESTS_KEY, JSON.stringify(next));
      return next;
    });
    setRequests((prev) => prev.filter((req) => req.id !== id));
    toast.success("Request removed from this view.");
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {
      console.log("Logout API failed, continue anyway");
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("student");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-sans antialiased pb-20">
      {/* Header Section */}
      <header className="bg-gradient-to-br from-[#0B3D7A] to-[#1557A6] pt-12 pb-28 px-6 shadow-xl">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3 justify-center md:justify-start">
              Taleeb <span className="bg-blue-400/20 px-3 py-1 rounded-lg text-blue-200">Portal</span>
            </h1>
            <p className="text-blue-100/70 mt-2 text-lg font-medium">
              Academic document tracking system
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-white text-[#0B3D7A] px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <PlusCircle size={20} />
              New Request
            </button>

            <button
              onClick={handleLogout}
              className="group flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-5 md:py-3 bg-red-500/10 text-red-100 hover:bg-red-500 hover:text-white rounded-2xl font-bold border border-red-400/30 transition-all"
              title="Logout"
            >
              <LogOut size={20} className="md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 -mt-16">
        {error && (
          <div className="mb-6 rounded-2xl border-l-4 border-red-500 bg-white p-4 shadow-sm flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-sm font-semibold text-slate-700">{error}</p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <StatCard 
            label="Total Requests" 
            count={pagination.total} 
            icon={<Layers size={22} />} 
            bgColor="bg-blue-50" 
            textColor="text-blue-600" 
          />
          <StatCard 
            label="Pending Review" 
            count={requests.filter(r => r.status === 'pending' || r.status === 'processing').length} 
            icon={<Clock size={22} />} 
            bgColor="bg-amber-50" 
            textColor="text-amber-600" 
          />
          <StatCard 
            label="Ready for Pickup" 
            count={requests.filter(r => r.status === 'ready').length} 
            icon={<CheckCircle2 size={22} />} 
            bgColor="bg-emerald-50" 
            textColor="text-emerald-600" 
          />
        </div>

        {/* Requests List */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-slate-800">Recent Applications</h2>
            <span className="text-sm font-medium text-slate-500">{pagination.total} found</span>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center p-24 bg-white rounded-3xl shadow-sm border border-slate-200">
              <span className="loading loading-spinner loading-lg text-[#1557A6] mb-4"></span>
              <p className="text-slate-400 font-medium animate-pulse">Loading your data...</p>
            </div>
          ) : requests.length > 0 ? (
            requests.map((req) => (
              <RequestCard 
                key={req.id} 
                req={req} 
                onCancel={handleCancel}
                onRemove={handleRemoveFromView}
                onOpenNote={setNoteRequest}
                deleting={deletingId === req.id} 
              />
            ))
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-dashed border-slate-300">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Inbox className="text-slate-300" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Desk is empty</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                You haven't requested any documents yet. Start by clicking "New Request".
              </p>
            </div>
          )}
          {/* {!loading && requests.length > 0 && (
            // <PaginationControls pagination={pagination} onPageChange={fetchRequests} />
          )} */}
        </div>
      </main>

      {/* Modern Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transition-all transform animate-in zoom-in-95">
            <button 
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
                <X size={20} />
            </button>
            
            <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="text-blue-600" size={28} />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Apply for Document
            </h2>
            <p className="text-slate-500 mb-6 text-sm">
              Please select the type of official document you need from the list below.
            </p>

            <div className="space-y-4">
                <div className="relative">
                    <select 
                        value={selectedType} 
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="appearance-none w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    >
                        <option value="">Choose document type...</option>
                        {documentTypes.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                            {doc.name}
                        </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <ArrowRight size={18} className="rotate-90" />
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <button 
                        disabled={!selectedType}
                        className="w-full bg-[#1557A6] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-[#0B3D7A] disabled:opacity-50 disabled:shadow-none transition-all"
                        onClick={handleSubmit}
                    >
                        Submit Application
                    </button>
                    <button 
                        className="w-full text-slate-500 font-bold py-2 hover:text-slate-800 transition-colors" 
                        onClick={() => setOpen(false)}
                    >
                        Dismiss
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Note Modal */}
      {noteRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setNoteRequest(null)}
          />
          <div className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transition-all transform animate-in zoom-in-95">
            <button
              onClick={() => setNoteRequest(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="text-blue-600" size={28} />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Status Note
            </h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
              {noteRequest.document_type?.name || "Document Request"}
            </p>
            <p className="text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-2xl p-4">
              {getStatusNote(noteRequest)}
            </p>

            <button
              onClick={() => setNoteRequest(null)}
              className="w-full mt-6 bg-[#1557A6] text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-[#0B3D7A] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestCard({ req, onCancel, onRemove, onOpenNote, deleting }) {
  return (
    <div className="group bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover: hover:shadow-sm hover:border-blue-200">
      <div className="p-5 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center transition-transform  duration-300 ${getStatusBg(req.status)}`}>
            <FileText className={getStatusColor(req.status)} size={30} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {req.document_type?.name || "Document Request"}
            </h2>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-tight">
                <Clock size={14} className="text-slate-300" />
                {req.requested_at ? new Date(req.requested_at).toLocaleDateString() : "Just now"}
              </span>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(req.status)}`}>
                {req.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-4 md:gap-2">
          <div className="bg-slate-50 md:bg-transparent rounded-xl p-3 md:p-0">
             <button
                type="button"
                onClick={() => onOpenNote(req)}
                className="text-sm font-bold text-[#1557A6] hover:text-[#0B3D7A] hover:underline transition-colors"
             >
                View note
             </button>
          </div>
          
          <div className="flex items-center gap-3">
             {req.status === "pending" && (
             <button
                type="button" 
                onClick={() => onCancel(req.id)}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm"
            >
                {deleting ? <span className="loading loading-spinner loading-xs"></span> : <Trash2 size={18} />}
                Cancel
            </button>
             )}
            {!["pending", "processing", "approved"].includes(req.status) && (
            <button
              type="button"
              onClick={() => onRemove(req.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all font-bold text-sm"
            >
              <X size={18} />
              Remove
            </button>
            )}
            {req.file_path && (
              <>
              <div className="h-8 w-[1px] bg-slate-100 hidden md:block mx-1"></div>
              <a
                href={`${STORAGE_BASE_URL}/${req.file_path}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1557A6] text-white hover:bg-[#0B3D7A] transition-all font-bold text-sm"
              >
                <Download size={16} />
                Download
              </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, count, icon, bgColor, textColor }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between group transition-all hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className={`${bgColor} ${textColor} p-3 rounded-2xl  transition-transform`}>
          {icon}
        </div>
        <div>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</span>
          <div className={`text-2xl font-black ${textColor} leading-tight`}>{count}</div>
        </div>
      </div>
      <div className="w-1 h-8 rounded-full bg-slate-100" />
    </div>
  );
}

// function PaginationControls({ pagination, onPageChange }) {
//   return (
//     <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
//       <button
//         disabled={pagination.currentPage === 1}
//         onClick={() => onPageChange(pagination.currentPage - 1)}
//         className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#0B3D7A] shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
//       >
//         <ChevronLeft size={16} />
//         Previous
//       </button>

//       <span className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-black text-[#0B3D7A] border border-blue-100">
//         {pagination.currentPage} / {pagination.lastPage}
//       </span>

//       <button
//         disabled={pagination.currentPage === pagination.lastPage}
//         onClick={() => onPageChange(pagination.currentPage + 1)}
//         className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#0B3D7A] shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
//       >
//         Next
//         <ChevronRight size={16} />
//       </button>
//     </div>
//   );
// }

/* Helper Functions */
function getStatusNote(req) {
  return req.admin_note || "Our team is reviewing your file.";
}

function getStatusColor(status) {
  const map = { 
    pending: "text-amber-500", 
    processing: "text-blue-500", 
    approved: "text-emerald-500", 
    rejected: "text-rose-500", 
    ready: "text-[#1557A6]" 
  };
  return map[status] || "text-slate-500";
}

function getStatusBg(status) {
  const map = { 
    pending: "bg-amber-50", 
    processing: "bg-blue-50", 
    approved: "bg-emerald-50", 
    rejected: "bg-rose-50", 
    ready: "bg-blue-100" 
  };
  return map[status] || "bg-slate-50";
}

function getStatusBadge(status) {
  switch (status) {
    case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
    case "processing": return "bg-blue-50 text-blue-700 border-blue-200";
    case "approved": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "rejected": return "bg-rose-50 text-rose-700 border-rose-200";
    case "ready": return "bg-[#1557A6] text-white border-blue-800 shadow-sm";
    default: return "bg-slate-50 text-slate-700 border-slate-200";
  }
}
