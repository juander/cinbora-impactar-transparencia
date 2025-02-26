import { CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import shareButton from "../../assets/share.svg"
import capa from "../../assets/capa.svg"

export default function Main() {
  const slides = [
    {
      category: "SAÚDE",
      title: "Desenvolvimento em Saúde",
      percentage: 62,
      meta: 2098,
      arrecadado: 1000,
      background: capa
    },
    {
      category: "EDUCAÇÃO",
      title: "Projetos Educacionais",
      percentage: 75,
      meta: 3000,
      arrecadado: 1500,
      background: capa
    },
    {
      category: "INFRA",
      title: "Infraestrutura Urbana",
      percentage: 50,
      meta: 5000,
      arrecadado: 2730,
      background: capa
    },
    {
      category: "ECONOMIA",
      title: "Iniciativas Econômicas",
      percentage: 80,
      meta: 4000,
      arrecadado: 2000,
      background: capa
    },
    {
      category: "AMBIENTE",
      title: "Projetos Ambientais",
      percentage: 40,
      meta: 3500,
      arrecadado: 1000,
      background: capa
    },
    {
      category: "TECNOLOGIA",
      title: "Inovação Tecnológica",
      percentage: 90,
      meta: 6000,
      arrecadado: 3000,
      background: capa
    },
    {
      category: "CULTURA",
      title: "Eventos Culturais",
      percentage: 70,
      meta: 2500,
      arrecadado: 800,
      background: capa
    },
  ]

  return (
    <main className="flex flex-col items-center">
      <h1 className="text-center text-5xl font-bold text-[#2E4049] mt-20">
        Transparência
      </h1>
      <h1 className="text-center text-4xl font-bold text-[#2E4049] mt-20">
        Ações
      </h1>

      <Carousel opts={{ align: "start" }} className="max-w-full p-4 mt-16">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem
              key={index}
              className="md:basis-1/2 lg:basis-1/4 border-none shadow-none"
            >
              <div className="p-1">
                <CardContent className="relative p-4">
                  <div
                    className="absolute inset-0 bg-no-repeat bg-top"
                    style={{ backgroundImage: `url(${slide.background.src})` }}
                  />
                  <div className="relative z-10 bg-white mt-32">
                    <div className="flex flex-col justify-between p-4 w-full h-64 border-solid border border-white rounded shadow-[0_1px_4px_1px_rgba(16,24,40,0.1)]">
                      <div>
                        <p className="inline text-sm font-medium text-[#294BB6] px-2 py-1 bg-[#2BAFF1] bg-opacity-20 rounded">
                          {slide.category}
                        </p>
                      </div>
                      <div className="font-semibold">
                        {slide.title}
                      </div>
                      <div>
                        <Progress
                          className="w-full bg-[#EAECF0]"
                          indicatorClass="bg-[#2BAFF150]"
                          value={slide.percentage}
                        />
                      </div>
                      <div className="flex justify-between font-semibold">
                        <div className="flex flex-col">
                          <p className="text-xs font-light text-gray-600">Meta</p>
                          <p>R${slide.meta}</p>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs font-light text-gray-600">Arrecadado</p>
                          <p>R${slide.arrecadado}</p>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs font-light text-gray-600">Restante</p>
                          <p>R${slide.meta - slide.arrecadado}</p>
                        </div>
                      </div>
                      <hr className="border-solide border borde-gray-500" />
                      <div className="h-12 flex justify-between">
                        <Button className="w-4/5 h-full font-bold rounded-[34px] bg-[#294BB6] text-white border-solid border-[#2E4049] border">
                          TRANSPARÊNCIA
                        </Button>
                        <div className="w-2/12 rounded-full bg-[#F2F4F7] flex justify-center items-center">
                          <Image className="w-6 h-6" src={shareButton} alt="share" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="flex justify-center mt-4 gap-4 pb-4 w-full">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </main>
  )
}
