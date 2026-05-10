import { useEffect, useState } from "react";
import { CalendarDays, PlusCircle, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

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

export default function AdminSchedule() {
const [schedules, setSchedules] = useState([]);
const [form, setForm] = useState(initialForm);
const [editingId, setEditingId] = useState(null);
const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(true);

const fetchSchedules = async () => {
try {
const res = await api.get("/schedule");
setSchedules(res.data);
} catch (err) {
toast.error("Failed to load schedules.");
} finally {
setLoading(false);
}
};

useEffect(() => {
fetchSchedules();
}, []);

const updateField = (key, value) => {
setForm((prev) => ({ ...prev, [key]: value }));
};

const openCreateModal = () => {
setForm(initialForm);
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
setForm(initialForm);
setEditingId(null);
} catch (err) {
toast.error(
err.response?.data?.message || "Failed to save schedule."
);
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
<div className="min-h-screen bg-[#EAF3FF] pb-20">
    <div className="bg-[#0B3D7A] pt-12 pb-24 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-6">
            <div className="flex items-center gap-4">
                <div className="bg-white/10 p-4 rounded-2xl">
                    <CalendarDays className="text-white" size={34} />
                </div>

                <div>
                    <h1 className="text-4xl font-extrabold text-white">
                        Manage Schedule
                    </h1>
                    <p className="text-blue-100/80 mt-2 text-lg">
                        Create, update, and delete cours / TD sessions.
                    </p>
                </div>
            </div>

            <button onClick={openCreateModal}
                className="flex items-center gap-2 bg-white text-[#0B3D7A] px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-50 transition-all">
                <PlusCircle size={20} />
                Add Session
            </button>
        </div>
    </div>

    <div className="max-w-6xl mx-auto px-6 -mt-12">
        <div className="bg-white rounded-3xl shadow-sm border border-blue-100 overflow-hidden">
            <div className="p-6 border-b border-blue-100">
                <h2 className="text-2xl font-bold text-[#0B3D7A]">
                    Weekly Sessions
                </h2>
                <p className="text-slate-500">
                    Manage schedules by department and level.
                </p>
            </div>

            {loading ? (
            <div className="flex justify-center p-20">
                <span className="loading loading-spinner loading-lg text-[#1557A6]"></span>
            </div>
            ) : (
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr className="text-[#0B3D7A]">
                            <th>Day</th>
                            <th>Time</th>
                            <th>Subject</th>
                            <th>Type</th>
                            <th>Teacher</th>
                            <th>Room</th>
                            <th>Group</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="text-slate-600">
                        {schedules.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/40">
                            <td className="font-bold text-[#102033]">{item.day}</td>

                            <td className="text-slate-600">
                                {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}
                            </td>

                            <td className="font-medium">{item.subject}</td>

                            <td>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ item.type
                                    === "td" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-[#1557A6]" }`}>
                                    {item.type === "td" ? "TD" : "Cours"}
                                </span>
                            </td>

                            <td className="text-slate-600">{item.teacher || "—"}</td>
                            <td>{item.room || "—"}</td>

                            <td>
                                <span className="badge bg-[#EAF3FF] text-[#0B3D7A] border-none font-bold">
                                    {item.department} - {item.level}
                                </span>
                            </td>

                            <td>
                                <div className="flex justify-end gap-2">
                                    <button onClick={()=> openEditModal(item)}
                                        className="btn btn-xs bg-blue-100 text-[#1557A6] border-none hover:bg-blue-200"
                                        >
                                        <Pencil size={14} />
                                        Edit
                                    </button>

                                    <button onClick={()=> handleDelete(item.id)}
                                        className="btn btn-xs bg-red-100 text-red-700 border-none hover:bg-red-200"
                                        >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                        ))}

                        {schedules.length === 0 && (
                        <tr>
                            <td colSpan="8" className="text-center py-10 text-slate-500">
                                No schedule sessions found.
                            </td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    </div>

    {open && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-6">
        <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-blue-100">
            <h2 className="text-2xl font-bold text-[#0B3D7A] mb-6">
                {editingId ? "Edit Session" : "Add Session"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-800">
                <input className="input input-bordered bg-white border-blue-100" placeholder="Department"
                    value={form.department} onChange={(e)=> updateField("department", e.target.value)}
                />

                <select className="select select-bordered bg-white border-blue-100" value={form.level} onChange={(e)=>
                    updateField("level", e.target.value)}
                    >
                    <option>S1</option>
                    <option>S2</option>
                    <option>S3</option>
                    <option>S4</option>
                    <option>S5</option>
                    <option>S6</option>
                </select>

                <select className="select select-bordered bg-white border-blue-100" value={form.day} onChange={(e)=>
                    updateField("day", e.target.value)}
                    >
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                    <option>Saturday</option>
                </select>

                <select className="select select-bordered bg-white border-blue-100" value={form.type} onChange={(e)=>
                    updateField("type", e.target.value)}
                    >
                    <option value="cours">Cours</option>
                    <option value="td">TD</option>
                </select>

                <input className="input input-bordered bg-white border-blue-100 md:col-span-2" placeholder="Subject"
                    value={form.subject} onChange={(e)=> updateField("subject", e.target.value)}
                />

                <input className="input input-bordered bg-white border-blue-100" placeholder="Teacher"
                    value={form.teacher} onChange={(e)=> updateField("teacher", e.target.value)}
                />

                <input className="input input-bordered bg-white border-blue-100" placeholder="Room" value={form.room}
                    onChange={(e)=> updateField("room", e.target.value)}
                />

                <input type="time" className="input input-bordered bg-white border-blue-100" value={form.start_time}
                    onChange={(e)=> updateField("start_time", e.target.value)}
                />

                <input type="time" className="input input-bordered bg-white border-blue-100" value={form.end_time}
                    onChange={(e)=> updateField("end_time", e.target.value)}
                />

                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={()=> setOpen(false)}
                        className="btn bg-slate-100 text-slate-600 border-none hover:bg-slate-200"
                        >
                        Cancel
                    </button>

                    <button type="submit" className="btn bg-[#1557A6] text-white border-none hover:bg-[#0B3D7A]">
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
