-- Execute no Supabase: Project > SQL Editor > New query > Run
-- Permite marcar produtos que não entram na regra de atacado.

alter table produtos add column if not exists participa_atacado boolean not null default true;
