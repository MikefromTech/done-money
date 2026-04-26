import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIOSInstall, setShowIOSInstall] = useState(false);

  // ✅ ANDROID INSTALL LOGIC
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setShowInstall(false);
  };

  // ✅ iPHONE DETECTION
  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isStandalone) {
      setShowIOSInstall(true);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

        {/* ✅ ANDROID INSTALL BUTTON */}
        {showInstall && (
          <button
            onClick={handleInstallClick}
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              background: "#FFD600",
              color: "#000",
              border: "none",
              padding: "10px 16px",
              borderRadius: "999px",
              fontWeight: "bold",
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
              cursor: "pointer",
              zIndex: 9999
            }}
          >
            ⬇ Install
          </button>
        )}

        {/* ✅ iPHONE SMALL INSTALL HINT */}
        {showIOSInstall && (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#111",
              color: "#fff",
              padding: "12px 16px",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              fontSize: "14px",
              maxWidth: "90%",
              zIndex: 9999
            }}
          >
            <div style={{ marginBottom: "6px", fontWeight: "bold" }}>
              📲 Install App
            </div>

            <div style={{ fontSize: "12px", opacity: 0.8 }}>
              Tap Share → Add to Home Screen
            </div>

            <button
              onClick={() => setShowIOSInstall(false)}
              style={{
                marginTop: "8px",
                background: "#FFD600",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Got it
            </button>
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;