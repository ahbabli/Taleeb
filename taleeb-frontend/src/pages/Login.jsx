import { useState } from "react";
import { GraduationCap, Mail, Lock } from "lucide-react";
import api from "../api/axios";

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
<div className="min-h-screen bg-[#EAF3FF] flex items-center justify-center px-6">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-blue-100 p-8">
        <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#0B3D7A] flex items-center justify-center mb-4">
                <GraduationCap className="text-white" size={34} />
            </div>

            <h1 className="text-3xl font-extrabold text-[#0B3D7A]">
                Taleeb Portal
            </h1>

            <p className="text-slate-500 mt-2">
                Sign in to access your student services.
            </p>
        </div>

        {error && (
        <div className="alert alert-error mb-5 text-sm">
            <span>{error}</span>
        </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
            <label className="input input-bordered flex items-center gap-3 bg-white border-blue-100">
                <Mail size={18} className="text-slate-400" />
                <input type="email" className="grow text-gray-700" placeholder="Email" value={email} onChange={(e)=>
                setEmail(e.target.value)}
                />
            </label>

            <label className="input input-bordered flex items-center gap-3 bg-white border-blue-100">
                <Lock size={18} className="text-slate-400" />
                <input type="password" className="grow text-gray-700" placeholder="Password" value={password}
                    onChange={(e)=> setPassword(e.target.value)}
                />
            </label>

            <button type="submit" disabled={loading}
                className="w-full bg-[#1557A6] hover:bg-[#0B3D7A] text-white py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-60">
                {loading ? "Signing in..." : "Login"}
            </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <button onClick={onGoRegister} className="text-[#1557A6] font-bold hover:underline">
                Register
            </button>
        </p>
    </div>
</div>
);
}
