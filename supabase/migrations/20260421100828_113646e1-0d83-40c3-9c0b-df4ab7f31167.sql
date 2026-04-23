-- Auto-grant admin role when elikingmoyo01@gmail.com signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'elikingmoyo01@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_admin();

-- If the user already exists, grant the role now
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'elikingmoyo01@gmail.com'
ON CONFLICT DO NOTHING;