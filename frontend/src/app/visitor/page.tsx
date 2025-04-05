"use client";
import { API_BASE_URL } from "@/config/api"
import { useState, useEffect, Suspense } from "react";
import { SearchParamsWrapper } from "@/components/ui/search-params-wrapper";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import shareButton from "../../assets/share.svg";
import Link from "next/link";
import { Search } from "lucide-react";

import VisitorGallery from "@/components/ui/visitorGallery";
import VisitorBalance from "@/components/ui/visitorBalance";
import VisitorDocuments from "@/components/ui/visitorDocuments";

interface Slide {
  id: number;
  name: string;
  type: string;
  colected: number;
  spent: number;
  goal: number;
  aws_url: string;
}

export default function VisitorPage() {
  return (
    <Suspense fallback={<p className="p-4">Carregando...</p>}>
      <SearchParamsWrapper>
        {(searchParams) => {
          const ngoId = searchParams.get("ngo_id");

          const [slides, setSlides] = useState<Slide[]>([]);
          const [activeTab, setActiveTab] = useState("gallery");
          const [loading, setLoading] = useState(true);
          const [searchTerm, setSearchTerm] = useState("");
          const [hoveredSlide, setHoveredSlide] = useState<number | null>(null);
          const [lastUpdated, setLastUpdated] = useState<string | null>(null);
          const [ngoName, setNgoName] = useState("");

          useEffect(() => {
            if (!ngoId) return;

            fetch(`${API_BASE_URL}/logs/last/${ngoId}`)
              .then((res) => res.json())
              .then((data) => {
                const timestamp = data?.timestamp;
                if (timestamp) {
                  const date = new Date(timestamp);
                  const formatted = date.toLocaleDateString("pt-BR");
                  setLastUpdated(formatted);
                }
              })
              .catch((err) => {
                console.error("Erro ao buscar última atualização:", err);
              });
          }, [ngoId]);

          useEffect(() => {
            if (ngoId) {
              fetch(`${API_BASE_URL}/ongs/${ngoId}/actions`)
                .then((res) => res.json())
                .then((data) => {
                  setSlides(data);
                  setLoading(false);
                })
                .catch((error) => {
                  console.log("Erro ao buscar ações:", error);
                  setLoading(false);
                });
            }
          }, [ngoId]);

          useEffect(() => {
            if (ngoId) {
              fetch(`${API_BASE_URL}/ongs/${ngoId}`)
                .then((res) => res.json())
                .then((data) => setNgoName(data.ngo.name))
                .catch((err) => console.error("Erro ao buscar ONG:", err));
            }
          }, [ngoId]);

          const filteredSlides = slides.filter((slide) =>
            slide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slide.type.toLowerCase().includes(searchTerm.toLowerCase())
          );

          return (
            <main className="relative flex flex-col items-center min-h-screen py-10">
              <h1 title={ngoName} className="text-4xl text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis w-[90%] m-auto max-xl:text-3xl max-sm:text-xl mt-20">
                {ngoName}
              </h1>

              {lastUpdated && (
                <div className="absolute top-6 right-10 text-gray-600 text-lg max-sm:p-2">
                  Dados atualizados pela última vez em: <strong>{lastUpdated}</strong>
                </div>
              )}
              <h1 className="text-center text-4xl font-bold text-[#2E4049] mt-20">
                Ações
              </h1>

              <div className="relative w-full max-w-xl mx-auto mt-10 px-4">
                <Search className="absolute left-6 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou causa da ação"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 pl-12 border border-gray-300 rounded-[16px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              {!loading && (
                <>
                  {searchTerm && filteredSlides.length === 0 ? (
                    <div className="mt-10 text-red-600">ação não encontrada</div>
                  ) : filteredSlides.length > 0 ? (
                    <Carousel opts={{ align: "start" }} className="w-[100%] mt-16 p-4 max-w-[3000px]">
                      <CarouselContent>
                        {filteredSlides.slice().reverse().map((slide, index) => (
                          <CarouselItem
                            key={index}
                            className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 w-full border-none border-t shadow-none"
                          >
                            <div>
                              <div className="relative w-full">
                                <div className="relative w-full h-[180px] overflow-hidden rounded-t-[16px]">
                                  <Image
                                    src={slide.aws_url}
                                    alt="Imagem da ação"
                                    layout="fill"
                                    objectFit="cover"
                                    className="absolute top-0 left-0 w-full h-full"
                                  />
                                </div>

                                <div className="relative z-10 -mt-12 bg-white p-3 py-6 border border-gray-200 rounded-[16px] shadow-lg w-[90%] mx-auto transition-[width] duration-300 ease-in-out hover:w-[100%] hover:shadow-2xl">
                                  <p
                                    title={slide.type}
                                    className="inline-block max-w-32 text-xs font-semibold text-[#0056D2] bg-[#E9F2FF] px-3 py-1 rounded-[8px] uppercase whitespace-nowrap overflow-hidden text-ellipsis"
                                  >
                                    {slide.type}
                                  </p>
                                  <h2
                                    title={slide.name}
                                    className="text-lg font-semibold mt-3 text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis"
                                  >
                                    {slide.name}
                                  </h2>

                                  <div className="relative w-full mt-3">
                                    <div
                                      className="relative w-full h-2 rounded-full bg-gray-300 overflow-hidden transition-all duration-300  hover:bg-gray-400"
                                      onMouseEnter={() => setHoveredSlide(slide.id)}
                                      onMouseLeave={() => setHoveredSlide(null)}
                                    >
                                      <div
                                        className="h-full bg-[#2BAFF150] transition-all duration-300"
                                        style={{
                                          width: `${Math.min(
                                            (slide.colected / slide.goal) * 100,
                                            100
                                          ).toFixed(2)}%`,
                                        }}
                                      />
                                    </div>
                                    <p className="text-sm text-center text-gray-500 mt-2 mb-1 italic">
                                      Representa o progresso da arrecadação
                                    </p>
                                    {hoveredSlide === slide.id && (
                                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 bg-white/90 backdrop-blur-sm text-gray-800 shadow-xl rounded-2xl px-5 py-4 w-[240px] text-sm">
                                        {slide.colected >= slide.goal ? (
                                          <p className="text-center font-semibold text-green-600">
                                            🎉 Meta de Arrecadação Alcançada!
                                          </p>
                                        ) : (
                                          <p className="text-center font-semibold text-blue-600">
                                            🎯{" "}
                                            {(
                                              (slide.colected / slide.goal) *
                                              100
                                            ).toFixed(2)}
                                            % da Meta Arrecadada
                                          </p>
                                        )}
                                        <div className="mt-2 space-y-1">
                                          <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">
                                              🔹 Arrecadado:
                                            </span>
                                            <span className="font-semibold">
                                              R${" "}
                                              {new Intl.NumberFormat("pt-BR", {
                                                notation: "compact",
                                                compactDisplay: "short",
                                              }).format(slide.colected)}
                                            </span>
                                          </p>
                                          <p className="flex justify-between text-red-500">
                                            <span className="font-medium">
                                              📉 Gasto:
                                            </span>
                                            <span className="font-semibold">
                                              R${" "}
                                              {new Intl.NumberFormat("pt-BR", {
                                                notation: "compact",
                                                compactDisplay: "short",
                                              }).format(slide.spent)}
                                            </span>
                                          </p>
                                          <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">
                                              🏆 Meta:
                                            </span>
                                            <span className="font-semibold">
                                              R${" "}
                                              {new Intl.NumberFormat("pt-BR", {
                                                notation: "compact",
                                                compactDisplay: "short",
                                              }).format(slide.goal)}
                                            </span>
                                          </p>
                                        </div>
                                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-4 h-4 bg-white rotate-45 border border-gray-300 -mt-1" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex justify-between text-sm font-semibold text-gray-700 mt-4">
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">
                                        Arrecadado
                                      </p>
                                      <p className="text-lg font-bold whitespace-nowrap">
                                        R${" "}
                                        {new Intl.NumberFormat("pt-BR", {
                                          notation: "compact",
                                          compactDisplay: "short",
                                        }).format(slide.colected)}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">Gasto</p>
                                      <p className="text-lg font-bold text-red-500 whitespace-nowrap">
                                        R${" "}
                                        {new Intl.NumberFormat("pt-BR", {
                                          notation: "compact",
                                          compactDisplay: "short",
                                        }).format(slide.spent)}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">Meta</p>
                                      <p className="text-lg font-bold whitespace-nowrap">
                                        R${" "}
                                        {new Intl.NumberFormat("pt-BR", {
                                          notation: "compact",
                                          compactDisplay: "short",
                                        }).format(slide.goal)}
                                      </p>
                                    </div>
                                  </div>
                                  <hr className="mt-4" />
                                  <div className="mt-5 flex justify-between items-center">
                                    <Button
                                      id="acao"
                                      className="w-4/5 h-full font-bold rounded-[34px] bg-[#294BB6] text-white border-solid border-[#2E4049] border hover:text-[#294BB6] hover:bg-white transition-all"
                                      asChild
                                    >
                                      <Link href={`/actions?action_id=${slide.id}`}>
                                        TRANSPARÊNCIA
                                      </Link>
                                    </Button>
                                    <Link
                                      href={`https://api.whatsapp.com/send?text=${
                                        typeof window !== "undefined"
                                          ? window.location.origin
                                          : ""
                                      }/actions?action_id=${slide.id}`}
                                      target="_blank"
                                      className="w-2/12 h-full"
                                    >
                                      <div className="w-full rounded-full h-full bg-[#F2F4F7] flex justify-center cursor-pointer">
                                        <Image
                                          className="w-6 h-10"
                                          src={shareButton}
                                          alt="share"
                                        />
                                      </div>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <div className="flex justify-center mt-16 gap-4 pb-4 w-full">
                        <CarouselPrevious />
                        <CarouselNext />
                      </div>
                    </Carousel>
                  ) : (
                    <div className="mt-10 text-red-600">Nenhuma ação criada ainda</div>
                  )}
                </>
              )}

              <div className="w-full flex justify-center border-b border-gray-300 mt-6">
                <div className="flex space-x-6">
                  {["gallery", "balance", "documents"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium transition-all ${
                        activeTab === tab
                          ? "text-[#294BB6] border-b-2 border-[#294BB6]"
                          : "text-gray-500 hover:text-[#2E4049]"
                      }`}
                    >
                      {tab === "gallery" && "Galeria"}
                      {tab === "balance" && "Balanço de Gastos"}
                      {tab === "documents" && "Documentos"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full mt-6">
                {activeTab === "gallery" && <VisitorGallery />}
                {activeTab === "balance" && <VisitorBalance />}
                {activeTab === "documents" && <VisitorDocuments />}
              </div>
            </main>
          );
        }}
      </SearchParamsWrapper>
    </Suspense>
  );
}
