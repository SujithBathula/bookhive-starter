import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import BookDetail from "./pages/BookDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Login from './pages/Login'

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App>
      {/* Global toast container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: "#10b981",
            color: "#fff",
            fontWeight: 500,
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          },
          success: { iconTheme: { primary: "#fff", secondary: "#10b981" } },
          error: {
            style: { background: "#dc2626" },
            iconTheme: { primary: "#fff", secondary: "#dc2626" },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<Catalog />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </App>
  </BrowserRouter>
);
