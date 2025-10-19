import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "./api";

export default function Cart() {
  const [items, setItems] = React.useState(null);
  const [err, setErr] = React.useState("");
  const nav = useNavigate();

  const load = React.useCallback(()=>{ api("/cart").then(setItems).catch(e=>setErr(e.message)); },[]);
  React.useEffect(()=>{ load(); },[load]);

  const total = (items||[]).reduce((s,it)=> s+Number(it.line_total), 0);

  async function changeQty(bookId, qty){ await api("/cart",{method:"POST",body:JSON.stringify({bookId,qty})}); load(); }
  async function remove(bookId){ await api(`/cart/${bookId}`,{method:"DELETE"}); load(); }
  async function checkout(){ try { await api("/orders",{method:"POST"}); nav("/orders"); } catch(e){ setErr(e.message); } }

  if(err) return <div className="card p-6 text-red-600">{err}</div>;
  if(!items) return <div className="card p-8">Loading…</div>;
  if(!items.length) return <div className="card p-10 text-center">Your cart is empty. <Link className="text-emerald-700 ml-1" to="/books">Browse books</Link></div>;

  return (
    <section className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-3">
        {items.map(it=>(
          <div key={it.book_id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{it.title}</div>
              <div className="text-sm text-slate-500">₹ {Number(it.price).toFixed(2)} each</div>
            </div>
            <div className="flex items-center gap-3">
              <input type="number" min={1} className="input w-24" value={it.qty} onChange={e=>changeQty(it.book_id, Number(e.target.value))}/>
              <div className="w-28 text-right font-semibold">₹ {Number(it.line_total).toFixed(2)}</div>
              <button onClick={()=>remove(it.book_id)} className="text-red-600 hover:bg-red-50 rounded-lg px-3 py-2">Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-5 h-fit sticky top-24">
        <div className="flex justify-between mb-2"><span>Subtotal</span><span>₹ {total.toFixed(2)}</span></div>
        <div className="flex justify-between text-slate-500 mb-4"><span>Est. tax</span><span>10%</span></div>
        <button onClick={checkout} className="btn btn-primary w-full">Checkout</button>
        <p className="text-xs text-slate-500 mt-3">You can review your orders after checkout.</p>
      </div>
    </section>
  );
}
