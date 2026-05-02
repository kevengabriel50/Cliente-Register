# Cadastro de Clientes

Aplicação web para cadastro e gerenciamento de clientes, com validação de CPF, máscaras de input e operações CRUD completas.

## Sobre o projeto

O projeto começou como uma API simples em Python (FastAPI) que escrevi para cadastrar clientes em memória, com validação de CPF (11 dígitos). A partir dela, evoluí para uma aplicação web completa com frontend, backend persistente em banco de dados e interface em português brasileiro.

> **Transparência:** parte da migração da API original para a stack web atual e a construção da interface foram feitas com auxílio de ferramentas de IA. A lógica de validação e a modelagem do domínio (cliente, CPF, telefone) partiram do código que escrevi.

## Funcionalidades

- **Dashboard** com totais de clientes (total geral, cadastros do dia, da semana) e cadastros recentes.
- **Cadastro de clientes** com formulário validado (Nome, E-mail, Telefone, CPF).
  - Máscaras de input para Telefone (`(11) 91234-5678`) e CPF (`123.456.789-00`).
  - Validação de CPF (exatamente 11 dígitos após remover formatação).
  - Validação de e-mail.
  - Detecção de duplicatas (CPF ou e-mail já cadastrados).
- **Lista de clientes** com busca por nome, e-mail ou CPF, e exclusão com confirmação.
- Interface inteiramente em português brasileiro.

## Stack

- **Frontend:** React + Vite + TypeScript, Tailwind CSS, shadcn/ui, react-hook-form, Zod, TanStack React Query, wouter
- **Backend:** Node.js + Express 5 + TypeScript
- **Banco de dados:** PostgreSQL com Drizzle ORM
- **Contrato de API:** OpenAPI 3.1 (geração automática de hooks React Query e schemas Zod com Orval)
- **Monorepo:** pnpm workspaces

## Estrutura do projeto

```
artifacts/
  api-server/         # Backend Express
  cadastro-clientes/  # Frontend React
lib/
  api-spec/           # Contrato OpenAPI (fonte da verdade)
  api-client-react/   # Hooks React Query gerados
  api-zod/            # Schemas Zod gerados
  db/                 # Schema Drizzle e conexão com PostgreSQL
```

## Como rodar localmente

Pré-requisitos: Node.js 24, pnpm, e um PostgreSQL acessível.

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar a variável DATABASE_URL apontando para seu PostgreSQL
export DATABASE_URL="postgresql://usuario:senha@localhost:5432/seu_banco"

# 3. Criar as tabelas no banco
pnpm --filter @workspace/db run push

# 4. Rodar o backend (porta definida pela variável PORT)
PORT=3001 pnpm --filter @workspace/api-server run dev

# 5. Em outro terminal, rodar o frontend
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/cadastro-clientes run dev
```

## Endpoints da API

| Método | Rota                  | Descrição                              |
| ------ | --------------------- | -------------------------------------- |
| GET    | `/api/healthz`        | Health check                           |
| GET    | `/api/clients`        | Lista todos os clientes                |
| POST   | `/api/clients`        | Cadastra um novo cliente               |
| DELETE | `/api/clients/:id`    | Remove um cliente                      |
| GET    | `/api/clients/stats`  | Estatísticas (totais e recentes)       |

## Próximos passos

Ideias de melhorias que pretendo explorar:

- Edição de cliente (atualmente só permite criar e excluir)
- Exportação da lista para CSV
- Campos adicionais (data de nascimento, endereço)
- Autenticação para múltiplos usuários

## Autor

**Keven Gabriel** — [@kevengabriel150](https://github.com/kevengabriel150)
