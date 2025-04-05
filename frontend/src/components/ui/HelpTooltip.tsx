"use client";

import { useState, useEffect, ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import ModalPortal from "@/components/ui/modalPortal";

export default function InfoTooltipModal({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShow(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="text-blue-600 hover:text-blue-800 transition-all"
        title="Abrir explicações"
      >
        <HelpCircle className="w-8 h-8" />
      </button>

      {show && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-[90%] max-w-4xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 overflow-y-auto max-h-[90vh] animate-fade-in">

              <button
                onClick={() => setShow(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all text-xl"
                title="Fechar"
              >
                ✕
              </button>

              <div className="text-sm leading-relaxed text-gray-800 space-y-6">
                {children}
              </div>

            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
