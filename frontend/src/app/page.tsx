"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import fotoInicial from "../assets/starter.svg";
import boraImpactar from "../assets/bora_impactar.svg";
import instagramIcon from "../assets/insta_icon.svg";
import { API_BASE_URL } from "@/config/api"
import dateIcon from "../assets/date_icon.svg";
import phoneIcon from "../assets/phone_icon.svg";
import shareButton from "../assets/share.svg";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ModalPortal from "@/components/ui/modalPortal";
import { Search } from "lucide-react";
import TypedHeader from "@/components/ui/typedHeader";

interface Ong {
  id: number;
  name: string;
  description: string;
  start_year?: number;
  contact_phone?: string;
  instagram_link?: string;
}

export default function Ongs() {
  const [ongs, setOngs] = useState<Ong[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOng, setSelectedOng] = useState<Ong | null>(null);

  const openModal = (ong: Ong) => setSelectedOng(ong);
  const closeModal = () => setSelectedOng(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/ongs`)
      .then((res) => res.json())
      .then((data) => {
        const responseData = (Array.isArray(data) ? data : data.ongs || data.data || []) as Ong[];
        setOngs(responseData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching ongs:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="flex mt-10 justify-between">
        <div className="flex flex-col w-3/5 text-[#294BB6] p-12 max-xl:p-3">
          <h1 className="font-semibold text-5xl max-lg:text-4xl max-md:text-3xl max-sm:text-xl">
            Portal da Transparência
          </h1>
          <TypedHeader />
        </div>
        <div className="flex flex-col">
          <Image
            className="self-center mb-4 max-lg:w-48 max-md:w-32 max-sm:w-24"
            src={boraImpactar}
            alt="logo do projeto bora impactar"
          />
          <Image
            className="rounded-l-full border-dashed border-r-0 border-4 border-[#007AFF] max-lg:w-96 max-md:w-72 max-sm:w-48"
            src={fotoInicial}
            alt="foto de criança"
          />
        </div>
      </div>

      <div className="text-center mb-12 mt-32">
        <span className="inline-block px-4 py-2 bg-[#009FE350] text-[#294BB6] text-lg font-semibold rounded-full">
          ONGs em Destaque
        </span>
        <p className="mt-4 text-gray-700 text-lg">Selecione uma ONG abaixo para conhecer seu trabalho.</p>
      </div>

      <div className="relative w-full max-w-2xl mx-auto mb-20 px-4">
        <input
          type="text"
          placeholder="Buscar ONG..."
          className="w-full py-3 pl-10 pr-28 rounded-full text-gray-700 placeholder-gray-400 bg-gradient-to-r from-white via-white to-[#E0F2FF] shadow-md focus:outline-none text-sm sm:text-base"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        <div className="absolute right-[25px] top-0 bottom-0 w-20 sm:w-24 rounded-r-full overflow-hidden">
          <Image
            src={boraImpactar}
            alt="Logo Bora Impactar"
            className="h-full w-full object-contain p-1"
          />
        </div>
      </div>

      {!isLoading && ongs.length === 0 && (
        <div className="w-full text-center mt-4 mb-20 text-red-600">Nenhuma ONG encontrada.</div>
      )}

      {ongs.length > 0 && (
        <div className="max-w-7xl grid grid-cols-3 m-auto mb-16 gap-6 justify-items-center max-xl:grid-cols-2 max-lg:grid-cols-1 overflow-visible">
          {ongs
            .filter((ong) =>
              ong.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((ong) => (
              <div
                key={ong.id}
                className="w-96 flex flex-col p-6 bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 max-sm:w-80 relative"
              >
                <h1 title={ong.name} className="font-extrabold text-xl text-[#2E4049] mb-3 line-clamp-5 overflow-hidden">{ong.name}</h1>
                <div className="mb-4 text-sm text-gray-700 h-32 overflow-hidden text-ellipsis rexlative">
                  {ong.description.length > 180 ? (
                    <>
                      {ong.description.slice(0, 180)}...
                      <button
                        onClick={() => openModal(ong)}
                        className="text-[#294BB6] underline font-medium hover:text-[#1d346e] block mt-1"
                      >
                        Ler mais
                      </button>
                    </>
                  ) : (
                    ong.description
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                  <Image src={dateIcon} alt="data" />
                  <span className="truncate">Ano: {ong.start_year || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                  <Image src={phoneIcon} alt="telefone" />
                  <span className="truncate">{ong.contact_phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                  <Image src={instagramIcon} alt="instagram" />
                  <a
                    href={
                      ong.instagram_link?.startsWith("http")
                        ? ong.instagram_link
                        : `https://${ong.instagram_link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#294BB6] truncate"
                  >
                    {ong.instagram_link || "N/A"}
                  </a>
                </div>
                <div className="flex justify-between items-center gap-2 mt-auto">
                  <Link href={`/visitor?ngo_id=${ong.id}`} className="flex-1">
                    <Button className="w-full font-bold text-sm rounded-full bg-[#294BB6] text-white border border-[#2E4049] hover:text-[#294BB6] hover:bg-white hover:border-[#294BB6] transition-all">
                      TRANSPARÊNCIA
                    </Button>
                  </Link>

                  <Link
                    href={`https://api.whatsapp.com/send?text=${typeof window !== "undefined" ? window.location.origin : ""}/actions?action_id=${ong.id}`}
                    target="_blank"
                    className="w-12 h-12"
                  >
                    <div className="w-full h-full rounded-full bg-[#F2F4F7] flex justify-center items-center border border-[#c3d0e6] hover:bg-[#d6deec] transition-all shadow-sm">
                      <Image className="w-5 h-5" src={shareButton} alt="Compartilhar no WhatsApp" />
                    </div>
                  </Link>
                </div>
              </div>
            ))}
        </div>
      )}

      {selectedOng && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-[90%] max-w-xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-[#294BB6] mb-4">
                {selectedOng.name}
              </h2>
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                {selectedOng.description}
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Image src={dateIcon} alt="Data de início" />
                  Ano de fundação: {selectedOng.start_year || "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <Image src={phoneIcon} alt="Contato" />
                  Contato: {selectedOng.contact_phone || "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <Image src={instagramIcon} alt="Instagram" />
                  Instagram:{" "}
                  {selectedOng.instagram_link ? (
                    <a
                      href={
                        selectedOng.instagram_link.startsWith("http")
                          ? selectedOng.instagram_link
                          : `https://${selectedOng.instagram_link}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[#294BB6]"
                    >
                      {selectedOng.instagram_link}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
