import { Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PRIMARY_PHONE, WHATSAPP_NUMBER } from "@/lib/wuchi";
import logo from "@/assets/logo.jpeg";

export const Header = () => {
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Done Money Transfer, I'd like to send money."
  )}`;
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-glow group-hover:scale-105 transition-smooth overflow-hidden">
            <img src={logo} alt="Done Money Transfer logo" className="h-full w-full object-contain" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-base sm:text-lg">Done Money</div>
            <div className="text-[10px] sm:text-xs text-primary -mt-0.5 tracking-widest uppercase font-semibold">Transfer</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex gap-2">
            <a href={`tel:${PRIMARY_PHONE.replace(/\s/g, "")}`}>
              <Phone className="h-4 w-4 text-primary" />
              <span className="font-medium">{PRIMARY_PHONE}</span>
            </a>
          </Button>
          <Button asChild size="sm" className="bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold gap-2 shadow-lg transition-smooth">
            <a href={waUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">Chat</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
};