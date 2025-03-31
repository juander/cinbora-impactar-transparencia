"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Cookie } from "lucide-react";
import ModalPortal from "./modalPortal";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set("cookie_consent", "accepted", {
      expires: 365,
      secure: true,
      sameSite: "Strict",
    });
    setShowBanner(false);
  };

  const handleReject = () => {
    Cookies.set("cookie_consent", "rejected", {
      expires: 30,
      secure: true,
      sameSite: "Strict",
    });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (

    <ModalPortal>
      <div
        className={cn(
          "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 max-w-xl p-6 bg-white border border-gray-200 shadow-xl rounded-3xl flex flex-col md:flex-row items-start md:items-center gap-5 animate-slide-up z-[9999]"
        )}
      >

        <div className="flex items-start gap-3 flex-1">
          <Cookie className="text-yellow-500 w-6 h-6 mt-1" />
          <p className="text-sm text-gray-700 leading-snug">
            Este site usa cookies para melhorar sua experiência. Você aceita o uso?
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto justify-end">
          <Button
            onClick={handleAccept}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded-full transition-all"
          >
            Aceitar
          </Button>
          <Button
            onClick={handleReject}
            variant="outline"
            className="border-gray-300 hover:bg-gray-100 text-sm px-6 py-2 rounded-full"
          >
            Recusar
          </Button>
        </div>
      </div>
    </ModalPortal>
  );
}