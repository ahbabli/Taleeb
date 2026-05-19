import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import api from "../api/axios";

const whiteLogo = "/taleeb-logo%20white.png";

export default function Login({ onLogin, onGoRegister }) {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleLogin = async (e) => {
e.preventDefault();
setError("");
setLoading(true);

try {
const res = await api.post("/login", {
email,
password,
});

localStorage.setItem("token", res.data.token);
localStorage.setItem("user", JSON.stringify(res.data.user));
localStorage.setItem("student", JSON.stringify(res.data.student));

onLogin();
} catch (err) {
setError(err.response?.data?.message || "Login failed.");
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
            <div className="w-full max-w-md">
                <div className="mb-8 text-center lg:hidden">
                    <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#0B3D7A]">
                        <img src={whiteLogo} alt="Taleeb" className="h-20 w-auto" />
                    </div>
                </div>

                <div className="mb-8">
                    <h1 className="text-4xl font-black tracking-tight text-[#102033]">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Login to continue.
                    </p>
                </div>

                {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <AuthField icon={Mail}>
                        <input
                            type="email"
                            className="grow bg-transparent text-[#102033] outline-none placeholder:text-slate-400"
                            placeholder="Email address"
                            value={email}
                            onChange={(e)=> setEmail(e.target.value)}
                        />
                    </AuthField>

                    <AuthField icon={Lock}>
                        <input
                            type="password"
                            className="grow bg-transparent text-[#102033] outline-none placeholder:text-slate-400"
                            placeholder="Password"
                            value={password}
                            onChange={(e)=> setPassword(e.target.value)}
                        />
                    </AuthField>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 flex w-full items-center justify-center rounded-2xl bg-[#1557A6] px-5 py-4 font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-[#0B3D7A] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                    Don't have an account?{" "}
                    <button onClick={onGoRegister} className="font-extrabold text-[#1557A6] hover:underline">
                        Create one
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
