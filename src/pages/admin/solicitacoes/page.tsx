import React, { useEffect, useState } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  email: string;
}

interface TokenPayload {
  userId: number;
  owner?: boolean;
  email: string;
}

export default function SolicitacoesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      if (!decoded.owner || decoded.email !== "mendes@gmail.com") {
        setError("Acesso negado.");
        navigate("/admin/post");
        return;
      }
    } catch {
      navigate("/admin/login");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } catch (err: any) {
        setError("Erro ao buscar usuários.");
        navigate("/admin/login");
      }
    };

    fetchData();
  }, [navigate]);

  const aprovarUsuario = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API_URL}/admin/approve/${id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError("Erro ao aprovar usuário.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-16 flex-grow max-w-3xl">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">
          Solicitações de Cadastro
        </h1>

        {error && (
          <p className="text-center text-red-500 font-semibold mb-6">{error}</p>
        )}

        {users.length === 0 ? (
          <p className="text-center text-muted-foreground italic">
            Nenhuma solicitação pendente.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-4 flex justify-between items-center shadow-md"
              >
                <span className="text-foreground">{user.email}</span>
                <Button variant="hero" size="sm" onClick={() => aprovarUsuario(user.id)}>
                  Aprovar
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
