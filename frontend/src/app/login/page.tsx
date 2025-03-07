"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import boraImpactar from "../../assets/bora_impactar.svg"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:3333/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Credenciais inválidas");

      const data = await response.json();

      // Salva os cookies
      Cookies.set("auth_token", data.token, { expires: 7, secure: true, sameSite: "Strict" });
      Cookies.set("user_name", data.user.name);

      toast.success("Login bem-sucedido! Redirecionando...", { duration: 4000 });

      router.push("/");

      setTimeout(() => {
        if (window.location.pathname === "/") {
          window.scrollTo(0, 0);
          window.location.reload();
        }
      }, 500);
      
    } catch (error) {
      toast.error(`Erro ao fazer login: ${error instanceof Error ? error.message : "Erro desconhecido"}`, {
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-w-4/5 p-4">
      <Image src={boraImpactar} alt="bora impactar"/>
      <div className="p-14 rounded-xl shadow-lg w-full max-w-lg bg-[#00B3FF]">
        <h2 className="text-2xl font-bold text-center text-white">Entrar</h2>
        <p className="text-white text-center">Acesse sua Ong</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input className="bg-white rounded-xl border-[#D4D7E3]" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input className="bg-white rounded-xl border-[#D4D7E3]" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full bg-[#294BB6] rounded-xl text-white font-bold tracking-widest hover:bg-white hover:text-[#294BB6]" disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
