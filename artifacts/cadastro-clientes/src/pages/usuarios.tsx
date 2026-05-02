import { useState } from "react";
import { useAuth } from "@/context/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, UserRound, Trash2, UserPlus, CircleCheck } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface UsuarioInfo {
  nome: string;
  role: "admin" | "operador";
}

function useListarUsuarios(token: string | null) {
  return useQuery<UsuarioInfo[]>({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const res = await fetch("/api/auth/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar usuários");
      return res.json();
    },
    enabled: !!token,
  });
}

export default function Usuarios() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { data: usuarios, isLoading } = useListarUsuarios(token);

  const [dialogAberto, setDialogAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [role, setRole] = useState<"admin" | "operador">("operador");
  const [usuarioParaRemover, setUsuarioParaRemover] = useState<string | null>(null);

  const criarUsuario = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, senha, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao criar usuário");
      return data;
    },
    onSuccess: () => {
      toast.success("Usuário criado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      setDialogAberto(false);
      setNome("");
      setSenha("");
      setConfirmarSenha("");
      setRole("operador");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const removerUsuario = useMutation({
    mutationFn: async (nomeUsuario: string) => {
      const res = await fetch(
        `/api/auth/usuarios/${encodeURIComponent(nomeUsuario)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || "Erro ao remover usuário");
      }
    },
    onSuccess: () => {
      toast.success("Acesso revogado.");
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      setUsuarioParaRemover(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setUsuarioParaRemover(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !senha.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }
    criarUsuario.mutate();
  };

  const totalAdmin = usuarios?.filter((u) => u.role === "admin").length ?? 0;
  const totalOperador = usuarios?.filter((u) => u.role === "operador").length ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">
            Controle de Acesso
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os usuários e permissões do sistema.
          </p>
        </div>
        <Button
          onClick={() => setDialogAberto(true)}
          className="gap-2 bg-primary hover:bg-primary/90 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Total de usuários
          </p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {isLoading ? "—" : (usuarios?.length ?? 0)}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Administradores
          </p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {isLoading ? "—" : totalAdmin}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Operadores
          </p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {isLoading ? "—" : totalOperador}
          </p>
        </div>
      </div>

      {/* Tabela de usuários */}
      <div className="rounded-lg border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Usuários cadastrados
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Usuário
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Perfil
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Permissões
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-16">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {usuarios?.map((u) => (
                <tr
                  key={u.nome}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {u.role === "admin" ? (
                          <ShieldCheck className="w-4 h-4 text-primary" />
                        ) : (
                          <UserRound className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{u.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {u.nome === "admin" ? "Conta protegida do sistema" : "Usuário ativo"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {u.role === "admin" ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <UserRound className="w-3 h-3" />
                      )}
                      {u.role === "admin" ? "Administrador" : "Operador"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <PermissaoItem label="Ver clientes" ativo />
                      <PermissaoItem label="Ver CPF completo" ativo={u.role === "admin"} />
                      <PermissaoItem label="Gerenciar usuários" ativo={u.role === "admin"} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.nome !== "admin" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setUsuarioParaRemover(u.nome)}
                        title="Revogar acesso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Dialog de criação de usuário */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif">
              <UserPlus className="w-5 h-5 text-primary" />
              Criar novo usuário
            </DialogTitle>
            <DialogDescription>
              O usuário receberá credenciais de acesso ao sistema.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="d-nome">Nome de usuário</Label>
              <Input
                id="d-nome"
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value.toLowerCase().replace(/\s/g, ""))
                }
                placeholder="Ex: joao.silva"
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Somente letras minúsculas, números e ponto. Sem espaços.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="d-senha">Senha</Label>
                <Input
                  id="d-senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-confirmar">Confirmar senha</Label>
                <Input
                  id="d-confirmar"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Perfil de acesso</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("operador")}
                  className={`flex flex-col items-start gap-1 p-3 rounded-md border text-left transition-colors ${
                    role === "operador"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserRound className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Operador</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Acesso aos dados, CPF mascarado
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex flex-col items-start gap-1 p-3 rounded-md border text-left transition-colors ${
                    role === "admin"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Administrador</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Acesso total, incluindo CPF
                  </p>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogAberto(false)}
                disabled={criarUsuario.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={criarUsuario.isPending}
              >
                {criarUsuario.isPending ? "Criando..." : "Criar usuário"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de remoção */}
      <AlertDialog
        open={!!usuarioParaRemover}
        onOpenChange={(open) => !open && setUsuarioParaRemover(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar acesso</AlertDialogTitle>
            <AlertDialogDescription>
              O usuário <strong>{usuarioParaRemover}</strong> perderá acesso
              imediato ao sistema. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removerUsuario.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (usuarioParaRemover)
                  removerUsuario.mutate(usuarioParaRemover);
              }}
              className="bg-destructive hover:bg-destructive/90"
              disabled={removerUsuario.isPending}
            >
              {removerUsuario.isPending ? "Revogando..." : "Revogar acesso"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PermissaoItem({ label, ativo }: { label: string; ativo: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <CircleCheck
        className={`w-3 h-3 shrink-0 ${ativo ? "text-primary" : "text-border"}`}
      />
      <span className={`text-xs ${ativo ? "text-foreground" : "text-muted-foreground/50 line-through"}`}>
        {label}
      </span>
    </div>
  );
}
