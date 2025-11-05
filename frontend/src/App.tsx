import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import your existing pages
import Index from "./pages/Index";
import Artifacts from "./pages/Artifacts";
import Exhibitions from "./pages/Exhibitions";
import Museums from "./pages/Museums";
import Sponsors from "./pages/Sponsors";
import NotFound from "./pages/NotFound";
import SearchResultsPage from "./pages/SearchResults";
// ⬇️ IMPORT YOUR NEW ADMIN PAGE
import AdminPage from "./pages/AdminPage"; // Make sure this path is correct
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/artifacts" element={<Artifacts />} />
          <Route path="/exhibitions" element={<Exhibitions />} />
          <Route path="/museums" element={<Museums />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/search" element={<SearchResultsPage />} />
          
          {/* --- ⬇️ 2. ADD THE NEW ROUTE FOR /admin --- */}
          <Route path="/admin" element={<AdminPage />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;