# =============================================================
# VERSÃO 2 — Cadastro de Clientes (API Web com FastAPI)
# Evolução da versão console para uma API HTTP completa.
# Implementa os mesmos conceitos, agora acessível pelo navegador.
#
# Para rodar localmente:
#   pip install fastapi uvicorn
#   uvicorn v2_web:app --reload
#
# Para testar no Google Colab:
#   !pip install fastapi uvicorn nest-asyncio pyngrok
#   (veja instruções no final do arquivo)
#
# Autor: Keven Afonso
# =============================================================

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import secrets
import uuid
from datetime import datetime

app = FastAPI(title="Cadastro de Clientes", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================
# ARMAZENAMENTO EM MEMÓRIA
# Em produção, isso seria substituído por um banco de dados
# como PostgreSQL, MySQL ou SQLite.
# =============================================================

# Usuários do sistema (nome → dados)
usuarios = {
    "admin": {"nome": "admin", "senha": "123", "role": "admin"}
}

# Sessões ativas (token → dados do usuário logado)
# Cada usuário que faz login recebe um token único.
# Diferente da v1, aqui múltiplos usuários podem estar
# logados ao mesmo tempo sem conflito.
sessoes = {}

# Clientes cadastrados
clientes = []


# =============================================================
# FUNÇÕES AUXILIARES
# =============================================================

def buscar_usuario(nome: str):
    return usuarios.get(nome)

def criar_sessao(nome: str, role: str) -> str:
    """Gera um token aleatório e salva a sessão."""
    token = secrets.token_hex(16)  # 32 caracteres aleatórios
    sessoes[token] = {"nome": nome, "role": role}
    return token

def obter_sessao(token: str):
    return sessoes.get(token)

def get_role(authorization: str | None) -> str:
    """Extrai o role do header Authorization: Bearer <token>"""
    if not authorization:
        return "visitante"
    token = authorization.replace("Bearer ", "")
    sessao = obter_sessao(token)
    return sessao["role"] if sessao else "visitante"

def apenas_digitos(valor: str) -> str:
    """Remove tudo que não for número. Mesma lógica da v1."""
    return ''.join(filter(str.isdigit, valor))


# =============================================================
# ROTAS DE AUTENTICAÇÃO
# =============================================================

@app.post("/api/auth/login")
async def login(request: Request):
    """
    Recebe nome e senha, verifica se são válidos,
    e retorna um token para usar nas próximas requisições.
    
    Na v1, o login era global (usuario_logado).
    Na v2, cada usuário tem seu próprio token — sem conflito.
    """
    body = await request.json()
    nome  = body.get("nome", "").strip()
    senha = body.get("senha", "")

    if not nome or not senha:
        raise HTTPException(status_code=400, detail="Nome e senha são obrigatórios")

    usuario = buscar_usuario(nome)
    if not usuario or usuario["senha"] != senha:
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")

    token = criar_sessao(usuario["nome"], usuario["role"])
    return {"token": token, "role": usuario["role"], "nome": usuario["nome"]}


@app.post("/api/auth/logout")
async def logout(request: Request):
    """Remove o token da sessão (equivale a deslogar)."""
    token = (request.headers.get("Authorization") or "").replace("Bearer ", "")
    sessoes.pop(token, None)
    return {"mensagem": "Logout realizado"}


@app.get("/api/auth/usuarios")
async def listar_usuarios(request: Request):
    """Lista usuários do sistema. Apenas admins podem ver."""
    role = get_role(request.headers.get("Authorization"))
    if role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")

    # Nunca retorna a senha!
    return [{"nome": u["nome"], "role": u["role"]} for u in usuarios.values()]


@app.post("/api/auth/register")
async def criar_usuario(request: Request):
    """Cria um novo usuário. Apenas admins podem fazer isso."""
    role = get_role(request.headers.get("Authorization"))
    if role != "admin":
        raise HTTPException(status_code=403, detail="Apenas admins podem criar usuários")

    body = await request.json()
    nome      = body.get("nome", "").strip()
    senha     = body.get("senha", "")
    novo_role = body.get("role", "operador")

    if not nome or not senha:
        raise HTTPException(status_code=400, detail="Nome e senha são obrigatórios")
    if novo_role not in ("admin", "operador"):
        raise HTTPException(status_code=400, detail="Perfil inválido. Use 'admin' ou 'operador'")
    if nome in usuarios:
        raise HTTPException(status_code=409, detail="Já existe um usuário com esse nome")

    usuarios[nome] = {"nome": nome, "senha": senha, "role": novo_role}
    return {"mensagem": "Usuário criado com sucesso"}


@app.delete("/api/auth/usuarios/{nome_usuario}")
async def remover_usuario(nome_usuario: str, request: Request):
    """Remove um usuário. Apenas admins. Admin principal não pode ser removido."""
    role = get_role(request.headers.get("Authorization"))
    if role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    if nome_usuario == "admin":
        raise HTTPException(status_code=400, detail="O usuário admin não pode ser removido")
    if nome_usuario not in usuarios:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    del usuarios[nome_usuario]
    return {"mensagem": "Usuário removido"}


# =============================================================
# ROTAS DE CLIENTES
# =============================================================

@app.get("/api/clients")
async def listar_clientes(request: Request):
    """
    Lista todos os clientes.
    LGPD: CPF mascarado para quem não for admin.
    Mesma lógica da função listar_clientes() da v1.
    """
    role = get_role(request.headers.get("Authorization"))

    resultado = []
    for c in clientes:
        copia = c.copy()
        if role != "admin":
            copia["cpf"] = "***.***.***-**"  # esconde CPF (LGPD)
        resultado.append(copia)

    return resultado


@app.get("/api/clients/stats")
async def stats_clientes(request: Request):
    """
    Retorna totais e os 5 clientes mais recentes.
    CPF mascarado para não-admin (bug que encontramos e corrigimos).
    """
    role = get_role(request.headers.get("Authorization"))
    hoje = datetime.now().date()

    recentes_raw = sorted(clientes, key=lambda c: c["created_at"], reverse=True)[:5]
    recentes = []
    for c in recentes_raw:
        copia = {k: v for k, v in c.items() if k != "created_at"}  # remove campo interno
        if role != "admin":
            copia["cpf"] = "***.***.***-**"
        recentes.append(copia)

    return {
        "total": len(clientes),
        "cadastrados_hoje": sum(1 for c in clientes if c["created_at"].date() == hoje),
        "recentes": recentes
    }


@app.post("/api/clients")
async def cadastrar_cliente(request: Request):
    """
    Cadastra um novo cliente.
    Mesma lógica da função cadastrar() da v1, agora via HTTP.
    """
    body = await request.json()

    nome     = body.get("nome", "").strip()
    email    = body.get("email", "").strip().lower()
    telefone = apenas_digitos(body.get("telefone", ""))
    cpf      = apenas_digitos(body.get("cpf", ""))

    # Validações (mesmas da v1)
    if len(cpf) != 11:
        raise HTTPException(status_code=400, detail="CPF inválido")
    if len(telefone) < 10 or len(telefone) > 11:
        raise HTTPException(status_code=400, detail="Telefone inválido")

    # Verifica duplicidade (equivale ao UNIQUE do banco de dados)
    for c in clientes:
        if c["cpf"] == cpf:
            raise HTTPException(status_code=409, detail="Já existe um cliente com este CPF")
        if c["email"] == email:
            raise HTTPException(status_code=409, detail="Já existe um cliente com este e-mail")

    novo_cliente = {
        "id": str(uuid.uuid4()),
        "nome": nome,
        "email": email,
        "telefone": telefone,
        "cpf": cpf,
        "created_at": datetime.now()
    }
    clientes.append(novo_cliente)

    # Retorna sem o campo interno created_at
    resposta = {k: v for k, v in novo_cliente.items() if k != "created_at"}
    return resposta


@app.delete("/api/clients/{cliente_id}")
async def deletar_cliente(cliente_id: str):
    """Remove um cliente pelo ID."""
    for i, c in enumerate(clientes):
        if c["id"] == cliente_id:
            clientes.pop(i)
            return {"mensagem": "Cliente removido"}
    raise HTTPException(status_code=404, detail="Cliente não encontrado")


# =============================================================
# COMO RODAR NO GOOGLE COLAB
# =============================================================
#
# Cole e rode em células separadas:
#
# Célula 1 — instalar dependências:
# !pip install fastapi uvicorn nest-asyncio pyngrok
#
# Célula 2 — rodar o servidor:
# import nest_asyncio
# import uvicorn
# from pyngrok import ngrok
#
# nest_asyncio.apply()
#
# # Crie uma conta gratuita em https://ngrok.com e copie seu token
# ngrok.set_auth_token("SEU_TOKEN_AQUI")
# url_publica = ngrok.connect(8000)
# print("Acesse a API em:", url_publica)
# print("Documentação automática:", str(url_publica) + "/docs")
#
# uvicorn.run(app, host="0.0.0.0", port=8000)
#
# A URL /docs abre uma interface visual para testar todas as rotas!
# =============================================================
