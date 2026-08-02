import React from "react";

type BreakdownItem = {
  category: string;
  total: number;
};

type ExpenseBreakdownProps = {
  breakdown: BreakdownItem[];
};

export function ExpenseBreakdown({ breakdown }: ExpenseBreakdownProps) {
  const grandTotal = breakdown.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300 relative overflow-hidden group">
      <h3 className="text-white text-xl font-bold tracking-tight mb-1">Distribución de Egresos</h3>
      <p className="text-xs text-[#a8b5b0] mb-6">
        Desglose visual de planillas de colaboradores, estudios, servicios e insumos.
      </p>

      <div className="space-y-4">
        {breakdown.map((item) => {
          const percent = grandTotal > 0 ? (item.total / grandTotal) * 100 : 0;

          return (
            <div key={item.category} className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-semibold">{item.category}</span>
                <div className="space-x-1.5">
                  <span className="text-white font-bold">
                    S/{item.total.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[#57cc99] font-semibold text-[10px] bg-[#57cc99]/10 px-1.5 py-0.5 rounded-md border border-[#57cc99]/10">
                    {percent.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-[#081a14] rounded-full h-2 overflow-hidden border border-[#1d4034]/40">
                <div
                  className="bg-gradient-to-r from-[#57cc99] to-[#80ed99] h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}

        {breakdown.length === 0 && (
          <div className="text-center py-8 text-[#a8b5b0] text-sm">
            No hay gastos registrados en este período.
          </div>
        )}
      </div>

      {grandTotal > 0 && (
        <div className="mt-6 pt-4 border-t border-[#1d4034]/40 flex justify-between items-center text-xs">
          <span className="text-[#a8b5b0] font-semibold">Total Gastado:</span>
          <span className="text-white font-extrabold text-base">
            S/{grandTotal.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  );
}
