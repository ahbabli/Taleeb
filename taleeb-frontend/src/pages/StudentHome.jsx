import { useEffect, useState } from "react";
import {
FileText,
CalendarDays,
HelpCircle,
Bot,
Clock,
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

function getTodayName() {
return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

export default function StudentHome({ setCurrentPage }) {
const [requests, setRequests] = useState([]);
const [schedule, setSchedule] = useState([]);
const [loading, setLoading] = useState(true);

const student = JSON.parse(localStorage.getItem("student") || "null");
const user = JSON.parse(localStorage.getItem("user") || "null");

const today = getTodayName();

useEffect(() => {
const fetchData = async () => {
try {
const [requestsRes, scheduleRes] = await Promise.all([
api.get("/document-requests"),
api.get("/schedule"),
]);

setRequests(requestsRes.data.data || requestsRes.data);
setSchedule(scheduleRes.data);
} catch (err) {
console.error(err);
} finally {
setLoading(false);
}
};

fetchData();
}, []);

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

const recentRequests = requests.slice(0, 3);
let nextCourseId = null;

for (const course of todayCourses) {
const start = timeToMinutes(course.start_time);
const end = timeToMinutes(course.end_time);

if (currentMinutes >= start && currentMinutes <= end) { continue; } if (start> currentMinutes) {
    nextCourseId = course.id;
    break;
    }
    }

    return (
    <div className="min-h-screen bg-white px-4 pt-5 pb-28 sm:px-5 sm:pt-8">
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-start gap-3 mb-5 sm:mb-8">
                <div className="flex items-center gap-3 min-w-0 sm:gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-[#EAF3FF] flex items-center justify-center sm:w-16 sm:h-16">
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
                    <button
                        className="relative w-11 h-11 shrink-0 rounded-2xl bg-[#F8FAFF] border border-blue-100 flex items-center justify-center hover:bg-blue-50 transition sm:w-14 sm:h-14">
                        <Bell className="text-[#1557A6] w-5 h-5 sm:w-6 sm:h-6" />

                        <span
                            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-5 h-5 rounded-full flex items-center justify-center px-1 sm:text-xs sm:min-w-[22px] sm:h-[22px]">
                            2
                        </span>
                    </button>
                </div>
            </div>

            {loading ? (
            <div className="flex justify-center p-20">
                <span className="loading loading-spinner loading-lg text-[#1557A6]"></span>
            </div>
            ) : (
            <>
                <section className="bg-[#0B3D7A] rounded-[1.5rem] overflow-hidden shadow-xl mb-4 sm:mb-6 sm:rounded-[2rem]">
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
                                    No classes today
                                </h3>
                                <p className="text-sm text-slate-500 mt-1 sm:text-base">
                                    You have no cours or TD today.
                                </p>
                            </div>
                            )}
                    </div>
                </section>



                <section className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4 sm:gap-4 sm:mb-6">

                    {/* Exam Countdown */}
                    <div className="bg-white rounded-[1.25rem] border border-blue-100 shadow-sm p-4 sm:rounded-[1.5rem] sm:p-5">
                        <div
                            className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 sm:w-14 sm:h-14 sm:mb-5">
                            <TimerReset className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>

                        <p className="text-slate-500 font-semibold text-xs leading-tight sm:text-sm">
                            Final Exams
                        </p>

                        <h2 className="text-3xl font-extrabold text-[#102033] mt-1 sm:text-4xl sm:mt-2">
                            18
                        </h2>

                        <p className="text-xs text-slate-500 mt-1 sm:text-base">
                            Days remaining
                        </p>
                    </div>

                    {/* Semester Progress */}
                    <div className="bg-white rounded-[1.25rem] border border-blue-100 shadow-sm p-4 sm:rounded-[1.5rem] sm:p-5">
                        <div
                            className="w-11 h-11 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4 sm:w-14 sm:h-14 sm:mb-5">
                            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>

                        <p className="text-slate-500 font-semibold text-xs leading-tight sm:text-sm">
                            Semester Progress
                        </p>

                        <h2 className="text-3xl font-extrabold text-[#102033] mt-1 sm:text-4xl sm:mt-2">
                            57%
                        </h2>

                        <div className="w-full h-2.5 bg-slate-100 rounded-full mt-3 overflow-hidden sm:h-3 sm:mt-4">
                            <div className="h-full bg-green-500 rounded-full w-[57%]"></div>
                        </div>

                        <p className="text-slate-500 mt-2 text-xs sm:mt-3 sm:text-sm">
                            Week 8 of 14
                        </p>
                    </div>

                    {/* Request Summary */}
                    <div className="bg-white rounded-[1.25rem] border border-blue-100 shadow-sm p-4 sm:rounded-[1.5rem] sm:p-5">
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
                        className="bg-gradient-to-br from-[#1557A6] to-[#0B3D7A] rounded-[1.25rem] shadow-sm p-4 text-white sm:rounded-[1.5rem] sm:p-5">
                        <p className="text-blue-100 font-semibold text-xs sm:text-sm">
                            Important Notice
                        </p>

                        <h2 className="text-lg leading-tight font-extrabold mt-2 sm:text-2xl sm:mt-3">
                            Internship Registration Open
                        </h2>

                        <p className="text-blue-100 mt-3 text-sm leading-relaxed">
                            Students can now submit internship agreements before May 20.
                        </p>

                        <button className="mt-4 flex items-center gap-2 text-sm font-bold sm:mt-5 sm:text-base">
                            Read More
                            <ArrowRight className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        </button>
                    </div>
                </section>
                <section className="bg-white rounded-[1.25rem] border border-blue-100 shadow-sm p-4 mb-6 sm:rounded-[1.5rem] sm:p-5">
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
                        <UsefulLink title="University Website" url="#" />

                        <UsefulLink title="E-Learning" url="#" />

                        <UsefulLink title="Student Email" url="#" />

                        <UsefulLink title="Library" url="#" />
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

        <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center sm:w-14 sm:h-14 ${ isTD ? "bg-orange-50 text-orange-600"
            : "bg-blue-50 text-[#1557A6]" }`}>
            {isTD ?
            <ClipboardList className="w-6 h-6 sm:w-[26px] sm:h-[26px]" /> :
            <BookOpen className="w-6 h-6 sm:w-[26px] sm:h-[26px]" />}
        </div>

        <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap sm:gap-2">
                <h3 className="font-extrabold text-sm leading-tight text-[#102033] sm:text-lg">
                    {course.subject}
                </h3>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold sm:px-3 sm:py-1 sm:text-xs ${ isTD ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-[#1557A6]" }`}>
                    {isTD ? "TD" : "Cours"}
                </span>
                {isCurrent && (
                <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-extrabold animate-pulse sm:px-3 sm:py-1 sm:text-xs">
                    LIVE NOW
                </span>
                )}

                {!isCurrent && isNext && (
                <span className="px-2 py-0.5 rounded-full bg-[#1557A6] text-white text-[10px] font-extrabold sm:px-3 sm:py-1 sm:text-xs">
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

    function FeatureCard({ title, desc, icon: Icon, color, onClick }) {
    const styles = {
    blue: "bg-blue-50 text-[#1557A6]",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    };

    return (
    <button onClick={onClick}
        className="bg-white rounded-[1.25rem] border border-blue-100 shadow-sm p-4 text-left hover:shadow-md hover:-translate-y-1 transition sm:rounded-[1.5rem] sm:p-5">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 sm:w-14 sm:h-14 sm:mb-5 ${styles[color]}`}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>

        <h3 className="text-lg font-extrabold text-[#0B3D7A] sm:text-xl">
            {title}
        </h3>

        <p className="text-slate-500 mt-2 text-xs sm:text-sm">
            {desc}
        </p>

        <div className="mt-4 text-[#1557A6] text-sm font-bold flex items-center gap-2 sm:mt-5 sm:text-base">
            Open
            <ArrowRight className="w-4 h-4 sm:w-[17px] sm:h-[17px]" />
        </div>
    </button>
    );
    }

    function getStatusBadge(status) {
    switch (status) {
    case "pending":
    return "bg-yellow-100 text-yellow-700";
    case "processing":
    return "bg-sky-100 text-sky-700";
    case "approved":
    return "bg-green-100 text-green-700";
    case "rejected":
    return "bg-red-100 text-red-700";
    case "ready":
    return "bg-[#1557A6] text-white";
    default:
    return "bg-gray-100 text-gray-700";
    }
    }
    function UsefulLink({ title, url }) {
    return (
    <a href={url}
        className="bg-[#F8FAFF] hover:bg-blue-50 border border-blue-100 rounded-2xl p-3 transition flex items-center justify-between gap-2 sm:p-4">
        <span className="font-bold text-sm leading-tight text-[#102033] sm:text-base">
            {title}
        </span>

        <ExternalLink className="text-[#1557A6] w-4 h-4 shrink-0 sm:w-[18px] sm:h-[18px]" />
    </a>
    );
    }
