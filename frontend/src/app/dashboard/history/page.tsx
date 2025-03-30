"use client";
import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/config/api"

interface LogChanges {
  name?: string;
  type?: string;
  spent?: number;
  goal?: number;
  colected?: number;
  aws_url?: string;
  categorysExpenses?: Record<string, number>;
  expensesByCategory?: Record<string, number>;
  description?: string;
}

interface Log {
  id: string;
  ngoId: number;
  userId: string;
  userName: string;
  action: string;
  model: string;
  modelId: string;
  changes: LogChanges;
  description: string;
  timestamp: string;
}

interface GroupedLogs {
  [dateKey: string]: Log[];
}

const keyTranslations: Record<string, string> = {
  name: "Nome",
  type: "Tipo",
  spent: "Gasto",
  goal: "Meta",
  colected: "Arrecadado",
  filename: "Nome do Arquivo",
  category: "Categoria",
  mimetype: "Tipo",
  size: "Tamanho",
  actionName: "Nome da Ação",
  description: "Descrição",
  telefone: "Telefone",
  Instagram: "Instagram",
  ano: "Ano",
  totalExpenses: "Total de Despesas",
  expensesByCategory: "Despesas por Categoria",
};

const HistoryPage: React.FC = () => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const [logs, setLogs] = useState<GroupedLogs>({});
  const [loading, setLoading] = useState(true);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchLogs = async () => {
    setLoading(true);
    const token = Cookies.get("auth_token");
    if (!token) return setLoading(false);
    try {
      const res = await fetch(`${API_BASE_URL}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setLogs(groupLogsByDate(data));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const groupLogsByDate = (logsData: Log[]): GroupedLogs =>
    logsData.reduce((acc, log) => {
      const d = new Date(log.timestamp);
      const dateKey = `${d.getDate()} de ${
        [
          "janeiro",
          "fevereiro",
          "março",
          "abril",
          "maio",
          "junho",
          "julho",
          "agosto",
          "setembro",
          "outubro",
          "novembro",
          "dezembro",
        ][d.getMonth()]
      } de ${d.getFullYear()}`;
      (acc[dateKey] = acc[dateKey] || []).push(log);
      return acc;
    }, {} as GroupedLogs);

  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const formatChangesForDisplay = (log: Log): string[] => {
    const { changes, model, action } = log;
    if (!changes || typeof changes !== "object") return [];
    const formatCurrency = (value: number) => `R$ ${value.toLocaleString("pt-BR")}`;
    const translateKey = (key: string) => keyTranslations[key] || key;
    switch (model) {
      case "Arquivo da ONG":
      case "Arquivo da Ação":
        return Object.entries(changes)
          .filter(([key]) => key !== "mimetype" && key !== "size")
          .map(([key, value]) =>
            key === "size"
              ? `${translateKey(key)}: "${
                  Number(value) < 1024
                    ? `${value} bytes`
                    : Number(value) < 1048576
                    ? `${(Number(value) / 1024).toFixed(2)} KB`
                    : `${(Number(value) / 1048576).toFixed(2)} MB`
                }"`
              : `${translateKey(key)}: "${value}"`
          );
      case "Ação":
        return Object.entries(changes)
          .filter(([key]) => key !== "aws_url")
          .map(([key, value]) =>
            ["spent", "goal", "colected"].includes(key) && typeof value === "number"
              ? `${translateKey(key)}: "${formatCurrency(value)}"`
              : `${translateKey(key)}: "${value}"`
          );
      case "Gráfico de despesas": {
        const despesas = changes.expensesByCategory || changes.categorysExpenses || changes;
        return Object.entries(despesas).map(
          ([key, val]) => `${translateKey(key)}: "${formatCurrency(Number(val))}"`
        );
      }
      default:
        return Object.entries(changes).map(
          ([key, value]) => `${translateKey(key)}: "${value}"`
        );
    }
  };

  const getLogUniqueKey = (log: Log): string => {
    if (log.id) return log.id;
    return new Date(log.timestamp).getTime().toString();
  };

  if (loading)
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando histórico...</h1>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </main>
    );

  return (
    <main className="flex flex-col items-center p-6 min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-2">Histórico da ONG</h1>
        <p className="text-gray-600 text-sm text-center mb-6">
          Veja o histórico de mudanças realizadas.
        </p>
        {Object.keys(logs).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum registro encontrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(logs).map(([date, items]) => (
              <div key={date}>
                <p className="text-sm font-semibold text-gray-600 mb-2">{date}</p>
                {items.map((item) => {
                  const logKey = getLogUniqueKey(item);
                  return (
                    <div key={logKey} className="bg-gray-100 rounded-xl overflow-hidden mb-2">
                      <button
                        onClick={() => toggleSection(logKey)}
                        className="w-full flex justify-between items-center p-4 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                      >
                        <span className="flex flex-col text-left">
                          <span className="font-medium text-gray-800">{item.description}</span>
                          <span className="text-xs font-normal text-gray-500">{formatTime(item.timestamp)}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{item.userName}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${openSections[logKey] ? "rotate-180" : ""}`} />
                        </div>
                      </button>
                      {openSections[logKey] && (
                        <div className="px-4 pb-4 text-sm text-gray-600 border-t overflow-x-auto">
                          <p className="font-semibold mt-2">Mudanças:</p>
                          <ul className="list-disc list-inside space-y-1 mt-1">
                            {formatChangesForDisplay(item).map((change, idx) => (
                              <li key={idx} className="break-words whitespace-normal">{change}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default HistoryPage;