import { Router, type IRouter } from "express";
import { criarSessao, removerSessao, obterSessao } from "../lib/sessions";

const router: IRouter = Router();

const ADMIN = { nome: "admin", senha: "123", role: "admin" };

router.post("/auth/login", (req, res) => {
  const { nome, senha } = req.body as { nome?: string; senha?: string };

  if (!nome || !senha) {
    return res.status(400).json({ erro: "Nome e senha são obrigatórios" });
  }

  if (nome !== ADMIN.nome || senha !== ADMIN.senha) {
    return res.status(401).json({ erro: "Usuário ou senha incorretos" });
  }

  const token = criarSessao(ADMIN.nome, ADMIN.role);
  return res.json({ token, role: ADMIN.role, nome: ADMIN.nome });
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

export default router;
