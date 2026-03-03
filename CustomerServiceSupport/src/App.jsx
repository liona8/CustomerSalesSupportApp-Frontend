import { useState, useRef, useEffect } from "react";
import './style.css';
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { FloatingChatbot } from "./components/FloatingChatbot";
import { HomePage } from "./pages/HomePage";
import { SupportPage } from "./pages/SupportPage";
import { TrackPage } from "./pages/TrackPage";
import { ProductsPage } from "./pages/ProductPage";

export default function App() {
  const [page, setPage] = useState("home");
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div>
      <link rel="stylesheet" href="style.css" />
      <Header activePage={page} setPage={setPage} />
      {page === "home" && <HomePage setPage={setPage} openChat={() => setChatOpen(true)} />}
      {page === "products" && <ProductsPage setPage={setPage} />}
      {page === "support" && <SupportPage openChat={() => setChatOpen(true)} />}
      {page === "track" && <TrackPage />}
      <Footer setPage={setPage} />
      <FloatingChatbot isOpen={chatOpen} setIsOpen={setChatOpen} />
    </div>
  );
}