import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { Bot } from "lucide-react";
import StudentHome from "./pages/StudentHome";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";

import MyRequests from "./pages/MyRequests";
import MySchedule from "./pages/MySchedule";

import AdminDashboard from "./pages/AdminDashboard";
import AdminSchedule from "./pages/AdminSchedule";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import StudentAnnouncements from "./pages/StudentAnnouncements";
import AdminAcademicSettings from "./pages/AdminAcademicSettings";
import AdminFAQ from "./pages/AdminFAQ";
import StudentFAQ from "./pages/StudentFAQ";
import AssistantChat from "./pages/AssistantChat";
import ClassFeed from "./pages/ClassFeed";
import ManageClassPosts from "./pages/ManageClassPosts";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
const LAST_PAGE_KEY = "taleebCurrentPage";

const studentPages = [
"home",
"class-feed",
"requests",
"schedule",
"faq",
"assistant",
"announcements",
];
const adminPages = [
"admin-analytics",
"admin-requests",
"admin-schedule",
"admin-faq",
"admin-announcements",
"admin-academic-settings",
"admin-users",
"assistant",
"home",
];

function getInitialPage(role) {
const fallback = role === "admin" ? "admin-analytics" : "home";
const storedPage = localStorage.getItem(LAST_PAGE_KEY);
const allowedPages = role === "admin" ? adminPages : studentPages;

return allowedPages.includes(storedPage) ? storedPage : fallback;
}

function App() {
const [isLoggedIn, setIsLoggedIn] = useState(
!!localStorage.getItem("token")
);

const [authPage, setAuthPage] = useState("login");

const user = JSON.parse(localStorage.getItem("user") || "null");
const role = user?.role || "student";

const [currentPage, setCurrentPage] = useState(
() => getInitialPage(role)
);

const navigateToPage = (page) => {
localStorage.setItem(LAST_PAGE_KEY, page);
setCurrentPage(page);
};

const handleLogout = () => {
setIsLoggedIn(false);
setAuthPage("login");
localStorage.removeItem(LAST_PAGE_KEY);
navigateToPage("home");
};

const renderPage = () => {
if (role === "admin") {
switch (currentPage) {
case "admin-requests":
return <AdminDashboard />;
case "admin-schedule":
return <AdminSchedule />;
case "admin-announcements":
return <AdminAnnouncements />;
case "admin-faq":
return <AdminFAQ />;
case "admin-academic-settings":
return <AdminAcademicSettings />;
case "assistant":
return <AssistantChat title="AI Assistant" />;
case "admin-users":
return <AdminUsers />;
case "admin-analytics":
  return <AdminAnalytics />;
case "home":
return <StudentHome setCurrentPage={navigateToPage} />;
default:
return <AdminDashboard />;
}
}
if (role === "student_representative") {
switch (currentPage) {
case "home":
return <StudentHome setCurrentPage={navigateToPage} />;

case "requests":
return <MyRequests />;

case "schedule":
return <MySchedule />;

case "class-feed":
return <ClassFeed />;

case "manage-class-posts":
return <ManageClassPosts />;

case "faq":
return <StudentFAQ />;

case "assistant":
return <AssistantChat />;

case "announcements":
return <StudentAnnouncements />;

default:
return <StudentHome setCurrentPage={navigateToPage} />;
}
}

switch (currentPage) {
case "home":
return <StudentHome setCurrentPage={navigateToPage} />;

case "requests":
return <MyRequests />;
case "schedule":
return <MySchedule />;
case "class-feed":
return <ClassFeed />;
case "faq":
return <StudentFAQ />;
case "assistant":
return <AssistantChat title="AI Assistant" />;
case "announcements":
return <StudentAnnouncements />;
default:
return <StudentHome setCurrentPage={setCurrentPage} />;
}
};

if (!isLoggedIn) {
return authPage === "login" ? (
<>
    <Toaster position="top-right" />
    <Login onLogin={()=> {
        setIsLoggedIn(true);
        const freshUser = JSON.parse(localStorage.getItem("user") || "null");
        navigateToPage(freshUser?.role === "admin" ? "admin-analytics" : "home");
        }}
        onGoRegister={() => setAuthPage("register")}
        />
</>
) : (
<>
    <Toaster position="top-right" />
    <Register onRegister={()=> setIsLoggedIn(true)}
        onGoLogin={() => setAuthPage("login")}
        />
</>
);
}

return (
<>
    <Toaster position="top-right" />
    <Navbar currentPage={currentPage} setCurrentPage={navigateToPage} role={role} onLogout={handleLogout} />
    {currentPage !== "assistant" && (
    <button type="button" onClick={()=> navigateToPage("assistant")}
        aria-label="Open AI Assistant"
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1557A6] text-white shadow-2xl shadow-blue-900/25 ring-1 ring-white/70 transition hover:bg-[#0B3D7A] focus:outline-none focus:ring-4 focus:ring-blue-100 sm:bottom-28 sm:right-6"
        >
        <Bot size={24} />
    </button>
    )}

    {renderPage()}
</>
);
}


export default App;
