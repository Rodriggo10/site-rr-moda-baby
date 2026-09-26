-- Execute no Supabase: Project > SQL Editor > New query > Run
-- Permite cadastrar a foto de capa de cada categoria pelo painel admin.

create table if not exists categorias_imagens (
  categoria text primary key,
  imagem text not null default ''
);
