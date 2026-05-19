import { useState } from "react";
import { Toaster } from "react-hot-toast";
import StudentHome from "./pages/StudentHome";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TaleebLogo from "./components/TaleebLogo";

import MyRequests from "./pages/MyRequests";
import MySchedule from "./pages/MySchedule";

import AdminDashboard from "./pages/AdminDashboard";
import AdminSchedule from "./pages/AdminSchedule";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import StudentAnnouncements from "./pages/StudentAnnouncements";
import AdminAcademicSettings from "./pages/AdminAcademicSettings";
import AdminFAQ from "./pages/AdminFAQ";
import StudentFAQ from "./pages/StudentFAQ";

const LAST_PAGE_KEY = "taleebCurrentPage";

const studentPages = ["home", "requests", "schedule", "faq", "assistant", "announcements"];
const adminPages = [
"admin-requests",
"admin-schedule",
"admin-faq",
"admin-announcements",
"admin-academic-settings",
"home",
];

function getInitialPage(role) {
const fallback = role === "admin" ? "admin-requests" : "home";
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
case "home":
return <StudentHome setCurrentPage={navigateToPage} />;
default:
return <AdminDashboard />;
}
}

switch (currentPage) {
case "home":
return <StudentHome setCurrentPage={navigateToPage} />;

case "requests":
return <MyRequests />;
case "schedule":
return <MySchedule />;
case "faq":
return <StudentFAQ />;
case "assistant":
return <ComingSoon title="AI Assistant" />;
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
        navigateToPage(freshUser?.role === "admin" ? "admin-requests" : "home");
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

    {renderPage()}
</>
);
}

function ComingSoon({ title }) {
return (
<div className="min-h-screen bg-[#EAF3FF] flex items-center justify-center px-6">
    <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-10 text-center max-w-md">
        <h1 className="text-3xl font-extrabold text-[#0B3D7A]">
            {title}
        </h1>
        <p className="text-slate-500 mt-3">
            This module will be added next.
        </p>
    </div>
</div>
);
}

export default App;
