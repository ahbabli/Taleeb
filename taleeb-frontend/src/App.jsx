import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyRequests from "./pages/MyRequests";
import AdminDashboard from "./pages/AdminDashboard";
import { Toaster } from "react-hot-toast";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [authPage, setAuthPage] = useState("login");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (isLoggedIn) {
    if (user?.role === "admin") {
      return (
        <>
          <Toaster position="top-right" />
          <AdminDashboard />
        </>
      );
    }

    return (
      <>
        <Toaster position="top-right" />
        <MyRequests />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      {authPage === "login" ? (
        <Login
          onLogin={() => setIsLoggedIn(true)}
          onGoRegister={() => setAuthPage("register")}
        />
  ) : (
        <Register
          onRegister={() => setIsLoggedIn(true)}
          onGoLogin={() => setAuthPage("login")}
        />
      )}
    </>
  );
}

export default App;
