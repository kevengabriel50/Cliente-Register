import { useState, useMemo } from "react";
import { useListClients, getListClientsQueryKey, useDeleteClient } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Trash2, ArrowUpDown } from "lucide-react";
import { Link } from "wouter";
import { formatCpf, formatPhone } from "@/lib/formatters";
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
import { toast } from "sonner";
import type { Client } from "@workspace/api-client-react/src/generated/api.schemas";

type SortField = "nome" | "createdAt";
type SortOrder = "asc" | "desc";

export default function Clientes() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const { data: clients, isLoading } = useListClients({
    query: { queryKey: getListClientsQueryKey() }
  });

  const deleteClient = useDeleteClient({
    mutation: {
      onSuccess: () => {
        toast.success("Cliente excluído com sucesso.");
        queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
        setClientToDelete(null);
      },
      onError: () => {
        toast.error("Erro ao excluir cliente.");
        setClientToDelete(null);
      }
    }
  });

  const filteredAndSortedClients = useMemo(() => {
    if (!clients) return [];
    
    let filtered = clients;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = clients.filter(c => 
        c.nome.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q) || 
        c.cpf.includes(q)
      );
    }

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === "nome") {
        comparison = a.nome.localeCompare(b.nome);
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [clients, search, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie sua base de clientes.</p>
        </div>
        <Link href="/cadastrar">
          <Button className="gap-2 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      <Card className="p-4 bg-card border-border/60 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, email ou CPF..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => toggleSort("nome")}
            className={sortField === "nome" ? "bg-muted" : ""}
          >
            Nome
            <ArrowUpDown className="w-3 h-3 ml-2 text-muted-foreground" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => toggleSort("createdAt")}
            className={sortField === "createdAt" ? "bg-muted" : ""}
          >
            Data
            <ArrowUpDown className="w-3 h-3 ml-2 text-muted-foreground" />
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : filteredAndSortedClients.length > 0 ? (
          filteredAndSortedClients.map(client => (
            <Card key={client.id} className="p-4 sm:p-6 bg-card border-border/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{client.nome}</h3>
                <p className="text-sm text-muted-foreground truncate">{client.email}</p>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                <div className="flex flex-col text-sm text-right">
                  <span className="text-foreground">{formatPhone(client.telefone)}</span>
                  <span className="font-mono text-muted-foreground text-xs mt-0.5">{formatCpf(client.cpf)}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                  onClick={() => setClientToDelete(client)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center bg-card border-dashed border-2">
            <h3 className="text-lg font-serif font-medium text-foreground">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
              {search ? "Tente mudar os termos da busca." : "Você ainda não tem clientes cadastrados — comece adicionando o primeiro."}
            </p>
            {!search && (
              <Link href="/cadastrar">
                <Button className="mt-6 bg-primary">Cadastrar Primeiro Cliente</Button>
              </Link>
            )}
          </Card>
        )}
      </div>

      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cadastro de <strong>{clientToDelete?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteClient.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                if (clientToDelete) deleteClient.mutate({ id: clientToDelete.id });
              }}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteClient.isPending}
            >
              {deleteClient.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
