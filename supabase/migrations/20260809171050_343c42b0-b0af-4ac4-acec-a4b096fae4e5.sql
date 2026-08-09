REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.booking_guard() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.booking_sync() FROM anon, authenticated;