import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RAGPage from "./pages/RAGPage";
import Classificacoes from "./pages/Classificacoes";
import Pessoas from "./pages/Pessoas";
import Movimentos from "./pages/Movimentos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rag" element={<RAGPage />} />
          <Route path="/pessoas" element={<Pessoas />} />
          <Route path="/classificacoes" element={<Classificacoes />} />
          <Route path="/movimentos" element={<Movimentos />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
