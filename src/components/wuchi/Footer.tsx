import { Phone, Settings, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { PRIMARY_PHONE, SECONDARY_PHONE, WHATSAPP_NUMBER } from "@/lib/wuchi";
import logo from "@/assets/logo.jpeg";

export const Footer = () => {
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}`;
  return (
    <footer className="border-t border-border/60 mt-20">
      <div className="container py-10 grid sm:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-white p-0.5 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Done Money Transfer" className="h-full w-full object-contain" />
            </div>
            <span className="font-display font-bold">Done Money Transfer</span>
          </div>
          <p className="text-muted-foreground">Fast · Secure · Reliable remittance between Zimbabwe, South Africa and India.</p>
        </div>
        <div>
          <div className="font-medium mb-3">Contact</div>
          <a href={`tel:${PRIMARY_PHONE.replace(/\s/g, "")}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth">
            <Phone className="h-3.5 w-3.5" /> {PRIMARY_PHONE}
          </a>
          <a href={`tel:${SECONDARY_PHONE.replace(/\s/g, "")}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth mt-1">
            <Phone className="h-3.5 w-3.5" /> {SECONDARY_PHONE}
          </a>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth mt-1">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp us
          </a>
        </div>
        <div>
          <div className="font-medium mb-3">Cash pickup</div>
          <ul className="text-muted-foreground space-y-1">
            <li>Harare</li><li>Mutare</li><li>Rusape</li><li>Murambinda</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 container">
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Done Money Transfer. All rights reserved.
        </div>
        <Link
          to="/admin"
          aria-label="Admin panel"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-primary transition-smooth"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Admin</span>
        </Link>
      </div>
    </footer>
  );
};