import React from "react";
import { api } from "./api";
import { Link, useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [placing, setPlacing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [info, setInfo] = React.useState("");

  // cart + totals
  const [cart, setCart] = React.useState([]);
  const subtotal = cart.reduce((s, it) => s + Number(it.line_total), 0);
  const tax = Math.round(subtotal * 0.10 * 100) / 100; // 10%
  const shipping = subtotal > 0 ? 49 : 0; // match your procedure default
  const total = subtotal + tax + shipping;

  // addresses
  const [addresses, setAddresses] = React.useState(null);
  const [addressId, setAddressId] = React.useState("");

  // try to load addresses; if endpoint not available, we silently fall back
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // 1) load cart
        const items = await api("/cart");
        if (!mounted) return;
        setCart(items);

        // 2) try to load addresses (if your backend has it)
        try {
          const addrs = await api("/addresses"); // adjust if yours differs
          if (!mounted) return;
          setAddresses(addrs || []);
          // pick default / first
          const def = (addrs || []).find(a => a.is_default) || (addrs || [])[0];
          if (def?.id) setAddressId(def.id);
        } catch {
          // endpoint not present: leave addresses=null and let manual ID input appear
          setAddresses(null);
        }
      } catch (e) {
        setError(e.message || "Failed to load checkout data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function placeOrder() {
    setError("");
    setInfo("");
    if (subtotal <= 0) {
      setError("Your cart is empty. Add items before checking out.");
      return;
    }
    if (!addressId || Number.isNaN(Number(addressId))) {
      setError("Please select a shipping address.");
      return;
    }
    try {
      setPlacing(true);
      // 1) create order
      const order = await api("/orders", {
        method: "POST",
        body: JSON.stringify({ shippingAddressId: Number(addressId) }),
      });
      // order_id from backend
      const oid = order.order_id || order.id;
      if (!oid) throw new Error("Order created but no order id returned");

      // 2) simulate payment
      await api(`/orders/${oid}/pay`, {
        method: "POST",
        body: JSON.stringify({ method: "card", txnRef: "DEMO" }),
      });

      setInfo("Payment successful. Redirecting…");
      navigate("/orders");
    } catch (e) {
      setError(e.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <section className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold mb-3">Shipping</h2>

          {addresses && addresses.length > 0 ? (
            <div className="space-y-3">
              <label className="text-sm text-slate-600">Select address</label>
              <select
                value={addressId}
                onChange={(e) => setAddressId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              >
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name ? `${a.full_name} — ` : ""}
                    {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postal_code}, {a.country}
                    {a.is_default ? " (Default)" : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Don’t see your address? Add it in your profile page (or seed an address for this user in the DB).
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-slate-600 text-sm">
                Address list endpoint not available. Enter your shipping address ID (from DB) to proceed.
              </p>
              <input
                type="number"
                min={1}
                value={addressId}
                onChange={(e) => setAddressId(e.target.value)}
                className="w-60 rounded-xl border border-slate-300 px-3 py-2"
                placeholder="Shipping Address ID"
              />
              <p className="text-xs text-slate-500">
                Example: set your demo user’s default address id from the <code>address</code> table.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold mb-3">Items</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-16 bg-slate-100 rounded-xl" />
              <div className="h-16 bg-slate-100 rounded-xl" />
            </div>
          ) : !cart.length ? (
            <div className="text-slate-600">
              Your cart is empty. <Link to="/books" className="text-emerald-700">Browse books</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((it) => (
                <div key={it.book_id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <div className="font-medium">{it.title}</div>
                    <div className="text-sm text-slate-500">Qty {it.qty} × ₹{Number(it.price).toFixed(2)}</div>
                  </div>
                  <div className="font-semibold">₹ {Number(it.line_total).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 h-fit sticky top-24">
        <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
        <div className="flex justify-between py-1">
          <span>Subtotal</span><span>₹ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1 text-slate-600">
          <span>Tax (10%)</span><span>₹ {tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1 text-slate-600">
          <span>Shipping</span><span>₹ {shipping.toFixed(2)}</span>
        </div>
        <div className="border-t my-3" />
        <div className="flex justify-between py-1 text-lg font-bold">
          <span>Total</span><span>₹ {total.toFixed(2)}</span>
        </div>

        <button
          onClick={placeOrder}
          disabled={placing || loading || subtotal <= 0 || !addressId}
          className={`mt-4 w-full rounded-xl px-4 py-2 text-white ${placing || loading || subtotal <= 0 || !addressId ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
        >
          {placing ? "Placing order…" : "Place Order"}
        </button>

        {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
        {info && <p className="mt-3 text-emerald-700 text-sm">{info}</p>}

        <p className="text-xs text-slate-500 mt-4">
          By placing your order you agree to BookHive’s terms. Payment is simulated via <code>/orders/:id/pay</code>.
        </p>
      </div>
    </section>
  );
}
