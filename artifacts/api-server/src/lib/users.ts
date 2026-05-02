export interface Usuario {
  nome: string;
  senha: string;
  role: "admin" | "operador";
}

const usuarios = new Map<string, Usuario>([
  ["admin", { nome: "admin", senha: "123", role: "admin" }],
]);

export function buscarUsuario(nome: string): Usuario | null {
  return usuarios.get(nome) ?? null;
}

export function listarUsuarios(): Omit<Usuario, "senha">[] {
  return Array.from(usuarios.values()).map(({ nome, role }) => ({ nome, role }));
}

export function criarUsuario(
  nome: string,
  senha: string,
  role: "admin" | "operador"
): { sucesso: boolean; erro?: string } {
  if (usuarios.has(nome)) {
    return { sucesso: false, erro: "Já existe um usuário com esse nome" };
  }
  usuarios.set(nome, { nome, senha, role });
  return { sucesso: true };
}

export function removerUsuario(nome: string): boolean {
  if (nome === "admin") return false;
  return usuarios.delete(nome);
}
