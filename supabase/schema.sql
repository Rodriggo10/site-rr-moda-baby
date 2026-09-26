-- Execute este script uma vez no Supabase: Project > SQL Editor > New query > Run

create table if not exists produtos (
  id text primary key,
  nome text not null,
  descricao text not null default '',
  categoria text not null default '',
  novidade boolean not null default false,
  destaque boolean not null default false,
  promocao jsonb,
  preco_varejo numeric not null default 0,
  estoque integer not null default 0,
  participa_atacado boolean not null default true,
  tamanhos text[] not null default '{}',
  cores text[] not null default '{}',
  fotos text[] not null default '{}',
  videos text[] not null default '{}',
  criado_em timestamptz not null default now()
);

create table if not exists categorias_imagens (
  categoria text primary key,
  imagem text not null default ''
);

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  telefone text not null default '',
  senha_hash text not null,
  endereco jsonb,
  criado_em timestamptz not null default now()
);

-- Bucket de armazenamento para fotos e vídeos dos produtos
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

-- Dados de exemplo (os mesmos que já existiam no site)
insert into produtos (id, nome, descricao, categoria, novidade, destaque, promocao, preco_varejo, estoque, participa_atacado, tamanhos, cores, fotos, videos)
values
  (
    'produto-exemplo-1',
    'Produto exemplo 1 (edite no painel)',
    'Descrição do produto. Troque pelo texto real no painel administrativo.',
    'Conjuntos', true, true, null, 49.90, 10, true,
    array['1','2','4','6'], array['Rosa','Azul'], array['/produtos/placeholder.svg'], array[]::text[]
  ),
  (
    'produto-exemplo-2',
    'Produto exemplo 2 (edite no painel)',
    'Descrição do produto. Troque pelo texto real no painel administrativo.',
    'Camisetas', true, false, '{"precoDe": 39.9, "precoPor": 29.9}'::jsonb, 39.90, 10, true,
    array['2','4','6','8'], array['Branco','Amarelo'], array['/produtos/placeholder.svg'], array[]::text[]
  ),
  (
    'produto-exemplo-3',
    'Produto exemplo 3 (edite no painel)',
    'Descrição do produto. Troque pelo texto real no painel administrativo.',
    'Vestidos', false, true, null, 79.90, 10, true,
    array['2','4','6'], array['Rosa','Vermelho'], array['/produtos/placeholder.svg'], array[]::text[]
  )
on conflict (id) do nothing;
