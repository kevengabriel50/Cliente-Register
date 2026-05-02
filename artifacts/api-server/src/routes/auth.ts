import { Router, type IRouter } from "express";
import { criarSessao, removerSessao, obterSessao } from "../lib/sessions";
import {
  buscarUsuario,
  criarUsuario,
  listarUsuarios,
  removerUsuario,
} from "../lib/users";

const router: IRouter = Router();

router.post("/auth/login", (req, res) => {
  const { nome, senha } = req.body as { nome?: string; senha?: string };

  if (!nome || !senha) {
    return res.status(400).json({ erro: "Nome e senha são obrigatórios" });
  }

  const usuario = buscarUsuario(nome.trim());
  if (!usuario || usuario.senha !== senha) {
    return res.status(401).json({ erro: "Usuário ou senha incorretos" });
  }

  const token = criarSessao(usuario.nome, usuario.role);
  return res.json({ token, role: usuario.role, nome: usuario.nome });
});

router.post("/auth/logout", (req, res) => {
  const token = (req.headers.authorization ?? "").replace("Bearer ", "");
  removerSessao(token);
  return res.status(204).send();
});

router.get("/auth/me", (req, res) => {
  const token = (req.headers.authorization ?? "").replace("Bearer ", "");
  const sessao = obterSessao(token);
  if (!sessao) {
    return res.status(401).json({ erro: "Não autenticado" });
  }
  return res.json({ role: sessao.role, nome: sessao.nome });
});

router.get("/auth/usuarios", (req, res) => {
  const token = (req.headers.authorization ?? "").replace("Bearer ", "");
  const sessao = obterSessao(token);
  if (!sessao || sessao.role !== "admin") {
    return res.status(403).json({ erro: "Acesso negado" });
  }
  return res.json(listarUsuarios());
});

router.post("/auth/register", (req, res) => {
  const token = (req.headers.authorization ?? "").replace("Bearer ", "");
  const sessao = obterSessao(token);
  if (!sessao || sessao.role !== "admin") {
    return res.status(403).json({ erro: "Apenas admins podem criar usuários" });
  }

  const { nome, senha, role } = req.body as {
    nome?: string;
    senha?: string;
    role?: string;
  };

  if (!nome || !senha) {
    return res.status(400).json({ erro: "Nome e senha são obrigatórios" });
  }

  if (role !== "admin" && role !== "operador") {
    return res.status(400).json({ erro: "Perfil inválido. Use 'admin' ou 'operador'" });
  }

  const resultado = criarUsuario(nome.trim(), senha, role);
  if (!resultado.sucesso) {
    return res.status(409).json({ erro: resultado.erro });
  }

  return res.status(201).json({ mensagem: "Usuário criado com sucesso" });
});

router.delete("/auth/usuarios/:nome", (req, res) => {
  const token = (req.headers.authorization ?? "").replace("Bearer ", "");
  const sessao = obterSessao(token);
  if (!sessao || sessao.role !== "admin") {
    return res.status(403).json({ erro: "Acesso negado" });
  }

  const { nome } = req.params;
  if (nome === "admin") {
    return res.status(400).json({ erro: "O usuário admin não pode ser removido" });
  }

  const removido = removerUsuario(nome);
  if (!removido) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  return res.status(204).send();
});

export default router;
