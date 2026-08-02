import { NextResponse } from "next/server";
import { db, isDemo } from "@/db/connection";
import { liabilities } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, amount, interestRate, type, dueDate, installmentAmount, pendingInstallments, currency } = body;

    if (!name || amount === undefined || interestRate === undefined || !type) {
      return NextResponse.json({ error: "Campos obligatorios faltantes (name, amount, interestRate, type)" }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);
    const numericRate = parseFloat(interestRate);
    if (isNaN(numericAmount) || isNaN(numericRate)) {
      return NextResponse.json({ error: "El monto y la tasa de interés deben ser números válidos" }, { status: 400 });
    }

    const numericInstallment = installmentAmount ? parseFloat(installmentAmount) : 0;
    const intPending = pendingInstallments ? parseInt(pendingInstallments) : 0;
    const finalCurrency = currency || "PEN";

    if (isDemo || !db) {
      return NextResponse.json({
        success: true, isDemo: true, message: "Pasivo/Préstamo registrado en modo demostración",
        liability: { id: `lia-demo-${Math.random().toString(36).substring(2, 11)}`, name, amount: numericAmount.toFixed(2), interestRate: numericRate.toFixed(2), type, dueDate: dueDate ? new Date(dueDate) : null, installmentAmount: numericInstallment.toFixed(2), pendingInstallments: intPending, currency: finalCurrency, createdAt: new Date() },
      });
    }

    const newLiaList = await db.insert(liabilities).values({ name, amount: numericAmount.toFixed(2), interestRate: numericRate.toFixed(2), type, dueDate: dueDate ? new Date(dueDate) : null, installmentAmount: numericInstallment.toFixed(2), pendingInstallments: intPending, currency: finalCurrency }).returning();
    return NextResponse.json({ success: true, liability: { ...newLiaList[0], amount: parseFloat(newLiaList[0].amount).toString(), interestRate: parseFloat(newLiaList[0].interestRate).toString(), installmentAmount: parseFloat(newLiaList[0].installmentAmount).toString(), pendingInstallments: newLiaList[0].pendingInstallments } });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al registrar el pasivo/préstamo", details: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const body = await req.json();
    const { name, amount, interestRate, type, dueDate, installmentAmount, pendingInstallments, currency } = body;

    const numericAmount = parseFloat(amount);
    const numericRate = parseFloat(interestRate ?? "0");
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "El monto debe ser un número positivo" }, { status: 400 });
    }

    if (isDemo || !db) {
      return NextResponse.json({ success: true, isDemo: true, message: "Pasivo actualizado en modo demo" });
    }

    const updated = await db.update(liabilities).set({
      name, amount: numericAmount.toFixed(2), interestRate: numericRate.toFixed(2), type,
      dueDate: dueDate ? new Date(dueDate) : null,
      installmentAmount: installmentAmount ? parseFloat(installmentAmount).toFixed(2) : "0.00",
      pendingInstallments: pendingInstallments ? parseInt(pendingInstallments) : 0,
      currency: currency || "PEN",
    }).where(eq(liabilities.id, id)).returning();

    if (!updated.length) return NextResponse.json({ error: "Pasivo no encontrado" }, { status: 404 });
    return NextResponse.json({ success: true, liability: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al actualizar el pasivo", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    if (isDemo || !db) {
      return NextResponse.json({ success: true, isDemo: true, message: "Pasivo eliminado en modo demo" });
    }

    await db.delete(liabilities).where(eq(liabilities.id, id));
    return NextResponse.json({ success: true, message: "Pasivo eliminado" });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al eliminar el pasivo", details: error.message }, { status: 500 });
  }
}
