import { useCallback, useEffect, useState } from "react";
import {
FileText,
MapPin,
BookOpen,
ClipboardList,
ArrowRight,
UserRound,
Bell,
GraduationCap,
TimerReset,
ExternalLink,
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

function getTodayName() {
return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function daysUntil(dateString) {
if (!dateString) return null;

const today = new Date();
const target = new Date(dateString);

today.setHours(0, 0, 0, 0);
target.setHours(0, 0, 0, 0);

return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function semesterProgress(startDate, endDate) {
if (!startDate || !endDate) return 0;

const start = new Date(startDate);
const end = new Date(endDate);
const today = new Date();

const total = end - start;
const passed = today - start;

const progress = Math.round((passed / total) * 100);

return Math.min(Math.max(progress, 0), 100);
}

function currentSemesterWeek(startDate) {
if (!startDate) return 1;

const start = new Date(startDate);
const today = new Date();

const diff = today - start;
const week = Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));

return Math.max(week, 1);
}

function totalSemesterWeeks(startDate, endDate) {
if (!startDate || !endDate) return 0;

const start = new Date(startDate);
const end = new Date(endDate);

return Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 7));
}

export default function StudentHome({ setCurrentPage }) {
const [requests, setRequests] = useState([]);
const [schedule, setSchedule] = useState([]);
const [loading, setLoading] = useState(true);
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [notificationsOpen, setNotificationsOpen] = useState(false);
const [latestNotificationId, setLatestNotificationId] = useState(null);
const [announcements, setAnnouncements] = useState([]);
const [academicSettings, setAcademicSettings] = useState(null);

const student = JSON.parse(localStorage.getItem("student") || "null");
const user = JSON.parse(localStorage.getItem("user") || "null");

const today = getTodayName();
const isSunday = today === "Sunday";
const handleNotificationClick = useCallback(async (notification) => {
try {
await api.patch(`/notifications/${notification.id}/read`);

setNotifications((prev) =>
prev.map((n) =>
n.id === notification.id ? { ...n, is_read: true } : n
)
);

setUnreadCount((prev) => Math.max(prev - 1, 0));

if (notification.link) {
setCurrentPage(notification.link);
setNotificationsOpen(false);
}
} catch (err) {
console.error(err);
}
}, [setCurrentPage]);

const showNotificationToast = useCallback((notification) => {
toast(
(t) => (
<div onClick={()=> {
    toast.dismiss(t.id);
    handleNotificationClick(notification);
    }}
    className="cursor-pointer flex items-start gap-4"
    >
    <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] flex items-center justify-center">
        <Bell className="text-[#1557A6]" size={22} />
    </div>

    <div className="flex-1">
        <h3 className="font-extrabold text-[#102033]">
            {notification.title}
        </h3>

        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            {notification.message}
        </p>
    </div>

    <button onClick={(e)=> {
        e.stopPropagation();
        toast.dismiss(t.id);
        }}
        className="text-slate-400 hover:text-red-500"
        >
        ✕
    </button>
</div>
),
{
duration: 10000,
position: "top-right",
style: {
borderRadius: "24px",
background: "#fff",
color: "#102033",
padding: "16px",
border: "1px solid #DBEAFE",
boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
minWidth: "340px",
},
}
);
}, [handleNotificationClick]);

const getNotifications = async () => {
try {
const [notificationsRes, unreadRes] = await Promise.all([
api.get("/notifications"),
api.get("/notifications/unread-count"),
]);

return {
notifications: notificationsRes.data,
unreadCount: unreadRes.data.count,
};
} catch (err) {
console.error(err);
return null;
}
};
useEffect(() => {
const fetchData = async () => {
try {
const [
requestsRes,
scheduleRes,
announcementsRes,
academicSettingsRes,
] = await Promise.all([
api.get("/document-requests"),
api.get("/schedule"),
api.get("/announcements"),
api.get("/academic-settings"),
]);

setRequests(requestsRes.data.data || requestsRes.data);
setSchedule(scheduleRes.data);
setAnnouncements(announcementsRes.data);
setAcademicSettings(academicSettingsRes.data);
} catch (err) {
console.error(err);
} finally {
setLoading(false);
}
};

fetchData();
}, []);

const latestImportantAnnouncement =
announcements.find((item) => item.is_important) || announcements[0];

useEffect(() => {
let isActive = true;

const fetchNotifications = async () => {
const data = await getNotifications();

if (!isActive || !data) {
return;
}

setNotifications(data.notifications);
setUnreadCount(data.unreadCount);

const fetchedNotifications = data.notifications;

if (fetchedNotifications.length > 0) {
const newest = fetchedNotifications[0];

if (
latestNotificationId !== null &&
newest.id !== latestNotificationId
) {
showNotificationToast(newest);
}

setLatestNotificationId(newest.id);
}
};

fetchNotifications();

const interval = setInterval(() => {
fetchNotifications();
}, 5000);

return () => {
isActive = false;
clearInterval(interval);
};
}, [latestNotificationId, showNotificationToast]);

const todayCourses = schedule
.filter((item) => item.day === today)
.sort((a, b) => a.start_time.localeCompare(b.start_time));

const currentMinutes = getCurrentTimeInMinutes();

const visibleTodayCourses = todayCourses
.filter((course) => {
const end = timeToMinutes(course.end_time);

// نخفي الحصص التي انتهت
return end >= currentMinutes;
})
.slice(0, 3);

let nextCourseId = null;

for (const course of todayCourses) {
const start = timeToMinutes(course.start_time);
const end = timeToMinutes(course.end_time);

if (currentMinutes >= start && currentMinutes <= end) { continue; } if (start> currentMinutes) {
    nextCourseId = course.id;
    break;
    }
    }

const examDaysLeft = daysUntil(academicSettings?.exams_start_date);
const progress = semesterProgress(
academicSettings?.semester_start_date,
academicSettings?.semester_end_date
);
const currentWeek = currentSemesterWeek(academicSettings?.semester_start_date);
const totalWeeks = totalSemesterWeeks(
academicSettings?.semester_start_date,
academicSettings?.semester_end_date
);

    return (
    <div className="min-h-screen bg-white px-4 pt-5 pb-28 sm:px-5 sm:pt-8">
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-start gap-3 mb-5 sm:mb-8">
                <div className="flex items-center gap-3 min-w-0 sm:gap-4">
                    <div
                        className="w-12 h-12 shrink-0 rounded-full bg-[#EAF3FF] flex items-center justify-center sm:w-16 sm:h-16">
                        <UserRound className="text-[#1557A6] w-6 h-6 sm:w-8 sm:h-8" />
                    </div>

                    <div className="min-w-0">
                        <h1 className="text-2xl leading-tight font-extrabold text-[#102033] truncate sm:text-3xl">
                            Hello, {user?.name?.split(" ")[0] || "Student"}👋
                        </h1>

                        <p className="text-xs text-slate-500 font-semibold truncate sm:text-base">
                            {student?.department} {student?.level} &nbsp; {student?.academic_year}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button onClick={()=> setNotificationsOpen(!notificationsOpen)}
                            className="relative w-14 h-14 rounded-2xl bg-[#F8FAFF] border border-blue-100 flex items-center justify-center hover:bg-blue-50 transition"
                            >
                            <Bell className="text-[#1557A6]" size={24} />

                            {unreadCount > 0 && (
                            <span
                                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[22px] h-[22px] rounded-full flex items-center justify-center px-1">
                                {unreadCount}
                            </span>
                            )}
                        </button>

                        {notificationsOpen && (
                        <div
                            className="absolute right-0 mt-3 w-[340px] bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden z-50">
                            <div className="p-5 border-b border-blue-100">
                                <h2 className="text-xl font-extrabold text-[#0B3D7A]">
                                    Notifications
                                </h2>

                                <p className="text-slate-500 text-sm mt-1">
                                    Latest updates and alerts
                                </p>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                <button key={notification.id} onClick={()=> handleNotificationClick(notification)}
                                    className={`w-full text-left p-4 border-b border-blue-50 hover:bg-blue-50/50
                                    transition ${
                                    !notification.is_read ? "bg-blue-50/40" : ""
                                    }`}
                                    >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-3 h-3 rounded-full mt-2 ${ notification.is_read
                                            ? "bg-slate-300" : "bg-[#1557A6]" }`} />

                                        <div className="flex-1">
                                            <h3 className="font-extrabold text-[#102033]">
                                                {notification.title}
                                            </h3>

                                            <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                                                {notification.message}
                                            </p>

                                            <p className="text-xs text-slate-400 mt-2">
                                                {new Date(notification.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                                ))
                                ) : (
                                <div className="p-10 text-center text-slate-500">
                                    No notifications yet.
                                </div>
                                )}
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
            <div className="flex justify-center p-20">
                <span className="loading loading-spinner loading-lg text-[#1557A6]"></span>
            </div>
            ) : (
            <>
                <section
                    className="bg-[#0B3D7A] rounded-[1.5rem] overflow-hidden shadow-xl mb-4 sm:mb-6 sm:rounded-[2rem]">
                    <div className="p-5 text-white flex justify-between items-center sm:p-6">
                        <div>
                            <h2 className="text-xl font-extrabold sm:text-2xl">Today's Schedule</h2>
                            <p className="text-sm text-blue-100 mt-1 sm:text-base">{today}</p>
                        </div>

                        <button onClick={()=> setCurrentPage("schedule")}
                            className="hidden sm:flex items-center gap-2 border border-white/30 px-4 py-2 rounded-full font-bold hover:bg-white hover:text-[#0B3D7A] transition"
                            >
                            View Full
                            <ArrowRight size={18} />
                        </button>
                    </div>

                    <div className="bg-white rounded-t-[1.5rem] overflow-hidden">
                        {visibleTodayCourses.length > 0 ? (
                        visibleTodayCourses.map((course) => (
                        <CourseLine key={course.id} course={course} isCurrent={ currentMinutes>=
                            timeToMinutes(course.start_time) &&
                            currentMinutes
                            <= timeToMinutes(course.end_time) } isNext={nextCourseId===course.id} />
                            ))
                            ) : (
                            <div className="p-8 text-center sm:p-10">
                                <h3 className="font-extrabold text-[#0B3D7A] text-lg sm:text-xl">
                                    {isSunday ? "Enjoy your rest 😌" : "No classes today"}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1 sm:text-base">
                                    {isSunday
                                    ? "It is Sunday. Take a break and recharge for the week ahead."
                                    : "You have no cours or TD today."}
                                </p>
                            </div>
                            )}
                    </div>
                </section>



                <section className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4 sm:gap-4 sm:mb-6">

                    {/* Exam Countdown */}
                    <div
                        className="bg-white rounded-[1.25rem] border border-blue-100 shadow-sm p-4 sm:rounded-[1.5rem] sm:p-5">
                        <div
                            className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 sm:w-14 sm:h-14 sm:mb-5">
                            <TimerReset className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>

                        <p className="text-slate-500 font-semibold text-xs leading-tight sm:text-sm">
                            Final Exams
                        </p>

                        <h2 className="text-3xl font-extrabold text-[#102033] mt-1 sm:text-4xl sm:mt-2">
                            {examDaysLeft !== null ? examDaysLeft : "—"}
                        </h2>

                        <p className="text-xs text-slate-500 mt-1 sm:text-base">
                            Days remaining
                        </p>
                    </div>

                    {/* Semester Progress */}
                    <div
                        className="bg-white rounded-[1.25rem] border border-blue-100 shadow-sm p-4 sm:rounded-[1.5rem] sm:p-5">
                        <div
                            className="w-11 h-11 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4 sm:w-14 sm:h-14 sm:mb-5">
                            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>

                        <p className="text-slate-500 font-semibold text-xs leading-tight sm:text-sm">
                            Semester Progress
                        </p>

                        <h2 className="text-3xl font-extrabold text-[#102033] mt-1 sm:text-4xl sm:mt-2">
                            {progress}%
                        </h2>

                        <div className="w-full h-2.5 bg-slate-100 rounded-full mt-3 overflow-hidden sm:h-3 sm:mt-4">
                            <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                        <p className="text-slate-500 mt-2 text-xs sm:mt-3 sm:text-sm">
                            Week {currentWeek} of {totalWeeks}
                        </p>
                    </div>

                    {/* Request Summary */}
                    <div
                        className="bg-white rounded-[1.25rem] border border-blue-100 shadow-sm p-4 sm:rounded-[1.5rem] sm:p-5">
                        <div
                            className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1557A6] flex items-center justify-center mb-4 sm:w-14 sm:h-14 sm:mb-5">
                            <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>

                        <p className="text-slate-500 font-semibold text-xs leading-tight sm:text-sm">
                            Active Requests
                        </p>

                        <h2 className="text-3xl font-extrabold text-[#102033] mt-1 sm:text-4xl sm:mt-2">
                            {
                            requests.filter(
                            (r) => r.status === "pending" || r.status === "processing"
                            ).length
                            }
                        </h2>

                        <p className="text-xs text-slate-500 mt-1 sm:text-base">
                            Requests in progress
                        </p>
                    </div>

                    {/* Important Notice */}
                    <div
                        className="bg-gradient-to-br from-[#1557A6] to-[#0B3D7A] rounded-[1.5rem] shadow-sm p-5 text-white">
                        <p className="text-blue-100 font-semibold text-sm">
                            Important Notice
                        </p>

                        {latestImportantAnnouncement ? (
                        <>
                            <h2 className="text-2xl font-extrabold mt-3">
                                {latestImportantAnnouncement.title}
                            </h2>

                            <p className="text-blue-100 mt-3 text-sm leading-relaxed line-clamp-3">
                                {latestImportantAnnouncement.content}
                            </p>

                            <button onClick={()=> setCurrentPage("announcements")}
                                className="mt-5 flex items-center gap-2 font-bold"
                                >
                                Read More
                                <ArrowRight size={18} />
                            </button>
                        </>
                        ) : (
                        <>
                            <h2 className="text-2xl font-extrabold mt-3">
                                No announcements
                            </h2>

                            <p className="text-blue-100 mt-3 text-sm leading-relaxed">
                                There are no university announcements at the moment.
                            </p>
                        </>
                        )}
                    </div>
                </section>
                <section
                    className="bg-white rounded-[1.25rem] border border-blue-100 shadow-sm p-4 mb-6 sm:rounded-[1.5rem] sm:p-5">
                    <div className="flex justify-between items-center mb-4 sm:mb-5">
                        <div>
                            <h2 className="text-xl font-extrabold text-[#0B3D7A] sm:text-2xl">
                                Useful Links
                            </h2>

                            <p className="text-sm text-slate-500 sm:text-base">
                                Quick access to university services.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <UsefulLink title="University Website" url="https://fs.uae.ac.ma/" />

                        <UsefulLink title="E-Learning" target="_blank" url="https://moodle.fst.ac.ma/moodle/" />

                        <UsefulLink title="Affichage des notes" url="https://apoweb-te.uae.ac.ma/dossier_etudiant_fs_tetouan/" />

                        <UsefulLink title="Espace Etudiant" url="https://fs.uae.ac.ma/espace-etudiant" />
                    </div>
                </section>
            </>
            )}
        </div>
    </div>
    );
    }
    function getCurrentTimeInMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
    }

    function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
    }
    function CourseLine({ course, isCurrent, isNext }) {
    const isTD = course.type === "td";

    return (
    <div className={`p-3 border-b border-blue-50 flex items-center gap-3 transition-all sm:p-4 sm:gap-4 ${ isCurrent
        ? "bg-green-50 border-l-4 border-l-green-500" : isNext ? "bg-blue-50/60 border-l-4 border-l-[#1557A6]" : "" }`}>
        <div className="w-12 shrink-0 text-center text-xs font-extrabold text-[#102033] sm:w-16 sm:text-base">
            <div>{course.start_time.slice(0, 5)}</div>
            <div className="text-slate-400">-</div>
            <div>{course.end_time.slice(0, 5)}</div>
        </div>

        <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center sm:w-14 sm:h-14 ${ isTD
            ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-[#1557A6]" }`}>
            {isTD ?
            <ClipboardList className="w-6 h-6 sm:w-[26px] sm:h-[26px]" /> :
            <BookOpen className="w-6 h-6 sm:w-[26px] sm:h-[26px]" />}
        </div>

        <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap sm:gap-2">
                <h3 className="font-extrabold text-sm leading-tight text-[#102033] sm:text-lg">
                    {course.subject}
                </h3>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold sm:px-3 sm:py-1 sm:text-xs ${ isTD
                    ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-[#1557A6]" }`}>
                    {isTD ? "TD" : "Cours"}
                </span>
                {isCurrent && (
                <span
                    className="px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-extrabold animate-pulse sm:px-3 sm:py-1 sm:text-xs">
                    LIVE NOW
                </span>
                )}

                {!isCurrent && isNext && (
                <span
                    className="px-2 py-0.5 rounded-full bg-[#1557A6] text-white text-[10px] font-extrabold sm:px-3 sm:py-1 sm:text-xs">
                    NEXT
                </span>
                )}
            </div>

            <p className="text-slate-500 text-xs mt-1 flex flex-wrap gap-x-2 gap-y-1 sm:text-sm sm:gap-3">
                <span>{course.teacher || "Not assigned"}</span>
                <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {course.room || "No room"}
                </span>
            </p>
        </div>
    </div>
    );
    }

    function UsefulLink({ title, url }) {
    return (
    <a target="_blank" href={url}
        className="bg-[#F8FAFF] hover:bg-blue-50 border border-blue-100 rounded-2xl p-3 transition flex items-center justify-between gap-2 sm:p-4">
        <span className="font-bold text-sm leading-tight text-[#102033] sm:text-base">
            {title}
        </span>

        <ExternalLink className="text-[#1557A6] w-4 h-4 shrink-0 sm:w-[18px] sm:h-[18px]" />
    </a>
    );
    }
