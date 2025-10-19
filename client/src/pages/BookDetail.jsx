import React from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "./api";

export default function BookDetail() {
  const { id } = useParams();
  const [data, setData] = React.useState(null);
  const [qty, setQty] = React.useState(1);

  React.useEffect(() => {
    api(`/books/${id}`)
      .then(setData)
      .catch((e) => toast.error(`Failed to load book: ${e.message}`));
  }, [id]);

  async function addToCart() {
    try {
      await api("/cart", {
        method: "POST",
        body: JSON.stringify({ bookId: Number(id), qty: Number(qty) }),
      });
      toast.success("✅ Successfully added to cart!");
    } catch (e) {
      toast.error(`❌ ${e.message}`);
    }
  }

  if (!data) return <div className="card p-8 text-center">Loading book details…</div>;
  const { book, authors = [], categories = [] } = data;

  return (
    <section className="grid md:grid-cols-2 gap-10 px-4 py-6 md:px-10">
      {/* Book cover */}
      <div className="card flex flex-col items-center justify-center aspect-[4/3] overflow-hidden">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="object-cover w-full h-full rounded-lg"
          />
        ) : (
          <div className="text-6xl">📘</div>
        )}
      </div>

      {/* Book details */}
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-800">{book.title}</h1>

        <p className="text-slate-600 text-sm">
          {authors.length > 0 ? authors.map((a) => a.name).join(", ") : "Unknown Author"}
        </p>

        <div className="flex items-center gap-3">
          <span className="text-emerald-700 text-2xl font-bold">
            ₹ {Number(book.price).toFixed(2)}
          </span>
          <span
            className={`badge ${
              book.stock_qty > 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {book.stock_qty > 0
              ? `In stock • ${book.stock_qty}`
              : "Out of stock"}
          </span>
        </div>

        <p className="text-slate-500 text-sm">
          {categories.map((c) => c.name).join(" • ")}
        </p>

        <p className="leading-relaxed text-slate-700">{book.description}</p>

        {/* Add to cart */}
        <div className="flex items-center gap-3 mt-4">
          <input
            type="number"
            min={1}
            className="input w-28"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
          <button
            onClick={addToCart}
            className="btn btn-primary text-white px-6 py-2"
            disabled={book.stock_qty <= 0}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  );
}
