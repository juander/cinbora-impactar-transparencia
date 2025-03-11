"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import fotoInicial from "../assets/starter.svg";
import boraImpactar from "../assets/bora_impactar.svg";
import instagramIcon from "../assets/insta_icon.svg";
import dateIcon from "../assets/date_icon.svg";
import phoneIcon from "../assets/phone_icon.svg";
import shareButton from "../assets/share.svg";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


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

  useEffect(() => {
    fetch("http://127.0.0.1:3333/ongs")
      .then((res) => res.json())
      .then((data) => {
        const responseData = (Array.isArray(data) ? data : data.ongs || data.data) as Ong[];
        setOngs(responseData);
      })
      .catch((error) => console.error("Error fetching ongs:", error));
  }, []);

  return (
    <div>
      <div className="flex mt-10">
        <div className="flex flex-col w-3/5 text-[#294BB6] p-12">
          <h1 className="font-semibold text-5xl">Portal da Transparência</h1>
          <h2 className="font-semibold text-3xl max-w-96 mt-auto">
            Transparência gera confiança, acompanhe cada passo das nossas atuações.
          </h2>
        </div>
        <div className="flex flex-col items-end">
          <Image
            className="self-center mb-4"
            src={boraImpactar}
            alt="logo do projeto bora impactar"
          />
          <Image
            className="rounded-l-full border-dashed border-r-0 border-4 border-[#007AFF]"
            src={fotoInicial}
            alt="foto de criança"
          />
        </div>
      </div>
      <p className="mx-auto mt-24 text-center max-w-24 p-2 bg-[#009FE350] text-[#294BB6] mb-4">
        Ongs
      </p>
      <p className="text-center mt-4 mb-4">
        Selecione sua ONG de interesse abaixo
      </p>

      <div className="w-full max-w-md m-auto mb-12">
        <Input
          type="text"
          placeholder="Search..."
          className="w-full radius-4"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="max-w-7xl grid grid-cols-3 m-auto mb-16 gap-2 justify-items-center max-h-[560px] overflow-y-scroll max-xl:grid">
        {ongs
          .filter((ong) =>
            ong.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((ong) => (
            <div key={ong.id} className="w-96 flex flex-col p-2 mb-4 shadow-[0_1px_4px_1px_rgba(16,24,40,0.1)]">
              <h1 className="font-bold mb-2">{ong.name}</h1>
              <p className="mb-2 h-48 pr-4 overflow-scroll">{ong.description}</p>
              <div className="flex mb-2">
                <Image src={dateIcon} alt="data" />
                <p className="ml-2">Ano: {ong.start_year || "N/A"}</p>
              </div>
              <div className="flex mb-2">
                <Image src={phoneIcon} alt="telefone" />
                <p className="ml-2">Telefone: {ong.contact_phone || "N/A"}</p>
              </div>
              <div className="flex mb-2">
                <Image src={instagramIcon} alt="instagram" />
                <p className="ml-2">Instagram: {ong.instagram_link || "N/A"}</p>
              </div>
              <div className="h-12 flex justify-between">
                <Link className="w-4/5 h-full font-bold rounded-[34px] bg-[#294BB6] text-white border-solid border-[#2E4049] border" href="/ongs">
                  <Button className="w-full h-full font-bold rounded-[34px] bg-[#294BB6] text-white border-solid border-[#2E4049] border hover:text-[#294BB6] hover:bg-white">
                    TRANSPARÊNCIA
                  </Button>
                </Link>
                <div className="w-2/12 rounded-full bg-[#F2F4F7] flex justify-center items-center">
                  <Image className="w-6 h-6" src={shareButton} alt="share" />
                </div>
              </div>   
              
              
            </div>
          ))}
      </div>
    </div>
  );
}