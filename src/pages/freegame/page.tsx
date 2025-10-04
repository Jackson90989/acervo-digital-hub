"use client";

import React, { useEffect, useState } from "react";
import { Gamepad } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Game {
  id: number;
  title: string;
  short_description: string;
  thumbnail: string;
  game_url: string;
}

export default function Jogos() {
  const [games, setGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 6;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch(`${API_URL}/freetogame`);
      if (!res.ok) throw new Error("Erro ao buscar jogos");
      const data: Game[] = await res.json();
      setGames(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
      setGames([]);
    }
  };

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Função para salvar no histórico localStorage
  const saveToHistory = (game: Game) => {
    try {
      const existing = JSON.parse(localStorage.getItem("history") || "[]");
      const newEntry = {
        id: String(game.id),
        title: game.title,
        type: "onlineGame",
        url: game.game_url,
      };
      const updated = [newEntry, ...existing.filter((item: any) => item.id !== newEntry.id)];
      localStorage.setItem("history", JSON.stringify(updated));
    } catch {
      // Se der erro, ignora
    }
  };

  return (
    <>
      <Header />

      <main className="w-full px-4 py-8 max-w-5xl mx-auto">
        {/* Seção de introdução */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Gamepad size={16} />
            Jogos Online Gratuitos
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Encontre seu jogo favorito
          </h1>
          <p className="text-lg text-gray-600 max-w-xl">
            Explore nossa seleção de jogos gratuitos para jogar online.
          </p>
        </div>

        {/* Campo de busca */}
        <div className="relative max-w-md mx-auto mb-10">
          <Gamepad className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Pesquisar jogos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        {/* Lista de jogos */}
        {games.length === 0 ? (
          <p className="text-center">Carregando jogos...</p>
        ) : filteredGames.length === 0 ? (
          <p className="text-center">Nenhum jogo encontrado.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentGames.map((game) => (
                <div
                  key={game.id}
                  className="border rounded-lg p-4 flex flex-col shadow-sm"
                >
                  <img
                    src={game.thumbnail}
                    alt={game.title}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-lg font-semibold mb-2">{game.title}</h3>
                  <p className="text-sm text-gray-600 flex-grow">
                    {game.short_description}
                  </p>
                  <button
                    onClick={() => {
                      saveToHistory(game);
                      window.open(game.game_url, "_blank");
                    }}
                    className="mt-4 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition font-medium"
                  >
                    Jogar Agora
                  </button>
                </div>
              ))}
            </div>

            {/* Paginação */}
            <div className="mt-10 flex justify-center flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &laquo; Anterior
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próximo &raquo;
              </Button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
