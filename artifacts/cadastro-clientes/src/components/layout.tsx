import { Link, useLocation } from "wouter";
import { Users, Home, Plus, LogOut, ShieldCheck, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { nome, isAdmin, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Visão Geral", icon: Home },
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/cadastrar", label: "Cadastrar", icon: Plus },
    ...(isAdmin
      ? [{ href: "/usuarios", label: "Usuários", icon: UserCog }]
      : []),
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border shrink-0 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Users className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-xl font-bold text-foreground">Agenda</h1>
        </div>

        <nav className="flex-1 px-4 py-4 flex md:flex-col gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer shrink-0",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-border flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{nome}</p>
            {isAdmin && (
              <Badge variant="secondary" className="mt-1 text-xs gap-1 px-1.5">
                <ShieldCheck className="w-3 h-3" />
                Admin
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
