import { useState } from "react";
import { IdCard, Lock, Mail, User } from "lucide-react";
import api from "../api/axios";

const whiteLogo = "/taleeb-logo%20white.png";

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
<div className="min-h-screen bg-[#EAF3FF] px-4 py-6 sm:px-6 lg:p-8">
    <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-blue-950/10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden bg-[#0B3D7A] p-10 text-white lg:flex lg:flex-col lg:items-center lg:justify-center">
            <div>
                <img src={whiteLogo} alt="Taleeb" className="mx-auto h-36 w-auto" />
                <p className="mt-8 text-center text-lg font-semibold text-blue-100">
                    Student portal
                </p>
            </div>
        </section>

        <main className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-lg">
                <div className="mb-7 text-center lg:hidden">
                    <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#0B3D7A]">
                        <img src={whiteLogo} alt="Taleeb" className="h-20 w-auto" />
                    </div>
                </div>

                <div className="mb-7">
                    <h1 className="text-4xl font-black tracking-tight text-[#102033]">
                        Create account
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Enter your student details.
                    </p>
                </div>

                {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <AuthField icon={User}>
                        <input
                            type="text"
                            className="grow bg-transparent text-[#102033] outline-none placeholder:text-slate-400"
                            placeholder="Full name"
                            value={form.name}
                            onChange={(e) => updateField("name", e.target.value)}
                        />
                    </AuthField>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <AuthField icon={Mail}>
                            <input
                                type="email"
                                className="grow bg-transparent text-[#102033] outline-none placeholder:text-slate-400"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) => updateField("email", e.target.value)}
                            />
                        </AuthField>

                        <AuthField icon={Lock}>
                            <input
                                type="password"
                                className="grow bg-transparent text-[#102033] outline-none placeholder:text-slate-400"
                                placeholder="Password"
                                value={form.password}
                                onChange={(e) => updateField("password", e.target.value)}
                            />
                        </AuthField>
                    </div>

                    <AuthField icon={IdCard}>
                        <input
                            type="text"
                            className="grow bg-transparent text-[#102033] outline-none placeholder:text-slate-400"
                            placeholder="Student code"
                            value={form.student_code}
                            onChange={(e) => updateField("student_code", e.target.value)}
                        />
                    </AuthField>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <select
                            className="h-14 rounded-2xl border border-blue-100 bg-[#F8FAFF] px-4 font-semibold text-[#102033] outline-none transition focus:border-[#1557A6] focus:bg-white focus:ring-4 focus:ring-blue-50"
                            value={form.department}
                            onChange={(e) => updateField("department", e.target.value)}
                        >
                            <option>Informatique</option>
                            <option>Mathématiques</option>
                            <option>Physique</option>
                            <option>Chimie</option>
                        </select>

                        <select
                            className="h-14 rounded-2xl border border-blue-100 bg-[#F8FAFF] px-4 font-semibold text-[#102033] outline-none transition focus:border-[#1557A6] focus:bg-white focus:ring-4 focus:ring-blue-50"
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
                            className="h-14 rounded-2xl border border-blue-100 bg-[#F8FAFF] px-4 font-semibold text-[#102033] outline-none transition focus:border-[#1557A6] focus:bg-white focus:ring-4 focus:ring-blue-50"
                            value={form.academic_year}
                            onChange={(e) => updateField("academic_year", e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 flex w-full items-center justify-center rounded-2xl bg-[#1557A6] px-5 py-4 font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-[#0B3D7A] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <button onClick={onGoLogin} className="font-extrabold text-[#1557A6] hover:underline">
                        Login
                    </button>
                </p>
            </div>
        </main>
    </div>
</div>
);
}

function AuthField({ icon: Icon, children }) {
return (
<label className="flex h-14 items-center gap-3 rounded-2xl border border-blue-100 bg-[#F8FAFF] px-4 transition focus-within:border-[#1557A6] focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
    <Icon size={19} className="text-[#1557A6]" />
    {children}
</label>
);
}
