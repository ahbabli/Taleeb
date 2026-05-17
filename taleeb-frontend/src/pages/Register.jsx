import { useState } from "react";
import { Mail, Lock, User, IdCard } from "lucide-react";
import api from "../api/axios";
import TaleebLogo from "../components/TaleebLogo";

export default function Register({ onRegister, onGoLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    student_code: "",
    department: "Informatique",
    level: "S1",
    academic_year: "2025-2026",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/register", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("student", JSON.stringify(res.data.student));

      onRegister();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAF3FF] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-blue-100 p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <TaleebLogo
            className="mb-5"
            markClassName="h-32 w-auto max-w-[220px]"
          />

          <h1 className="text-3xl font-extrabold text-[#0B3D7A]">
            Create Student Account
          </h1>

          <p className="text-slate-500 mt-2">
            Register to access Taleeb student services.
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-5 text-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-gray-700">
          <label className="input input-bordered flex items-center gap-3 bg-white border-blue-100">
            <User size={18} className="text-slate-400" />
            <input
              type="text"
              className="grow"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </label>

          <label className="input input-bordered flex items-center gap-3 bg-white border-blue-100">
            <Mail size={18} className="text-slate-400" />
            <input
              type="email"
              className="grow"
              placeholder="Email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </label>

          <label className="input input-bordered flex items-center gap-3 bg-white border-blue-100">
            <Lock size={18} className="text-slate-400" />
            <input
              type="password"
              className="grow"
              placeholder="Password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
          </label>

          <label className="input input-bordered flex items-center gap-3 bg-white border-blue-100">
            <IdCard size={18} className="text-slate-400" />
            <input
              type="text"
              className="grow"
              placeholder="Student code"
              value={form.student_code}
              onChange={(e) => updateField("student_code", e.target.value)}
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              className="select select-bordered bg-white border-blue-100"
              value={form.department}
              onChange={(e) => updateField("department", e.target.value)}
            >
              <option>Informatique</option>
              <option>Mathématiques</option>
              <option>Physique</option>
              <option>Chimie</option>
            </select>

            <select
              className="select select-bordered bg-white border-blue-100"
              value={form.level}
              onChange={(e) => updateField("level", e.target.value)}
            >
              <option>S1</option>
              <option>S2</option>
              <option>S3</option>
              <option>S4</option>
              <option>S5</option>
              <option>S6</option>
            </select>

            <input
              className="input input-bordered bg-white border-blue-100"
              value={form.academic_year}
              onChange={(e) => updateField("academic_year", e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1557A6] hover:bg-[#0B3D7A] text-white py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <button
            onClick={onGoLogin}
            className="text-[#1557A6] font-bold hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
