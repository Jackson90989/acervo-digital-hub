import React, { useState } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


interface TokenPayload {
  userId: number;
  email: string;
  approved: boolean;
  owner?: boolean;
  exp: number;
  iat: number;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const token = res.data.token;
      localStorage.setItem("token", token);

      const decoded = jwtDecode<TokenPayload>(token);

      if (decoded.owner || decoded.email !== "mendes@gmail.com") {
        navigate("/admin/solicitacoes");
      } else {
        navigate("/admin/post");
      }
    } catch (err: any) {
      console.error(err);
      setError("Login inválido");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-16 flex-grow flex flex-col justify-center max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Login do Admin</h1>
          <p className="text-muted-foreground">Acesse sua conta para gerenciar o sistema</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-8 shadow-md"
        >
          <div className="mb-6">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-6">
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500 text-center font-medium">{error}</p>
          )}

          <Button variant="hero" type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
