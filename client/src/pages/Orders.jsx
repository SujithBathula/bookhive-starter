import React from "react";
import { Link } from "react-router-dom";
import { api } from "./api";

export default function Orders() {
  const [orders, setOrders] = React.useState(null);
  const [err, setErr] = React.useState("");

  React.useEffect(()=>{ api("/orders").then(setOrders).catch(e=>setErr(e.message)); },[]);

  if(err) return <div className="card p-6 text-red-600">{err}</div>;
  if(!orders) return <div className="card p-8">Loading…</div>;
  if(!orders.length) return <div className="card p-10 text-center">No orders yet. <Link className="text-emerald-700" to="/books">Start shopping</Link>.</div>;

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">My Orders</h2>
      <div className="space-y-3">
        {orders.map(o=>(
          <div key={o.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold">Order #{o.id}</div>
              <div className="text-sm text-slate-500">{new Date(o.placed_at || o.created_at || Date.now()).toLocaleString()}</div>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="badge bg-slate-100">{o.status}</span>
              <span>Total: <b>₹ {Number(o.total_amount).toFixed(2)}</b></span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
