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

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"



export default function Main (){
    return (
        <main className="flex flex-col items-center">
            <h1 className="text-center text-5xl font-bold text-[#2E4049] mt-20">Transparência</h1>
            <h1 className="text-center text-4xl font-bold text-[#2E4049] mt-20">Ações</h1>
            <Carousel
                opts={{
                    align: "start",
                }}
                className="max-w-7xl mt-16 bg-gray-800">

                <CarouselContent>
                    {Array.from({ length: 7 }).map((_, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                        <div className="p-1">
                        <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-4">
                            <span className="text-3xl font-semibold"><Image src={prefeituraLogo} alt="Prefeitura do Recife"/></span>
                            </CardContent>
                        </Card>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
                
            </Carousel>
            
            <ResizablePanelGroup
              direction="horizontal"
              className="max-w-md rounded-lg border md:min-w-[450px] mt-20"
            >
              <ResizablePanel defaultSize={50}>
                <div className="flex h-[200px] items-center justify-center p-6">
                  <span className="font-semibold"><Image className="bg-blue-800" src={prefeituraLogo} alt="Prefeitura do Recife"/></span>
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={50}>
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={25}>
                    <div className="flex h-full items-center justify-center p-6">
                      <span className="font-semibold">Two</span>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={75}>
                    <div className="flex h-full items-center justify-center p-6">
                      <span className="font-semibold">Three</span>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
            
            
            
        </main>
    );
}