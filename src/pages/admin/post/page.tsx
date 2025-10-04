import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminPostPage() {
  const navigate = useNavigate();

  const [isLogged, setIsLogged] = useState(false);
  const [type, setType] = useState<"book" | "game" | "movie">("book");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState<number | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
    } else {
      setIsLogged(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLogged(false);
    navigate("/admin/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !file) {
      setError("Você precisa estar logado e selecionar um arquivo.");
      setSuccessMessage("");
      return;
    }

    if (type === "movie" && (rating === "" || rating < 0 || rating > 10)) {
      setError("Informe uma nota válida entre 0 e 10 para o filme.");
      setSuccessMessage("");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("type", type);
    formData.append("file", file);
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }
    if (type === "movie") {
      formData.append("rating", rating.toString());
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      await axios.post(`${API_URL}/admin/post`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(progress);
        },
      });

      setSuccessMessage(`${type === "book" ? "Livro" : type === "game" ? "Jogo" : "Filme"} postado com sucesso!`);
      setTitle("");
      setDescription("");
      setRating("");
      setFile(null);
      setCoverImage(null);
      setError("");
    } catch (err) {
      setError("Erro ao postar conteúdo");
      setSuccessMessage("");
      console.error(err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const mainFileLabel = type === "book" ? "Escolha arquivo do livro" : type === "game" ? "Escolha arquivo do jogo" : "Escolha arquivo do filme";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-16 flex-grow flex flex-col justify-center max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-8 shadow-md flex flex-col gap-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-foreground">
              Postar {type === "book" ? "Livro" : type === "game" ? "Jogo" : "Filme"}
            </h1>
            {isLogged && (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            )}
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={type === "book"}
                onChange={() => setType("book")}
                className="cursor-pointer"
              />
              Livro
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={type === "game"}
                onChange={() => setType("game")}
                className="cursor-pointer"
              />
              Jogo
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={type === "movie"}
                onChange={() => setType("movie")}
                className="cursor-pointer"
              />
              Filme
            </label>
          </div>

          <Input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="resize-none rounded-md border border-border/50 bg-card/70 text-foreground p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {type === "movie" && (
            <Input
              type="number"
              placeholder="Nota (0 a 10)"
              value={rating}
              min={0}
              max={10}
              step={0.1}
              onChange={(e) => {
                const value = e.target.value;
                setRating(value === "" ? "" : parseFloat(value));
              }}
              required
            />
          )}

          <div>
            <label htmlFor="fileInput" className="block mb-1 font-medium text-foreground cursor-pointer">
              {file ? file.name : mainFileLabel}
            </label>
            <input
              id="fileInput"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              className="w-full cursor-pointer"
            />
          </div>

          <div>
            <label htmlFor="coverInput" className="block mb-1 font-medium text-foreground cursor-pointer">
              {coverImage ? coverImage.name : "Escolha a imagem da capa"}
            </label>
            <input
              id="coverInput"
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
              className="w-full cursor-pointer"
            />
          </div>

          <Button variant="hero" type="submit" className="w-full" disabled={uploading}>
            {uploading ? `Enviando... (${uploadProgress}%)` : "Enviar"}
          </Button>

          {uploading && (
            <div className="text-sm text-blue-500 text-center">
              Carregando arquivo... {uploadProgress}%
            </div>
          )}

          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          {successMessage && <p className="text-center text-sm text-green-500">{successMessage}</p>}
        </form>
      </main>

      <Footer />
    </div>
  );
}
