import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Clientes from "@/pages/clientes";
import CadastrarCliente from "@/pages/cadastrar";
import Login from "@/pages/login";
import { AuthProvider, useAuth } from "@/context/auth";

const queryClient = new QueryClient();

function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }

  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <RotaProtegida>
          <Dashboard />
        </RotaProtegida>
      </Route>
      <Route path="/clientes">
        <RotaProtegida>
          <Clientes />
        </RotaProtegida>
      </Route>
      <Route path="/cadastrar">
        <RotaProtegida>
          <CadastrarCliente />
        </RotaProtegida>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
