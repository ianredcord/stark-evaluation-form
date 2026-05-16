import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import EvaluationForm from "./pages/EvaluationForm";
import EvaluationCompare from "./pages/EvaluationCompare";
import Evaluations from "./pages/Evaluations";
import Templates from "./pages/Templates";
import TemplateEdit from "./pages/TemplateEdit";
import PublicReport from "./pages/PublicReport";
import Account from "./pages/Account";
import Dashboard from "./pages/Dashboard";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/evaluation/new" component={EvaluationForm} />
      <Route path="/evaluation/:id/compare" component={EvaluationCompare} />
      <Route path="/evaluation/:id" component={EvaluationForm} />
      <Route path="/evaluations" component={Evaluations} />
      <Route path="/clients" component={Clients} />
      <Route path="/clients/:name" component={ClientDetail} />
      <Route path="/templates" component={Templates} />
      <Route path="/template/:id/edit" component={TemplateEdit} />
      <Route path="/report/:shareCode" component={PublicReport} />
      <Route path="/account" component={Account} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
