import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, Upload, Check, MapPin, Smartphone, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CountryCode, getCountry, WHATSAPP_NUMBER } from "@/lib/wuchi";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  ecocashName: z.string().trim().min(2, "Enter the EcoCash registered full name").max(80),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
});

interface Props {
  conversion: {
    from: CountryCode; to: CountryCode;
    amountFrom: number; amountTo: number; rate: number;
  };
}

export const SendForm = ({ conversion }: Props) => {
  const [name, setName] = useState("");
  const [ecocashName, setEcocashName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<"ecocash" | "cash">("ecocash");
  const [location, setLocation] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [locations, setLocations] = useState<{ id: string; name: string; city: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.from("payout_locations").select("id,name,city").eq("active", true)
      .then(({ data }) => data && setLocations(data));
  }, []);

  const fromC = getCountry(conversion.from);
  const toC = getCountry(conversion.to);

  const handleSubmit = async () => {
    const parsed = schema.safeParse({ name, ecocashName, phone });
    if (!parsed.success) {
      toast({ title: "Check your info", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    if (method === "cash" && !location) {
      toast({ title: "Pick a cash location", variant: "destructive" });
      return;
    }
    if (!file) {
      toast({ title: "Upload payment proof", description: "Payment proof is required before submitting.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      let proofUrl: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, file);
        if (upErr) throw upErr;
        proofUrl = path;
      }

      const { error } = await supabase.from("transactions").insert({
        customer_name: name.trim(),
        phone: phone.trim(),
        from_country: fromC.name,
        to_country: toC.name,
        from_currency: fromC.currency,
        to_currency: toC.currency,
        amount_from: conversion.amountFrom,
        amount_to: conversion.amountTo,
        rate_used: conversion.rate,
        cashout_method: method,
        cashout_location: method === "cash" ? location : null,
        proof_url: proofUrl,
      });
      if (error) throw error;

      // Build WhatsApp message
      const msg = [
        `*New Done Money Transfer*`,
        `Name: ${name}`,
        `EcoCash registered name: ${ecocashName}`,
        `Phone: ${phone}`,
        `Sending: ${fromC.symbol}${conversion.amountFrom.toFixed(2)} ${fromC.currency} (${fromC.flag} ${fromC.name})`,
        `Receiving: ${toC.symbol}${conversion.amountTo.toFixed(2)} ${toC.currency} (${toC.flag} ${toC.name})`,
        `Rate: ${conversion.rate.toFixed(4)}`,
        `Cash-out: ${method === "ecocash" ? "EcoCash" : `Cash pickup — ${location}`}`,
        `Proof uploaded ✅`,
      ].join("\n");

      setDone(true);
      toast({ title: "Request submitted!", description: "Opening WhatsApp to confirm…" });
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Please try again";
      toast({ title: "Submission failed", description: errorMessage, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="gradient-card rounded-2xl border border-border/60 shadow-card p-8 text-center fade-in-up">
        <div className="mx-auto h-14 w-14 rounded-full bg-success/15 flex items-center justify-center mb-4">
          <Check className="h-7 w-7 text-success" />
        </div>
        <h3 className="font-display text-2xl font-bold mb-2">Request received</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          We'll process your transfer shortly. Your payment proof has been received.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>Send another</Button>
      </div>
    );
  }

  return (
    <div className="gradient-card rounded-2xl border border-border/60 shadow-card p-5 sm:p-7 space-y-6">
      <div>
        <h3 className="font-display text-xl font-bold">Your details</h3>
        <p className="text-sm text-muted-foreground">Tell us where to send the money.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+263…" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ecocash-name">Sender full name on registered EcoCash number</Label>
        <div className="relative">
          <BadgeCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input
            id="ecocash-name"
            value={ecocashName}
            onChange={(e) => setEcocashName(e.target.value)}
            placeholder="Name exactly as registered on EcoCash"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Cash-out method</Label>
        <RadioGroup value={method} onValueChange={(v) => setMethod(v as "ecocash" | "cash")} className="grid sm:grid-cols-2 gap-3">
          <label className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-smooth ${method === "ecocash" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
            <RadioGroupItem value="ecocash" />
            <Smartphone className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium text-sm">EcoCash</div>
              <div className="text-xs text-muted-foreground">Mobile money payout</div>
            </div>
          </label>
          <label className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-smooth ${method === "cash" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
            <RadioGroupItem value="cash" />
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium text-sm">Cash pickup</div>
              <div className="text-xs text-muted-foreground">Harare, Mutare, Rusape, Murambinda</div>
            </div>
          </label>
        </RadioGroup>
      </div>

      {method === "cash" && (
        <div className="space-y-2 fade-in-up">
          <Label>Pickup location</Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger><SelectValue placeholder="Choose a location" /></SelectTrigger>
            <SelectContent>
              {locations.map((l) => (
                <SelectItem key={l.id} value={l.name}>{l.name} <span className="text-muted-foreground">— {l.city}</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Payment proof</Label>
        <label className="flex items-center gap-3 rounded-xl border border-dashed border-border hover:border-primary p-4 cursor-pointer transition-smooth">
          <Upload className="h-5 w-5 text-primary" />
          <span className="text-sm flex-1">
            {file ? file.name : "Required: upload screenshot or PDF"}
          </span>
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <Button
        size="lg"
        className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</> : "Submit & continue on WhatsApp"}
      </Button>
    </div>
  );
};