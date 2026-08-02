import { NextResponse } from "next/server";
import { db, isDemo } from "@/db/connection";
import { projections } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, estimatedRevenue, estimatedCost, status, currency } = body;

    if (!name || estimatedRevenue === undefined || estimatedCost === undefined || !status) {
      return NextResponse.json({ error: "Campos obligatorios faltantes (name, estimatedRevenue, estimatedCost, status)" }, { status: 400 });
    }

    const revenue = parseFloat(estimatedRevenue);
    const cost = parseFloat(estimatedCost);
    if (isNaN(revenue) || isNaN(cost) || revenue < 0 || cost < 0) {
      return NextResponse.json({ error: "Los montos deben ser números válidos no negativos" }, { status: 400 });
    }

    const finalCurrency = currency || "PEN";

    if (isDemo || !db) {
      return NextResponse.json({
        success: true, isDemo: true, message: "Proyección registrada en modo demostración",
        projection: { id: `prj-demo-${Math.random().toString(36).substring(2, 11)}`, name, estimatedRevenue: revenue.toFixed(2), estimatedCost: cost.toFixed(2), status, currency: finalCurrency, createdAt: new Date() },
      });
    }

    const newPrjList = await db.insert(projections).values({ name, estimatedRevenue: revenue.toFixed(2), estimatedCost: cost.toFixed(2), status, currency: finalCurrency }).returning();
    return NextResponse.json({ success: true, projection: { ...newPrjList[0], estimatedRevenue: parseFloat(newPrjList[0].estimatedRevenue).toString(), estimatedCost: parseFloat(newPrjList[0].estimatedCost).toString() } });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al registrar la proyección", details: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const body = await req.json();
    const { name, estimatedRevenue, estimatedCost, status, currency } = body;

    const revenue = parseFloat(estimatedRevenue);
    const cost = parseFloat(estimatedCost);
    if (isNaN(revenue) || isNaN(cost) || revenue < 0 || cost < 0) {
      return NextResponse.json({ error: "Los montos deben ser números válidos no negativos" }, { status: 400 });
    }

    if (isDemo || !db) {
      return NextResponse.json({ success: true, isDemo: true, message: "Proyección actualizada en modo demo" });
    }

    const updated = await db.update(projections).set({
      name, estimatedRevenue: revenue.toFixed(2), estimatedCost: cost.toFixed(2), status, currency: currency || "PEN",
    }).where(eq(projections.id, id)).returning();

    if (!updated.length) return NextResponse.json({ error: "Proyección no encontrada" }, { status: 404 });
    return NextResponse.json({ success: true, projection: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al actualizar la proyección", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    if (isDemo || !db) {
      return NextResponse.json({ success: true, isDemo: true, message: "Proyección eliminada en modo demo" });
    }

    await db.delete(projections).where(eq(projections.id, id));
    return NextResponse.json({ success: true, message: "Proyección eliminada" });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al eliminar la proyección", details: error.message }, { status: 500 });
  }
}
