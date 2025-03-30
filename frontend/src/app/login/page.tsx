"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import boraImpactar from "../../assets/bora_impactar.svg";
import { Checkbox } from "@/components/ui/checkbox";
import mini_impactar from "../../assets/mini_impactar.svg"
import ModalPortal from "@/components/ui/modalPortal";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://127.0.0.1:3333/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Credenciais inválidas. Verifique seu e-mail e senha.");
        } else {
          toast.error(`Erro ao fazer login: ${response.statusText}`);
        }
        throw new Error("Erro no login");
      }

      const data = await response.json();

      if (rememberMe) {
        Cookies.set("auth_token", data.token, {
          expires: 7,
          secure: true,
          sameSite: "Strict"
        });
      } else {
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + (4 * 60 * 60 * 1000));
        
        Cookies.set("auth_token", data.token, {
          expires: expirationDate,
          secure: true,
          sameSite: "Strict"
        });
      }
      
      

      if (data.user?.name) {
        Cookies.set("user_name", data.user.name);
        toast.success(`Bem-vindo, ${data.user.name}!`);
      }

      if (data.ngo?.name) {
        Cookies.set("ngo_name", data.ngo.name);
      }

      if (data.ngo?.id) {
        Cookies.set("ngo_id", data.ngo.id);
      }

      toast.success("Redirecionando para o painel...");
      setTimeout(() => router.push("/dashboard/ongs"), 0);
    } catch (error) {
      toast.error("Falha ao conectar ao servidor. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#e0f0ff] via-[#f3faff] to-white pointer-events-none z-0" />

      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-12 items-center justify-center py-12 relative z-10">
        <div className="lg:w-1/2 w-full flex items-center justify-center">
          <Image
            src={boraImpactar}
            alt="Bora Impactar"
            className="w-[350px] lg:w-[450px]"
            priority
          />
        </div>

        <div className="hidden lg:flex h-[700px] w-1 rounded-full bg-blue-200" />

        <div className="lg:w-1/2 w-full flex justify-center">
          <div className="bg-white rounded-[16px] shadow-xl border border-gray-200 p-12 w-full max-w-lg font-sans">
            <div className="w-14 h-14 rounded-full bg-blue-100 mx-auto mb-8 flex items-center justify-center">
              <Image
                src={mini_impactar}
                alt="Mini Impactar Logo"
                className="w-10 h-10 object-contain"
                priority
              />
            </div>
            <h2 className="text-2xl font-semibold text-center text-blue-900 mb-8">Entrar na plataforma</h2>
    
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                id="email"
                type="email"
                placeholder="E-mail da sua ONG"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3 text-lg border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-blue-300"
              />

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-3 text-lg border border-gray-300 rounded-[8px] pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-sm text-gray-500 hover:text-blue-600"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-5 h-5 mr-1" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 mr-1" />
                      Mostrar
                    </>
                  )}
                </button>
              </div>

              <button
                id="entrar"
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white font-semibold text-lg py-3 rounded-[24px] hover:bg-blue-600 transition"
              >
                {loading ? <Loader2 className="animate-spin w-6 h-6 mx-auto" /> : "Entrar"}
              </button>
            </form>

            <p className="text-sm text-center text-gray-500 mt-6">
              Ao continuar, você concorda com os{" "}
              <button onClick={() => setShowTerms(true)} className="underline text-blue-600 hover:text-blue-800">
                Termos de Uso
              </button>{" "}
              e a{" "}
              <button onClick={() => setShowPrivacy(true)} className="underline text-blue-600 hover:text-blue-800">
                Política de Privacidade
              </button>
              .
            </p>


            <div className="flex justify-between text-sm text-blue-600 underline mt-6">
              <div className="flex items-center gap-3 mt-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                  className="w-5 h-5 border-2 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white transition-colors duration-200"
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm font-medium text-gray-700 leading-none select-none"
                >
                  Lembrar-me
                </label>
              </div>
            </div>

          </div>
        </div>
      </div>
      {showTerms && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="relative w-[95%] max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-xl p-6 sm:p-8 animate-fade-in">
              <button
                onClick={() => setShowTerms(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#294BB6] mb-6 text-center">Termos de Uso</h2>

              <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold text-[#294BB6] mb-2">1. Aceitação dos Termos</h3>
                  <p>
                    Ao utilizar a plataforma Bora Impactar, você concorda com os presentes Termos de Uso. Se não estiver de acordo, não utilize nossos serviços.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-[#294BB6] mb-2">2. Uso Permitido</h3>
                  <p>
                    A plataforma destina-se exclusivamente ao uso legítimo por ONGs e usuários interessados em causas sociais. É proibido qualquer uso indevido, ofensivo ou que infrinja leis.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-[#294BB6] mb-2">3. Responsabilidades do Usuário</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Manter suas informações atualizadas.</li>
                    <li>Não compartilhar sua conta com terceiros.</li>
                    <li>Respeitar outras ONGs e usuários da plataforma.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-[#294BB6] mb-2">4. Atualizações dos Termos</h3>
                  <p>
                    Os termos podem ser modificados a qualquer momento. O uso contínuo da plataforma implica concordância com os novos termos.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {showPrivacy && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="relative w-[95%] max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-xl p-6 sm:p-8 animate-fade-in">
              <button
                onClick={() => setShowPrivacy(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#294BB6] mb-6 text-center">Política de Privacidade</h2>

              <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold text-[#294BB6] mb-2">1. Coleta de Dados</h3>
                  <p>
                    Coletamos informações como nome, e-mail, telefone e dados da ONG para fins de autenticação e personalização da experiência.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-[#294BB6] mb-2">2. Armazenamento e Segurança</h3>
                  <p>
                    Os dados são armazenados com segurança e protegidos por tecnologias modernas. Seus dados não serão vendidos nem compartilhados sem sua permissão.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-[#294BB6] mb-2">3. Compartilhamento</h3>
                  <p>
                    Compartilhamos dados apenas com serviços essenciais à operação da plataforma, como provedores de hospedagem e autenticação, sempre com proteção contratual.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-[#294BB6] mb-2">4. Seus Direitos</h3>
                  <p>
                    Você pode solicitar acesso, correção ou exclusão de seus dados a qualquer momento. Basta entrar em contato com nossa equipe de suporte.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

    </div>
  );
}
