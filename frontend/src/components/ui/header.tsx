import Image from "next/image";
import prefeituraLogo from "../../assets/prefeitura.svg";
import { Button } from "@/components/ui/button";
import {
  Menubar,
<<<<<<< HEAD
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"



export default function Header() {

  return (
    <header className="bg-[#00B3FF] py-4 px-10 flex items-center justify-between">
      <Image src={prefeituraLogo} alt="Prefeitura do Recife" />
      <Menubar className="border-none shadow-none text-white justify-between">
        <MenubarMenu>
          <MenubarTrigger className="px-20 text-base text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">Início</MenubarTrigger>
          <MenubarTrigger className="px-20 text-base text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">Ongs</MenubarTrigger>
          <MenubarTrigger className="px-20 text-base text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">Ações</MenubarTrigger>
          <MenubarTrigger className="px-20 text-base text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">Transparência</MenubarTrigger>
        </MenubarMenu >
      </Menubar>
      <Button className="bg-[#294BB6] text-white border-solid rounded-xl px-14 transition-colors duration-300 delay-150 hover:bg-white hover:text-[#294BB6]">Entrar</Button>
=======
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

export default function Header() {
  return (
    <header className="bg-[#00B3FF] py-5 px-12 flex items-center justify-between">
      <Image src={prefeituraLogo} alt="Prefeitura do Recife" width={150} height={60} />
      
      <Menubar className="border-none shadow-none text-white justify-between">
        <MenubarMenu>
          <MenubarTrigger className="px-10 text-xl font-semibold text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">
            Início
          </MenubarTrigger>
          <MenubarTrigger className="px-10 text-xl font-semibold text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">
            Ongs
          </MenubarTrigger>
          <MenubarTrigger className="px-10 text-xl font-semibold text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">
            Ações
          </MenubarTrigger>
          <MenubarTrigger className="px-10 text-xl font-semibold text-white transition-all duration-300 hover:text-[#d4dbf0] hover:scale-110">
            Transparência
          </MenubarTrigger>
        </MenubarMenu>
      </Menubar>

      <Button className="bg-[#294BB6] text-lg font-semibold text-white rounded-xl px-14 py-3 transition-colors duration-300 delay-150 hover:bg-white hover:text-[#294BB6]">
        Entrar
      </Button>
>>>>>>> e0e1566c (footer)
    </header>
  );
}
