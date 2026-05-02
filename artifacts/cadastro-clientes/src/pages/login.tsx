import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro || "Usuário ou senha incorretos");
        return;
      }

      login(data.token, data.role, data.nome);
      toast.success("Login realizado com sucesso!");
      setLocation("/");
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold text-foreground">Agenda</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Faça login para acessar o sistema
            </p>
          </div>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Usuário</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="admin"
                  required
                  autoFocus
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

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  "Entrando..."
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Usuário: <span className="font-mono">admin</span> · Senha:{" "}
          <span className="font-mono">123</span>
        </p>
      </div>
    </div>
  );
}
