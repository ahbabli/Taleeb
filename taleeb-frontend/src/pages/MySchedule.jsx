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
  const isSunday = today === "Sunday";

  useEffect(() => {
    let isActive = true;

    const fetchSchedule = async () => {
      try {
        const res = await api.get("/schedule");

        if (!isActive) {
          return;
        }

        setSchedule(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchSchedule();

    return () => {
      isActive = false;
    };
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
    <div className="min-h-screen bg-[#EAF3FF] pb-28">
      <div className="bg-[#0B3D7A] pt-7 pb-20 px-4 sm:pt-12 sm:pb-24 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white/10 p-3 rounded-2xl sm:p-4">
              <CalendarDays className="text-white w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div className="min-w-0">
              <h1 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl">
                My Schedule
              </h1>
              <p className="text-sm text-blue-100/80 mt-1 leading-snug sm:mt-2 sm:text-lg">
                View today’s courses and your weekly timetable.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 sm:px-6 sm:-mt-12">
        {loading ? (
          <div className="flex justify-center p-14 sm:p-20">
            <span className="loading loading-spinner loading-lg text-[#1557A6]"></span>
          </div>
        ) : (
          <>
            {/* Today's Schedule */}
            <div className="bg-white rounded-[1.5rem] shadow-md border border-blue-100 overflow-hidden mb-6 sm:mb-8 sm:rounded-3xl">
              <div className="p-5 bg-gradient-to-r to-[#13CE66] from-[#14a655] text-white sm:p-6">
                <h2 className="text-xl font-extrabold sm:text-2xl">
                  Today: {today}
                </h2>
                <p className="text-sm text-white mt-1 sm:text-base">
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
                <div className="p-8 text-center sm:p-10">
                  <h3 className="text-lg font-bold text-[#0B3D7A] sm:text-xl">
                    {isSunday ? "Enjoy your rest 😌" : "No classes today"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 sm:text-base">
                    {isSunday
                      ? "It is Sunday. Take a break and recharge for the week ahead."
                      : "You have no scheduled cours or TD for today."}
                  </p>
                </div>
              )}
            </div>

            {/* Weekly Schedule */}
            <div className="mb-4 sm:mb-5">
              <h2 className="text-xl font-extrabold text-[#0B3D7A] sm:text-2xl">
                Weekly Schedule
              </h2>
              <p className="text-sm text-slate-500 sm:text-base">
                All cours and TD sessions for the week.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6">
              {groupedSchedule.map(({ day, courses }) => (
                <div
                  key={day}
                  className={`bg-white rounded-[1.5rem] shadow-sm border overflow-hidden sm:rounded-3xl ${
                    day === today
                      ? "border-[#1557A6] ring-2 ring-blue-100"
                      : "border-blue-100"
                  }`}
                >
                  <div className="p-4 border-b border-blue-100 flex justify-between items-center gap-3 sm:p-5">
                    <div>
                      <h2 className="text-xl font-bold text-[#0B3D7A] sm:text-2xl">
                        {day}
                      </h2>
                      {day === today && (
                        <span className="text-xs font-bold text-[#1557A6] sm:text-sm">
                          Current day
                        </span>
                      )}
                    </div>

                    <span className="shrink-0 rounded-full bg-[#EAF3FF] px-3 py-1.5 text-xs font-bold text-[#1557A6] sm:px-4 sm:text-sm">
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
                    <div className="p-6 text-center text-sm text-slate-400 sm:p-8 sm:text-base">
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
      className={`p-4 transition-all sm:p-5 ${
        highlight ? "bg-blue-50/50" : "hover:bg-blue-50/40"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex gap-3 min-w-0 sm:gap-4">
          <div
            className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center sm:w-12 sm:h-12 ${
              isTD ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-[#1557A6]"
            }`}
          >
            {isTD ? (
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap sm:gap-3">
              <h3 className="text-base leading-tight font-bold text-[#102033] sm:text-xl">
                {course.subject}
              </h3>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase sm:px-3 sm:py-1 sm:text-xs ${
                  isTD
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-[#1557A6]"
                }`}
              >
                {isTD ? "TD" : "Cours"}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-2 mt-2 text-xs text-slate-500 sm:gap-4 sm:mt-3 sm:text-sm">
              <span className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3.5 h-3.5 text-[#1557A6] sm:w-4 sm:h-4" />
                {course.start_time.slice(0, 5)} - {course.end_time.slice(0, 5)}
              </span>

              <span className="flex items-center gap-1.5 sm:gap-2">
                <UserRound className="w-3.5 h-3.5 text-[#1557A6] sm:w-4 sm:h-4" />
                {course.teacher || "Not assigned"}
              </span>

              <span className="flex items-center gap-1.5 sm:gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#1557A6] sm:w-4 sm:h-4" />
                {course.room || "No room"}
              </span>
            </div>
          </div>
        </div>

        <span className="self-start rounded-full bg-[#EAF3FF] px-3 py-1.5 text-xs font-bold text-[#0B3D7A] md:self-auto sm:px-4 sm:py-2 sm:text-sm">
          {course.department} - {course.level}
        </span>
      </div>
    </div>
  );
}
