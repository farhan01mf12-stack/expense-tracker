import { useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/Layout.css";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <h1 className="topbar-title">Expense Tracker</h1>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
