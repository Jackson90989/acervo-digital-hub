"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Download, Gamepad2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface Game {
  id: number;
  title: string;
  description: string;
  filePath: string;
  coverImagePath?: string;
}

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const gamesPerPage = 6;
  const API_URL = import.meta.env.VITE_API_URL;

  const [searchParams] = useSearchParams();
  const focusId = Number(searchParams.get("focusId"));

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(`${API_URL}/games`);
        setGames(response.data);
      } catch (error) {
        console.error("Erro ao carregar jogos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    if (!isLoading && focusId) {
      setTimeout(() => {
        const el = document.getElementById(`game-${focusId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-4", "ring-primary", "ring-offset-2");
          setTimeout(() => {
            el.classList.remove("ring-4", "ring-primary", "ring-offset-2");
          }, 3000);
        }
      }, 500);
    }
  }, [isLoading, focusId]);

  // Função para salvar no histórico localStorage
  const saveToHistory = (item: { id: number; title: string; type: string }) => {
    const existing = JSON.parse(localStorage.getItem("history") || "[]");
    // Remove itens iguais para evitar duplicidade
    const updated = [item, ...existing.filter((i: any) => i.id !== item.id || i.type !== item.type)];
    localStorage.setItem("history", JSON.stringify(updated));
  };

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  // Garante que currentPage nunca ultrapasse totalPages
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Gamepad2 className="h-4 w-4" />
            Jogos Python
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Jogos em Python
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra nossa coleção de jogos desenvolvidos em Python disponíveis
            para download gratuito
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Pesquisar jogos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Carregando jogos...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-20">
            <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              {searchTerm ? "Nenhum jogo encontrado." : "Nenhum jogo disponível."}
            </p>
          </div>
        ) : (
          <>
            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {currentGames.map((game) => (
                <Card
                  key={game.id}
                  id={`game-${game.id}`}
                  className="group hover:shadow-glow transition-all duration-300 bg-card/80 backdrop-blur-sm border-border/50"
                >
                  <CardHeader className="p-0">
                    {game.coverImagePath ? (
                      <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
                        <img
                          src={`${API_URL}/files/${game.coverImagePath}`}
                          alt={`Capa do jogo ${game.title}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[3/4] bg-muted/30 rounded-t-lg flex items-center justify-center">
                        <Gamepad2 className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                      {game.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {game.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button asChild className="w-full" variant="hero">
                      <a
                        href={`${API_URL}/downloadGame/${game.filePath}`}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          saveToHistory({ id: game.id, title: game.title, type: "game" })
                        }
                      >
                        <Download className="h-4 w-4" />
                        Baixar Jogo
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            goToPage(page);
                          }}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
