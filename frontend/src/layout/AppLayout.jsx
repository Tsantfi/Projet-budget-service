import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-haigana-bg">

      {/* NAVBAR — jamais imprimé */}
      <div className="no-print">
        <Navbar />
      </div>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER — jamais imprimé */}
      <div className="no-print">
        <Footer />
      </div>

    </div>
  );
}