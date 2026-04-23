ALTER TABLE public.exchange_rates REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exchange_rates;