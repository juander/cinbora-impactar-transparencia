"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { API_BASE_URL } from "@/config/api"
import { FaChevronDown } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useSearchParams } from "next/navigation";
import InfoTooltipModal from "./HelpTooltip";
import { HelpCircle, Target, UploadCloud } from "lucide-react";
import { FiChevronDown } from "react-icons/fi";

// Add TypeScript interfaces for API response
interface DailyRecord {
  day: number;
  expensesByAction: { [key: string]: number };
}

interface MonthData {
  month: number;
  dailyRecords: DailyRecord[];
}

interface YearData {
  year: number;
  months: MonthData[];
}

interface NgoData {
  ngoGrafic?: {
    id: string;
    ngoId: number;
    totalExpenses: number;
    expensesByAction: YearData[];
  };
}

const monthNames = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

const fullMonthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const generateUniqueColor = (usedColors: Set<string>) => {
  let color;
  do {
    const hue = Math.floor(Math.random() * 360);
    color = `hsl(${hue}, 70%, 50%)`;
  } while (usedColors.has(color));
  usedColors.add(color);
  return color;
};

export default function Balance() {
  const searchParams = useSearchParams();
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [data, setData] = useState<Array<{[key: string]: any}>>([]);
  const [visibleLines, setVisibleLines] = useState<{ [key: string]: boolean }>({});
  const [actionColors, setActionColors] = useState<{ [key: string]: string }>({});
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [apiData, setApiData] = useState<NgoData | null>(null);

  // Primeiro useEffect - busca os dados iniciais apenas quando searchParams mudar
  useEffect(() => {
    const ngoId = searchParams.get("ngo_id");
    if (!ngoId) return;
  
    fetch(`${API_BASE_URL}/ongs/${ngoId}?nocache=${Date.now()}`)
      .then((res) => res.json())
      .then((response: NgoData) => {
        setApiData(response);
        
        if (!response?.ngoGrafic?.expensesByAction?.length) return;
        
        const { expensesByAction } = response.ngoGrafic;
        setTotalExpenses(response.ngoGrafic?.totalExpenses || 0);
        
        const allYears = new Set<string>();
        expensesByAction.forEach((yearData) => {
          allYears.add(yearData.year.toString());
        });
        
        const sortedYears = Array.from(allYears).sort().reverse();
        setAvailableYears(sortedYears);
        
        if (!selectedYear && sortedYears.length > 0) {
          setSelectedYear(sortedYears[0]);
        }
      })
      .catch(error => console.error("Error fetching NGO data:", error));
  }, [searchParams]); 

  // Segundo useEffect - processa os dados quando o ano é selecionado
  useEffect(() => {
    if (!apiData || !selectedYear) return;
    
    const { ngoGrafic } = apiData;
    if (!ngoGrafic?.expensesByAction?.length) return;
    
    const selectedYearNumber = Number(selectedYear);
    const currentYearData = ngoGrafic.expensesByAction.find(
      (y) => y.year === selectedYearNumber
    );
    const previousYearData = ngoGrafic.expensesByAction.find(
      (y) => y.year === selectedYearNumber - 1
    );
    
    if (!currentYearData) {
      setData([]);
      return;
    }
    
    const lastValuesFromPreviousYear: { [action: string]: number } = {};
    if (previousYearData?.months?.length) {
      const lastMonth = previousYearData.months.reduce((a, b) =>
        a.month > b.month ? a : b
      );
      
      if (lastMonth.dailyRecords?.length) {
        const lastDayRecord = lastMonth.dailyRecords.reduce((a, b) =>
          a.day > b.day ? a : b
        );
        Object.entries(lastDayRecord.expensesByAction).forEach(([action, value]) => {
          lastValuesFromPreviousYear[action] = Number(value);
        });
      }
    }
    
    const currentYearLastValues: { [action: string]: number } = {};
    if (currentYearData.months?.length) {
      const lastMonth = currentYearData.months.reduce((a, b) =>
        a.month > b.month ? a : b
      );
      
      if (lastMonth.dailyRecords?.length) {
        const lastDay = lastMonth.dailyRecords.reduce((a, b) =>
          a.day > b.day ? a : b
        );
        Object.entries(lastDay.expensesByAction).forEach(([action, value]) => {
          currentYearLastValues[action] = Number(value);
        });
      }
    }
    
    const actionsToDisplay = Object.entries(currentYearLastValues)
      .filter(([action, value]) => {
        const previous = lastValuesFromPreviousYear[action] || 0;
        return value !== previous;
      })
      .map(([action]) => action);
    
    const expensesByMonth: { [month: string]: any } = {};
    for (let i = 0; i < 12; i++) {
      expensesByMonth[monthNames[i]] = { month: monthNames[i] };
    }
    
    const monthlyTotals: { [action: string]: number[] } = {};
    actionsToDisplay.forEach((action) => {
      monthlyTotals[action] = Array(12).fill(null);
    });
    
    currentYearData.months.forEach((monthData) => {
      const monthIndex = monthData.month - 1;
      const dailySum: { [action: string]: number } = {};
      
      monthData.dailyRecords.forEach((record) => {
        Object.entries(record.expensesByAction).forEach(([action, value]) => {
          if (!actionsToDisplay.includes(action)) return;
          dailySum[action] = (dailySum[action] || 0) + Number(value);
        });
      });
      
      Object.entries(dailySum).forEach(([action, total]) => {
        monthlyTotals[action][monthIndex] = total;
      });
    });
    
    // Calcula a diferença mês a mês
    const previousTotals: { [action: string]: number } = {};
    actionsToDisplay.forEach((action) => {
      previousTotals[action] = lastValuesFromPreviousYear[action] || 0;
    });
    
    for (let i = 0; i < 12; i++) {
      const monthName = monthNames[i];
      actionsToDisplay.forEach((action) => {
        const current = monthlyTotals[action][i];
        if (current !== null && current !== undefined) {
          const diff = current - previousTotals[action];
          // Substitute negative values with 0
          expensesByMonth[monthName][action] = diff < 0 ? 0 : diff;
          previousTotals[action] = current;
        }
      });
    }
    
    // Preeche os meses seguintes com 0 (depois do primeiro registro), e antes como null
    const firstValidMonthIndex: { [key: string]: number } = {};
    actionsToDisplay.forEach((action) => {
      for (let i = 0; i < 12; i++) {
        const monthName = monthNames[i];
        if (expensesByMonth[monthName][action] !== undefined) {
          firstValidMonthIndex[action] = i;
          break;
        }
      }
    });
    
    Object.entries(expensesByMonth).forEach(([monthName, monthData]) => {
      actionsToDisplay.forEach((action) => {
        if (!(action in monthData)) {
          monthData[action] = 0;
        }
      });
    });
    
    const formattedData = Object.values(expensesByMonth);
    setData(formattedData);
    
    const initialVisibility: { [key: string]: boolean } = {};
    const newColors: { [key: string]: string } = {};
    const usedColors = new Set<string>();
    
    actionsToDisplay.forEach((action) => {
      initialVisibility[action] = true;
      if (!actionColors[action]) {
        newColors[action] = generateUniqueColor(usedColors);
      }
    });
    
    setVisibleLines(initialVisibility);
    setActionColors((prev) => ({ ...prev, ...newColors }));
    
  }, [apiData, selectedYear]);

  return (
    <div className="flex justify-center py-10">
      <div className="w-[95%] max-w-[1400px]">
        <div className="relative mb-16">
          <h2 className="text-center font-bold text-5xl">Balanço de gastos</h2>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <InfoTooltipModal>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 text-[15px]">
                <div className="group p-4 rounded-2xl hover:bg-[#F4F7FF] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <HelpCircle className="text-blue-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">O que é o Balanço de Gastos?</h3>
                  </div>
                  <p>É um painel visual que mostra quanto foi gasto pela ONG, com o quê e em qual mês.</p>
                </div>

                <div className="group p-4 rounded-2xl hover:bg-[#F5FFF6] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <FiChevronDown className="text-green-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">Filtros de Ação e Ano</h3>
                  </div>
                  <p>Você pode escolher quais categorias quer ver no gráfico e mudar o ano exibido.</p>
                  <div className="opacity-0 group-hover:opacity-100 mt-2 transition-all text-xs">
                    <span className="inline-block bg-green-100 text-green-600 px-3 py-1 rounded-full">Ex: Alimentação - 2025</span>
                  </div>
                </div>

                <div className="group p-4 rounded-2xl hover:bg-[#FFF5F7] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <UploadCloud className="text-pink-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">Total Gasto</h3>
                  </div>
                  <p>Logo abaixo do título, você verá quanto já foi gasto no total, atualizado automaticamente.</p>
                  <div className="opacity-0 group-hover:opacity-100 mt-2 transition-all text-xs text-pink-500">
                    Ex: R$ 12.500,00
                  </div>
                </div>

                <div className="group p-4 rounded-2xl hover:bg-[#F9F5FF] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <Target className="text-purple-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">Gráfico de Linhas</h3>
                  </div>
                  <p>Mostra mês a mês quanto foi gasto em cada categoria com linhas coloridas e interativas.</p>
                </div>

                <div className="group p-4 rounded-2xl hover:bg-[#E9F6FF] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <HelpCircle className="text-sky-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">Tooltip no gráfico</h3>
                  </div>
                  <p>Ao passar o mouse sobre o gráfico, aparece uma caixinha com os valores exatos por mês e categoria.</p>
                </div>

                <div className="group p-4 rounded-2xl hover:bg-[#FFFCEB] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <FiChevronDown className="text-yellow-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">Legenda Colorida</h3>
                  </div>
                  <p>Logo abaixo do gráfico, você encontra a legenda com a cor de cada ação. Se o nome estiver cortado, é só passar o mouse.</p>
                  <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">Alimentação</span>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">Transporte</span>
                  </div>
                </div>
              </div>
            </InfoTooltipModal>
          </div>
        </div>

        <div className="flex justify-between items-center mb-16">
          <div className="text-left">
            <p className="text-gray-500 text-xl">Total gasto em todos os anos</p>
            <p className="text-4xl font-bold text-gray-800">
              {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 relative text-lg">
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer text-gray-800 flex items-center text-2xl">
              Ações <FaChevronDown className="ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.keys(visibleLines).map((line) => (
                <DropdownMenuCheckboxItem
                  key={line}
                  title={line}
                  checked={visibleLines[line]}
                  onCheckedChange={() =>
                    setVisibleLines((prev) => ({ ...prev, [line]: !prev[line] }))
                  }
                  className="text-2xl text-gray-800 font-normal"
                >
                  {line.length > 20 ? line.slice(0, 30) + "..." : line}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer text-gray-800 flex items-center text-2xl">
              {selectedYear}
              <FaChevronDown className="ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableYears.map((year) => (
                <DropdownMenuItem
                  key={year}
                  className={`text-2xl text-gray-800 font-normal ${selectedYear === year ? "font-bold" : ""}`}
                  onSelect={() => setSelectedYear(year)}
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="rounded-3xl p-8 border-4 border-[#00B3FF] shadow-xl">
          <ResponsiveContainer width="100%" height={700}>
            <LineChart data={data} margin={{ top: 40, right: 20, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{ fontSize: 16 }}
              />
              <YAxis
                className="max-sm:none"
                label={{ value: "", angle: -90, position: "insideLeft", fontSize: 18 }}
                tick={{ fontSize: 16 }}
              />
              <Tooltip
                formatter={(value: any, name: string) => {
                  const truncated = name.length > 30 ? name.slice(0, 30) + "..." : name;
                  // Ensure value is never negative when displayed
                  const displayValue = value < 0 ? 0 : value;
                  return [`${displayValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, truncated];
                }}
                labelFormatter={(label: string) => {
                  const index = monthNames.indexOf(label);
                  return index >= 0 ? fullMonthNames[index] : label;
                }}
              />

              {Object.keys(visibleLines).map((key) =>
                visibleLines[key] ? (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={actionColors[key]}
                    strokeWidth={3}
                    dot={true}
                    connectNulls={true}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-4 gap-6 mt-6 text-xl">
            {Object.keys(visibleLines).map((key) => (
              <div key={key} className="flex flex-col items-center max-md:overflow-scroll" title={key}>
                <span className="w-48 h-4 rounded-full max-xl:w-32 max-md:w-24 max-sm:w-12" style={{ backgroundColor: actionColors[key] }}></span>
                <span className="text-gray-700 font-bold text-3xl max-xl:text-xl max-md:text-[10px]">
                  {key.length > 15 ? key.slice(0, 15) + "..." : key}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
