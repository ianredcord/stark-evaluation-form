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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/evaluation/new" component={EvaluationForm} />
      <Route path="/evaluation/:id" component={EvaluationForm} />
      <Route path="/templates" component={Templates} />
      <Route path="/template/:id/edit" component={TemplateEdit} />
      <Route path="/components" component={ComponentShowcase} />
      <Route path="/clients/:id/assessment" component={IntegratedAssessmentPage} />
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
