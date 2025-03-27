"use client";
import { useState, useEffect, Suspense } from "react";
import { SearchParamsWrapper } from "@/components/search-params-wrapper";
import { CardContent } from "@/components/ui/card";
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

// Define interface for slide data
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

          useEffect(() => {
            if (ngoId) {
              fetch(`http://127.0.0.1:3333/ongs/${ngoId}/actions`)
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

          const filteredSlides = slides.filter((slide) =>
            slide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slide.type.toLowerCase().includes(searchTerm.toLowerCase())
          );

          return (
            <main className="flex flex-col items-center">
              <h1 className="text-center text-5xl font-bold text-[#2E4049] mt-20">
                Transparência
              </h1>
              <h1 className="text-center text-4xl font-bold text-[#2E4049] mt-20">
                Ações
              </h1>
              <div className="relative w-full max-w-md mx-auto mt-6 px-4">
                <Search className="absolute left-6 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou meta"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 pl-12 border border-gray-300 rounded-[16px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
              {loading ? null : (
                searchTerm && filteredSlides.length === 0 ? (
                  <div className="mt-10 text-red-600">
                    ação não encontrada
                  </div>
                ) : (
                  slides.length > 0 ? (
                    <Carousel opts={{ align: "start" }} className="w-full p-4 mt-16">
                      <CarouselContent>
                        {filteredSlides.slice().reverse().map((slide, index) => (
                          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 border-none shadow-none">
                            <CardContent className="relative p-4 min-w-72">
                              <div
                                className="absolute inset-0 bg-no-repeat bg-center bg-cover max-h-48"
                                style={{ backgroundImage: `url(${slide.aws_url})` }}
                              />
                              <div className="relative z-10 bg-white mt-32 w-full">
                                <div className="flex flex-col justify-between p-4 w-full h-64 border-solid border border-white rounded shadow-[0_1px_4px_1px_rgba(16,24,40,0.1)]">
                                  <div>
                                    <p title={slide.type} className="inline-block text-sm font-semibold text-[#294BB6] px-2 py-1 bg-[#2BAFF1] bg-opacity-20 rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-[95%]">
                                      {slide.type}
                                    </p>
                                  </div>
                                  <div title={slide.name} className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{slide.name}</div>
                                  <div className="relative w-full mt-3">
                                    <div
                                      className="relative w-full h-2 rounded-full bg-gray-300 overflow-hidden transition-all duration-300 hover:bg-gray-400"
                                      onMouseEnter={() => setHoveredSlide(slide.id)}
                                      onMouseLeave={() => setHoveredSlide(null)}
                                    >
                                      <div
                                        className="h-full bg-[#2BAFF150] transition-all duration-300"
                                        style={{ width: `${Math.min((slide.spent / slide.goal) * 100, 100).toFixed(2)}%` }}
                                      />
                                    </div>
                                    {hoveredSlide === slide.id && (
                                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 bg-white/90 backdrop-blur-sm text-gray-800 shadow-xl rounded-2xl px-5 py-4 w-[240px] text-sm">
                                        {slide.spent >= slide.goal ? (
                                          <p className="text-center font-semibold text-green-600">🎉 Meta Concluída!</p>
                                        ) : (
                                        <p className="text-center font-semibold text-blue-600">
                                            🎯 {(slide.spent / slide.goal * 100).toFixed(2)}% da Meta Atingida
                                        </p>
                                        )}
                                        <div className="mt-2 space-y-1">
                                          <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">🔹 Arrecadado:</span>
                                            <span className="font-semibold">
                                              R$ {new Intl.NumberFormat("pt-BR", {
                                                notation: "compact",
                                                compactDisplay: "short",
                                              }).format(slide.colected)}
                                            </span>
                                          </p>
                                          <p className="flex justify-between text-red-500">
                                            <span className="font-medium">📉 Gasto:</span>
                                            <span className="font-semibold">
                                              R$ {new Intl.NumberFormat("pt-BR", {
                                                notation: "compact",
                                                compactDisplay: "short",
                                              }).format(slide.spent)}
                                            </span>
                                          </p>
                                          <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">🏆 Meta:</span>
                                            <span className="font-semibold">
                                              R$ {new Intl.NumberFormat("pt-BR", {
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
                                  <div className="flex justify-between font-semibold">
                                    <div className="flex flex-col">
                                      <p className="text-xs font-light text-gray-600">Arrecadado</p>
                                      <p>
                                        R$ {new Intl.NumberFormat("pt-BR", {
                                          notation: "compact",
                                          compactDisplay: "short",
                                        }).format(slide.colected)}
                                      </p>
                                    </div>
                                    <div className="flex flex-col">
                                      <p className="text-xs font-light text-gray-600">Gasto</p>
                                      <p className="text-red-500">
                                        R$ {new Intl.NumberFormat("pt-BR", {
                                          notation: "compact",
                                          compactDisplay: "short",
                                        }).format(slide.spent)}
                                      </p>
                                    </div>
                                    <div className="flex flex-col">
                                      <p className="text-xs font-light text-gray-600">Meta</p>
                                      <p>
                                        R$ {new Intl.NumberFormat("pt-BR", {
                                          notation: "compact",
                                          compactDisplay: "short",
                                        }).format(slide.goal)}
                                      </p>
                                    </div>
                                  </div>
                                  <hr className="border-solide border borde-gray-500" />
                                  <div className="flex justify-between items-center h-10">
                                    <Link href={`/actions?action_id=${slide.id}`} className="w-4/5 h-full font-bold rounded-[34px] bg-[#294BB6] text-white border-solid border-[#2E4049] border">
                                      <Button className="w-full h-full font-bold rounded-[34px] bg-[#294BB6] text-white border-solid border-[#2E4049] border hover:text-[#294BB6] hover:bg-white">
                                        TRANSPARÊNCIA
                                      </Button>
                                    </Link>
                                    <Link href={`https://api.whatsapp.com/send?text=${typeof window !== 'undefined' ? window.location.origin : ''}/actions?action_id=${slide.id}`} target="_blank" className="w-2/12 h-full">
                                      <div className="w-full rounded-full h-full bg-[#F2F4F7] flex justify-center items-center">
                                        <Image className="w-6 h-6" src={shareButton} alt="share" />
                                      </div>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <div className="flex justify-center mt-4 gap-4 pb-4 w-full">
                        <CarouselPrevious />
                        <CarouselNext />
                      </div>
                    </Carousel>
                  ) : (
                    <div className="mt-10 text-red-600">
                      Nenhuma ação criada ainda
                    </div>
                  )
                )
              )}
              <div className="w-full flex justify-center border-b border-gray-300 mt-6">
                <div className="flex space-x-6">
                  {["gallery", "balance", "documents"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === tab ? "text-[#294BB6] border-b-2 border-[#294BB6]" : "text-gray-500 hover:text-[#2E4049]"}`}
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