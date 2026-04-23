import { useState } from "react";
import { Building2, CreditCard, MapPin, MessageCircle, Phone, Smartphone, User } from "lucide-react";
import { BANK_DETAILS, WHATSAPP_NUMBER } from "@/lib/wuchi";
import { Header } from "@/components/wuchi/Header";
import { Footer } from "@/components/wuchi/Footer";
import { RatesTicker } from "@/components/wuchi/RatesTicker";
import { Converter } from "@/components/wuchi/Converter";
import { SendForm } from "@/components/wuchi/SendForm";
import { CountryCode } from "@/lib/wuchi";
import heroBg from "@/assets/hero-transfer-bg.jpeg";
import badgeFast from "@/assets/badge-fast.jpg";
import badgeTrusted from "@/assets/badge-trusted.jpg";
import badgeCountries from "@/assets/badge-countries.jpg";

interface Conversion {
  from: CountryCode; to: CountryCode;
  amountFrom: number; amountTo: number; rate: number;
}

const PAYMENT_DETAILS = [
  { title: "EcoCash", icon: Smartphone, rows: ["Merchant code: 041763", "Lasta Magaya"] },
  { title: "Innbucks", icon: User, rows: ["Shepherd Magaya", "+263 77 722 0915"] },
  { title: "SA bank details", icon: Building2, rows: ["Ms S Mtshayi", "Acc Number: 2351260836", "Acc type: current", "Capitec"] },
  { title: "FNB bank details", icon: CreditCard, rows: [`${BANK_DETAILS.accountName}`, `Acc Number: ${BANK_DETAILS.accountNumber}`, BANK_DETAILS.bank] },
  { title: "Our office", icon: MapPin, rows: ["UZ, Money Maben"] },
  { title: "Contact Magaya", icon: Phone, rows: ["Direct calls: +263 77 722 0915", "WhatsApp: +263 77 722 0915"] },
];

const Index = () => {
  const [conversion, setConversion] = useState<Conversion | null>(null);
  const indiaPayUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Done Money Transfer, I am in India and want to pay."
  )}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <RatesTicker />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden min-h-[600px] sm:min-h-[700px] lg:min-h-[800px]">
          <div
            className="absolute inset-0 opacity-70"
            style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="absolute inset-0 gradient-hero opacity-75" />
          <div className="relative container py-12 sm:py-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="fade-in-up max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Live rates · Instant transfers
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Send money <span className="text-gradient">easily</span> across borders
              </h1>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground">
                Move money between Zimbabwe, South Africa and India with great rates,
                EcoCash and cash pickup options. Trusted by families and businesses.
              </p>
              <div className="mt-6 grid gap-3 max-w-xl">
                <div className="rounded-xl border border-border/60 bg-card/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <CreditCard className="h-4 w-4" />
                    Payment details
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                    {PAYMENT_DETAILS.map((detail) => (
                      <div key={detail.title} className="rounded-lg border border-border/50 bg-background/40 p-3">
                        <div className="flex items-center gap-2 font-semibold text-foreground">
                          <detail.icon className="h-4 w-4 text-primary" />
                          {detail.title}
                        </div>
                        <div className="mt-2 space-y-1 text-muted-foreground">
                          {detail.rows.map((row) => <div key={row}>{row}</div>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <a
                  href={indiaPayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-[#25D366] p-4 text-sm font-semibold text-white transition-smooth hover:bg-[#128C7E] flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  🇮🇳 India pay via WhatsApp
                </a>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { img: badgeFast, label: "Fast" },
                  { img: badgeTrusted, label: "Trusted" },
                  { img: badgeCountries, label: "3 Countries" },
                ].map((b) => (
                  <div key={b.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card/40 border border-border/60">
                    <img src={b.img} alt={b.label} className="h-10 w-10 rounded-full object-cover" loading="lazy" />
                    <span className="text-xs font-medium">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="fade-in-up" style={{ animationDelay: "120ms" }}>
              {conversion ? (
                <SendForm conversion={conversion} />
              ) : (
                <Converter onContinue={setConversion} />
              )}
              {conversion && (
                <button
                  onClick={() => setConversion(null)}
                  className="mt-4 text-sm text-muted-foreground hover:text-primary transition-smooth"
                >
                  ← Edit amount
                </button>
              )}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-foreground text-background py-16">
          <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-display text-3xl font-bold">How it works</h2>
            <p className="text-background/70 mt-2">Three simple steps to send money home.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: "01", t: "Calculate", d: "Pick countries and amount. See exactly what arrives." },
              { n: "02", t: "Pay & upload proof", d: "Send via EcoCash or bank, then upload your receipt." },
              { n: "03", t: "Recipient cashes out", d: "Via EcoCash or pickup in Harare, Mutare, Rusape, Murambinda." },
            ].map((s) => (
              <div key={s.n} className="bg-background/5 border border-background/15 rounded-2xl p-6 hover:border-primary/60 transition-smooth">
                <div className="text-gradient font-display text-3xl font-extrabold">{s.n}</div>
                <div className="font-display font-semibold text-lg mt-2">{s.t}</div>
                <p className="text-sm text-background/70 mt-1">{s.d}</p>
              </div>
            ))}
          </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
