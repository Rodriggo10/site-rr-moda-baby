-- Execute no Supabase: Project > SQL Editor > New query > Run
-- Passa as categorias para o banco, para a cliente criar/renomear/excluir pelo painel.
-- Mantém as 20 categorias atuais, na mesma ordem, com as fotos já cadastradas.

create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  imagem text not null default '',
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);

insert into categorias (nome, imagem, ordem)
select v.nome, coalesce(ci.imagem, ''), v.ordem
from (
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
) as v(nome, ordem)
left join categorias_imagens ci on ci.categoria = v.nome
on conflict (nome) do nothing;
