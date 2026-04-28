import { useGetClientStats, getGetClientStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatCpf, formatPhone } from "@/lib/formatters";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetClientStats({
    query: { queryKey: getGetClientStatsQueryKey() }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground mt-1">Acompanhe seus cadastros e recentes.</p>
        </div>
        <Link href="/cadastrar">
          <Button className="gap-2 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Cadastrar Cliente
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-border/60 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total de clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-serif font-bold text-foreground">{stats?.total || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-border/60 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Cadastrados hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-serif font-bold text-foreground">{stats?.registeredToday || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Cadastrados nesta semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-serif font-bold text-foreground">{stats?.registeredThisWeek || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-semibold text-foreground">Cadastros recentes</h2>
          <Link href="/clientes">
            <Button variant="link" className="text-primary gap-1 px-0 h-auto">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <Card className="border-border/60 shadow-sm bg-card overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : stats?.recent && stats.recent.length > 0 ? (
            <div className="divide-y divide-border/60">
              {stats.recent.map((client) => (
                <div key={client.id} className="p-4 sm:px-6 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-foreground">{client.nome}</h3>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 text-sm text-muted-foreground">
                    <span>{formatPhone(client.telefone)}</span>
                    <span className="bg-muted px-2 py-0.5 rounded-md font-mono text-xs">{formatCpf(client.cpf)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-serif font-medium text-foreground">Nenhum cliente recente</h3>
              <p className="text-muted-foreground mt-1 max-w-sm mx-auto">Você ainda não tem clientes cadastrados — comece adicionando o primeiro para ver aqui.</p>
              <Link href="/cadastrar">
                <Button className="mt-6 shadow-sm bg-primary">
                  Cadastrar Primeiro Cliente
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
