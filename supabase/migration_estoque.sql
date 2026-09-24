-- Execute no Supabase: Project > SQL Editor > New query > Run
-- Adiciona controle de estoque manual aos produtos já existentes.

alter table produtos add column if not exists estoque integer not null default 10;

-- Opcional: remove a coluna antiga "esgotado", que não é mais usada
-- (o site agora considera esgotado quando estoque = 0).
-- alter table produtos drop column if exists esgotado;
