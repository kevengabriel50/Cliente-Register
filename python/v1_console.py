# =============================================================
# VERSÃO 1 — Cadastro de Clientes (Console)
# Código original do projeto, com pequenas correções
# Autor: Keven Afonso
# =============================================================

dados = []

usuario = {
    "nome": "admin",
    "senha": "123",
    "role": "admin"
}

usuario_logado = None


def login():
    global usuario_logado

    nome = input("Digite seu nome: ").strip()
    senha = input("Digite sua senha: ").strip()

    if nome == usuario["nome"] and senha == usuario["senha"]:
        usuario_logado = usuario
        print("Login realizado com sucesso!\n")
    else:
        print("Login inválido. Tente novamente.\n")


def cadastrar():
    if not usuario_logado:
        print("Você precisa fazer login primeiro!\n")
        return

    nome = input("Digite o nome do cliente: ").strip()
    email = input("Digite o email do cliente: ").strip()
    telefone = ''.join(filter(str.isdigit, input("Digite o telefone: ")))

    while True:
        cpf = ''.join(filter(str.isdigit, input("Digite o CPF: ")))
        if len(cpf) != 11:
            print("CPF inválido. Digite somente os 11 dígitos.\n")
        else:
            break

    # Verifica se CPF já existe
    for c in dados:
        if c["CPF"] == cpf:
            print("Já existe um cliente com esse CPF!\n")
            return

    cliente = {
        "Nome": nome,
        "Email": email,
        "Telefone": telefone,
        "CPF": cpf
    }

    dados.append(cliente)
    print("Cadastro realizado com sucesso!\n")


def listar_clientes():
    if not dados:
        print("Nenhum cliente cadastrado.\n")
        return

    for cliente in dados:
        cliente_copia = cliente.copy()

        # LGPD: esconde CPF para quem não for admin
        if not usuario_logado or usuario_logado["role"] != "admin":
            cliente_copia["CPF"] = "***.***.***-**"

        print(cliente_copia)
    print()


# Menu principal
while True:
    print("=" * 30)
    print("  SISTEMA DE CADASTRO DE CLIENTES")
    print("=" * 30)
    print("1. Login")
    print("2. Cadastrar cliente")
    print("3. Listar clientes")
    print("4. Sair")
    print("-" * 30)

    opcao = input("Escolha uma opção: ").strip()

    if opcao == "1":
        login()
    elif opcao == "2":
        cadastrar()
    elif opcao == "3":
        listar_clientes()
    elif opcao == "4":
        print("Saindo do programa...")
        break
    else:
        print("Opção inválida. Tente novamente.\n")
