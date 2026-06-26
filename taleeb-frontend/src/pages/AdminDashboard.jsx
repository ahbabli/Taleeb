import { useCallback, useEffect, useState } from "react";
import {
FileText,
Clock,
CheckCircle,
XCircle,
Loader2,
ClipboardList,
AlertCircle,
CheckSquare,
Search,
Filter,
User,
ChevronLeft,
ChevronRight
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const semesterFilters = ["S1", "S2", "S3", "S4", "S5", "S6"];
const sectionFilters = ["Informatique", "Mathématiques", "Physique", "Chimie"];

export default function AdminDashboard() {
const [requests, setRequests] = useState([]);
const [requestSnapshot, setRequestSnapshot] = useState([]);
const [loading, setLoading] = useState(true);
const [statusFilter, setStatusFilter] = useState("all");
const [levelFilter, setLevelFilter] = useState("S1");
const [sectionFilter, setSectionFilter] = useState("Informatique");
const [sectionOptions, setSectionOptions] = useState(sectionFilters);
const [search, setSearch] = useState("");
const [pagination, setPagination] = useState({
currentPage: 1,
lastPage: 1,
total: 0,
});

const [rejectModalOpen, setRejectModalOpen] = useState(false);
const [selectedRequest, setSelectedRequest] = useState(null);
const [rejectNote, setRejectNote] = useState("");
const [uploadModalOpen, setUploadModalOpen] = useState(false);
const [uploadRequest, setUploadRequest] = useState(null);
const [selectedFile, setSelectedFile] = useState(null);
const [uploading, setUploading] = useState(false);

const openUploadModal = (req) => {
setUploadRequest(req);
setSelectedFile(null);
setUploadModalOpen(true);
};

const uploadDocument = async () => {
if (!uploadRequest) return;

if (!selectedFile) {
toast.error("Please select a PDF file.");
return;
}

const formData = new FormData();
formData.append("file", selectedFile);

try {
setUploading(true);

const res = await api.post(
`/document-requests/${uploadRequest.id}/upload`,
formData,
{
headers: {
"Content-Type": "multipart/form-data",
},
}
);

setRequests((prev) =>
prev.map((req) =>
req.id === uploadRequest.id ? res.data.data : req
)
);
setRequestSnapshot((prev) =>
prev.map((req) =>
req.id === uploadRequest.id ? res.data.data : req
)
);

setUploadModalOpen(false);
setUploadRequest(null);
setSelectedFile(null);
toast.success("Document uploaded successfully.");
} catch (err) {
toast.error(err.response?.data?.message || "Failed to upload document.");
} finally {
setUploading(false);
}
};

const fetchRequests = useCallback(async (pageNumber = 1) => {
try {
setLoading(true);

const params = new URLSearchParams({
page: String(pageNumber),
level: levelFilter,
department: sectionFilter,
});

if (statusFilter !== "all") {
params.set("status", statusFilter);
}

if (search.trim()) {
params.set("search", search.trim());
}

const res = await api.get(`/document-requests?${params.toString()}`);
setRequests(res.data.data);
setPagination({
currentPage: res.data.current_page,
lastPage: res.data.last_page,
total: res.data.total,
});
} catch (err) {
console.error(err);
toast.error("Failed to load requests.");
} finally {
setLoading(false);
}
}, [levelFilter, search, sectionFilter, statusFilter]);

useEffect(() => {
let isActive = true;

const loadFilteredRequests = async () => {
try {
setLoading(true);

const params = new URLSearchParams({
page: "1",
level: levelFilter,
department: sectionFilter,
});

if (statusFilter !== "all") {
params.set("status", statusFilter);
}

if (search.trim()) {
params.set("search", search.trim());
}

const res = await api.get(`/document-requests?${params.toString()}`);

if (isActive) {
setRequests(res.data.data);
setPagination({
currentPage: res.data.current_page,
lastPage: res.data.last_page,
total: res.data.total,
});
}
} catch (err) {
console.error(err);
toast.error("Failed to load requests.");
} finally {
if (isActive) {
setLoading(false);
}
}
};

loadFilteredRequests();

return () => {
isActive = false;
};
}, [levelFilter, search, sectionFilter, statusFilter]);

useEffect(() => {
let isActive = true;

const loadSections = async () => {
try {
const res = await api.get("/academic-sections");
const sections = normalizeSections(res.data);
const nextSections = sections.length ? sections : sectionFilters;

if (isActive) {
setSectionOptions(nextSections);

if (!nextSections.includes(sectionFilter)) {
setSectionFilter(nextSections[0]);
}
}
} catch (err) {
console.error(err);
}
};

loadSections();

return () => {
isActive = false;
};
}, [sectionFilter]);

useEffect(() => {
let isActive = true;

const loadRequestSnapshot = async () => {
try {
const res = await api.get("/document-requests?per_page=500");

if (isActive) {
setRequestSnapshot(res.data.data);
}
} catch (err) {
console.error(err);
}
};

loadRequestSnapshot();

return () => {
isActive = false;
};
}, []);

const updateStatus = async (id, status) => {
try {
const res = await api.patch(`/document-requests/${id}/status`, {
status,
admin_note: `Request marked as ${status}`,
});

setRequests((prev) =>
prev.map((req) =>
req.id === id ? { ...req, ...res.data.data } : req
)
);
setRequestSnapshot((prev) =>
prev.map((req) =>
req.id === id ? { ...req, ...res.data.data } : req
)
);
toast.success("Request status updated successfully.");
} catch (err) {
toast.error(err.response?.data?.message || "Failed to update request.");
}
};

const openRejectModal = (req) => {
setSelectedRequest(req);
setRejectNote("");
setRejectModalOpen(true);
};

const confirmReject = async () => {
if (!selectedRequest) return;
if (!rejectNote.trim()) {
toast.error("Please write a rejection reason.");
return;
}

try {
const res = await api.patch(
`/document-requests/${selectedRequest.id}/status`,
{
status: "rejected",
admin_note: rejectNote,
}
);

setRequests((prev) =>
prev.map((req) =>
req.id === selectedRequest.id ? { ...req, ...res.data.data } : req
)
);
setRequestSnapshot((prev) =>
prev.map((req) =>
req.id === selectedRequest.id ? { ...req, ...res.data.data } : req
)
);

setRejectModalOpen(false);
setSelectedRequest(null);
setRejectNote("");
toast.success("Request rejected successfully.");
} catch (err) {
toast.error(err.response?.data?.message || "Failed to reject request.");
}
};

return (
<div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Request Management</h2>
                <p className="text-slate-500 mt-1">Review and process student documentation requests.</p>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <StatCard label="Total Submissions" count={pagination.total} icon={<ClipboardList size={22} />}
            color="indigo" />
            <StatCard label="Pending Review" count={requestSnapshot.filter(r=> r.status === "pending").length} icon={
                <Clock size={22} />} color="amber" />
                <StatCard label="In Progress" count={requestSnapshot.filter(r=> r.status === "processing").length} icon={
                    <Loader2 size={22} />} color="sky" />
                    <StatCard label="Ready for Pickup" count={requestSnapshot.filter(r=> r.status === "ready").length}
                        icon={
                        <CheckSquare size={22} />} color="emerald" />
        </div>

        <SemesterCards
          activeLevel={levelFilter}
          activeSection={sectionFilter}
          items={requestSnapshot}
          getLevel={(item) => item.student?.level}
          getSection={(item) => item.student?.department}
          onSelect={setLevelFilter}
        />

        <SectionCards
          activeSection={sectionFilter}
          activeLevel={levelFilter}
          items={requestSnapshot}
          sections={sectionOptions}
          getLevel={(item) => item.student?.level}
          getSection={(item) => item.student?.department}
          onSelect={setSectionFilter}
        />

        {/* Controls and Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10">
            {/* Table Toolbar */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/30 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Search by student, code, or document..." value={search}
                            onChange={(e)=> setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-600"
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="relative flex-shrink-0">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select value={statusFilter} onChange={(e)=> setStatusFilter(e.target.value)}
                                className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-600 text-sm font-medium appearance-none cursor-pointer"
                                >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="approved">Approved</option>
                                <option value="ready">Ready</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin">
                    </div>
                </div>
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Syncing database...</p>
            </div>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold text-slate-400">
                                Student Identity</th>
                            <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold text-slate-400">
                                Request Type</th>
                            <th
                                className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold text-slate-400 text-center">
                                Status</th>
                            <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold text-slate-400">
                                Submitted</th>
                            <th
                                className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold text-slate-400 text-right">
                                Workflow</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                        {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <User size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span
                                            className="font-bold text-slate-800 leading-none mb-1">{req.student?.student_code}</span>
                                        <span className="text-xs text-slate-500 font-medium">
                                            {req.student?.department} <span className="text-slate-300 mx-1">•</span>
                                            {req.student?.level}
                                        </span>
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-5">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="p-1.5 bg-blue-50 rounded-lg text-blue-600 border border-blue-100/50">
                                        <FileText size={16} />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700">
                                        {req.document_type?.name}
                                    </span>
                                </div>
                            </td>

                            <td className="px-6 py-5">
                                <div className="flex justify-center">
                                    <StatusBadge status={req.status} />
                                </div>
                            </td>

                            <td className="px-6 py-5">
                                <div className="flex flex-col">
                                    <span className="text-sm text-slate-700 font-medium">
                                        {new Date(req.requested_at).toLocaleDateString('en-GB', { day: '2-digit', month:
                                        'short' })}
                                    </span>
                                    <span className="text-[11px] text-slate-400">{new
                                        Date(req.requested_at).getFullYear()}</span>
                                </div>
                            </td>

                            <td className="px-6 py-5">
                                <div className="flex justify-end items-center gap-1.5">
                                    {req.status === 'pending' && (
                                    <ActionButton onClick={()=> updateStatus(req.id, "processing")} variant="sky"
                                        label="Process" />
                                        )}
                                        {(req.status === 'processing' || req.status === 'pending') && (
                                        <ActionButton onClick={()=> updateStatus(req.id, "approved")} variant="green"
                                            label="Approve" />
                                            )}
                                            {req.status === 'approved' && (
                                            <ActionButton onClick={()=> openUploadModal(req)} variant="indigo"
                                                label="Upload PDF" />
                                                )}
                                                {req.status !== 'ready' && (
                                                <button onClick={()=> openRejectModal(req)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Reject Request"
                                                    >
                                                    <XCircle size={18} />
                                                </button>
                                                )}
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>

                {requests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 px-6 bg-white">
                    <div className="bg-slate-50 p-6 rounded-full mb-4">
                        <AlertCircle size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No requests found</h3>
                    <p className="text-slate-500 text-center max-w-xs mt-1">
                        Try adjusting your filters or search terms to find what you're looking for.
                    </p>
                </div>
                )}
            </div>
            )}
            <PaginationControls pagination={pagination} onPageChange={fetchRequests} />
        </div>
    {/* Upload Modal */}
    {uploadModalOpen && (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => {
                if (!uploading) {
                    setUploadModalOpen(false);
                    setUploadRequest(null);
                    setSelectedFile(null);
                }
            }}></div>

            <div
                className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-indigo-50 p-6 flex items-start gap-4">
                    <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Upload PDF</h2>
                        <p className="text-sm text-slate-600 mt-1">Student: {uploadRequest?.student?.student_code}</p>
                    </div>
                </div>

                <div className="p-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Completed Document</label>
                    <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-100 file:px-4 file:py-2 file:text-sm file:font-bold file:text-indigo-700 hover:file:bg-indigo-200"
                    />
                    <p className="mt-3 text-xs text-slate-500">
                        Uploading a PDF will mark this request as ready for pickup.
                    </p>

                    <div className="flex items-center gap-3 mt-8">
                        <button
                            onClick={() => {
                                setUploadModalOpen(false);
                                setUploadRequest(null);
                                setSelectedFile(null);
                            }}
                            disabled={uploading}
                            className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={uploadDocument}
                            disabled={uploading}
                            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100"
                        >
                            {uploading ? "Uploading..." : "Upload and Ready"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )}

    {/* Reject Modal */}
    {rejectModalOpen && (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={()=>
                setRejectModalOpen(false)}></div>

            <div
                className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-rose-50 p-6 flex items-start gap-4">
                    <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Confirm Rejection</h2>
                        <p className="text-sm text-slate-600 mt-1">Student: {selectedRequest?.student?.student_code}
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Rejection</label>
                    <textarea value={rejectNote} onChange={(e)=> setRejectNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all min-h-[120px] resize-none"
                  placeholder="Tell the student why their request was declined..."
                />
                
                <div className="flex items-center gap-3 mt-8">
                  <button
                    onClick={() => setRejectModalOpen(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={confirmReject}
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-200 transition-all active:scale-95"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
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
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 group transition-all hover:-translate-y-1">
      <div className={`p-3.5 rounded-2xl ${themes[color]} border transition-transform `}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800 leading-none mt-1">{count}</p>
      </div>
    </div>
  );
}

function SemesterCards({ activeLevel, activeSection, items, getLevel, getSection, onSelect }) {
  const cards = semesterFilters.map((semester) => ({
      key: semester,
      label: semester,
      count: items.filter((item) => getLevel(item) === semester && getSection(item) === activeSection).length,
    }));

  return (
    <section className="mb-8">
      <div className="mb-4">
        <h3 className="text-xl font-extrabold text-slate-900">
          Filter by Semester
        </h3>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Choose a semester to show matching student requests.
        </p>
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
              <span className={`text-xs font-bold uppercase ${active ? "text-blue-100" : "text-slate-400"}`}>
                Semester
              </span>
              <span className="mt-2 block text-2xl font-black">
                {card.label}
              </span>
              <span className={`mt-2 block text-sm font-bold ${active ? "text-blue-100" : "text-slate-500"}`}>
                {card.count} request{card.count === 1 ? "" : "s"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SectionCards({ activeSection, activeLevel, items, sections: availableSections, getLevel, getSection, onSelect }) {
  const sections = availableSections;

  return (
    <section className="mb-8">
      <div className="mb-4">
        <h3 className="text-xl font-extrabold text-slate-900">
          Filter by Section
        </h3>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Pick a section such as Informatique to narrow the list.
        </p>
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
              <span className={`text-xs font-bold uppercase ${active ? "text-blue-100" : "text-slate-400"}`}>
                Section
              </span>
              <span className="mt-2 block text-2xl font-black">
                {section}
              </span>
              <span className={`mt-2 block text-sm font-bold ${active ? "text-blue-100" : "text-slate-500"}`}>
                {count} request{count === 1 ? "" : "s"}
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

function StatusBadge({ status }) {
  const config = {
    pending: { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock size={12} /> },
    processing: { bg: "bg-sky-50 text-sky-700 border-sky-200", icon: <Loader2 size={12} className="animate-spin" /> },
    approved: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle size={12} /> },
    rejected: { bg: "bg-rose-50 text-rose-700 border-rose-200", icon: <XCircle size={12} /> },
    ready: { bg: "bg-[#0B3D7A] text-white border-[#0B3D7A]", icon: <CheckSquare size={12} /> },
  };

  const style = config[status] || { bg: "bg-slate-100 text-slate-600 border-slate-200", icon: null };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${style.bg}`}>
      {style.icon}
      {status}
    </span>
  );
}

function ActionButton({ onClick, variant, label }) {
  const variants = {
    sky: "bg-white text-sky-600 border-sky-200 hover:bg-sky-50 hover:border-sky-300",
    green: "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-100",
    primary: "bg-[#0B3D7A] text-white border-[#0B3D7A] hover:bg-[#082d5a] hover:shadow-blue-100",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-100 hover:bg-indigo-200 hover:border-indigo-200",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border active:scale-95 shadow-sm ${variants[variant]}`}
    >
      {label}
    </button>
  );
}

function PaginationControls({ pagination, onPageChange }) {
  return (
    <div className="flex flex-wrap justify-center items-center gap-3 p-6 m border-t border-slate-100">
      <button
        disabled={pagination.currentPage === 1}
        onClick={() => onPageChange(pagination.currentPage - 1)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#0B3D7A] shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      <span className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-black text-[#0B3D7A] border border-blue-100">
        {pagination.currentPage} / {pagination.lastPage}
      </span>

      <button
        disabled={pagination.currentPage === pagination.lastPage}
        onClick={() => onPageChange(pagination.currentPage + 1)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#0B3D7A] shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
