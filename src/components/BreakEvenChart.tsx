import React from "react";
import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

type HistoryItem = {
  month: string;
  income: number;
  expenses: number;
  breakEven: number;
};

type BreakEvenChartProps = {
  history: HistoryItem[];
};

export function BreakEvenChart({ history }: BreakEvenChartProps) {
  if (!history || history.length === 0) return null;

  // Chart configuration constants
  const chartWidth = 600;
  const chartHeight = 280;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const contentWidth = chartWidth - paddingLeft - paddingRight;
  const contentHeight = chartHeight - paddingTop - paddingBottom;

  // Find max value in history to scale Y axis
  const maxVal = Math.max(
    ...history.flatMap((h) => [h.income, h.expenses, h.breakEven]),
    1000 // default min
  ) * 1.15; // 15% headroom

  const getY = (val: number) => {
    return paddingTop + contentHeight - (val / maxVal) * contentHeight;
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (history.length - 1)) * contentWidth;
  };

  // Generate path for the Break-Even line
  const breakEvenPath = history
    .map((item, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx)} ${getY(item.breakEven)}`)
    .join(" ");

  // Grid line values
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => maxVal * pct);

  // Analysis of current month (last item in history)
  const currentItem = history[history.length - 1];
  const netMargin = currentItem.income - currentItem.expenses;
  const isAboveBreakEven = currentItem.income >= currentItem.breakEven;
  
  const breakEvenGap = currentItem.breakEven > 0 
    ? ((currentItem.income - currentItem.breakEven) / currentItem.breakEven) * 100 
    : 0;

  return (
    <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300 relative overflow-hidden group">
      <h3 className="text-white text-xl font-bold tracking-tight mb-1">Comportamiento Financiero e Historial</h3>
      <p className="text-xs text-[#a8b5b0] mb-6">
        Historial de los últimos 6 meses comparado contra el Punto de Equilibrio (costos fijos indispensables).
      </p>

      {/* SVG Chart Wrapper */}
      <div className="relative w-full overflow-x-auto select-none">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[500px] h-auto">
          {/* 1. Grid lines & Y Axis Labels */}
          {gridLines.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={`grid-${idx}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#1d4034"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  fill="#a8b5b0"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  S/{Math.round(val).toLocaleString("es-ES")}
                </text>
              </g>
            );
          })}

          {/* 2. X Axis Labels */}
          {history.map((item, idx) => (
            <text
              key={`x-label-${idx}`}
              x={getX(idx)}
              y={chartHeight - 15}
              fill="#a8b5b0"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
            >
              {item.month}
            </text>
          ))}

          {/* 3. Bar charts for Income & Expenses */}
          {history.map((item, idx) => {
            const x = getX(idx);
            const yIncome = getY(item.income);
            const yExpenses = getY(item.expenses);
            const bottomY = paddingTop + contentHeight;
            const barWidth = 14;

            return (
              <g key={`bars-${idx}`}>
                {/* Income Bar (Green) */}
                <rect
                  x={x - barWidth - 2}
                  y={yIncome}
                  width={barWidth}
                  height={Math.max(0, bottomY - yIncome)}
                  fill="url(#greenGrad)"
                  rx="4"
                  className="transition-all duration-300 opacity-90 hover:opacity-100"
                />
                {/* Expense Bar (Rose) */}
                <rect
                  x={x + 2}
                  y={yExpenses}
                  width={barWidth}
                  height={Math.max(0, bottomY - yExpenses)}
                  fill="url(#roseGrad)"
                  rx="4"
                  className="transition-all duration-300 opacity-90 hover:opacity-100"
                />
              </g>
            );
          })}

          {/* 4. Break-Even Trend Line */}
          <path
            d={breakEvenPath}
            fill="none"
            stroke="#57cc99"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            className="drop-shadow-[0_2px_4px_rgba(87,204,153,0.3)]"
          />

          {/* 5. Dots on the Break-Even line for clarity */}
          {history.map((item, idx) => (
            <circle
              key={`dot-${idx}`}
              cx={getX(idx)}
              cy={getY(item.breakEven)}
              r="4"
              fill="#143028"
              stroke="#57cc99"
              strokeWidth="2"
            />
          ))}

          {/* Definitions for Gradients */}
          <defs>
            <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#80ed99" />
              <stop offset="100%" stopColor="#57cc99" />
            </linearGradient>
            <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 text-xs text-[#a8b5b0] mt-3 pb-6 border-b border-[#1d4034]/30">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-gradient-to-r from-[#80ed99] to-[#57cc99]" />
          <span className="font-semibold text-white">Ingresos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-gradient-to-r from-[#f43f5e] to-[#be123c]" />
          <span className="font-semibold text-white">Egresos Semanales / Mensuales</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-0.5 border-t-2 border-dashed border-[#57cc99] inline-block" />
          <span className="font-semibold text-white">Punto de Equilibrio (Costos Fijos)</span>
        </div>
      </div>

      {/* Diagnostic Panel */}
      <div className="mt-6">
        {isAboveBreakEven ? (
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#57cc99]/10 border border-[#57cc99]/20">
            <CheckCircle className="w-6 h-6 text-[#80ed99] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h5 className="text-[#80ed99] font-bold text-sm">Operación en Zona de Ganancia</h5>
              <p className="text-[#a8b5b0] leading-relaxed">
                Este mes tus ingresos se ubicaron un <strong className="text-white">{breakEvenGap.toFixed(1)}% por encima</strong> de tu punto de equilibrio (costos fijos de planilla, colegio, rentas e insumos indispensables). Tus operaciones se mantienen estables y solventes.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h5 className="text-rose-450 font-bold text-sm text-rose-400">Operación en Zona de Pérdida / Estrés</h5>
              <p className="text-[#a8b5b0] leading-relaxed">
                Tus ingresos mensuales se situaron un <strong className="text-white">{Math.abs(breakEvenGap).toFixed(1)}% por debajo</strong> de tu punto de equilibrio indispensable. Prioriza reducir de inmediato los egresos variables de ocio u oficinas, o acelera el cobro de tus facturas vencidas a clientes.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
