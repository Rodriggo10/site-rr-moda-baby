# R&R Moda Baby e Infantil — site

Site vitrine com catálogo, carrinho, cálculo de frete (Melhor Envio) e finalização
de pedido via WhatsApp. Painel administrativo próprio para a Raquel cadastrar
produtos, fotos e vídeos sem depender do desenvolvedor.

Banco de dados e armazenamento de fotos/vídeos ficam no **Supabase** (plano
gratuito), o que permite hospedar o site inteiro de graça (ex.: Netlify), sem
precisar de servidor com disco próprio.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000. O painel administrativo fica em `/admin`
(senha definida em `ADMIN_PASSWORD`, no `.env.local`).

## Configuração (.env.local)

Copie `.env.example` para `.env.local` e preencha:

- `MELHOR_ENVIO_TOKEN` — token gerado em melhorenvio.com.br → Integrações → Permissões de acesso
- `ORIGIN_CEP` — CEP de origem dos envios (já preenchido com o CEP da loja: 68746-030)
- `ADMIN_PASSWORD` — senha de acesso ao painel `/admin` (troque antes de publicar)
- `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` — em Project Settings → API no
  painel do Supabase (veja "Configurar o Supabase" abaixo)

**Nunca** commite o `.env.local` — ele já está no `.gitignore`.

## Configurar o Supabase (uma vez só)

1. Crie um projeto gratuito em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** → **New query**, cole todo o conteúdo do arquivo
   [`supabase/schema.sql`](./supabase/schema.sql) deste projeto e clique em **Run**.
   Isso cria as tabelas `produtos` e `clientes`, o espaço de armazenamento
   (`bucket`) para fotos/vídeos, e os 3 produtos de exemplo.
3. Em **Project Settings → API**, copie a **Project URL** e a **service_role
   key** para o `.env.local` (`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`).

## Estrutura

- Supabase (Postgres) — tabelas `produtos` e `clientes`; Supabase Storage —
  bucket `produtos` guarda as fotos e vídeos enviados pelo painel.
- `src/app` — páginas (catálogo, produto, carrinho, painel admin, rotas de API).
- `src/lib` — regras de negócio (preço/desconto de atacado, catálogo, WhatsApp,
  Melhor Envio, autenticação) e os clientes do Supabase.

## Publicar (deploy) — Netlify, de graça

1. Suba o código para um repositório no GitHub
2. Em [app.netlify.com](https://app.netlify.com), clique em **Add new site →
   Import an existing project**, conecte o GitHub e escolha o repositório
3. Em **Site settings → Environment variables**, adicione as mesmas variáveis
   do `.env.local` (`MELHOR_ENVIO_TOKEN`, `ORIGIN_CEP`, `ADMIN_PASSWORD`,
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
4. Deploy automático a cada alteração no repositório
5. Depois, em **Domain settings**, aponte o domínio comprado (registro.br) para
   o site da Netlify

### Atenção: o projeto gratuito do Supabase "dorme"

Se o site ficar **7 dias seguidos** sem nenhum acesso ao banco, o Supabase
pausa o projeto automaticamente (volta sozinho quando alguém tenta acessar,
mas leva um tempinho para "acordar"). Para uma loja nova com pouco movimento,
vale configurar um "ping" automático gratuito (ex.: um GitHub Action agendado
acessando o site 1x por dia) para nunca deixar passar dos 7 dias.

## Pendências antes de publicar

1. **Catálogo real**: hoje existem 3 produtos de exemplo. Cadastre os produtos
   de verdade pelo painel (`/admin`) — nome, preço, tamanhos, cores, fotos e vídeos.
2. **Domínio**: ainda não configurado. Depois de registrado, apontar o DNS para
   a Netlify.
3. **Senha do painel**: trocar `ADMIN_PASSWORD` para uma senha definitiva antes
   de publicar (a atual é só um placeholder de desenvolvimento).
4. **Peso/dimensões reais dos produtos**: o cálculo de frete usa uma estimativa
   fixa de peso por peça (0,3kg). Depois que o catálogo tiver produtos reais, vale
   ajustar isso por categoria (ex: um casaco pesa mais que uma camiseta).
