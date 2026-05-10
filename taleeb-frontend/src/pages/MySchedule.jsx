import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  UserRound,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import api from "../api/axios";

const daysOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getTodayName() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

export default function MySchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = getTodayName();

  const fetchSchedule = async () => {
    try {
      const res = await api.get("/schedule");
      setSchedule(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const todayCourses = schedule
    .filter((item) => item.day === today)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const groupedSchedule = daysOrder.map((day) => ({
    day,
    courses: schedule
      .filter((item) => item.day === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }));

  return (
    <div className="min-h-screen bg-[#EAF3FF] pb-20">
      <div className="bg-[#0B3D7A] pt-12 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-4 rounded-2xl">
              <CalendarDays className="text-white" size={34} />
            </div>

            <div>
              <h1 className="text-4xl font-extrabold text-white">
                My Schedule
              </h1>
              <p className="text-blue-100/80 mt-2 text-lg">
                View today’s courses and your weekly timetable.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12">
        {loading ? (
          <div className="flex justify-center p-20">
            <span className="loading loading-spinner loading-lg text-[#1557A6]"></span>
          </div>
        ) : (
          <>
            {/* Today's Schedule */}
            <div className="bg-white rounded-3xl shadow-md border border-blue-100 overflow-hidden mb-8">
              <div className="p-6 bg-gradient-to-r to-[#13CE66] from-[#14a655] text-white">
                <h2 className="text-2xl font-extrabold">
                  Today: {today}
                </h2>
                <p className="text-white mt-1">
                  Your classes for today.
                </p>
              </div>

              {todayCourses.length > 0 ? (
                <div className="divide-y divide-blue-50">
                  {todayCourses.map((course) => (
                    <CourseRow key={course.id} course={course} highlight />
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <h3 className="text-xl font-bold text-[#0B3D7A]">
                    No classes today
                  </h3>
                  <p className="text-slate-500 mt-1">
                    You have no scheduled cours or TD for today.
                  </p>
                </div>
              )}
            </div>

            {/* Weekly Schedule */}
            <div className="mb-5">
              <h2 className="text-2xl font-extrabold text-[#0B3D7A]">
                Weekly Schedule
              </h2>
              <p className="text-slate-500">
                All cours and TD sessions for the week.
              </p>
            </div>

            <div className="grid gap-6">
              {groupedSchedule.map(({ day, courses }) => (
                <div
                  key={day}
                  className={`bg-white rounded-3xl shadow-sm border overflow-hidden ${
                    day === today
                      ? "border-[#1557A6] ring-2 ring-blue-100"
                      : "border-blue-100"
                  }`}
                >
                  <div className="p-5 border-b border-blue-100 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0B3D7A]">
                        {day}
                      </h2>
                      {day === today && (
                        <span className="text-sm font-bold text-[#1557A6]">
                          Current day
                        </span>
                      )}
                    </div>

                    <span className="badge bg-[#EAF3FF] text-[#1557A6] border-none font-bold">
                      {courses.length} session{courses.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {courses.length > 0 ? (
                    <div className="divide-y divide-blue-50">
                      {courses.map((course) => (
                        <CourseRow key={course.id} course={course} />
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      No sessions scheduled.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CourseRow({ course, highlight = false }) {
  const isTD = course.type === "td";

  return (
    <div
      className={`p-5 transition-all ${
        highlight ? "bg-blue-50/50" : "hover:bg-blue-50/40"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isTD ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-[#1557A6]"
            }`}
          >
            {isTD ? <ClipboardList size={24} /> : <BookOpen size={24} />}
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-[#102033]">
                {course.subject}
              </h3>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  isTD
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-[#1557A6]"
                }`}
              >
                {isTD ? "TD" : "Cours"}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-[#1557A6]" />
                {course.start_time.slice(0, 5)} - {course.end_time.slice(0, 5)}
              </span>

              <span className="flex items-center gap-2">
                <UserRound size={16} className="text-[#1557A6]" />
                {course.teacher || "Not assigned"}
              </span>

              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-[#1557A6]" />
                {course.room || "No room"}
              </span>
            </div>
          </div>
        </div>

        <span className="px-4 py-2 rounded-full bg-[#EAF3FF] text-[#0B3D7A] font-bold text-sm">
          {course.department} - {course.level}
        </span>
      </div>
    </div>
  );
}