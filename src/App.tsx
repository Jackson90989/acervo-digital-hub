import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Books from "./pages/Books";
import Games from "./pages/Games";
import NotFound from "./pages/NotFound";
import AdminLoginPage from './pages/admin/login/page'
import AdminPostPage from './pages/admin/post/page'
import SolicitacoesPage from './pages/admin/solicitacoes/page'
import AdminRegisterPage from './pages/admin/register/page'
import Jogos from './pages/freegame/page'
import LivroPg from './pages/livrospg/page'
//import Credits from './pages/Créditos';
import Movie from './pages/Movie';
import HistoryPage from './pages/Historico'
import  Desafio from './pages/Desafio';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/books" element={<Books />} />
          <Route path="/games" element={<Games />} />
           <Route path="/admin/login" element={<AdminLoginPage/>} />
            <Route path="/admin/post" element={<AdminPostPage/>} />
             <Route path="/admin/solicitacoes" element={<SolicitacoesPage/>} />
             <Route path="/auth/register" element={<AdminRegisterPage/>} />
             <Route path="/freegame" element={<Jogos/>} />
             <Route path="/livrospg" element={<LivroPg/>} />
       
               <Route path="/Movies" element={<Movie/>} />
                <Route path="/Historico" element={<HistoryPage/>} />
                <Route path="/Desafio" element={<Desafio/>} />
              
              
  
  
         
        
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
