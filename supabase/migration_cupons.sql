-- Execute no Supabase: Project > SQL Editor > New query > Run
-- Cria a tabela de cupons de desconto (a cliente gerencia pelo painel).

create table if not exists cupons (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  tipo text not null check (tipo in ('porcentagem', 'valor')),
  valor numeric not null check (valor > 0),
  validade date,
  limite_usos integer check (limite_usos is null or limite_usos > 0),
  usos integer not null default 0,
  pedido_minimo numeric check (pedido_minimo is null or pedido_minimo >= 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
