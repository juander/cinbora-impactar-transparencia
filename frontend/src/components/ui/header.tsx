"use client";

import Image from "next/image";
import prefeituraLogo from "../../assets/prefeitura.svg";
import Link from "next/link";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!Cookies.get("auth_token"));
    };

    const interval = setInterval(checkAuth, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#00B3FF] py-5 px-12 flex items-center justify-between max-sm:px-5">
      <div>
        <div className="flex justify-between max-sm:max-w-40">
          <Image src={prefeituraLogo} alt="Prefeitura do Recife" className="max-sm:w-[80%]"/>
          <div className="border-solid border-l-2 border-white h-14 ml-4 mr-2 max-sm:ml-3 max-sm:mr-1 max-sm:h-12"></div>
          <Image src={cinLogo} alt="logo do cin/ufpe" className="max-sm:w-[30%] max-s"/>
        </div>
      </div>
      <Menubar className="border-none shadow-none text-white justify-between max-lg:hidden">
        <MenubarMenu>
          <MenubarTrigger className="px-20 pl-0 text-xl font-semibold text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">
            Início
          </MenubarTrigger>
          <MenubarTrigger className="px-20 pr-0 text-xl font-semibold text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">
            Ongs
          </MenubarTrigger>
        </MenubarMenu>
      </Menubar>

      {isLoggedIn ? <UserSidebar /> : (
        <div>
          <Link href="/login">
            <Button className="bg-[#294BB6] text-lg font-semibold text-white rounded-xl px-14 py-3 transition-colors duration-300 delay-150 hover:bg-white hover:text-[#294BB6] max-lg:hidden">
              Entrar
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-white text-4xl hidden max-lg:block">
              ☰
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#00B3FF] rounded-xl border-solid border-2 border-white">
              <DropdownMenuItem className="block text-center text-8 font-semibold text-white hover:scale-110">Início</DropdownMenuItem>
              <DropdownMenuItem className="block text-center text-8 font-semibold text-white hover:scale-110">Ongs</DropdownMenuItem>
              <DropdownMenuItem className="px-4 py-2 hover:bg-gray-200">
                <Link href="/login">
                  <Button className="bg-[#294BB6] text-8 font-semibold text-white rounded-xl px-14 py-3 transition-colors duration-300 delay-150 hover:bg-white hover:text-[#294BB6]">Entrar como Ong</Button>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

    </header>
  );
}
