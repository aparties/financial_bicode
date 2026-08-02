import { NextResponse } from "next/server";
import { db, isDemo } from "@/db/connection";
import { invoices } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientName, amount, status, paymentTerms, dueDate, currency } = body;

    if (!clientName || amount === undefined || !status || !paymentTerms) {
      return NextResponse.json(
        { error: "Campos obligatorios faltantes (clientName, amount, status, paymentTerms)" },
        { status: 400 }
      );
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "El monto de la factura debe ser un número positivo" }, { status: 400 });
    }

    const finalCurrency = currency || "PEN";
    let calculatedDueDate = dueDate ? new Date(dueDate) : null;
    const now = Date.now();
    if (paymentTerms === "immediate") calculatedDueDate = new Date(now);
    else if (paymentTerms === "30_days") calculatedDueDate = new Date(now + 30 * 24 * 60 * 60 * 1000);
    else if (paymentTerms === "60_days") calculatedDueDate = new Date(now + 60 * 24 * 60 * 60 * 1000);

    if (isDemo || !db) {
      return NextResponse.json({
        success: true, isDemo: true, message: "Factura registrada en modo demostración",
        invoice: { id: `inv-demo-${Math.random().toString(36).substring(2, 11)}`, clientName, amount: numericAmount.toFixed(2), status, paymentTerms, dueDate: calculatedDueDate, currency: finalCurrency, createdAt: new Date() },
      });
    }

    const newInvList = await db.insert(invoices).values({ clientName, amount: numericAmount.toFixed(2), status, paymentTerms, dueDate: calculatedDueDate, currency: finalCurrency }).returning();
    return NextResponse.json({ success: true, invoice: { ...newInvList[0], amount: parseFloat(newInvList[0].amount).toString() } });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al registrar la factura", details: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const body = await req.json();
    const { clientName, amount, status, paymentTerms, dueDate, currency } = body;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "El monto debe ser un número positivo" }, { status: 400 });
    }

    if (isDemo || !db) {
      return NextResponse.json({ success: true, isDemo: true, message: "Factura actualizada en modo demo" });
    }

    const updated = await db.update(invoices).set({
      clientName, amount: numericAmount.toFixed(2), status, paymentTerms,
      dueDate: dueDate ? new Date(dueDate) : null,
      currency: currency || "PEN",
    }).where(eq(invoices.id, id)).returning();

    if (!updated.length) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    return NextResponse.json({ success: true, invoice: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al actualizar la factura", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    if (isDemo || !db) {
      return NextResponse.json({ success: true, isDemo: true, message: "Factura eliminada en modo demo" });
    }

    await db.delete(invoices).where(eq(invoices.id, id));
    return NextResponse.json({ success: true, message: "Factura eliminada" });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al eliminar la factura", details: error.message }, { status: 500 });
  }
}
