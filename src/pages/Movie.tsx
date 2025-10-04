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
import { Search, Download, Film } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  description: string;
  rating: number;
  filePath: string;
  coverImagePath?: string;
}

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const moviesPerPage = 6;
  const API_URL = import.meta.env.VITE_API_URL;
  

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(`${API_URL}/movies`);
        setMovies(response.data);
      } catch (error) {
        console.error("Erro ao carregar filmes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Função para salvar no histórico
  const saveToHistory = (item: { id: number; title: string; type: string }) => {
    try {
      const stored = localStorage.getItem("history");
      let history = stored ? JSON.parse(stored) : [];

      // Remove o item se já existir para evitar duplicidade e manter ordem atualizada
      history = history.filter(
        (h: { id: number; type: string }) => !(h.id === item.id && h.type === item.type)
      );

      // Adiciona o item no começo do array
      history.unshift(item);

      // Limita o histórico a 20 itens para não crescer demais
      if (history.length > 20) {
        history = history.slice(0, 20);
      }

      localStorage.setItem("history", JSON.stringify(history));
    } catch (error) {
      console.error("Erro ao salvar histórico:", error);
    }
  };

  // Função para verificar se o item está no histórico (para aplicar o efeito azul)
  const isInHistory = (id: number, type: string): boolean => {
    try {
      const stored = localStorage.getItem("history");
      const history = stored ? JSON.parse(stored) : [];
      return history.some((h: { id: number; type: string }) => h.id === id && h.type === type);
    } catch {
      return false;
    }
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const indexOfLast = currentPage * moviesPerPage;
  const indexOfFirst = indexOfLast - moviesPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirst, indexOfLast);

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
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Film className="h-4 w-4" />
            Catálogo de Filmes
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Filmes Disponíveis
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Navegue por nossa coleção de filmes disponíveis para assistir ou baixar
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Pesquisar filmes..."
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
            <p className="text-muted-foreground mt-4">Carregando filmes...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20">
            <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              {searchTerm ? "Nenhum filme encontrado." : "Nenhum filme disponível."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {currentMovies.map((movie) => (
                <Card
                  key={movie.id}
                  className="group hover:shadow-glow transition-all duration-300 bg-card/80 backdrop-blur-sm border-border/50"
                >
                  <CardHeader className="p-0">
                    {movie.coverImagePath ? (
                      <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
                        <img
                          src={`${API_URL}/files/${movie.coverImagePath}`}
                          alt={`Capa do filme ${movie.title}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[3/4] bg-muted/30 rounded-t-lg flex items-center justify-center">
                        <Film className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle
                      className={`text-lg mb-2 group-hover:text-primary transition-colors ${
                        typeof window !== "undefined" && isInHistory(movie.id, "movie")
                          ? "text-primary"
                          : ""
                      }`}
                    >
                      {movie.title}
                    </CardTitle>
                    <CardDescription>
                      {movie.description}
                    </CardDescription>
                    <p className="mt-2 text-sm text-muted-foreground">Nota: {movie.rating}/10</p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex gap-2">
                    {/* Assistir */}
                    <Button asChild variant="outline" className="w-1/2">
                      <a
                        href={`${API_URL}/watchMovie/${movie.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => saveToHistory({ id: movie.id, title: movie.title, type: "movie" })}
                      >
                        <Film className="h-4 w-4 mr-2" />
                        Assistir
                      </a>
                    </Button>

                    {/* Baixar */}
                    <Button asChild variant="hero" className="w-1/2">
                      <a
                        href={`${API_URL}/downloadMovie/${movie.filePath}`}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => saveToHistory({ id: movie.id, title: movie.title, type: "movie" })}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Paginação */}
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
                        className={
                          currentPage === totalPages || totalPages === 0
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
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
