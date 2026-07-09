import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Registration from "@/pages/registration";
import Minicourses from "@/pages/minicourses";
import Certificates from "@/pages/certificates";
import AdminDashboard from "@/pages/admin";
import Localizacao from "@/pages/localizacao";
import Palestrantes from "@/pages/palestrantes";
import Galeria from "@/pages/galeria";
import { UserProvider } from "@/lib/user-context";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/inscricao" component={Registration} />
        <Route path="/minicursos" component={Minicourses} />
        <Route path="/certificados" component={Certificates} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/localizacao" component={Localizacao} />
        <Route path="/palestrantes" component={Palestrantes} />
        <Route path="/galeria" component={Galeria} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </UserProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
