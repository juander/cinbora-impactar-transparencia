"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import arrowDown from "../../assets/downArrow.svg";
import download from "../../assets/Documents.svg";

interface FileObject {
  id: string;
  name: string;
  aws_url?: string;
}

const AccordionSection = ({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");

  const updateHeight = () => {
    if (ref.current) {
      setHeight(`${ref.current.scrollHeight}px`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setTimeout(updateHeight, 100);
      });
    } else {
      setHeight("0px");
    }
  }, [isOpen, children]);

  return (
    <div
      style={{ maxHeight: height, marginBottom: isOpen ? "2rem" : "0px" }}
      className="transition-all duration-500 ease-in-out overflow-hidden"
    >
      <div ref={ref}>{children}</div>
    </div>
  );
};

export default function VisitorDocuments() {
  const searchParams = useSearchParams();
  const ngoId = searchParams.get("ngo_id");
  const [others, setOthers] = useState<FileObject[]>([]);
  const [taxInvoices, setTaxInvoices] = useState<FileObject[]>([]);
  const [reports, setReports] = useState<FileObject[]>([]);
  const [isNotasFiscaisOpen, setIsNotasFiscaisOpen] = useState(false);
  const [isRelatoriosOpen, setIsRelatoriosOpen] = useState(false);
  const [isOutrosOpen, setIsOutrosOpen] = useState(false);

  const getFiles = () => {
    if (ngoId) {
      fetch(`http://127.0.0.1:3333/ongs/${ngoId}/files/others`)
        .then((response) => {
          if (!response.ok) throw new Error("Erro ao buscar outros arquivos");
          return response.json();
        })
        .then((data: FileObject[]) => setOthers(data))
        .catch((err) => console.error(err));

      fetch(`http://127.0.0.1:3333/ongs/${ngoId}/files/tax_invoices`)
        .then((response) => {
          if (!response.ok) throw new Error("Erro ao buscar notas fiscais");
          return response.json();
        })
        .then((data: FileObject[]) => setTaxInvoices(data))
        .catch((err) => console.error(err));

      fetch(`http://127.0.0.1:3333/ongs/${ngoId}/files/reports`)
        .then((response) => {
          if (!response.ok) throw new Error("Erro ao buscar relatórios");
          return response.json();
        })
        .then((data: FileObject[]) => setReports(data))
        .catch((err) => console.error(err));
    }
  };

  useEffect(() => {
    if (ngoId) getFiles();
  }, [ngoId]);

  const handleDownload = (file: FileObject) => {
    if (file.aws_url) {
      window.open(file.aws_url, "_blank");
    } else {
      alert("URL do arquivo não disponível");
    }
  };

  const renderFileList = (list: FileObject[]) => (
    <>
      {list.length === 0 ? (
        <p>Nenhum arquivo encontrado</p>
      ) : (
        list.map((item, index) => (
          <div
            key={index}
            onClick={() => handleDownload(item)}
            className="w-full h-14 border border-[#294BB6] rounded-[16px] flex items-center px-4 bg-[#F9FAFB] hover:shadow-md transition cursor-pointer"
          >
            <Image
              className="cursor-pointer flex-shrink-0"
              onClick={() => handleDownload(item)}
              src={download}
              alt="download"
            />
            <span
              onClick={() => handleDownload(item)}
              title={item.name}
              className="cursor-pointer ml-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[calc(100%-60px)] flex-grow"
            >
              {item.name}
            </span>
          </div>
        ))
      )}
    </>
  );

  return (
    <div className="w-9/12 m-auto mb-20 mt-10 max-[1600px]:w-11/12">
      <div className="flex flex-col">
        {/* Notas Fiscais */}
        <div
          onClick={() => setIsNotasFiscaisOpen(!isNotasFiscaisOpen)}
          className="w-full h-20 bg-[#E0E0E0] border border-[#ADADAD] rounded-full flex items-center justify-between mb-4 cursor-pointer"
        >
          <p className="ml-12">Notas Fiscais</p>
          <Image
            className={`w-4 mr-12 transition-transform duration-300 ${isNotasFiscaisOpen ? "rotate-180" : ""}`}
            src={arrowDown}
            alt="toggle"
          />
        </div>
        <AccordionSection isOpen={isNotasFiscaisOpen} key={JSON.stringify(taxInvoices.map(f => f.id))}>
          <h1 className="text-center font-bold text-2xl mb-2">Notas Fiscais</h1>
          <div className="h-full w-full border border-black rounded-[64px] p-10 mb-16 max-[1600px]:border-none max-[1600px]:p-0">
            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {renderFileList(taxInvoices)}
            </div>
          </div>
        </AccordionSection>

        {/* Relatórios */}
        <div
          onClick={() => setIsRelatoriosOpen(!isRelatoriosOpen)}
          className="w-full h-20 bg-[#E0E0E0] border border-[#ADADAD] rounded-full flex items-center justify-between mb-4 cursor-pointer"
        >
          <p className="ml-12">Relatórios</p>
          <Image
            className={`w-4 mr-12 transition-transform duration-300 ${isRelatoriosOpen ? "rotate-180" : ""}`}
            src={arrowDown}
            alt="toggle"
          />
        </div>
        <AccordionSection isOpen={isRelatoriosOpen} key={JSON.stringify(reports.map(r => r.id))}>
          <h1 className="text-center font-bold text-2xl mb-2">Relatórios</h1>
          <div className="h-full w-full border border-black rounded-[64px] p-10 mb-16 max-[1600px]:border-none max-[1600px]:p-0">
            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {renderFileList(reports)}
            </div>
          </div>
        </AccordionSection>

        {/* Outros documentos */}
        <div
          onClick={() => setIsOutrosOpen(!isOutrosOpen)}
          className="w-full h-20 bg-[#E0E0E0] border border-[#ADADAD] rounded-full flex items-center justify-between mb-4 cursor-pointer"
        >
          <p className="ml-12">Outros documentos</p>
          <Image
            className={`w-4 mr-12 transition-transform duration-300 ${isOutrosOpen ? "rotate-180" : ""}`}
            src={arrowDown}
            alt="toggle"
          />
        </div>
        <AccordionSection isOpen={isOutrosOpen} key={JSON.stringify(others.map(o => o.id))}>
          <h1 className="text-center font-bold text-2xl mb-2">Outros documentos</h1>
          <div className="h-full w-full border border-black rounded-[64px] p-10 mb-16 max-[1600px]:border-none max-[1600px]:p-0">
            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {renderFileList(others)}
            </div>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}