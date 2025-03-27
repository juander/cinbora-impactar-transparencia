"use client";

import Image from "next/image";
import prefeituraLogo from "../../assets/prefeitura.svg";
import Link from "next/link";
import Cookies from "js-cookie";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import dynamic from "next/dynamic";
import cinLogo from "../../assets/cin.svg"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const UserSidebar = dynamic(() => import("./user-sidebar").then((mod) => mod.UserSidebar), { ssr: false });

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fetchedOnce = useRef(false);
  const lastToken = useRef<string | undefined>(undefined);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = Cookies.get("auth_token");

      if (token && token !== lastToken.current) {
        lastToken.current = token;
        setIsLoggedIn(true);

        if (!fetchedOnce.current) {
          fetchedOnce.current = true;

          fetch("http://127.0.0.1:3333/user", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => res.json())
            .then((data) => setAvatarUrl(data?.profileUrl || null))
            .catch(() => setAvatarUrl(null));
        }
      }

      if (!token) {
        lastToken.current = undefined;
        fetchedOnce.current = false;
        setIsLoggedIn(false);
        setAvatarUrl(null);
      }
    }, 500); 

    return () => clearInterval(interval);
  }, []);
  

  return (
    <header className="bg-[#00B3FF] py-5 px-12 flex items-center justify-between max-sm:px-5">
      <div>
      <div className="flex justify-between max-sm:max-w-40  items-center gap-4">
        <Link href="/" className="inline-block">
          <Image
            src={prefeituraLogo}
            alt="Prefeitura do Recife"
            className=" w-auto h-auto"
          />
        </Link>

        <div className="border-solid border-l-2 border-white h-14 max-sm:h-12" />

        <Link href="/" className="inline-block">
          <Image
            src={cinLogo}
            alt="logo do cin/ufpe"
            className=" w-auto h-auto"
          />
        </Link>
      </div>

      </div>
      <Menubar className="border-none shadow-none text-white justify-between max-lg:hidden">
        <MenubarMenu>
          <Link href="/">
            <MenubarTrigger className="px-20 text-xl font-semibold text-white relative group">
              <span className="relative cursor-pointer inline-block after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 group-hover:after:w-full">
                Início
              </span>
            </MenubarTrigger>
          </Link>
          <Link href="/partners">
            <MenubarTrigger className="px-20 text-xl font-semibold text-white relative group">
              <span className="relative cursor-pointer inline-block after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 group-hover:after:w-full">
                Parceiros
              </span>
            </MenubarTrigger>
          </Link>
        </MenubarMenu>
      </Menubar>

      {isLoggedIn ? <UserSidebar avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl} />
 : (
        <div>
          <Link href="/login">
            <Button className="bg-[#294BB6] text-lg font-semibold text-white rounded-xl px-14 py-3 transition-colors duration-300 delay-150 hover:bg-white hover:text-[#294BB6] max-lg:hidden">
              Entrar
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-white text-4xl hidden max-lg:block">
              <div id="mobile">☰</div>
            </DropdownMenuTrigger>
            <DropdownMenuContent id="start" className="bg-white rounded-xl border-solid border-2 mr-4 mt-2 border-white hidden max-lg:block">
              <Link href="/">
                <DropdownMenuItem id="partners" className="block text-center text-8 font-semibold text-[#294BB6] hover:scale-110">Início</DropdownMenuItem>
              </Link>
              <Link href="/partners">
                <DropdownMenuItem className="block text-center text-8 font-semibold text-[#294BB6] hover:scale-110">Parceiros</DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="px-4 py-2 hover:bg-gray-200">
                <Link href="/login">
                  <Button id="loginMobile" className="bg-[#294BB6] text-8 font-semibold text-white rounded-xl px-14 py-3 transition-colors duration-300 delay-150 hover:bg-white hover:text-[#294BB6]">Entrar como Ong</Button>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

    </header>
  );
}
