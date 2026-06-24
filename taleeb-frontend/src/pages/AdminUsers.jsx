import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Search,
  ShieldCheck,
  UserCog,
  UsersRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    role: "student",
    managed_department: "",
    managed_level: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadUsers = async () => {
      try {
        const res = await api.get("/users");

        if (isActive) {
          setUsers(res.data);
        }
      } catch {
        toast.error("Failed to load users.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isActive = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => user.role === "admin").length,
      representatives: users.filter((user) => user.role === "student_representative").length,
      departmentHeads: users.filter((user) => user.role === "department_head").length,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return users;

    return users.filter((user) => {
      const text = [
        user.name,
        user.email,
        user.role,
        user.managed_department,
        user.managed_level,
        user.student?.student_code,
        user.student?.department,
        user.student?.level,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(value);
    });
  }, [search, users]);

  const openRoleModal = (user) => {
    setEditingUser(user);
    setForm({
      role: user.role || "student",
      managed_department: user.managed_department || user.student?.department || "",
      managed_level: user.managed_level || user.student?.level || "",
    });
  };

  const closeModal = () => {
    if (saving) return;
    setEditingUser(null);
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveRole = async () => {
    try {
      setSaving(true);
      const res = await api.patch(`/users/${editingUser.id}/role`, form);

      setUsers((prev) =>
        prev.map((user) => (user.id === editingUser.id ? res.data.data : user))
      );

      setEditingUser(null);
      toast.success("User role updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-4 pb-28 pt-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5">
          <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#1557A6] text-white">
            <UsersRound size={22} />
          </span>
          <h1 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">
            User Management
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
            Manage student roles, representative scopes, department heads, and admins.
          </p>
        </header>

        <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={UsersRound} label="Users" value={stats.total} />
          <StatCard icon={ShieldCheck} label="Admins" value={stats.admins} tone="red" />
          <StatCard icon={UserCog} label="Representatives" value={stats.representatives} tone="green" />
          <StatCard icon={GraduationCap} label="Heads" value={stats.departmentHeads} tone="violet" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-950">
                  Users
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {filteredUsers.length} shown from {users.length} total.
                </p>
              </div>

              <label className="relative block w-full md:w-80">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users"
                  className="h-10 w-full rounded-xl bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-800 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:bg-white focus:ring-[#1557A6]/40"
                />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((item) => (
                <UserSkeleton key={item} />
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <UserRow key={user.id} user={user} onEdit={openRoleModal} />
              ))}
            </div>
          ) : (
            <EmptyState hasSearch={Boolean(search.trim())} />
          )}
        </section>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold text-slate-950">
                  Change User Role
                </h2>
                <p className="mt-1 truncate text-sm font-medium text-slate-500">
                  {editingUser.name} - {editingUser.email}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-800">
                  Role
                </span>
                <select
                  value={form.role}
                  onChange={(e) => updateField("role", e.target.value)}
                  className="select select-bordered w-full border-slate-200 bg-white text-slate-900 focus:border-[#1557A6]"
                >
                  <option value="student">Student</option>
                  <option value="student_representative">Student Representative</option>
                  <option value="department_head">Department Head</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              {(form.role === "student_representative" || form.role === "department_head") && (
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-800">
                    Managed Department
                  </span>
                  <input
                    value={form.managed_department}
                    onChange={(e) => updateField("managed_department", e.target.value)}
                    placeholder="Department"
                    className="input input-bordered w-full border-slate-200 bg-white text-slate-900 focus:border-[#1557A6]"
                  />
                </label>
              )}

              {form.role === "student_representative" && (
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-slate-800">
                    Managed Level
                  </span>
                  <input
                    value={form.managed_level}
                    onChange={(e) => updateField("managed_level", e.target.value)}
                    placeholder="Level"
                    className="input input-bordered w-full border-slate-200 bg-white text-slate-900 focus:border-[#1557A6]"
                  />
                </label>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn border-none bg-slate-100 text-slate-600 hover:bg-slate-200"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveRole}
                  className="btn border-none bg-[#1557A6] text-white hover:bg-[#0B3D7A]"
                  disabled={saving}
                >
                  <ShieldCheck size={18} />
                  Save Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function UserRow({ user, onEdit }) {
  return (
    <article className="p-4 transition hover:bg-slate-50 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FF] text-[#1557A6]">
            <UsersRound size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-base font-extrabold text-slate-950">
                {user.name}
              </h3>
              <RoleBadge role={user.role} />
            </div>

            <p className="mt-1 break-words text-sm font-medium text-slate-500">
              {user.email}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
              {user.student ? (
                <>
                  <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 ring-1 ring-slate-200">
                    {user.student.student_code}
                  </span>
                  <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 ring-1 ring-slate-200">
                    {user.student.department} - {user.student.level}
                  </span>
                </>
              ) : (
                <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-slate-400 ring-1 ring-slate-200">
                  No student profile
                </span>
              )}
              {(user.managed_department || user.managed_level) && (
                <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[#1557A6] ring-1 ring-blue-100">
                  Scope: {[user.managed_department, user.managed_level].filter(Boolean).join(" - ")}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onEdit(user)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1557A6] px-4 text-sm font-extrabold text-white transition hover:bg-[#0B3D7A] lg:shrink-0"
        >
          <ShieldCheck size={17} />
          Change Role
        </button>
      </div>
    </article>
  );
}

function StatCard({ icon: Icon, label, value, tone = "navy" }) {
  const tones = {
    navy: "bg-[#EAF3FF] text-[#1557A6]",
    red: "bg-red-50 text-red-600",
    green: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-950">{value}</p>
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase ${getRoleBadge(role)}`}>
      {formatRole(role)}
    </span>
  );
}

function UserSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-64 max-w-full animate-pulse rounded bg-slate-100" />
          <div className="h-8 w-80 max-w-full animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div className="p-10 text-center sm:p-14">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3FF] text-[#1557A6]">
        <UsersRound size={28} />
      </div>
      <h3 className="text-lg font-extrabold text-slate-950">
        No users found
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-sm font-medium text-slate-500">
        {hasSearch
          ? "Try searching by name, email, role, department, or student code."
          : "Users will appear here after accounts are created."}
      </p>
    </div>
  );
}

function getRoleBadge(role) {
  switch (role) {
    case "admin":
      return "bg-red-50 text-red-700";
    case "department_head":
      return "bg-violet-50 text-violet-700";
    case "student_representative":
      return "bg-emerald-50 text-emerald-700";
    default:
      return "bg-blue-50 text-[#1557A6]";
  }
}

function formatRole(role) {
  switch (role) {
    case "admin":
      return "Admin";
    case "department_head":
      return "Department Head";
    case "student_representative":
      return "Representative";
    default:
      return "Student";
  }
}
