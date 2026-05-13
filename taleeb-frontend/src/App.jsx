import { useState } from "react";
import { Toaster } from "react-hot-toast";
import StudentHome from "./pages/StudentHome";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";

import MyRequests from "./pages/MyRequests";
import MySchedule from "./pages/MySchedule";

import AdminDashboard from "./pages/AdminDashboard";
import AdminSchedule from "./pages/AdminSchedule";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [authPage, setAuthPage] = useState("login");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role || "student";

  const [currentPage, setCurrentPage] = useState(
  role === "admin" ? "admin-requests" : "home"
);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthPage("login");
    setCurrentPage("home");
  };

  const renderPage = () => {
    if (role === "admin") {
      switch (currentPage) {
        case "admin-requests":
          return <AdminDashboard />;
        case "admin-schedule":
          return <AdminSchedule />;
        case "admin-faq":
          return <ComingSoon title="FAQ Management" />;
          case "home":
  return <StudentHome setCurrentPage={setCurrentPage} />;
        default:
          return <AdminDashboard />;
      }
    }

    switch (currentPage) {
  case "home":
    return <StudentHome setCurrentPage={setCurrentPage} />;
  case "requests":
    return <MyRequests />;
  case "schedule":
    return <MySchedule />;
  case "faq":
    return <ComingSoon title="FAQ" />;
  case "assistant":
    return <ComingSoon title="AI Assistant" />;
  default:
    return <StudentHome setCurrentPage={setCurrentPage} />;
}
  };

  if (!isLoggedIn) {
    return authPage === "login" ? (
      <>
        <Toaster position="top-right" />
        <Login
          onLogin={() => {
            setIsLoggedIn(true);
            const freshUser = JSON.parse(localStorage.getItem("user") || "null");
            setCurrentPage(freshUser?.role === "admin" ? "admin-requests" : "home");
          }}
          onGoRegister={() => setAuthPage("register")}
        />
      </>
    ) : (
      <>
        <Toaster position="top-right" />
        <Register
          onRegister={() => setIsLoggedIn(true)}
          onGoLogin={() => setAuthPage("login")}
        />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        role={role}
        onLogout={handleLogout}
      />

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