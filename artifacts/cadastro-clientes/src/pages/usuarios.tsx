import { useState } from "react";
import { useAuth } from "@/context/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User, Trash2, Plus } from "lucide-react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UsuarioInfo {
  nome: string;
  role: "admin" | "operador";
}

function useListarUsuarios() {
  const { token } = useAuth();
  return useQuery<UsuarioInfo[]>({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const res = await fetch("/api/auth/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar usuários");
      return res.json();
    },
  });
}

export default function Usuarios() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { data: usuarios, isLoading } = useListarUsuarios();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
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
      toast.success("Usuário criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      setNome("");
      setSenha("");
      setRole("operador");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const removerUsuario = useMutation({
    mutationFn: async (nomeUsuario: string) => {
      const res = await fetch(`/api/auth/usuarios/${encodeURIComponent(nomeUsuario)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || "Erro ao remover usuário");
      }
    },
    onSuccess: () => {
      toast.success("Usuário removido.");
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
    criarUsuario.mutate();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">
          Usuários
        </h1>
        <p className="text-muted-foreground mt-1">
          Crie e gerencie os acessos ao sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo usuário
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome de usuário</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value.toLowerCase().replace(/\s/g, ""))}
                  placeholder="Ex: joao.silva"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Perfil de acesso</Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("operador")}
                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-md border text-sm transition-colors ${
                      role === "operador"
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Operador
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-md border text-sm transition-colors ${
                      role === "admin"
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {role === "operador"
                    ? "Operador vê os dados dos clientes, mas o CPF aparece mascarado (LGPD)."
                    : "Admin tem acesso completo, incluindo CPF e gerenciamento de usuários."}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={criarUsuario.isPending}
              >
                {criarUsuario.isPending ? "Criando..." : "Criar usuário"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Usuários cadastrados
            </h2>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : (
              <div className="space-y-2">
                {usuarios?.map((u) => (
                  <div
                    key={u.nome}
                    className="flex items-center justify-between px-3 py-2.5 rounded-md border border-border/60 bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        {u.role === "admin" ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground">{u.nome}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">
                        {u.role === "admin" ? "Admin" : "Operador"}
                      </Badge>
                      {u.nome !== "admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setUsuarioParaRemover(u.nome)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!usuarioParaRemover}
        onOpenChange={(open) => !open && setUsuarioParaRemover(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o usuário{" "}
              <strong>{usuarioParaRemover}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removerUsuario.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (usuarioParaRemover) removerUsuario.mutate(usuarioParaRemover);
              }}
              className="bg-destructive hover:bg-destructive/90"
              disabled={removerUsuario.isPending}
            >
              {removerUsuario.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
