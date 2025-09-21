import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast, { Toaster } from "react-hot-toast";

export default function AdminRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
      });

      toast.success("Cadastro realizado com sucesso!");

      // Navega para login depois de 2 segundos
      setTimeout(() => {
        navigate("/admin/login");
      }, 2000);
    } catch (err: any) {
      console.error("Erro no cadastro:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Erro ao cadastrar");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {/* Componente Toaster que mostra as notificações */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: "1rem",
          },
        }}
      />

      <div className="w-full max-w-md bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-foreground mb-6 text-center">
          Cadastro de Admin
        </h1>

        <Input
          type="email"
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
        />

        <Input
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6"
        />

        <Button
          onClick={handleRegister}
          variant="hero"
          className="w-full"
          type="button"
        >
          Cadastrar
        </Button>
      </div>
    </div>
  );
}
