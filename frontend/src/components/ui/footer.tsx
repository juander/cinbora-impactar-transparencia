'use client';

import Image from "next/image";
import prefeituraLogo from "../../assets/prefeitura.svg";

export default function Footer() {
  return (
    <footer className="bg-[#00B3FF] text-white py-28 px-20 animate-slide-up">
      <div className="max-w-[1728px] mx-auto flex flex-col md:flex-row items-start gap-20">
        {/* Agrupando todas as colunas próximas ao lado esquerdo */}
        <div className="flex flex-col md:flex-row items-start gap-24">
          
          {/* Coluna 1 - Logo e Descrição */}
          <div className="flex flex-col items-start gap-8 transform transition-transform duration-300 hover:scale-105">
            <Image src={prefeituraLogo} alt="Prefeitura do Recife" width={180} height={72} />
            <h3 className="font-bold text-2xl">Recife do Bem</h3>
            <p className="text-lg">A união que transforma vidas</p>
          </div>

          {/* Coluna 2 - Navegação */}
          <div className="flex flex-col items-start gap-8">
            <h3 className="font-bold text-2xl">Portal</h3>
            <ul className="space-y-4">
              {["Início", "ONGs", "Transparência"].map((item, index) => (
                <li
                  key={index}
                  className="text-lg transition-transform duration-300 hover:scale-110 hover:text-[#d4dbf0] cursor-pointer"
                >
                  <a href="#" className="hover:underline">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3 - Contato */}
          <div className="flex flex-col items-start gap-8">
            <h3 className="font-bold text-2xl">Contato</h3>
            <p className="text-lg transition-transform duration-300 hover:scale-110">
              Email: contato@recife.pe.gov.br
            </p>
            <p className="text-lg transition-transform duration-300 hover:scale-110">
              Telefone: (81) 1234-5678
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
