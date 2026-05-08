# Klinix.digital

CRM para clínicas de estética. Stack: **Vite + React + TypeScript + Supabase**.

## Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com) com um projeto criado

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY com os valores do
# painel do Supabase (Project Settings → API).

# 3. Aplicar a migração inicial no Supabase
# Opção A — via Supabase CLI:
#   supabase link --project-ref <seu-project-ref>
#   supabase db push
#
# Opção B — copie o conteúdo de supabase/migrations/00001_initial_schema.sql
# e cole no SQL Editor do painel do Supabase.

# 4. Rodar localmente
npm run dev
```

## Scripts

| Script              | Descrição                              |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento Vite        |
| `npm run build`     | Build de produção                       |
| `npm run preview`   | Preview do build                        |
| `npm run lint`      | ESLint                                  |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`)      |

## Estrutura

```
src/
  lib/
    supabase.ts          # Cliente Supabase compartilhado
  App.tsx
  main.tsx
supabase/
  migrations/
    00001_initial_schema.sql   # DDL inicial + RLS + trigger auth.users → users
```

## Schema

Ver `supabase/migrations/00001_initial_schema.sql` — 9 tabelas com UUIDs como
PK, RLS habilitado em todas (com policies permissivas temporárias até o Prompt
11 de Auditoria) e trigger que copia `auth.users` recém-criados para a tabela
pública `users`.
