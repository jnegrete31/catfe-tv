import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import TVDisplay from "./pages/TVDisplay";
import Admin from "./pages/Admin";
import UploadHappyTails from "./pages/UploadHappyTails";
import UploadSnapPurr from "./pages/UploadSnapPurr";
import GuestSlideshow from "./pages/GuestSlideshow";
import Vote from "./pages/Vote";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tv" component={TVDisplay} />
      <Route path="/admin" component={Admin} />
      <Route path="/upload/happy-tails" component={UploadHappyTails} />
      <Route path="/upload/snap-purr" component={UploadSnapPurr} />
      <Route path="/slideshow/:type" component={GuestSlideshow} />
      <Route path="/vote/:pollId" component={Vote} />
      <Route path="/404" component={NotFound} />
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
