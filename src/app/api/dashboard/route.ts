import { NextResponse } from "next/server";
import { db, isDemo } from "@/db/connection";
import { accounts, transactions, liabilities, invoices, propertiesAssets, projections } from "@/db/schema";
import { desc } from "drizzle-orm";


// Mock Fixed Assets and Inventory for Demo Mode
const MOCK_ASSETS = [
  { id: "ast-1", name: "Cluster Servidores Cloud locales", value: "75000.00", type: "servers", currency: "PEN", createdAt: new Date("2025-06-15") },
  { id: "ast-2", name: "Oficina Miraflores (Sede Central)", value: "320000.00", type: "property", currency: "PEN", createdAt: new Date("2026-03-10") },
  { id: "ast-3", name: "Laptops de Desarrollo Pro (Equipos)", value: "18000.00", type: "hardware", currency: "PEN", createdAt: new Date("2025-10-01") },
  { id: "ast-4", name: "Stock Licencias SaaS Factura-E", value: "3450.00", type: "software_licenses", currency: "PEN", createdAt: new Date("2026-07-28") },
  { id: "ast-5", name: "Stock Licencias API Integración", value: "4800.00", type: "software_licenses", currency: "PEN", createdAt: new Date("2026-07-29") },
];

// Mock Future Project Projections
const MOCK_PROJECTIONS = [
  { id: "prj-1", name: "SaaS Facturación Electrónica Q4", estimatedRevenue: "85000.00", estimatedCost: "32000.00", status: "active", currency: "PEN", createdAt: new Date("2026-07-01") },
  { id: "prj-2", name: "Desarrollo ERP Corporativo 2027", estimatedRevenue: "45000.00", estimatedCost: "15000.00", status: "planned", currency: "USD", createdAt: new Date("2026-08-01") }, // USD Project
  { id: "prj-3", name: "App Móvil Clave Fase B", estimatedRevenue: "60000.00", estimatedCost: "25000.00", status: "planned", currency: "PEN", createdAt: new Date("2026-08-01") },
];

// Mock Invoices
const MOCK_INVOICES = [
  { id: "inv-1", clientName: "Factura #201 - Tech Corp (Desarrollo)", amount: "4800.00", status: "paid", paymentTerms: "immediate", dueDate: new Date("2026-07-27"), currency: "USD", createdAt: new Date("2026-07-15") }, // USD Invoice
  { id: "inv-2", clientName: "Factura #202 - Alpha Inc (DevOps)", amount: "2500.00", status: "pending", paymentTerms: "30_days", dueDate: new Date("2026-08-30"), currency: "USD", createdAt: new Date("2026-07-31") },  // USD Invoice
  { id: "inv-3", clientName: "Factura #203 - Beta LLC (Consultoría)", amount: "12000.00", status: "pending", paymentTerms: "60_days", dueDate: new Date("2026-10-01"), currency: "PEN", createdAt: new Date("2026-08-01") },
  { id: "inv-4", clientName: "Factura #199 - Gamma Group (Auditoría)", amount: "6500.00", status: "overdue", paymentTerms: "30_days", dueDate: new Date("2026-07-28"), currency: "PEN", createdAt: new Date("2026-06-28") },
  { id: "inv-5", clientName: "Trabajo Terminado - Delta Co (Desarrollo Web)", amount: "5400.00", status: "unbilled", paymentTerms: "30_days", dueDate: null, currency: "PEN", createdAt: new Date("2026-07-31") },
  { id: "inv-6", clientName: "Servicio Cloud - Epsilon LLC (Migración)", amount: "3100.00", status: "unbilled", paymentTerms: "60_days", dueDate: null, currency: "PEN", createdAt: new Date("2026-07-29") },
  { id: "inv-7", clientName: "Factura Histórica #105 - Sigma Inc", amount: "5200.00", status: "paid", paymentTerms: "immediate", dueDate: new Date("2025-08-25"), currency: "PEN", createdAt: new Date("2025-08-10") }
];

// Mock Accounts
const MOCK_ACCOUNTS = [
  { id: "acc-1", name: "BBVA Negocios Soles", balance: "42450.00", type: "checking", currency: "PEN", createdAt: new Date("2024-12-01") },
  { id: "acc-2", name: "Santander USD Reserva", balance: "15500.00", type: "savings", currency: "USD", createdAt: new Date("2024-12-01") }, // USD Account
  { id: "acc-3", name: "Caja Chica Soles", balance: "1850.00", type: "checking", currency: "PEN", createdAt: new Date("2024-12-01") },
];

// Mock Transactions dated across months
const MOCK_TRANSACTIONS = [
  { id: "tx-1", accountId: "acc-2", type: "income", amount: "4800.00", description: "Cobro Factura #201 (Tech Corp)", category: "Ingreso Empresa", currency: "USD", date: new Date("2026-07-27") },
  { id: "tx-2", accountId: "acc-1", type: "rent", amount: "4500.00", description: "Renta Oficina Miraflores", category: "Alquiler", currency: "PEN", date: new Date("2026-07-28") },
  { id: "tx-3", accountId: "acc-1", type: "expense", amount: "15700.00", description: "Pago Planilla Trabajadores (Quincena)", category: "Planilla Trabajadores", currency: "PEN", date: new Date("2026-08-01") },
  { id: "tx-4", accountId: "acc-1", type: "expense", amount: "2500.00", description: "Mensualidad Colegio de los Niños", category: "Educación", currency: "PEN", date: new Date("2026-07-27") },
  { id: "tx-5", accountId: "acc-1", type: "expense", amount: "1800.00", description: "Supermercado y Alimentación Familiar", category: "Alimentación", currency: "PEN", date: new Date("2026-07-30") },
  { id: "tx-6", accountId: "acc-2", type: "expense", amount: "450.00", description: "Servidores Cloud AWS / Azure", category: "Servicios Básicos", currency: "USD", date: new Date("2026-07-26") }, // USD Expense
  { id: "tx-7", accountId: "acc-1", type: "expense", amount: "450.00", description: "Ocio y Salida Familiar Fin de Semana", category: "Ocio", currency: "PEN", date: new Date("2026-07-25") },
  { id: "tx-8", accountId: "acc-1", type: "expense", amount: "800.00", description: "Pasajes, Combustible y Movilidad", category: "Transporte", currency: "PEN", date: new Date("2026-07-27") },
  { id: "tx-9", accountId: "acc-1", type: "income", amount: "9800.00", description: "Consultoría TI Local", category: "Ingreso Empresa", currency: "PEN", date: new Date("2026-07-24") },
  { id: "tx-10", accountId: "acc-1", type: "income", amount: "5200.00", description: "Cobro Factura #105 (Sigma Inc)", category: "Ingreso Empresa", currency: "PEN", date: new Date("2025-08-25") },
  { id: "tx-11", accountId: "acc-1", type: "expense", amount: "3100.00", description: "Pago Planilla Trabajadores 2025", category: "Planilla Trabajadores", currency: "PEN", date: new Date("2025-08-15") },
  { id: "tx-12", accountId: "acc-1", type: "expense", amount: "750.00", description: "Mensualidad Colegio Niños 2025", category: "Educación", currency: "PEN", date: new Date("2025-08-05") },
];

// Mock Liabilities
const MOCK_LIABILITIES = [
  { id: "lia-1", name: "Préstamo Comercial BBVA", amount: "25000.00", interestRate: "5.50", type: "financial", dueDate: new Date("2026-12-18"), installmentAmount: "1500.00", pendingInstallments: 18, currency: "PEN", createdAt: new Date("2025-12-15") },
  { id: "lia-2", name: "Tarjeta Visa Corporate USD", amount: "1200.00", interestRate: "18.90", type: "financial", dueDate: new Date("2026-08-10"), installmentAmount: "1200.00", pendingInstallments: 1, currency: "USD", createdAt: new Date("2026-01-10") }, // USD Loan
  { id: "lia-3", name: "Leasing Servidores Dell", amount: "8900.00", interestRate: "4.20", type: "financial", dueDate: new Date("2026-10-22"), installmentAmount: "450.00", pendingInstallments: 20, currency: "PEN", createdAt: new Date("2025-10-22") },
  { id: "lia-4", name: "Préstamo Personal - Dr. Juan Gómez", amount: "7500.00", interestRate: "0.00", type: "personal", dueDate: new Date("2026-11-01"), installmentAmount: "500.00", pendingInstallments: 15, currency: "PEN", createdAt: new Date("2026-05-01") },
  { id: "lia-5", name: "Fraccionamiento Deuda SUNAT", amount: "12000.00", interestRate: "1.20", type: "tax", dueDate: new Date("2027-08-10"), installmentAmount: "1000.00", pendingInstallments: 12, currency: "PEN", createdAt: new Date("2026-08-01") },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month"); // Format "YYYY-MM"
    const rateParam = searchParams.get("exchangeRate");
    const EXCHANGE_RATE = rateParam ? parseFloat(rateParam) : 3.4;

    const toPEN = (amount: number, currency: string) => {
      return currency === "USD" ? amount * EXCHANGE_RATE : amount;
    };

    let filterEndDate: Date | null = null;
    if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number);
      filterEndDate = new Date(year, month, 0, 23, 59, 59, 999);
    }

    // Helper function to build 6-month history dynamically (consolidated in PEN)
    const buildMonthlyHistory = (txs: any[]) => {
      const today = filterEndDate || new Date();
      const history = [];
      const monthNamesShort = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const mIndex = d.getMonth();
        const yVal = d.getFullYear();
        const monthLabel = monthNamesShort[mIndex];

        // Filter transactions for this month and year
        const monthTxs = txs.filter(t => {
          const txDate = new Date(t.date);
          return txDate.getFullYear() === yVal && txDate.getMonth() === mIndex;
        });

        const income = monthTxs.filter(t => t.type === "income").reduce((sum, t) => sum + toPEN(parseFloat(t.amount || "0"), t.currency), 0);
        const expenses = monthTxs.filter(t => t.type === "expense").reduce((sum, t) => sum + toPEN(parseFloat(t.amount || "0"), t.currency), 0);
        const rent = monthTxs.filter(t => t.type === "rent").reduce((sum, t) => sum + toPEN(parseFloat(t.amount || "0"), t.currency), 0);
        const totalExpenses = expenses + rent;

        // Fixed Costs (Alquiler + Planilla + Educación + Servicios)
        const fixedCosts = monthTxs.filter(t => 
          t.type === "rent" || 
          (t.type === "expense" && ["Planilla Trabajadores", "Educación", "Servicios Básicos"].includes(t.category))
        ).reduce((sum, t) => sum + toPEN(parseFloat(t.amount || "0"), t.currency), 0);

        let finalIncome = income;
        let finalExpenses = totalExpenses;
        let finalBreakEven = fixedCosts;

        // Fallback for mock/demo visualization curves (simulated in Soles)
        if (income === 0 && totalExpenses === 0) {
          const mockHistoryMap: Record<string, { income: number, expenses: number, breakEven: number }> = {
            "Mar": { income: 35000, expenses: 25000, breakEven: 22000 },
            "Abr": { income: 32000, expenses: 26000, breakEven: 22000 },
            "May": { income: 36000, expenses: 27000, breakEven: 24000 },
            "Jun": { income: 26000, expenses: 28000, breakEven: 24500 }, // deficit
            "Jul": { income: 39000, expenses: 28000, breakEven: 24500 },
            "Ago": { income: 37500, expenses: 26200, breakEven: 24500 }
          };
          const simulated = mockHistoryMap[monthLabel];
          if (simulated) {
            finalIncome = simulated.income;
            finalExpenses = simulated.expenses;
            finalBreakEven = simulated.breakEven;
          } else {
            finalIncome = 32000;
            finalExpenses = 24000;
            finalBreakEven = 22000;
          }
        }

        history.push({
          month: monthLabel,
          income: finalIncome,
          expenses: finalExpenses,
          breakEven: finalBreakEven
        });
      }
      return history;
    };

    if (isDemo || !db) {
      // Filter Mock Data by cut-off date if filtering is active
      const filteredAccounts = MOCK_ACCOUNTS.filter(acc => 
        !filterEndDate || new Date(acc.createdAt).getTime() <= filterEndDate.getTime()
      );

      const filteredTransactions = MOCK_TRANSACTIONS.filter(tx => 
        !filterEndDate || new Date(tx.date).getTime() <= filterEndDate.getTime()
      );

      const filteredLiabilities = MOCK_LIABILITIES.filter(l => 
        !filterEndDate || new Date(l.createdAt).getTime() <= filterEndDate.getTime()
      );

      const filteredInvoices = MOCK_INVOICES.filter(inv => 
        !filterEndDate || new Date(inv.createdAt).getTime() <= filterEndDate.getTime()
      ).map(inv => {
        let status = inv.status;
        if (filterEndDate && status === "paid" && inv.dueDate && new Date(inv.dueDate).getTime() > filterEndDate.getTime()) {
          status = new Date(inv.dueDate).getTime() < filterEndDate.getTime() ? "overdue" : "pending";
        }
        return { ...inv, status };
      });

      const filteredAssets = MOCK_ASSETS.filter(ast => 
        !filterEndDate || new Date(ast.createdAt).getTime() <= filterEndDate.getTime()
      );

      const filteredProjections = MOCK_PROJECTIONS.filter(prj => 
        !filterEndDate || new Date(prj.createdAt).getTime() <= filterEndDate.getTime()
      );

      // BACK-CALCULATE Account Balances (reconstruction in native currency)
      const reconstructedAccounts = filteredAccounts.map(acc => {
        let balance = parseFloat(acc.balance);
        if (filterEndDate) {
          const futureTxs = MOCK_TRANSACTIONS.filter(tx => 
            tx.accountId === acc.id && 
            new Date(tx.date).getTime() > filterEndDate!.getTime()
          );
          futureTxs.forEach(tx => {
            if (tx.type === "income") {
              balance -= parseFloat(tx.amount);
            } else {
              balance += parseFloat(tx.amount);
            }
          });
        }
        return {
          ...acc,
          balance: balance.toFixed(2),
        };
      });

      // CONVERT AND AGGREGATE metrics in Soles (PEN)
      const totalBalance = reconstructedAccounts.reduce((sum, acc) => sum + toPEN(parseFloat(acc.balance), acc.currency), 0);
      const totalUnbilled = filteredInvoices.filter(inv => inv.status === "unbilled").reduce((sum, inv) => sum + toPEN(parseFloat(inv.amount), inv.currency), 0);
      const totalReceivables = filteredInvoices.filter(inv => inv.status === "pending" || inv.status === "overdue").reduce((sum, inv) => sum + toPEN(parseFloat(inv.amount), inv.currency), 0);
      const totalFixedAssets = filteredAssets.filter(ast => ast.type !== "software_licenses").reduce((sum, ast) => sum + toPEN(parseFloat(ast.value), ast.currency), 0);
      const totalInventory = filteredAssets.filter(ast => ast.type === "software_licenses").reduce((sum, ast) => sum + toPEN(parseFloat(ast.value), ast.currency), 0);
      const totalAssets = totalBalance + totalUnbilled + totalReceivables + totalFixedAssets + totalInventory;

      const totalFinancialLiabilities = filteredLiabilities.filter(l => l.type === "financial" || l.type === "tax").reduce((sum, l) => sum + toPEN(parseFloat(l.amount), l.currency), 0);
      const totalPersonalLiabilities = filteredLiabilities.filter(l => l.type === "personal").reduce((sum, l) => sum + toPEN(parseFloat(l.amount), l.currency), 0);
      const totalLiabilities = totalFinancialLiabilities + totalPersonalLiabilities;

      const consolidated = totalAssets - totalLiabilities;

      // Group expenses in PEN
      const categoryBreakdownMap: Record<string, number> = {};
      const expenseList = filteredTransactions.filter(t => t.type === "expense" || t.type === "rent");
      expenseList.forEach(t => {
        categoryBreakdownMap[t.category] = (categoryBreakdownMap[t.category] || 0) + toPEN(parseFloat(t.amount), t.currency);
      });
      const categoryBreakdown = Object.entries(categoryBreakdownMap).map(([category, total]) => ({
        category,
        total,
      })).sort((a, b) => b.total - a.total);

      // Growth calculations in PEN
      const growthTarget20 = consolidated * 0.20;
      const projectedGrowth = filteredProjections
        .filter(p => p.status === "planned" || p.status === "active")
        .reduce((sum, p) => sum + toPEN(parseFloat(p.estimatedRevenue) - parseFloat(p.estimatedCost), p.currency), 0);
      const growthProgress = growthTarget20 > 0 ? (projectedGrowth / growthTarget20) * 100 : 0;

      // Cashflow for the selected month in PEN
      let targetMonthTxs = filteredTransactions;
      if (filterEndDate) {
        const filterYear = filterEndDate.getFullYear();
        const filterMonthIndex = filterEndDate.getMonth();
        targetMonthTxs = filteredTransactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate.getFullYear() === filterYear && tDate.getMonth() === filterMonthIndex;
        });
      }
      const monthlyIncome = targetMonthTxs.filter(t => t.type === "income").reduce((sum, t) => sum + toPEN(parseFloat(t.amount), t.currency), 0);
      const monthlyExpenses = targetMonthTxs.filter(t => t.type === "expense").reduce((sum, t) => sum + toPEN(parseFloat(t.amount), t.currency), 0);
      const monthlyRent = targetMonthTxs.filter(t => t.type === "rent").reduce((sum, t) => sum + toPEN(parseFloat(t.amount), t.currency), 0);

      const netCashFlow = monthlyIncome - (monthlyExpenses + monthlyRent);
      const liquidityRatio = totalLiabilities > 0 ? totalBalance / totalLiabilities : 1.0;
      const weightedInterestRate = totalLiabilities > 0
        ? filteredLiabilities.reduce((sum, l) => sum + (toPEN(parseFloat(l.amount), l.currency) * parseFloat(l.interestRate)), 0) / totalLiabilities
        : 0;

      const monthlyHistory = buildMonthlyHistory(filteredTransactions);

      return NextResponse.json({
        isDemo: true,
        accounts: reconstructedAccounts,
        transactions: filteredTransactions,
        liabilities: filteredLiabilities,
        invoices: filteredInvoices,
        assets: filteredAssets,
        projections: filteredProjections,
        categoryBreakdown,
        monthlyHistory,
        summary: {
          totalBalance,
          totalUnbilled,
          totalReceivables,
          totalFixedAssets,
          totalInventory,
          totalAssets,
          totalFinancialLiabilities,
          totalPersonalLiabilities,
          totalLiabilities,
          consolidated,
          monthlyIncome,
          monthlyExpenses,
          monthlyRent,
          growthTarget20,
          projectedGrowth,
          growthProgress,
          netCashFlow,
          liquidityRatio,
          weightedInterestRate,
        }
      });
    }

    // Query Drizzle tables when connected to Neon
    const dbAccounts = await db.select().from(accounts);
    const dbTransactions = await db.select().from(transactions).orderBy(desc(transactions.date));
    const dbLiabilities = await db.select().from(liabilities);
    const dbInvoices = await db.select().from(invoices).orderBy(desc(invoices.createdAt));
    const dbAssets = await db.select().from(propertiesAssets).orderBy(desc(propertiesAssets.createdAt));
    const dbProjections = await db.select().from(projections).orderBy(desc(projections.createdAt));

    // Filter database rows by cutoff date
    const filteredAccounts = dbAccounts.filter(acc => 
      !filterEndDate || new Date(acc.createdAt).getTime() <= filterEndDate.getTime()
    );

    const filteredTransactions = dbTransactions.filter(tx => 
      !filterEndDate || new Date(tx.date).getTime() <= filterEndDate.getTime()
    );

    const filteredLiabilities = dbLiabilities.filter(l => 
      !filterEndDate || new Date(l.createdAt).getTime() <= filterEndDate.getTime()
    );

    const filteredInvoices = dbInvoices.filter(inv => 
      !filterEndDate || new Date(inv.createdAt).getTime() <= filterEndDate.getTime()
    ).map(inv => {
      let status = inv.status;
      if (filterEndDate && status === "paid" && inv.dueDate && new Date(inv.dueDate).getTime() > filterEndDate.getTime()) {
        status = new Date(inv.dueDate).getTime() < filterEndDate.getTime() ? "overdue" : "pending";
      }
      return { ...inv, status };
    });

    const filteredAssets = dbAssets.filter(ast => 
      !filterEndDate || new Date(ast.createdAt).getTime() <= filterEndDate.getTime()
    );

    const filteredProjections = dbProjections.filter(prj => 
      !filterEndDate || new Date(prj.createdAt).getTime() <= filterEndDate.getTime()
    );

    // BACK-CALCULATE Account Balances
    const reconstructedAccounts = filteredAccounts.map(acc => {
      let balance = parseFloat(acc.balance || "0");
      if (filterEndDate) {
        const futureTxs = dbTransactions.filter(tx => 
          tx.accountId === acc.id && 
          new Date(tx.date).getTime() > filterEndDate!.getTime()
        );
        futureTxs.forEach(tx => {
          const amt = parseFloat(tx.amount || "0");
          if (tx.type === "income") {
            balance -= amt;
          } else {
            balance += amt;
          }
        });
      }
      return {
        ...acc,
        balance: balance.toFixed(2),
      };
    });

    const totalBalance = reconstructedAccounts.reduce((sum, acc) => sum + toPEN(parseFloat(acc.balance), acc.currency), 0);
    const totalUnbilled = filteredInvoices.filter(inv => inv.status === "unbilled").reduce((sum, inv) => sum + toPEN(parseFloat(inv.amount || "0"), inv.currency), 0);
    const totalReceivables = filteredInvoices.filter(inv => inv.status === "pending" || inv.status === "overdue").reduce((sum, inv) => sum + toPEN(parseFloat(inv.amount || "0"), inv.currency), 0);
    const totalFixedAssets = filteredAssets.filter(ast => ast.type !== "software_licenses").reduce((sum, ast) => sum + toPEN(parseFloat(ast.value || "0"), ast.currency), 0);
    const totalInventory = filteredAssets.filter(ast => ast.type === "software_licenses").reduce((sum, ast) => sum + toPEN(parseFloat(ast.value || "0"), ast.currency), 0);
    const totalAssets = totalBalance + totalUnbilled + totalReceivables + totalFixedAssets + totalInventory;

    const totalFinancialLiabilities = filteredLiabilities.filter(l => l.type === "financial" || l.type === "tax").reduce((sum, l) => sum + toPEN(parseFloat(l.amount || "0"), l.currency), 0);
    const totalPersonalLiabilities = filteredLiabilities.filter(l => l.type === "personal").reduce((sum, l) => sum + toPEN(parseFloat(l.amount || "0"), l.currency), 0);
    const totalLiabilities = totalFinancialLiabilities + totalPersonalLiabilities;

    const consolidated = totalAssets - totalLiabilities;

    // Group expenses in PEN
    const categoryBreakdownMap: Record<string, number> = {};
    const dbExpenseList = filteredTransactions.filter(t => t.type === "expense" || t.type === "rent");
    dbExpenseList.forEach(t => {
      categoryBreakdownMap[t.category] = (categoryBreakdownMap[t.category] || 0) + toPEN(parseFloat(t.amount || "0"), t.currency);
    });
    const categoryBreakdown = Object.entries(categoryBreakdownMap).map(([category, total]) => ({
      category,
      total,
    })).sort((a, b) => b.total - a.total);

    // Growth calculations in PEN
    const growthTarget20 = consolidated * 0.20;
    const projectedGrowth = filteredProjections
      .filter(p => p.status === "planned" || p.status === "active")
      .reduce((sum, p) => sum + toPEN(parseFloat(p.estimatedRevenue) - parseFloat(p.estimatedCost), p.currency), 0);
    const growthProgress = growthTarget20 > 0 ? (projectedGrowth / growthTarget20) * 100 : 0;

    // Monthly cashflow for that selected month in PEN
    let targetMonthTxs = filteredTransactions;
    if (filterEndDate) {
      const filterYear = filterEndDate.getFullYear();
      const filterMonthIndex = filterEndDate.getMonth();
      targetMonthTxs = filteredTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === filterYear && tDate.getMonth() === filterMonthIndex;
      });
    }
    const monthlyIncome = targetMonthTxs.filter(t => t.type === "income").reduce((sum, t) => sum + toPEN(parseFloat(t.amount || "0"), t.currency), 0);
    const monthlyExpenses = targetMonthTxs.filter(t => t.type === "expense").reduce((sum, t) => sum + toPEN(parseFloat(t.amount || "0"), t.currency), 0);
    const monthlyRent = targetMonthTxs.filter(t => t.type === "rent").reduce((sum, t) => sum + toPEN(parseFloat(t.amount || "0"), t.currency), 0);

    const netCashFlow = monthlyIncome - (monthlyExpenses + monthlyRent);
    const liquidityRatio = totalLiabilities > 0 ? totalBalance / totalLiabilities : 1.0;
    const weightedInterestRate = totalLiabilities > 0
      ? filteredLiabilities.reduce((sum, l) => sum + (toPEN(parseFloat(l.amount || "0"), l.currency) * parseFloat(l.interestRate || "0")), 0) / totalLiabilities
      : 0;

    const monthlyHistory = buildMonthlyHistory(filteredTransactions);

    return NextResponse.json({
      isDemo: false,
      accounts: reconstructedAccounts,
      transactions: filteredTransactions.map(t => ({ ...t, amount: parseFloat(t.amount || "0").toString() })),
      liabilities: filteredLiabilities.map(l => ({ ...l, amount: parseFloat(l.amount || "0").toString(), interestRate: parseFloat(l.interestRate || "0").toString() })),
      invoices: filteredInvoices.map(inv => ({ ...inv, amount: parseFloat(inv.amount || "0").toString() })),
      assets: filteredAssets.map(ast => ({ ...ast, value: parseFloat(ast.value || "0").toString() })),
      projections: filteredProjections.map(prj => ({ ...prj, estimatedRevenue: parseFloat(prj.estimatedRevenue || "0").toString(), estimatedCost: parseFloat(prj.estimatedCost || "0").toString() })),
      categoryBreakdown,
      monthlyHistory,
      summary: {
        totalBalance,
        totalUnbilled,
        totalReceivables,
        totalFixedAssets,
        totalInventory,
        totalAssets,
        totalFinancialLiabilities,
        totalPersonalLiabilities,
        totalLiabilities,
        consolidated,
        monthlyIncome,
        monthlyExpenses,
        monthlyRent,
        growthTarget20,
        projectedGrowth,
        growthProgress,
        netCashFlow,
        liquidityRatio,
        weightedInterestRate,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al recuperar datos financieros históricos", details: error.message },
      { status: 500 }
    );
  }
}
