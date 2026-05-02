import crypto from "crypto";

interface Sessao {
  role: string;
  nome: string;
}

const sessoes = new Map<string, Sessao>();

export function criarSessao(nome: string, role: string): string {
  const token = crypto.randomBytes(16).toString("hex");
  sessoes.set(token, { role, nome });
  return token;
}

export function obterSessao(token: string): Sessao | null {
  return sessoes.get(token) ?? null;
}

export function removerSessao(token: string): void {
  sessoes.delete(token);
}
