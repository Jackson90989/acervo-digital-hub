import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {PDFPreview} from "@/components/PDFPreview"
import { Book } from "lucide-react";
import { useSearchParams } from "react-router-dom";
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
import { Search, Download, BookOpen } from "lucide-react";

interface Book {
  id: number;
  title: string;
  description: string;
  filePath: string;
  coverImagePath?: string;
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const booksPerPage = 6;
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("focusId");

  // Ref para o container dos cards para fazer scroll
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`${API_URL}/books`);
        setBooks(response.data);
      } catch (error) {
        console.error("Erro ao carregar livros:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Quando books ou focusId mudarem, definimos a página e scrollamos para o livro focado
  useEffect(() => {
    if (focusId && books.length > 0) {
      const idNumber = Number(focusId);
      const index = books.findIndex((book) => book.id === idNumber);
      if (index !== -1) {
        const pageOfBook = Math.floor(index / booksPerPage) + 1;
        setCurrentPage(pageOfBook);

        // Espera o render do livro e rola suavemente até ele
        setTimeout(() => {
          const cardElement = document.getElementById(`book-card-${idNumber}`);
          if (cardElement) {
            cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300);
      }
    }
  }, [focusId, books]);

  // ✅ Salvar no histórico se o livro for acessado diretamente por focusId
useEffect(() => {
  if (focusId && books.length > 0) {
    const idNumber = Number(focusId);
    const book = books.find((b) => b.id === idNumber);
    if (book) {
      saveToHistory({
        id: book.id,
        title: book.title,
        type: "book",
      });
    }
  }
}, [focusId, books]);


  const saveToHistory = (item: { id: number; title: string; type: string }) => {
    const existing = JSON.parse(localStorage.getItem("history") || "[]");
    const updated = [item, ...existing.filter((i: any) => i.id !== item.id || i.type !== item.type)];
    localStorage.setItem("history", JSON.stringify(updated));
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

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
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            Biblioteca Digital
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Livros Disponíveis
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore nossa coleção de livros em PDF disponíveis para download gratuito
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Pesquisar livros..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Carregando livros...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              {searchTerm ? "Nenhum livro encontrado." : "Nenhum livro disponível."}
            </p>
          </div>
        ) : (
          <>
            <div
              ref={cardsContainerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {currentBooks.map((book) => (
                <Card
                  key={book.id}
                  id={`book-card-${book.id}`}
                  
                  className={`group hover:shadow-glow transition-all duration-300 bg-card/80 backdrop-blur-sm border-border/50 ${
                    book.id === Number(focusId) ? "border-4 border-primary" : ""
                  }`}
                >
                 <CardHeader className="p-0">
  {book.coverImagePath ? (
    <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
      <img
        src={`${API_URL}/files/${book.coverImagePath}`}
        alt={`Capa do livro ${book.title}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 "
      />
    </div>
  ) : (
    <div className="aspect-[3/4] bg-muted/30 rounded-t-lg overflow-hidden">
       <Book className="h-16 w-16 text-muted-foreground" />
      <PDFPreview url={`${API_URL}/files/${book.filePath}`} />
    </div>
  )}
</CardHeader>

                  <CardContent className="p-6">
                    <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                      {book.title}
                    </CardTitle>
                    <CardDescription>
                      {book.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex gap-2">
                    {/* Visualizar PDF */}
                    <Button asChild variant="outline" className="w-1/2">
                      <a
                        href={`${API_URL}/files/${book.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          saveToHistory({
                            id: book.id,
                            title: book.title,
                            type: "book",
                          })
                        }
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Visualizar
                      </a>
                    </Button>

                    {/* Baixar PDF */}
                    <Button asChild variant="hero" className="w-1/2">
                      <a
                        href={`${API_URL}/downloadBook/${book.filePath}`}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
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
                        className={
                          currentPage === 1 ? "pointer-events-none opacity-50" : ""
                        }
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
