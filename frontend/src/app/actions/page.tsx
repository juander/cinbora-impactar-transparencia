"use client"

import { useRouter } from "next/navigation"
import { SearchParamsWrapper } from '@/components/ui/search-params-wrapper'
import { useEffect, useState } from "react"
import { CardContent } from "@/components/ui/card"
import { API_BASE_URL } from "@/config/api"
import ActionsGallery from "@/components/ui/actionsGallery"
import ActionsDocuments from "@/components/ui/actionsDocuments"
import ActionsBalance from "@/components/ui/actionsBalance"
import { Suspense } from "react"

interface Action {
  type: string;
  name: string;
  colected: number;
  spent: number;
  goal: number;
}

export default function ActionDetail() {
  return(
    <Suspense fallback={<p className="p-4">Carregando...</p>}>
      <SearchParamsWrapper>
        {(searchParams) => {
          const router = useRouter()
          const acaoId = searchParams.get("action_id")
          const [action, setAction] = useState<Action | null>(null)
          const [activeTab, setActiveTab] = useState("gallery");
          const [hoveredCard, setHoveredCard] = useState(false);

          if (!acaoId) {
            router.push("/cinboratransparecer/")
            return null
          }

        useEffect(() => {
          if (acaoId) {
            fetch(`${API_BASE_URL}/ongs/actions/${acaoId}`)
              .then(res => res.json())
              .then(data => {
                if (!data.action) {
                  router.push("/cinboratransparecer/")
                  return;
                }
                setAction(data.action)
              })
              .catch(err => {
                console.error("Erro ao buscar ação:", err)
                router.push("/cinboratransparecer/")
              })
          }
        }, [acaoId, router])

        if (!action) return <p className="p-4">Carregando...</p>

        return (
          <main>
            <h1 title={action.name} className="text-4xl text-center font-bold mt-10 whitespace-nowrap overflow-hidden text-ellipsis w-[90%] m-auto max-xl:text-3xl max-sm:text-xl">{action.name}</h1>
            <CardContent className="relative p-0 min-w-84">
              <div className="relative z-10 bg-white mt-20 w-5/6 m-auto">
                <div className="flex flex-col justify-between py-6 px-3 w-full border-solid border border-gray-200 rounded-xl shadow-lg mb-20 duration-300 ease-in hover:shadow-[#2BAFF150]">
                  <div>
                    <p title={action.type} className="inline-block text-xs font-semibold text-[#0056D2] bg-[#E9F2FF] px-3 py-1 rounded-lg uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[100%]">
                      {action.type}
                    </p>
                  </div>
                  <h2 title={action.name} className="text-lg font-semibold mt-3 text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                    {action.name}
                  </h2>
                  <div className="relative w-full mt-3">
                    <div
                      className="relative w-full h-2 rounded-full bg-gray-300 overflow-hidden transition-all duration-300 hover:bg-gray-400"
                      onMouseEnter={() => setHoveredCard(true)}
                      onMouseLeave={() => setHoveredCard(false)}
                    >
                      <div
                        className="h-full bg-[#2BAFF150] transition-all duration-300"
                        style={{ width: `${Math.min((action.colected / action.goal) * 100, 100).toFixed(2)}%` }}
                      />
                    </div>
                    <p className="text-sm text-center text-gray-500 mt-2 mb-1 italic">
                      Representa o progresso da arrecadação
                    </p>
                    {hoveredCard && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 bg-white/90 backdrop-blur-sm text-gray-800 shadow-xl rounded-2xl px-5 py-4 w-[240px] text-sm z-50">
                        {action.spent >= action.goal ? (
                          <p className="text-center font-semibold text-green-600">🎉 Meta Concluída!</p>
                        ) : (
                          <p className="text-center font-semibold text-blue-600">
                            🎯 {(action.colected / action.goal * 100).toFixed(2)}% da Meta Atingida
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          <p className="flex justify-between">
                            <span className="font-medium text-gray-600">🔹 Arrecadado:</span>
                            <span className="font-semibold">
                              R$ {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(action.colected)}
                            </span>
                          </p>
                          <p className="flex justify-between text-red-500">
                            <span className="font-medium">📉 Gasto:</span>
                            <span className="font-semibold">
                              R$ {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(action.spent)}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="font-medium text-gray-600">🏆 Meta:</span>
                            <span className="font-semibold">
                              R$ {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(action.goal)}
                            </span>
                          </p>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-4 h-4 bg-white rotate-45 border border-gray-300 -mt-1" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-around text-sm font-semibold text-gray-700 mt-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Arrecadado</p>
                      <p className="text-lg font-bold whitespace-nowrap">
                        R$ {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(action.colected)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Gasto</p>
                      <p className="text-lg font-bold text-red-500 whitespace-nowrap">
                        R$ {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(action.spent)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Meta</p>
                      <p className="text-lg font-bold whitespace-nowrap">
                        R$ {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(action.goal)}
                      </p>
                    </div>
                  </div>
                  <hr className="mt-4" />
                </div>
              </div>
            </CardContent>

            <div className="w-full flex justify-center border-b border-gray-300 mt-6">
              <div className="flex space-x-6">
                {["gallery", "balance", "documents"].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === tab ? "text-[#294BB6] border-b-2 border-[#294BB6]" : "text-gray-500 hover:text-[#2E4049]"}`}
                  >
                    {tab === "gallery" && "Galeria"}
                    {tab === "balance" && "Balanço de Gastos"}
                    {tab === "documents" && "Documentos"}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full mt-6">
              {activeTab === "gallery" && <ActionsGallery />}
              {activeTab === "balance" && <ActionsBalance />}
              {activeTab === "documents" && <ActionsDocuments />}
            </div>
          </main>
        )
      }}
      </SearchParamsWrapper>
    </Suspense>
    )
}