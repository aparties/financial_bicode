"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  Database,
  ArrowRightLeft,
  FileSpreadsheet,
  Download,
  LogOut
} from "lucide-react";

import { exportFullReportToCSV } from "@/lib/exportCsv";

import { MetricCard } from "@/components/MetricCard";
import { AccountList } from "@/components/AccountList";
import { TransactionList } from "@/components/TransactionList";
import { LiabilityList } from "@/components/LiabilityList";
import { InvoiceList } from "@/components/InvoiceList";
import { ConsolidatedReport } from "@/components/ConsolidatedReport";
import { AssetList } from "@/components/AssetList";
import { ProjectionList } from "@/components/ProjectionList";
import { ExpenseBreakdown } from "@/components/ExpenseBreakdown";
import { GrowthTargetTracker } from "@/components/GrowthTargetTracker";

// New analytical components
import { LiquidityWeightedDebt } from "@/components/LiquidityWeightedDebt";
import { UpcomingDeadlines } from "@/components/UpcomingDeadlines";
import { ProjectStressTest } from "@/components/ProjectStressTest";
import { FinancialCalendar } from "@/components/FinancialCalendar";
import { BreakEvenChart } from "@/components/BreakEvenChart";

// Modals
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { AddAccountModal } from "@/components/AddAccountModal";
import { AddLiabilityModal } from "@/components/AddLiabilityModal";
import { AddInvoiceModal } from "@/components/AddInvoiceModal";
import { AddAssetModal } from "@/components/AddAssetModal";
import { AddProjectModal } from "@/components/AddProjectModal";

type Summary = {
  totalBalance: number;
  totalUnbilled: number;
  totalReceivables: number;
  totalFixedAssets: number;
  totalInventory: number;
  totalAssets: number;
  totalFinancialLiabilities: number;
  totalPersonalLiabilities: number;
  totalLiabilities: number;
  consolidated: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyRent: number;
  growthTarget20: number;
  projectedGrowth: number;
  growthProgress: number;
  netCashFlow: number;
  liquidityRatio: number;
  weightedInterestRate: number;
};

type DashboardData = {
  isDemo: boolean;
  accounts: any[];
  transactions: any[];
  liabilities: any[];
  invoices: any[];
  assets: any[];
  projections: any[];
  categoryBreakdown: any[];
  monthlyHistory: any[];
  summary: Summary;
};

export default function DashboardPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const logoutToast = toast.loading("Cerrando sesión...");
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Sesión cerrada", { id: logoutToast });
        router.push("/login");
        router.refresh();
      } else {
        throw new Error("No se pudo cerrar la sesión.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al cerrar sesión", { id: logoutToast });
      setIsLoggingOut(false);
    }
  };

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [isLiaModalOpen, setIsLiaModalOpen] = useState(false);
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Time travel / reporting period state (defaults to current month)
  const [selectedMonth, setSelectedMonth] = useState("2026-08");

  // Exchange rate USD/PEN setup state (defaults to 3.4)
  const [exchangeRate, setExchangeRate] = useState(3.4);

  // Stress Testing States (recalculates future projections dynamically in the client)
  const [stressRevenueChange, setStressRevenueChange] = useState(0); // in percent (e.g. -20 for -20%)
  const [stressCostChange, setStressCostChange] = useState(0); // in percent (e.g. +15 for +15%)

  // TanStack Query for data fetching, in accordance with standard.md
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ["dashboard", selectedMonth, exchangeRate],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?month=${selectedMonth}&exchangeRate=${exchangeRate}`);
      if (!res.ok) throw new Error("Error de conexión al obtener datos financieros.");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b241c] text-[#a8b5b0]">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-[#57cc99]/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#57cc99] animate-spin" />
        </div>
        <p className="text-xs font-bold tracking-widest uppercase text-[#57cc99] animate-pulse">
          Cargando Panel Analítico...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b241c] text-[#a8b5b0] p-6 text-center">
        <AlertCircle className="w-16 h-16 text-rose-400 mb-4 animate-bounce" />
        <h2 className="text-white text-2xl font-bold mb-2">Error de conexión</h2>
        <p className="max-w-md text-sm mb-6 text-[#a8b5b0]">
          {error instanceof Error ? error.message : "No se pudieron obtener los datos de tu panel."}
        </p>
        <button
          onClick={() => refetch()}
          className="bg-[#57cc99] text-[#0b241c] rounded-full px-8 py-4 font-bold hover:bg-[#80ed99] transition-all cursor-pointer shadow-lg hover:shadow-[#57cc99]/20"
        >
          Reintentar conexión
        </button>
      </div>
    );
  }

  const { summary, accounts, transactions, liabilities, invoices, assets, projections, categoryBreakdown, monthlyHistory, isDemo } = data;

  // Reactively calculate stressed projects and growth progress
  const stressedProjections = projections.map((prj: any) => {
    const rev = parseFloat(prj.estimatedRevenue);
    const cost = parseFloat(prj.estimatedCost);
    const stressedRev = rev * (1 + stressRevenueChange / 100);
    const stressedCost = cost * (1 + stressCostChange / 100);
    return {
      ...prj,
      estimatedRevenue: stressedRev.toFixed(2),
      estimatedCost: stressedCost.toFixed(2),
    };
  });

  const stressedProjectedGrowth = stressedProjections
    .filter((p: any) => p.status === "planned" || p.status === "active")
    .reduce((sum: number, p: any) => sum + (parseFloat(p.estimatedRevenue) - parseFloat(p.estimatedCost)), 0);

  const stressedGrowthProgress = summary.growthTarget20 > 0
    ? (stressedProjectedGrowth / summary.growthTarget20) * 100
    : 0;

  return (
    <main className="min-h-screen bg-[#0b241c] p-6 md:p-12 relative overflow-hidden">
      <Toaster position="bottom-right" />

      {/* Radial soft background glows to give a trendy modern dark visual feel */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#57cc99]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-[#80ed99]/3 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Neon Database Connection Warning / Demo Mode Badge */}
        {isDemo && (
          <div className="bg-[#143028] border border-[#57cc99]/20 rounded-[40px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
            <div className="absolute left-0 top-0 h-full w-2 bg-[#57cc99]" />
            <div className="flex items-center gap-4">
              <div className="bg-[#57cc99]/10 p-3.5 rounded-full text-[#57cc99]">
                <Database className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Modo de Demostración Activo</h4>
                <p className="text-sm text-[#a8b5b0] mt-1 max-w-2xl">
                  Mostrando datos de ejemplo. Para conectar tu base de datos de Neon PostgreSQL real, configura la variable de entorno <code className="text-[#57cc99] bg-[#0b241c] px-2 py-0.5 rounded font-mono text-xs">DATABASE_URL</code> en un archivo <code className="text-[#57cc99] bg-[#0b241c] px-2 py-0.5 rounded font-mono text-xs">.env.local</code>.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#0b241c] bg-[#57cc99] px-4 py-2.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-lg">
              Demostración
            </span>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-[#1d4034]/30">
          {/* Left: Titles */}
          <div className="min-w-0">
            <span className="text-[#57cc99] font-bold text-[10px] tracking-[0.2em] uppercase block">
              Bicode Control Premium
            </span>
            <h1 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mt-0.5 leading-tight">
              Dashboard Financiero
            </h1>
            <p className="text-xs text-[#a8b5b0] mt-1 max-w-md">
              Control premium de activos TI, pasivos fijos, facturación multidivisa y simulaciones de estrés.
            </p>
          </div>

          {/* Right: Controls bar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* T.C. pill */}
            <div className="flex items-center gap-2 bg-[#0b241c] border border-[#1d4034] rounded-full px-3.5 py-2">
              <span className="text-[#57cc99] text-[9px] font-black tracking-[0.15em] uppercase whitespace-nowrap">
                T.C. $1 USD
              </span>
              <span className="text-[#1d4034]">=</span>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={exchangeRate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) setExchangeRate(val);
                }}
                className="bg-transparent text-white text-xs font-bold w-9 text-center focus:outline-none"
              />
              <span className="text-[#a8b5b0] text-[9px] font-bold tracking-widest">PEN</span>
            </div>

            {/* Período pill */}
            <div className="flex items-center gap-2 bg-[#0b241c] border border-[#1d4034] rounded-full px-3.5 py-2">
              <span className="text-[#57cc99] text-[9px] font-black tracking-[0.15em] uppercase whitespace-nowrap">
                Periodo
              </span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="2026-08" className="bg-[#0b241c]">Ago 2026</option>
                <option value="2026-07" className="bg-[#0b241c]">Jul 2026</option>
                <option value="2026-06" className="bg-[#0b241c]">Jun 2026</option>
                <option value="2026-05" className="bg-[#0b241c]">May 2026</option>
                <option value="2026-04" className="bg-[#0b241c]">Abr 2026</option>
                <option value="2026-03" className="bg-[#0b241c]">Mar 2026</option>
                <option value="2026-02" className="bg-[#0b241c]">Feb 2026</option>
                <option value="2026-01" className="bg-[#0b241c]">Ene 2026</option>
                <option value="2025-12" className="bg-[#0b241c]">Dic 2025</option>
                <option value="2025-11" className="bg-[#0b241c]">Nov 2025</option>
                <option value="2025-10" className="bg-[#0b241c]">Oct 2025</option>
                <option value="2025-09" className="bg-[#0b241c]">Sep 2025</option>
                <option value="2025-08" className="bg-[#0b241c]">Ago 2025</option>
              </select>
            </div>

            {/* Export CSV button */}
            <button
              onClick={() => exportFullReportToCSV(data, selectedMonth, exchangeRate)}
              className="flex items-center gap-2 bg-[#143028] border border-[#57cc99]/30 text-[#57cc99] font-bold text-xs rounded-full px-4 py-2.5 hover:bg-[#57cc99] hover:text-[#0b241c] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-lg whitespace-nowrap"
              title="Descargar reporte completo en archivo CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Reporte CSV
            </button>

            {/* CTA button */}
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="flex items-center gap-2 bg-[#57cc99] text-[#0b241c] font-black text-xs rounded-full px-5 py-2.5 hover:bg-[#80ed99] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-lg shadow-[#57cc99]/10 whitespace-nowrap"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Registrar Transacción
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 bg-transparent border border-rose-500/30 text-rose-400 font-bold text-xs rounded-full px-4 py-2.5 hover:bg-rose-500 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-lg whitespace-nowrap disabled:opacity-50"
              title="Cerrar sesión del panel"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </div>

        {/* 5 Metric Cards Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
          <MetricCard
            title="Activos Totales"
            value={`S/${summary.totalAssets.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`}
            subtext="Bancos + Invoices + Hardware + Licencias"
            icon={DollarSign}
          />
          <MetricCard
            title="Pasivos Totales"
            value={`S/${summary.totalLiabilities.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`}
            subtext="Obligaciones consolidadas"
            icon={AlertCircle}
          />
          <MetricCard
            title="Consolidado Neto"
            value={`S/${summary.consolidated.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`}
            subtext="Patrimonio neto real"
            icon={FileSpreadsheet}
          />
          <MetricCard
            title="Ingresos del Mes"
            value={`S/${summary.monthlyIncome.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`}
            subtext="Facturación cobrada"
            icon={TrendingUp}
          />
          <MetricCard
            title="Flujo Caja Neto"
            value={`${summary.netCashFlow >= 0 ? "+" : ""}S/${summary.netCashFlow.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`}
            subtext="Ingresos - Egresos (Efectivo)"
            icon={ArrowRightLeft}
            trend={{
              value: summary.netCashFlow >= 0 ? "Flujo Positivo" : "Déficit Mensual",
              isPositive: summary.netCashFlow >= 0
            }}
          />
        </div>

        {/* Dashboard Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List column */}
          <div className="lg:col-span-2 space-y-8">
            
            <ConsolidatedReport 
              summary={summary} 
              exchangeRate={exchangeRate} 
              onExportCsv={() => exportFullReportToCSV(data, selectedMonth, exchangeRate)}
            />

            {/* Financial Behavior and Break-Even Chart */}
            <BreakEvenChart history={monthlyHistory} />

            {/* 1. Liquidity Gauge and Weighted Debt Cost Component */}
            <LiquidityWeightedDebt 
              liquidityRatio={summary.liquidityRatio} 
              weightedInterestRate={summary.weightedInterestRate} 
              liabilities={liabilities}
            />

            {/* 2. Deadlines Timeline (próximos 30 días) */}
            <UpcomingDeadlines 
              invoices={invoices} 
              liabilities={liabilities} 
            />

            {/* Deadlines Calendar Grid */}
            <FinancialCalendar 
              invoices={invoices} 
              liabilities={liabilities} 
            />

            {/* 3. Interactive Crop/Project Stress Testing Slider Component */}
            <ProjectStressTest 
              stressRevenueChange={stressRevenueChange}
              setStressRevenueChange={setStressRevenueChange}
              stressCostChange={stressCostChange}
              setStressCostChange={setStressCostChange}
            />

            {/* 4. Growth Goal Target Tracker (+20%) Component */}
            <GrowthTargetTracker
              currentNetWorth={summary.consolidated}
              growthTarget20={summary.growthTarget20}
              projectedGrowth={stressedProjectedGrowth}
              growthProgress={stressedGrowthProgress}
            />

            {/* Expense Categories Breakdown Component */}
            <ExpenseBreakdown breakdown={categoryBreakdown} />

            {/* Projections and Future Projects Component */}
            <ProjectionList 
              projections={stressedProjections} 
              onAddClick={() => setIsProjectModalOpen(true)}
              onMutate={() => refetch()}
            />

            {/* Invoices Component */}
            <InvoiceList 
              invoices={invoices} 
              onAddClick={() => setIsInvModalOpen(true)}
              onMutate={() => refetch()}
            />

            {/* Transactions Component */}
            <TransactionList
              transactions={transactions}
              onAddClick={() => setIsTxModalOpen(true)}
              onMutate={() => refetch()}
            />
          </div>
          
          {/* Sidebar accounts, physical assets, and liabilities */}
          <div className="space-y-8">
            <AccountList 
              accounts={accounts} 
              onAddClick={() => setIsAccModalOpen(true)}
            />
            <AssetList 
              assets={assets} 
              onAddClick={() => setIsAssetModalOpen(true)}
              onMutate={() => refetch()}
            />
            <LiabilityList 
              liabilities={liabilities} 
              onAddClick={() => setIsLiaModalOpen(true)}
              onMutate={() => refetch()}
            />
          </div>
        </div>

      </div>

      <AddTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        accounts={accounts.map(a => ({ id: a.id, name: a.name, currency: a.currency }))}
        onSubmitSuccess={() => refetch()}
      />

      {/* 2. Account Dialog Modal */}
      <AddAccountModal
        isOpen={isAccModalOpen}
        onClose={() => setIsAccModalOpen(false)}
        onSubmitSuccess={() => refetch()}
      />

      {/* 3. Liability/Loan Dialog Modal */}
      <AddLiabilityModal
        isOpen={isLiaModalOpen}
        onClose={() => setIsLiaModalOpen(false)}
        onSubmitSuccess={() => refetch()}
      />

      {/* 4. Invoice Dialog Modal */}
      <AddInvoiceModal
        isOpen={isInvModalOpen}
        onClose={() => setIsInvModalOpen(false)}
        onSubmitSuccess={() => refetch()}
      />

      {/* 5. Asset/Land/Stock Dialog Modal */}
      <AddAssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSubmitSuccess={() => refetch()}
      />

      {/* 6. Project/Projection Dialog Modal */}
      <AddProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmitSuccess={() => refetch()}
      />
    </main>
  );
}
