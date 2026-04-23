import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, CountryCode, getCountry, isSupported, SUPPORTED_PAIRS } from "@/lib/wuchi";
import { supabase } from "@/integrations/supabase/client";
import indiaFlag from "@/assets/indiaflag.jpeg";
import saFlag from "@/assets/saflag.jpeg";
import zimFlag from "@/assets/zimflag.jpeg";

interface Props {
  onContinue: (data: {
    from: CountryCode; to: CountryCode;
    amountFrom: number; amountTo: number; rate: number;
  }) => void;
}

export const Converter = ({ onContinue }: Props) => {
  const [from, setFrom] = useState<CountryCode>("ZA");
  const [to, setTo] = useState<CountryCode>("ZW");
  const [amount, setAmount] = useState<string>("1000");
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fromC = getCountry(from);
  const toC = getCountry(to);

  // Ensure pair is supported when changing dropdowns
  useEffect(() => {
    if (!isSupported(from, to)) {
      const next = SUPPORTED_PAIRS.find(([a]) => a === from);
      if (next) setTo(next[1]);
    }
  }, [from, to]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("exchange_rates")
      .select("rate")
      .eq("from_currency", fromC.currency)
      .eq("to_currency", toC.currency)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setRate(data?.rate ? Number(data.rate) : null);
        setLoading(false);
      });
    return () => { active = false; };
  }, [fromC.currency, toC.currency]);

  const amountNum = parseFloat(amount) || 0;
  const converted = useMemo(() => (rate ? amountNum * rate : 0), [amountNum, rate]);

  const swap = () => { setFrom(to); setTo(from); };

  const allowedToCountries = COUNTRIES.filter((c) =>
    SUPPORTED_PAIRS.some(([a, b]) => a === from && b === c.code)
  );

  return (
    <div className="gradient-card rounded-2xl border border-border/60 shadow-card p-5 sm:p-7 backdrop-blur-sm">
      <div className="space-y-5">
        {/* You send */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">You send</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-semibold h-14 bg-background/50"
              placeholder="0.00"
            />
            <CountrySelect value={from} onChange={setFrom} options={COUNTRIES} />
          </div>
        </div>

        {/* Swap */}
        <div className="flex justify-center -my-2">
          <button
            onClick={swap}
            className="h-10 w-10 rounded-full bg-secondary border border-border hover:border-primary hover:text-primary transition-smooth flex items-center justify-center"
            aria-label="Swap currencies"
          >
            <ArrowDownUp className="h-4 w-4" />
          </button>
        </div>

        {/* Recipient gets */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Recipient gets</Label>
          <div className="flex gap-2">
            <div className="flex-1 h-14 px-3 rounded-md border border-border bg-background/50 flex items-center text-2xl font-semibold">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <span className="text-gradient">
                  {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
            <CountrySelect value={to} onChange={setTo} options={allowedToCountries} />
          </div>
        </div>

        {/* Rate */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-4">
          <span>Exchange rate</span>
          <span className="font-mono">
            1 {fromC.currency} = {rate ? rate.toFixed(4) : "—"} {toC.currency}
          </span>
        </div>

        <Button
          variant="default"
          size="lg"
          className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-95 transition-smooth"
          disabled={!rate || amountNum <= 0}
          onClick={() => onContinue({ from, to, amountFrom: amountNum, amountTo: converted, rate: rate! })}
        >
          Continue to send
        </Button>
      </div>
    </div>
  );
};

const FLAG_IMAGES: Record<CountryCode, string> = {
  ZA: saFlag,
  ZW: zimFlag,
  IN: indiaFlag,
};

function CountrySelect({
  value, onChange, options,
}: { value: CountryCode; onChange: (v: CountryCode) => void; options: typeof COUNTRIES }) {
  const selected = getCountry(value);
  return (
    <Select value={value} onValueChange={(v) => onChange(v as CountryCode)}>
      <SelectTrigger className="w-[140px] h-14 bg-background/50 font-medium">
        <SelectValue>
          <span className="flex items-center gap-2">
            <img src={FLAG_IMAGES[value]} alt="" className="h-5 w-7 rounded-sm object-cover" />
            <span>{selected.currency}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span className="flex items-center gap-2">
              <img src={FLAG_IMAGES[c.code]} alt="" className="h-5 w-7 rounded-sm object-cover" />
              <span className="font-semibold">{c.currency}</span>
              <span className="text-xs text-muted-foreground">{c.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}