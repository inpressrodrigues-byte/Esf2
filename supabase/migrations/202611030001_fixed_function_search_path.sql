-- Auditoria: corpos inspecionados em produção antes desta alteração.
-- handle_new_user usa public.profiles explicitamente; set_updated_at usa now().
-- A resolução passa a priorizar funções de sistema, sem mudar retornos ou RLS.
alter function public.handle_new_user() set search_path = pg_catalog, public;
alter function public.set_updated_at() set search_path = pg_catalog, public;
