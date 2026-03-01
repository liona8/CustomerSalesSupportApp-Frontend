import { useState, useRef, useEffect } from "react";
import './style.css';
import { Header } from "../src/components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { SupportPage } from "./pages/SupportPage";
import { TrackPage } from "./pages/TrackPage";

// ─── APP ──────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div>
      <link rel="stylesheet" href="style.css" />
      <Header activePage={page} setPage={setPage} />
      {page === "home" && <HomePage setPage={setPage} />}
      {page === "support" && <SupportPage />}
      {page === "track" && <TrackPage />}
      <Footer setPage={setPage} />
    </div>
  );
}
