import React from "react";
import { Wallet, Landmark, PiggyBank } from "lucide-react";

type Account = {
  id: string;
  name: string;
  balance: string;
  type: string;
  currency: string;
};

type AccountListProps = {
  accounts: Account[];
  onAddClick?: () => void;
};

export function AccountList({ accounts, onAddClick }: AccountListProps) {
  const getAccountIcon = (type: string) => {
    switch (type) {
      case "savings":
        return PiggyBank;
      case "credit":
        return Wallet;
      default:
        return Landmark;
    }
  };

  return (
    <div className="bg-[#143028] border border-[#1d4034] rounded-[40px] p-8 hover:shadow-2xl hover:border-[#57cc99]/20 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white text-xl font-bold tracking-tight">Mis Cuentas</h3>
        {onAddClick ? (
          <button
            onClick={onAddClick}
            className="text-[10px] font-bold text-[#0b241c] bg-[#57cc99] hover:bg-[#80ed99] px-3 py-1 rounded-full transition-all duration-300 cursor-pointer shadow hover:scale-105 active:scale-95"
          >
            + Añadir
          </button>
        ) : (
          <span className="text-[#57cc99] font-semibold text-xs tracking-wider uppercase">
            {accounts.length} Activas
          </span>
        )}
      </div>

      <div className="space-y-4">
        {accounts.map((account) => {
          const Icon = getAccountIcon(account.type);
          const balanceNum = parseFloat(account.balance);
          const symbol = account.currency === "USD" ? "$" : "S/";
          
          return (
            <div
              key={account.id}
              className="flex justify-between items-center p-4 rounded-2xl bg-[#081a14] border border-[#1d4034]/50 hover:border-[#57cc99]/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-[#57cc99]/10 p-3 rounded-xl text-[#57cc99] group-hover:bg-[#57cc99]/20 transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm group-hover:text-[#57cc99] transition-colors duration-300">
                    {account.name}
                  </h4>
                  <span className="text-xs text-[#a8b5b0] capitalize">
                    {account.type === "checking" ? "Corriente" : account.type === "savings" ? "Ahorros" : "Crédito"}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-white font-bold text-base block">
                  {symbol}{balanceNum.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })}

        {accounts.length === 0 && (
          <div className="text-center py-8 text-[#a8b5b0] text-sm">
            No hay cuentas registradas.
          </div>
        )}
      </div>
    </div>
  );
}
