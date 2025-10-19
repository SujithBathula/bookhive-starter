import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { login } from "./api";

export default function Login() {
  const [email, setEmail] = React.useState("demo@gmail.com");   // change if needed
  const [password, setPassword] = React.useState("password123"); // change if needed
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);          // saves token to localStorage
      toast.success("Logged in");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-md mx-auto">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-slate-500 text-sm mb-4">Sign in to continue</p>
        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="text-sm">Email</label>
          <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />

          <label className="text-sm">Password</label>
          <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••" />

          <button className="btn btn-primary mt-2" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-4">
          Don’t have an account? You can register via API/Postman or seed a user in DB.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Tip: If you already have a token, paste in DevTools: <code>localStorage.setItem('token','YOUR_JWT')</code> then refresh.
        </p>
      </div>
    </section>
  );
}
