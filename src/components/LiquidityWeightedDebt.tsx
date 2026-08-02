import React from "react";
import { Sparkles, ShieldCheck } from "lucide-react";

type Liability = {
  id: string;
  name: string;
  amount: string;
  interestRate: string;
};

type LiquidityWeightedDebtProps = {
  liquidityRatio: number;
  weightedInterestRate: number;
  liabilities: Liability[];
};

export function LiquidityWeightedDebt({
  liquidityRatio,
  weightedInterestRate,
  liabilities,
}: LiquidityWeightedDebtProps) {
  // Find highest interest rate liability
  const sortedLiabilities = [...liabilities]
    .map(l => ({ ...l, rateNum: parseFloat(l.interestRate), amountNum: parseFloat(l.amount) }))
    .filter(l => l.rateNum > 0 && l.amountNum > 0)
    .sort((a, b) => b.rateNum - a.rateNum);

  const highestInterestLiability = sortedLiabilities.length > 0 ? sortedLiabilities[0] : null;

  // Determine status color and text for liquidity
  let liquidityColor = "from-rose-500 to-rose-400";
  let liquidityBg = "bg-rose-500/10 border-rose-500/20 text-rose-400";
  let liquidityText = "Riesgo de Iliquidez Alto. El disponible en bancos no cubre la mitad de tus deudas. Acelera los cobros a clientes.";
  
  if (liquidityRatio >= 1.0) {
    liquidityColor = "from-[#57cc99] to-[#80ed99]";
    liquidityBg = "bg-[#57cc99]/10 border-[#57cc99]/20 text-[#80ed99]";
    liquidityText = "Liquidez Saludable. Tu saldo líquido disponible en cuentas cubre holgadamente el 100% de tus pasivos consolidados.";
  } else if (liquidityRatio >= 0.5) {
    liquidityColor = "from-amber-400 to-[#57cc99]";
    liquidityBg = "bg-amber-400/10 border-amber-400/20 text-amber-300";
    liquidityText = "Liquidez Ajustada. Cubres parcialmente tus pasivos de forma líquida. Dependes del flujo de cobros de facturas a 30/60 días.";
  }

  return (
    <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-[#57cc99]/5 rounded-full blur-[85px] pointer-events-none" />

      <h3 className="text-white text-xl font-bold tracking-tight mb-6">Salud de Liquidez y Deuda</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Liquidity Ratio / Acid Test */}
        <div className="space-y-4">
          <div>
            <span className="text-[#a8b5b0] text-[10px] uppercase font-bold tracking-wider block mb-1">
              Prueba Ácida (Disponible / Pasivos)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-white font-extrabold text-2xl">
                {(liquidityRatio * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-[#a8b5b0]">cobertura líquida</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#081a14] rounded-full h-2.5 overflow-hidden border border-[#1d4034]/40">
            <div
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${liquidityColor}`}
              style={{ width: `${Math.min(liquidityRatio * 100, 100)}%` }}
            />
          </div>

          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${liquidityBg}`}>
            {liquidityText}
          </div>
        </div>

        {/* Weighted Debt cost & Algorithm Recommendation */}
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[#a8b5b0] text-[10px] uppercase font-bold tracking-wider block mb-1">
              Costo de Deuda (Tasa Ponderada)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-white font-extrabold text-2xl">
                {weightedInterestRate.toFixed(2)}%
              </span>
              <span className="text-xs text-[#a8b5b0]">interés promedio anual</span>
            </div>
          </div>

          {highestInterestLiability ? (
            <div className="p-4 rounded-2xl bg-[#081a14]/60 border border-[#1d4034]/50 text-xs text-[#a8b5b0] space-y-2">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <Sparkles className="w-4 h-4 text-[#57cc99]" />
                Pago Inteligente (Algoritmo)
              </div>
              <p className="leading-relaxed">
                Prioriza amortizar capital a tu deudor <strong className="text-white">{highestInterestLiability.name}</strong>, que aplica la tasa de interés comercial más cara (<strong className="text-rose-400">{highestInterestLiability.interestRate}%</strong>).
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#081a14]/60 border border-[#1d4034]/50 text-xs text-[#a8b5b0] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#57cc99]" />
              No tienes deudas activas que devenguen intereses. ¡Excelente salud crediticia!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
