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

create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  imagem text not null default '',
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  imagem text not null,
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
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

-- Categorias iniciais da loja (a cliente edita pelo painel)
insert into categorias (nome, ordem)
values
  ('Formatura infantil e juvenil', 0),
  ('Infantil', 1),
  ('Conjuntos femininos', 2),
  ('Conjuntos masculinos', 3),
  ('Blusas masculinas', 4),
  ('Blusas femininas', 5),
  ('Vestidos/ macaquitos', 6),
  ('Calça e short masculino', 7),
  ('Calça e short feminino', 8),
  ('Moda praia', 9),
  ('Bonés Feminino e masculino', 10),
  ('Calçados baby masculinos', 11),
  ('Calçados Baby femininos', 12),
  ('Bolsas', 13),
  ('Modelo adulto', 14),
  ('Moda íntima /meias', 15),
  ('Espaço do Bebê', 16),
  ('Fitness', 17),
  ('Brinquedos', 18),
  ('Temáticos', 19)
on conflict (nome) do nothing;

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
