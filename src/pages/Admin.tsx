import { useEffect, useState } from "react";
import { Loader2, LogOut, RefreshCw, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/wuchi/Header";
import type { Session } from "@supabase/supabase-js";

interface Rate { id: string; from_currency: string; to_currency: string; rate: number; manual_override: boolean }
interface Tx {
  id: string; customer_name: string; phone: string;
  from_country: string; to_country: string; from_currency: string; to_currency: string;
  amount_from: number; amount_to: number; cashout_method: string; cashout_location: string | null;
  status: string; created_at: string; proof_url: string | null;
}

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) checkAdmin(s.user.id);
      else { setIsAdmin(false); setChecking(false); }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) checkAdmin(data.session.user.id);
      else setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const checkAdmin = async (uid: string) => {
    setChecking(true);
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
    setIsAdmin(!!data);
    setChecking(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-10">
        {checking ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : !session ? (
          <AuthForm />
        ) : !isAdmin ? (
          <NotAdmin onSignOut={() => supabase.auth.signOut()} email={session.user.email ?? ""} />
        ) : (
          <Dashboard onSignOut={() => supabase.auth.signOut()} />
        )}
      </main>
    </div>
  );
};

function AuthForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const ADMIN_EMAIL = "elikingmoyo01@gmail.com";

  const submit = async () => {
    setLoading(true);
    try {
      // Try sign-in first; if account doesn't exist yet, sign up then sign in.
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      });
      if (signInErr) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (signUpErr) throw signInErr; // surface the original sign-in error
        // Sign in after first-time signup
        const { error: retryErr } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password,
        });
        if (retryErr) throw retryErr;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Wrong password";
      toast({ title: "Access denied", description: msg, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="gradient-card border-border/60 p-6 space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Admin access</h2>
          <p className="text-sm text-muted-foreground">Enter your admin password to continue.</p>
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="••••••••"
            autoFocus
          />
        </div>
        <Button onClick={submit} disabled={loading} className="w-full gradient-primary text-primary-foreground">
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Unlock dashboard
        </Button>
      </Card>
    </div>
  );
}

function NotAdmin({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  return (
    <Card className="max-w-md mx-auto p-6 space-y-3">
      <h2 className="font-display text-xl font-bold">Not an admin</h2>
      <p className="text-sm text-muted-foreground">
        You are signed in as <span className="font-mono">{email}</span> but don't have admin privileges. To grant access, run this in your Lovable Cloud database:
      </p>
      <pre className="text-xs bg-secondary p-3 rounded-md overflow-x-auto">{`INSERT INTO public.user_roles (user_id, role)
VALUES ('<your-user-id>', 'admin');`}</pre>
      <Button variant="outline" onClick={onSignOut}><LogOut className="h-4 w-4 mr-2" /> Sign out</Button>
    </Card>
  );
}

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" size="sm" onClick={onSignOut}><LogOut className="h-4 w-4 mr-2" /> Sign out</Button>
      </div>
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="rates">Exchange rates</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="mt-4"><TransactionsTab /></TabsContent>
        <TabsContent value="rates" className="mt-4"><RatesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function TransactionsTab() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
    setTxs((data ?? []) as Tx[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("transactions").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else { toast({ title: `Marked ${status}` }); load(); }
  };

  const viewProof = async (path: string) => {
    const { data, error } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 60);
    if (error || !data) return toast({ title: "Could not load proof", variant: "destructive" });
    window.open(data.signedUrl, "_blank");
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <Card className="gradient-card border-border/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Route</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-left p-3">Cash-out</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {txs.length === 0 && (
              <tr><td colSpan={6} className="text-center p-8 text-muted-foreground">No transactions yet.</td></tr>
            )}
            {txs.map((t) => (
              <tr key={t.id} className="border-t border-border/60">
                <td className="p-3">
                  <div className="font-medium">{t.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{t.phone}</div>
                </td>
                <td className="p-3 text-xs">{t.from_country} → {t.to_country}</td>
                <td className="p-3 text-right font-mono text-xs">
                  {t.amount_from} {t.from_currency}
                  <div className="text-muted-foreground">→ {Number(t.amount_to).toFixed(2)} {t.to_currency}</div>
                </td>
                <td className="p-3 text-xs">
                  <div className="capitalize">{t.cashout_method}</div>
                  {t.cashout_location && <div className="text-muted-foreground">{t.cashout_location}</div>}
                </td>
                <td className="p-3">
                  <Badge variant={t.status === "completed" ? "default" : t.status === "rejected" ? "destructive" : "secondary"}>
                    {t.status}
                  </Badge>
                </td>
                <td className="p-3 text-right space-x-1 whitespace-nowrap">
                  {t.proof_url && <Button size="sm" variant="ghost" onClick={() => viewProof(t.proof_url!)}>Proof</Button>}
                  {t.status !== "completed" && <Button size="sm" variant="outline" onClick={() => setStatus(t.id, "completed")}>Complete</Button>}
                  {t.status === "pending" && <Button size="sm" variant="ghost" onClick={() => setStatus(t.id, "rejected")}>Reject</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function RatesTab() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("exchange_rates").select("*").order("from_currency");
    setRates((data ?? []) as Rate[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const refreshLive = async () => {
    toast({ title: "Fetching live rates…" });
    try {
      const bases = ["USD", "ZAR", "INR"];
      for (const base of bases) {
        const r = await fetch(`https://open.er-api.com/v6/latest/${base}`);
        const j = await r.json();
        if (!j.rates) continue;
        for (const target of bases) {
          if (target === base) continue;
          const rate = j.rates[target];
          if (!rate) continue;
          await supabase.from("exchange_rates").upsert({
            from_currency: base, to_currency: target, rate, manual_override: false,
            updated_at: new Date().toISOString(),
          }, { onConflict: "from_currency,to_currency" });
        }
      }
      toast({ title: "Live rates updated" });
      load();
    } catch {
      toast({ title: "Failed to fetch live rates", variant: "destructive" });
    }
  };

  const save = async (r: Rate) => {
    const v = parseFloat(edits[r.id]);
    if (!v || v <= 0) return toast({ title: "Invalid rate", variant: "destructive" });
    const { error } = await supabase.from("exchange_rates").update({
      rate: v, manual_override: true, updated_at: new Date().toISOString(),
    }).eq("id", r.id);
    if (error) toast({ title: error.message, variant: "destructive" });
    else { toast({ title: "Rate updated" }); load(); }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <Card className="gradient-card border-border/60 p-5 space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Manage exchange rates. Manual overrides take precedence.</p>
        <Button size="sm" variant="outline" onClick={refreshLive}><RefreshCw className="h-4 w-4 mr-2" /> Fetch live</Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {rates.map((r) => (
          <div key={r.id} className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border/60">
            <div className="font-mono text-sm flex-1">
              {r.from_currency} → {r.to_currency}
              {r.manual_override && <Badge className="ml-2" variant="secondary">manual</Badge>}
            </div>
            <Input
              defaultValue={Number(r.rate).toFixed(4)}
              className="w-28 h-9"
              onChange={(e) => setEdits((prev) => ({ ...prev, [r.id]: e.target.value }))}
            />
            <Button size="sm" variant="ghost" onClick={() => save(r)}><Save className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default Admin;