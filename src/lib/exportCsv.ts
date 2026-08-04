import { toast } from "react-hot-toast";

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

export type DashboardData = {
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

// Helper to escape CSV strings cleanly
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Helper to format currency numbers
function fmtNum(val: number | string): string {
  const num = typeof val === "number" ? val : parseFloat(val || "0");
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

export function exportFullReportToCSV(
  data: DashboardData,
  selectedMonth: string,
  exchangeRate: number
) {
  try {
    const lines: string[] = [];
    const now = new Date();
    const exportDateStr = now.toISOString().split("T")[0] + " " + now.toTimeString().split(" ")[0];

    const toPEN = (amount: number | string, currency: string) => {
      const num = typeof amount === "number" ? amount : parseFloat(amount || "0");
      return currency === "USD" ? num * exchangeRate : num;
    };

    // --- ENCABEZADO METADATOS ---
    lines.push("================================================================================");
    lines.push("REPORTE FINANCIERO Y PATRIMONIAL CONSOLIDADO COMPLETO - BICODE");
    lines.push(`Periodo Evaluado: ${selectedMonth} | Tipo de Cambio: S/ ${exchangeRate.toFixed(2)} PEN por USD | Fecha de Exportacion: ${exportDateStr}`);
    lines.push("================================================================================");
    lines.push("");

    // --- SECCIÓN 1: RESUMEN GENERAL ---
    lines.push("--- 1. RESUMEN GENERAL Y METRICAS CLAVE ---");
    lines.push(["Metrica", "Valor en PEN (S/)", "Descripcion"].map(escapeCSV).join(","));
    
    lines.push([
      "Activos Totales",
      fmtNum(data.summary.totalAssets),
      "Saldo Bancario + Invoices Pendientes + hardware/Servidores + Licencias"
    ].map(escapeCSV).join(","));

    lines.push([
      "Pasivos Totales",
      fmtNum(data.summary.totalLiabilities),
      "Deudas Financieras (Bancos) + Prestamos Personales + SUNAT"
    ].map(escapeCSV).join(","));

    lines.push([
      "Consolidado Neto (Patrimonio)",
      fmtNum(data.summary.consolidated),
      "Activos Totales menos Pasivos Totales"
    ].map(escapeCSV).join(","));

    lines.push([
      "Ingresos del Mes",
      fmtNum(data.summary.monthlyIncome),
      "Facturacion efectivamente cobrada en el periodo"
    ].map(escapeCSV).join(","));

    lines.push([
      "Egresos del Mes",
      fmtNum(data.summary.monthlyExpenses),
      "Gastos operativos, planillas y servicios en el periodo"
    ].map(escapeCSV).join(","));

    lines.push([
      "Flujo de Caja Neto",
      fmtNum(data.summary.netCashFlow),
      "Ingresos del mes menos Egresos del mes"
    ].map(escapeCSV).join(","));

    lines.push([
      "Razon de Liquidez (Current Ratio)",
      fmtNum(data.summary.liquidityRatio),
      "Proporcion de activos liquidos sobre pasivos corrientes"
    ].map(escapeCSV).join(","));

    lines.push([
      "Tasa de Interes Ponderada Deuda (%)",
      fmtNum(data.summary.weightedInterestRate) + "%",
      "Costo promedio de financiamiento de pasivos activos"
    ].map(escapeCSV).join(","));

    lines.push("");

    // --- SECCIÓN 2: TRANSACCIONES ---
    lines.push("--- 2. REGISTRO COMPLETO DE TRANSACCIONES ---");
    lines.push([
      "ID",
      "Fecha",
      "Descripcion",
      "Categoria",
      "Tipo",
      "Moneda Original",
      "Monto Original",
      "Equivalente en PEN (S/)"
    ].map(escapeCSV).join(","));

    data.transactions.forEach((tx) => {
      const origAmt = parseFloat(tx.amount || "0");
      const penAmt = toPEN(origAmt, tx.currency || "PEN");
      const dateStr = tx.date ? new Date(tx.date).toISOString().split("T")[0] : "";
      
      lines.push([
        tx.id,
        dateStr,
        tx.description,
        tx.category,
        tx.type === "income" ? "Ingreso" : tx.type === "rent" ? "Renta/Alquiler" : "Egreso",
        tx.currency || "PEN",
        fmtNum(origAmt),
        fmtNum(penAmt)
      ].map(escapeCSV).join(","));
    });

    lines.push("");

    // --- SECCIÓN 3: CUENTAS BANCARIAS ---
    lines.push("--- 3. CUENTAS BANCARIAS Y DISPONIBILIDADES ---");
    lines.push([
      "ID",
      "Nombre de Cuenta",
      "Tipo de Cuenta",
      "Moneda Original",
      "Saldo Original",
      "Saldo Equivalente en PEN (S/)"
    ].map(escapeCSV).join(","));

    data.accounts.forEach((acc) => {
      const origBal = parseFloat(acc.balance || "0");
      const penBal = toPEN(origBal, acc.currency || "PEN");

      lines.push([
        acc.id,
        acc.name,
        acc.type === "checking" ? "Cuenta Corriente" : acc.type === "savings" ? "Cuenta de Ahorros" : acc.type,
        acc.currency || "PEN",
        fmtNum(origBal),
        fmtNum(penBal)
      ].map(escapeCSV).join(","));
    });

    lines.push("");

    // --- SECCIÓN 4: FACTURACIÓN E INVOICES ---
    lines.push("--- 4. FACTURACION E INVOICES DE CLIENTES ---");
    lines.push([
      "ID",
      "Cliente / Concepto",
      "Estado",
      "Terminos de Pago",
      "Fecha de Vencimiento",
      "Moneda Original",
      "Monto Original",
      "Monto Equivalente en PEN (S/)"
    ].map(escapeCSV).join(","));

    data.invoices.forEach((inv) => {
      const origAmt = parseFloat(inv.amount || "0");
      const penAmt = toPEN(origAmt, inv.currency || "PEN");
      const dueStr = inv.dueDate ? new Date(inv.dueDate).toISOString().split("T")[0] : "Sin fecha";

      const statusMap: Record<string, string> = {
        paid: "Pagado",
        pending: "Pendiente de Cobro",
        overdue: "Vencido (En Mora)",
        unbilled: "Trabajo Terminado (No Facturado)"
      };

      lines.push([
        inv.id,
        inv.clientName,
        statusMap[inv.status] || inv.status,
        inv.paymentTerms,
        dueStr,
        inv.currency || "PEN",
        fmtNum(origAmt),
        fmtNum(penAmt)
      ].map(escapeCSV).join(","));
    });

    lines.push("");

    // --- SECCIÓN 5: PASIVOS Y DEUDAS ---
    lines.push("--- 5. PASIVOS Y DEUDAS FINANCIERAS ---");
    lines.push([
      "ID",
      "Nombre de Obligacion",
      "Tipo de Deuda",
      "Tasa Interes (%)",
      "Cuota Mensual Original",
      "Cuotas Pendientes",
      "Fecha Vencimiento",
      "Moneda Original",
      "Monto Total Original",
      "Monto Total en PEN (S/)"
    ].map(escapeCSV).join(","));

    data.liabilities.forEach((lia) => {
      const origAmt = parseFloat(lia.amount || "0");
      const penAmt = toPEN(origAmt, lia.currency || "PEN");
      const origInst = parseFloat(lia.installmentAmount || "0");
      const dueStr = lia.dueDate ? new Date(lia.dueDate).toISOString().split("T")[0] : "N/A";

      const typeMap: Record<string, string> = {
        financial: "Bancaria / Comercial",
        personal: "Prestamo Personal",
        tax: "Deuda Tributaria / SUNAT"
      };

      lines.push([
        lia.id,
        lia.name,
        typeMap[lia.type] || lia.type,
        fmtNum(lia.interestRate || 0) + "%",
        fmtNum(origInst),
        lia.pendingInstallments || 0,
        dueStr,
        lia.currency || "PEN",
        fmtNum(origAmt),
        fmtNum(penAmt)
      ].map(escapeCSV).join(","));
    });

    lines.push("");

    // --- SECCIÓN 6: ACTIVOS FÍSICOS Y SOFTWARE ---
    lines.push("--- 6. ACTIVOS FISICOS, IT Y SOFTWARE ---");
    lines.push([
      "ID",
      "Nombre del Activo",
      "Tipo de Activo",
      "Moneda Original",
      "Valor Original",
      "Valor Equivalente en PEN (S/)"
    ].map(escapeCSV).join(","));

    data.assets.forEach((ast) => {
      const origVal = parseFloat(ast.value || "0");
      const penVal = toPEN(origVal, ast.currency || "PEN");

      const typeMap: Record<string, string> = {
        property: "Inmueble / Sede",
        servers: "Servidores / Infraestructura Cloud",
        hardware: "Hardware / Equipos TI",
        software_licenses: "Licencias Software"
      };

      lines.push([
        ast.id,
        ast.name,
        typeMap[ast.type] || ast.type,
        ast.currency || "PEN",
        fmtNum(origVal),
        fmtNum(penVal)
      ].map(escapeCSV).join(","));
    });

    lines.push("");

    // --- SECCIÓN 7: PROYECCIONES Y PROYECTOS FUTUROS ---
    lines.push("--- 7. PROYECCIONES Y PROYECTOS FUTUROS ---");
    lines.push([
      "ID",
      "Nombre del Proyecto",
      "Estado",
      "Moneda Original",
      "Ingreso Est. Original",
      "Costo Est. Original",
      "Margen Est. PEN (S/)"
    ].map(escapeCSV).join(","));

    data.projections.forEach((prj) => {
      const rev = parseFloat(prj.estimatedRevenue || "0");
      const cost = parseFloat(prj.estimatedCost || "0");
      const netPen = toPEN(rev - cost, prj.currency || "PEN");

      const statusMap: Record<string, string> = {
        planned: "Planificado",
        active: "En Ejecucion",
        completed: "Completado"
      };

      lines.push([
        prj.id,
        prj.name,
        statusMap[prj.status] || prj.status,
        prj.currency || "PEN",
        fmtNum(rev),
        fmtNum(cost),
        fmtNum(netPen)
      ].map(escapeCSV).join(","));
    });

    // Add UTF-8 BOM byte order mark to force Excel to correctly render accented characters
    const csvContent = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_financiero_completo_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("¡Reporte completo descargado con éxito en formato .csv!");
  } catch (err) {
    console.error("Error al exportar reporte a CSV:", err);
    toast.error("Hubo un error al generar el reporte CSV.");
  }
}
