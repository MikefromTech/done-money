import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp } from "lucide-react";
import indiaFlag from "@/assets/indiaflag.jpeg";
import saFlag from "@/assets/saflag.jpeg";
import zimFlag from "@/assets/zimflag.jpeg";

interface Rate {
  from_currency: string;
  to_currency: string;
  rate: number;
}

const FLAGS: Record<string, string> = {
  USD: zimFlag,
  ZAR: saFlag,
  INR: indiaFlag,
};

export const RatesTicker = () => {
  const [rates, setRates] = useState<Rate[]>([]);

  useEffect(() => {
    const fetchRates = async () => {
      const { data } = await supabase
        .from("exchange_rates")
        .select("from_currency,to_currency,rate");
      if (data) setRates(data);
    };
    fetchRates();

    const channel = supabase
      .channel("exchange_rates_ticker")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exchange_rates" },
        () => fetchRates()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!rates.length) return null;
  const items = [...rates, ...rates, ...rates]; // triple for seamless loop

  return (
    <>
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .ticker-animate {
          animation: ticker-scroll 30s linear infinite;
        }
      `}</style>
      <div className="border-y border-border/60 bg-card/40 overflow-hidden py-2.5">
        <div className="flex items-center gap-10 ticker-animate whitespace-nowrap">
          {items.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-6 shrink-0">
              <TrendingUp className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                {FLAGS[r.from_currency] && (
                  <img src={FLAGS[r.from_currency]} alt={`${r.from_currency} flag`} className="inline-block h-5 w-7 rounded-sm object-cover" loading="lazy" />
                )}
                <span>1 <span className="text-foreground">{r.from_currency}</span></span>
                <span className="text-primary">=</span>
                <span className="text-foreground font-semibold">{Number(r.rate).toFixed(4)}</span>
                <span>{r.to_currency}</span>
                {FLAGS[r.to_currency] && (
                  <img src={FLAGS[r.to_currency]} alt={`${r.to_currency} flag`} className="inline-block h-5 w-7 rounded-sm object-cover" loading="lazy" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
