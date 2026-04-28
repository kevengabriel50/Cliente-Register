import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateClient, getGetClientStatsQueryKey, getListClientsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Save } from "lucide-react";
import { formatCpf, formatPhone, stripDigits } from "@/lib/formatters";
import { toast } from "sonner";
import { useState } from "react";
import type { ErrorResponse } from "@workspace/api-client-react/src/generated/api.schemas";
import type { ErrorType } from "@workspace/api-client-react/src/custom-fetch";

const schema = z.object({
  nome: z.string().min(1, "O nome é obrigatório.").max(200),
  email: z.string().min(1, "O e-mail é obrigatório.").email("E-mail inválido."),
  telefone: z.string().min(1, "O telefone é obrigatório."),
  cpf: z.string().min(1, "O CPF é obrigatório.")
}).superRefine((data, ctx) => {
  const cleanCpf = stripDigits(data.cpf);
  if (cleanCpf.length !== 11) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["cpf"],
      message: "CPF deve conter exatamente 11 dígitos.",
    });
  }
});

type FormData = z.infer<typeof schema>;

export default function CadastrarCliente() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
    }
  });

  const createClient = useCreateClient({
    mutation: {
      onSuccess: () => {
        toast.success("Cliente cadastrado com sucesso!");
        queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetClientStatsQueryKey() });
        setSuccess(true);
        form.reset();
      },
      onError: (err: ErrorType<ErrorResponse>) => {
        toast.error(err.erro || "Ocorreu um erro ao cadastrar o cliente.");
      }
    }
  });

  const onSubmit = (data: FormData) => {
    createClient.mutate({
      data: {
        nome: data.nome,
        email: data.email,
        telefone: stripDigits(data.telefone),
        cpf: stripDigits(data.cpf),
      }
    });
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 animate-in fade-in zoom-in duration-500">
        <Card className="text-center p-8 border-border/60 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Cadastrado com sucesso!</h2>
          <p className="text-muted-foreground mb-8">O novo cliente foi adicionado à sua base.</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
              Cadastrar outro
            </Button>
            <Link href="/clientes">
              <Button className="w-full bg-primary text-primary-foreground">
                Ir para a lista
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/clientes">
          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">Cadastrar Cliente</h1>
          <p className="text-muted-foreground mt-1">Preencha os dados abaixo.</p>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm bg-card overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Maria Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="maria@exemplo.com.br" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(11) 91234-5678" 
                          {...field} 
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(formatPhone(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123.456.789-00" 
                          {...field}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(formatCpf(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <Link href="/clientes">
                  <Button variant="ghost" type="button" disabled={createClient.isPending}>
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={createClient.isPending} className="bg-primary hover:bg-primary/90 min-w-32">
                  {createClient.isPending ? "Salvando..." : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Salvar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
