import React, { useEffect, useState } from "react";
import { Menu, X, BookOpen, Gamepad2, Joystick, Users, Home, Book, HistoryIcon, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FilePlus2, BellRing, LogIn, UserPlus, Film } from "lucide-react";

const navigationItems = [
  { label: "Início", href: "/", icon: Home },
  { label: "Abaixar Livros", href: "/books", icon: BookOpen },
  { label: "Abaixar Jogos", href: "/games", icon: Joystick },
  { label: "Jogos Online", href: "/freegame", icon: Gamepad2 },
  { label: "Livros Online", href: "/livrospg", icon: Book },
  { label: "Abaixar Filmes", href: "/movies", icon: Film },
  { label: "Histórico", href: "/historico", icon: HistoryIcon },
  { label: "Desafio", href: "/Desafio", icon: Award },
];

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLogged(!!token);
    setIsMobileMenuOpen(false); // fecha menu ao mudar de rota
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLogged(false);
    navigate("/");
    window.location.reload(); // Recarrega a página após logout
  };

  const handleNavigation = (href) => {
    // Verifica se já está na mesma rota antes de recarregar
    if (location.pathname === href) {
      window.location.reload();
    } else {
      navigate(href);
      // Recarrega após um pequeno delay para garantir que a navegação ocorra
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  const renderNavLinks = () =>
    navigationItems.map((item) => (
      <button
        key={item.label}
        onClick={() => {
          handleNavigation(item.href);
          setIsMobileMenuOpen(false);
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-300 w-full text-left"
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </button>
    ));

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AcervoDigital</h1>
              <p className="text-xs text-muted-foreground">Conhecimento Livre</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.href)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-300"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isLogged ? (
              <>
                <Link to="/admin/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="hero" size="sm">
                    <UserPlus className="h-4 w-4" />
                    Cadastrar
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/admin/post">
                  <Button variant="ghost" size="sm">
                    <FilePlus2 className="h-4 w-4" />
                    Postar Conteúdo
                  </Button>
                </Link>
                <Link to="/admin/solicitacoes">
                  <Button variant="ghost" size="sm">
                    <BellRing className="h-4 w-4" />
                    Solicitações
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-500"
                >
                  Sair
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 animate-slide-up">
            <nav className="flex flex-col gap-2">
              {renderNavLinks()}

              <div className="flex flex-col gap-2 mt-4 px-4">
                {!isLogged ? (
                  <>
                    <Link to="/admin/login">
                      <Button variant="ghost" size="sm" className="w-full">
                        <LogIn className="h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                    <Link to="/auth/register">
                      <Button variant="hero" size="sm" className="w-full">
                        <UserPlus className="h-4 w-4" />
                        Cadastrar
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/admin/post">
                      <Button variant="ghost" size="sm" className="w-full">
                        <FilePlus2 className="h-4 w-4" />
                        Postar Conteúdo
                      </Button>
                    </Link>
                    <Link to="/admin/solicitacoes">
                      <Button variant="ghost" size="sm" className="w-full">
                        Solicitações
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-red-500"
                      onClick={handleLogout}
                    >
                      Sair
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};