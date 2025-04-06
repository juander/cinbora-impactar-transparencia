"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { FaChevronDown } from "react-icons/fa"
import { FiChevronDown } from "react-icons/fi"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { API_BASE_URL } from "@/config/api"
import InfoTooltipModal from "./HelpTooltip"
import { HelpCircle, Target, UploadCloud } from "lucide-react"

// Define type interfaces for API response
interface DailyRecord {
  day: number;
  categorysExpenses: { [key: string]: number };
}

interface MonthData {
  month: number;
  dailyRecords: DailyRecord[];
}

interface YearData {
  year: number;
  months: MonthData[];
}

interface ActionData {
  actionGrafic?: [{
    id: string;
    actionId: number;
    totalExpenses: number;
    categorysExpenses: YearData[];
  }];
}

interface BalanceProps {
  refreshTrigger?: number;
}

const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

const fullMonthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const generateUniqueColor = (usedColors: Set<string>) => {
  let color
  do {
    const hue = Math.floor(Math.random() * 360)
    color = `hsl(${hue}, 70%, 50%)`
  } while (usedColors.has(color))
  usedColors.add(color)
  return color
}

export default function Balance({ refreshTrigger = 0 }: BalanceProps) {
  const searchParams = useSearchParams()
  const actionId = searchParams.get("action_id")

  const [selectedYear, setSelectedYear] = useState<string>("")
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [data, setData] = useState<Array<{[key: string]: any}>>([])
  const [visibleLines, setVisibleLines] = useState<{ [key: string]: boolean }>({})
  const [actionColors, setActionColors] = useState<{ [key: string]: string }>({})
  const [refreshKey, setRefreshKey] = useState<number>(0)

  useEffect(() => {
    const handleRefreshBalance = () => {
      setRefreshKey(Date.now());
    };
    
    window.addEventListener('refreshBalance', handleRefreshBalance);
    
    return () => {
      window.removeEventListener('refreshBalance', handleRefreshBalance);
    };
  }, []);

  useEffect(() => {
    if (!actionId) return;

    fetch(`${API_BASE_URL}/ongs/actions/${actionId}?nocache=${Date.now()}`)
      .then((res) => res.json())
      .then((response: ActionData) => {
        if (!response?.actionGrafic?.[0]?.categorysExpenses?.length) return;
        
        const { categorysExpenses } = response.actionGrafic[0];
        
        const allYears = new Set<string>();
        categorysExpenses.forEach((y) => allYears.add(y.year.toString()));
        const sortedYears = Array.from(allYears).sort().reverse();
        setAvailableYears(sortedYears);
        
        if (!selectedYear && sortedYears.length > 0) {
          setSelectedYear(sortedYears[0]);
          return;
        }
        
        const selectedYearNumber = Number(selectedYear);
        const currentYearData = categorysExpenses.find((y) => y.year === selectedYearNumber);
        const previousYearData = categorysExpenses.find((y) => y.year === selectedYearNumber - 1);
        
        if (!currentYearData) {
          setData([]);
          return;
        }
        
        const lastValuesFromPreviousYear: { [category: string]: number } = {};
        if (previousYearData?.months?.length) {
          const lastMonth = previousYearData.months.reduce((a, b) =>
            a.month > b.month ? a : b
          );
          
          if (lastMonth.dailyRecords?.length) {
            const lastDayRecord = lastMonth.dailyRecords.reduce((a, b) =>
              a.day > b.day ? a : b
            );
            Object.entries(lastDayRecord.categorysExpenses).forEach(([category, value]) => {
              lastValuesFromPreviousYear[category] = Number(value);
            });
          }
        }
        
        const currentYearLastValues: { [category: string]: number } = {};
        if (currentYearData.months?.length) {
          const lastMonth = currentYearData.months.reduce((a, b) =>
            a.month > b.month ? a : b
          );
          
          if (lastMonth.dailyRecords?.length) {
            const lastDay = lastMonth.dailyRecords.reduce((a, b) =>
              a.day > b.day ? a : b
            );
            Object.entries(lastDay.categorysExpenses).forEach(([category, value]) => {
              currentYearLastValues[category] = Number(value);
            });
          }
        }
        
        const categoriesToDisplay = Object.entries(currentYearLastValues)
          .filter(([category, value]) => {
            const previous = lastValuesFromPreviousYear[category] || 0;
            return value !== previous;
          })
          .map(([category]) => category);
        
        const expensesByMonth: { [month: string]: any } = {};
        for (let i = 0; i < 12; i++) {
          expensesByMonth[monthNames[i]] = { month: monthNames[i] };
        }
        
        const monthlyTotals: { [category: string]: number[] } = {};
        categoriesToDisplay.forEach((category) => {
          monthlyTotals[category] = Array(12).fill(null);
        });
        
        currentYearData.months.forEach((monthData) => {
          const monthIndex = monthData.month - 1;
          const dailySum: { [category: string]: number } = {};
          
          monthData.dailyRecords.forEach((record) => {
            Object.entries(record.categorysExpenses).forEach(([category, value]) => {
              if (!categoriesToDisplay.includes(category)) return;
              dailySum[category] = (dailySum[category] || 0) + Number(value);
            });
          });
          
          Object.entries(dailySum).forEach(([category, total]) => {
            monthlyTotals[category][monthIndex] = total;
          });
        });
        
        // Calculate month-to-month differences
        const previousTotals: { [category: string]: number } = {};
        categoriesToDisplay.forEach((category) => {
          previousTotals[category] = lastValuesFromPreviousYear[category] || 0;
        });
        
        for (let i = 0; i < 12; i++) {
          const monthName = monthNames[i];
          categoriesToDisplay.forEach((category) => {
            const current = monthlyTotals[category][i];
            if (current !== null && current !== undefined) {
              const diff = current - previousTotals[category];
              expensesByMonth[monthName][category] = diff;
              previousTotals[category] = current;
            }
          });
        }
        
        // Fill subsequent months with 0 (after first record), and before as null
        const firstValidMonthIndex: { [key: string]: number } = {};
        categoriesToDisplay.forEach((category) => {
          for (let i = 0; i < 12; i++) {
            const monthName = monthNames[i];
            if (expensesByMonth[monthName][category] !== undefined) {
              firstValidMonthIndex[category] = i;
              break;
            }
          }
        });
        
        Object.entries(expensesByMonth).forEach(([monthName, monthData]) => {
          categoriesToDisplay.forEach((category) => {
            if (!(category in monthData)) {
              monthData[category] = 0;
            }
          });
        });
        
        const formattedData = Object.values(expensesByMonth);
        setData(formattedData);
        
        const initialVisibility: { [key: string]: boolean } = {};
        const newColors: { [key: string]: string } = {};
        const usedColors = new Set<string>();
        
        categoriesToDisplay.forEach((category) => {
          initialVisibility[category] = true;
          if (!actionColors[category]) {
            newColors[category] = generateUniqueColor(usedColors);
          }
        });
        
        setVisibleLines(initialVisibility);
        setActionColors((prev) => ({ ...prev, ...newColors }));
      })
      .catch((error) => console.error("Erro ao buscar dados da Ação:", error));
  }, [actionId, selectedYear, refreshTrigger, refreshKey]);

  return (
    <div className="flex justify-center py-10">
      <div className="w-[95%] max-w-[1400px]">
        <div className="relative mb-16">
          <h2 className="text-center font-bold text-5xl">Balanço de gastos por Categoria</h2>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <InfoTooltipModal>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 text-[15px]">
                <div className="group p-4 rounded-2xl hover:bg-[#F4F7FF] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <HelpCircle className="text-blue-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">O que é o Balanço de Categorias?</h3>
                  </div>
                  <p>É um painel visual que mostra quanto foi gasto em cada categoria dentro desta ação, mês a mês.</p>
                </div>

                <div className="group p-4 rounded-2xl hover:bg-[#F5FFF6] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <FiChevronDown className="text-green-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">Filtros de Categoria e Ano</h3>
                  </div>
                  <p>Você pode escolher quais categorias quer ver no gráfico e mudar o ano exibido.</p>
                </div>

                <div className="group p-4 rounded-2xl hover:bg-[#FFF5F7] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <UploadCloud className="text-pink-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">Total Gasto na Ação</h3>
                  </div>
                  <p>Logo abaixo do título, você verá quanto já foi gasto no total nesta ação.</p>
                </div>

                <div className="group p-4 rounded-2xl hover:bg-[#F9F5FF] transition-all border">
                  <div className="flex items-center gap-3 mb-1">
                    <Target className="text-purple-600 w-5 h-5" />
                    <h3 className="font-semibold text-[#2E4049]">Gráfico de Linhas</h3>
                  </div>
                  <p>Mostra mês a mês quanto foi gasto em cada categoria com linhas coloridas e interativas.</p>
                </div>
              </div>
            </InfoTooltipModal>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 relative text-lg">
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer text-gray-800 flex items-center text-2xl">
              Categorias <FaChevronDown className="ml-1" />
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
                  return [`${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, truncated];
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
  )
}
