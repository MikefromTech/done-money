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
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iPhone
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setIsIOS(true);
    }

    // Android install prompt
    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowInstall(false);
      });
    }
  };

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

        {/* ✅ INSTALL BUTTON (Android) */}
        {showInstall && !isIOS && (
          <button
            onClick={handleInstallClick}
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              background: "#FFD700",
              color: "#000",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "none",
              fontWeight: "bold",
              zIndex: 1000,
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            }}
          >
            Install App
          </button>
        )}

        {/* 🍏 iPhone instruction */}
        {isIOS && (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              left: "20px",
              right: "20px",
              background: "#1F1F1F",
              color: "#fff",
              padding: "12px",
              borderRadius: "10px",
              textAlign: "center",
              zIndex: 1000,
            }}
          >
            Tap Share → Add to Home Screen
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;