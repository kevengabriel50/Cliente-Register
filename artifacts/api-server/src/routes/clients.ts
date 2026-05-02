import { Router, type IRouter } from "express";
import { db, clientsTable } from "@workspace/db";
import { CreateClientBody, DeleteClientParams } from "@workspace/api-zod";
import { desc, eq, gte, sql } from "drizzle-orm";
import { obterSessao } from "../lib/sessions";

const router: IRouter = Router();

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function getRole(authHeader: string | undefined): string {
  const token = (authHeader ?? "").replace("Bearer ", "");
  return obterSessao(token)?.role ?? "visitante";
}

router.get("/clients", async (req, res) => {
  const role = getRole(req.headers.authorization);

  const rows = await db
    .select()
    .from(clientsTable)
    .orderBy(desc(clientsTable.createdAt));

  const resultado = rows.map((cliente) => ({
    ...cliente,
    cpf: role === "admin" ? cliente.cpf : "***.***.***-**",
  }));

  res.json(resultado);
});

router.get("/clients/stats", async (_req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const [totalRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clientsTable);

  const [todayRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clientsTable)
    .where(gte(clientsTable.createdAt, startOfDay));

  const [weekRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clientsTable)
    .where(gte(clientsTable.createdAt, startOfWeek));

  const recent = await db
    .select()
    .from(clientsTable)
    .orderBy(desc(clientsTable.createdAt))
    .limit(5);

  res.json({
    total: totalRow?.count ?? 0,
    registeredToday: todayRow?.count ?? 0,
    registeredThisWeek: weekRow?.count ?? 0,
    recent,
  });
});

router.post("/clients", async (req, res) => {
  const parsed = CreateClientBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ erro: "Dados inválidos" });
  }

  const nome = parsed.data.nome.trim();
  const email = parsed.data.email.trim().toLowerCase();
  const telefone = digitsOnly(parsed.data.telefone);
  const cpf = digitsOnly(parsed.data.cpf);

  if (cpf.length !== 11) {
    return res.status(400).json({ erro: "CPF inválido" });
  }

  if (telefone.length < 10 || telefone.length > 11) {
    return res.status(400).json({ erro: "Telefone inválido" });
  }

  try {
    const [created] = await db
      .insert(clientsTable)
      .values({ nome, email, telefone, cpf })
      .returning();

    return res.status(201).json(created);
  } catch (err) {
    const code = (err as { code?: string } | null)?.code;
    if (code === "23505") {
      return res
        .status(409)
        .json({ erro: "Já existe um cliente com este CPF ou e-mail" });
    }
    req.log.error({ err }, "Failed to create client");
    return res.status(500).json({ erro: "Erro ao cadastrar cliente" });
  }
});

router.delete("/clients/:id", async (req, res) => {
  const parsed = DeleteClientParams.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  const deleted = await db
    .delete(clientsTable)
    .where(eq(clientsTable.id, parsed.data.id))
    .returning({ id: clientsTable.id });

  if (deleted.length === 0) {
    return res.status(404).json({ erro: "Cliente não encontrado" });
  }

  return res.status(204).send();
});

export default router;
