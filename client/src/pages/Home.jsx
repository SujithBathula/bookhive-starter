import React from "react";
import { Link } from "react-router-dom";
import { api } from "./api";

export default function Home() {
  const [books, setBooks] = React.useState(null);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    api("/books?limit=8").then(setBooks).catch(e=>setErr(e.message));
  }, []);

  return (
    <section>
      <div className="card p-8 text-center mb-8 bg-gradient-to-br from-emerald-50 to-white">
        <div className="text-4xl mb-2">📚</div>
        <h1 className="text-3xl font-bold mb-1">Discover your next read</h1>
        <p className="text-slate-600">Browse bestsellers, classics, and tech favorites.</p>
        <div className="mt-4">
          <Link to="/books" className="btn btn-primary">Explore Catalog</Link>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">Featured</h2>
      {err && <p className="text-red-600">{err}</p>}
      {!books ? <GridSkeleton count={8}/> : <GridBooks books={books}/>}
    </section>
  );
}

function GridBooks({ books }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {books.map((b)=>(
        <Link to={`/book/${b.id}`} key={b.id} className="card overflow-hidden hover:shadow-md transition">
          <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
            <div className="text-5xl">📘</div>
          </div>
          <div className="p-4">
            <div className="font-semibold line-clamp-2">{b.title}</div>
            <div className="text-sm text-slate-500 mt-1">{b.authors}</div>
            <div className="mt-2 font-bold text-emerald-700">₹ {Number(b.price).toFixed(2)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
function GridSkeleton({ count=8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({length:count}).map((_,i)=>(
        <div key={i} className="card animate-pulse overflow-hidden">
          <div className="aspect-[4/3] bg-slate-100"/>
          <div className="p-4 space-y-2">
            <div className="h-4 bg-slate-100 rounded"/>
            <div className="h-4 bg-slate-100 rounded w-1/2"/>
          </div>
        </div>
      ))}
    </div>
  );
}
