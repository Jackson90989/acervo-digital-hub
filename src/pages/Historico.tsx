"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Film, Gamepad2, Clock, Book } from "lucide-react";

interface HistoryItem {
  id: string;  // id do item, string para flexibilidade
  title: string;
  type: "book" | "movie" | "game" | "onlineBook" | "onlineGame";
  url?: string; // URL externa para onlineBook e onlineGame
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("history");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("history");
    setHistory([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "book":
        return <BookOpen className="h-5 w-5 mr-2" />;
      case "movie":
        return <Film className="h-5 w-5 mr-2" />;
      case "game":
        return <Gamepad2 className="h-5 w-5 mr-2" />;
      case "onlineBook":
        return <Book className="h-5 w-5 mr-2" />;
      case "onlineGame":
        return <Gamepad2 className="h-5 w-5 mr-2" />;
      default:
        return <Clock className="h-5 w-5 mr-2" />;
    }
  };

  const getLink = (item: HistoryItem) => {
    if (item.type === "onlineBook" || item.type === "onlineGame") {
      return item.url || "#";
    } else {
      return `/${item.type}s?focusId=${encodeURIComponent(item.id)}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Clock className="h-4 w-4" />
            Histórico de Acessos
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Seus Últimos Acessos
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Veja os conteúdos que você acessou recentemente
          </p>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">Nenhum item acessado ainda.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-6">
              <Button variant="destructive" onClick={clearHistory}>
                Limpar Histórico
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <Card
                  key={`${item.type}-${item.id}`}
                  className="bg-card/80 backdrop-blur-sm border-border/50 group hover:shadow-glow transition-all duration-300"
                >
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center">
                      {getIcon(item.type)}
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Tipo:{" "}
                      <span className="capitalize font-medium text-foreground">{item.type}</span>
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                    >
                      <a href={getLink(item)} target="_blank" rel="noopener noreferrer">
                        Acessar novamente
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
