import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import Image from "next/image";
import prefeituraLogo from "../../assets/prefeitura.svg";
import { Progress } from "@/components/ui/progress"



export default function Main() {
  return (
    <main className="flex flex-col items-center">
      <h1 className="text-center text-5xl font-bold text-[#2E4049] mt-20">Transparência</h1>
      <h1 className="text-center text-4xl font-bold text-[#2E4049] mt-20">Ações</h1>
      
      <Carousel
        opts={{
          align: "start",
        }}
        className="max-w-7xl mt-16"
      >
        <CarouselContent>
          {Array.from({ length: 7 }).map((_, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-4 bg-gray-800">
                    <span className="text-3xl font-semibold">
                      <Image src={prefeituraLogo} alt="Prefeitura do Recife" />
                    </span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Container dos botões */}
        <div className="flex justify-center gap-4 mt-8 pb-4 w-full">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
      
      <Progress 
        className="w-80 mb-20 mt-20 bg-[#EAECF0]"
        indicatorClass="bg[#2BAFF1]"
        value={62}
      />

      <div className="p-4 w-80 h-64 border-solid border border-white rounded shadow-[0_1px_4px_1px_rgba(16,24,40,0.1)] mb-8">
          <div className=""><p className="text-sm font-medium text-[#294BB6] px-2 py-1 bg-[#2BAFF1] bg-opacity-20 inline rounded ">SAÚDE</p></div>
          <div>Deseslove</div>
          <div>    
            <Progress 
            className="w-full bg-[#EAECF0]"
            indicatorClass="bg-[#2BAFF1]"
            value={62}/>
          </div>
        </div>

    </main>
  )
}
