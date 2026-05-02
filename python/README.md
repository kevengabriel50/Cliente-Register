# Python — Evolução do Projeto

Esta pasta mostra a evolução do código Python que originou o projeto web.

## Arquivos

### `v1_console.py` — Versão original (console)
O programa de linha de comando que deu origem a tudo. Roda direto no terminal ou no Google Colab. Mostra os conceitos de:
- Validação de CPF (remover caracteres, verificar 11 dígitos)
- Controle de acesso com login
- Mascaramento de CPF (LGPD)
- Verificação de duplicidade

**Como rodar:**
```bash
python v1_console.py
```

### `v2_web.py` — Versão web (FastAPI)
Os mesmos conceitos da v1, reescritos como uma API HTTP. É o equivalente Python do backend TypeScript que roda no app web publicado. Mostra como os mesmos conceitos funcionam num servidor web real:
- Login retorna um token (sessões isoladas por usuário)
- Rotas protegidas por role (admin vs operador)
- CPF mascarado para não-admins em todas as rotas
- Respostas com status codes corretos (400, 401, 403, 404, 409)

**Como rodar localmente:**
```bash
pip install fastapi uvicorn
uvicorn v2_web:app --reload
# Acesse http://localhost:8000/docs para a documentação interativa
```

## O que mudou da v1 para a v2?

| Conceito | v1 (Console) | v2 (Web) |
|---|---|---|
| Login | Variável global `usuario_logado` | Token por sessão (sem conflito entre usuários) |
| Dados | Lista em memória | Lista em memória (banco de dados em produção) |
| Acesso | Terminal local | HTTP — acessível de qualquer lugar |
| Erros | `print("erro")` | Status codes HTTP (400, 401, 403, 404, 409) |
| Docs | Nenhuma | Interface automática em `/docs` |

## Relação com o app web

O app publicado usa o mesmo backend, mas implementado em TypeScript/Node.js (padrão da plataforma web). A lógica é 100% idêntica — só a linguagem muda.

```
python/v1_console.py  →  lógica original (Python, terminal)
python/v2_web.py      →  lógica web (Python, FastAPI)
artifacts/api-server/ →  mesma lógica no app publicado (TypeScript, Express)
```
