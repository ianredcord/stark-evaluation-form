import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import EvaluationForm from "./pages/EvaluationForm";
import Templates from "./pages/Templates";
import TemplateEdit from "./pages/TemplateEdit";
import ComponentShowcase from "./pages/ComponentShowcase";
import IntegratedAssessmentPage from "./pages/IntegratedAssessmentPage";
import ClientReportPage from "./pages/ClientReportPage";
import PrescriptionsAdmin from "./pages/PrescriptionsAdmin";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/clients" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/evaluation/new" component={EvaluationForm} />
      <Route path="/evaluation/:id" component={EvaluationForm} />
      <Route path="/templates" component={Templates} />
      <Route path="/template/:id/edit" component={TemplateEdit} />
      <Route path="/components" component={ComponentShowcase} />
      <Route path="/clients/:id/assessment" component={IntegratedAssessmentPage} />
      <Route path="/r/:shareCode" component={ClientReportPage} />
      <Route path="/prescriptions" component={PrescriptionsAdmin} />
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
