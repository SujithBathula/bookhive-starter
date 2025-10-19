import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "./pages/api";

export default function App({ children }) {
  const [q, setQ] = React.useState("");
  const nav = useNavigate();
  const loc = useLocation();
  const token = !!localStorage.getItem("token");

  // keep search box in sync with query param
  React.useEffect(() => {
    const sp = new URLSearchParams(loc.search);
    setQ(sp.get("q") || "");
  }, [loc.search]);

  function onSearch(e) {
    e.preventDefault();
    nav(`/books?q=${encodeURIComponent(q)}`);
  }

  function doLogout() {
    logout();              // clear token
    nav("/login");         // redirect to login
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/75 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="text-xl font-black tracking-tight text-emerald-700">
            BookHive
          </Link>

          {/* Search */}
          <form onSubmit={onSearch} className="flex-1">
            <input
              className="input w-full"
              placeholder="Search books, authors, or categories…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>

          {/* Navigation */}
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/books" className="hover:text-emerald-600">Catalog</Link>
            <Link to="/cart" className="hover:text-emerald-600">Cart</Link>
            <Link to="/orders" className="hover:text-emerald-600">Orders</Link>
            {token ? (
              <button onClick={doLogout} className="btn btn-ghost">Logout</button>
            ) : (
              <Link to="/login" className="btn btn-ghost">Login</Link>
            )}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-10 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} BookHive. All rights reserved.
      </footer>
    </div>
  );
}
