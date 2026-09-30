-- Execute no Supabase: Project > SQL Editor > New query > Run
-- Permite trocar/adicionar/remover os banners da página inicial pelo painel admin.

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  imagem text not null,
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);

-- Mantém no ar os 3 banners que já estavam fixos no site
insert into banners (imagem, ordem)
values
  ('/marca/capa6.jpg', 0),
  ('/marca/capa5.jpg', 1),
  ('/marca/capa.jpg', 2);
