import { NextResponse } from "next/server";
import { db, isDemo } from "@/db/connection";
import { propertiesAssets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, value, type, currency } = body;

    if (!name || value === undefined || !type) {
      return NextResponse.json({ error: "Campos obligatorios faltantes (name, value, type)" }, { status: 400 });
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) {
      return NextResponse.json({ error: "El valor del activo debe ser un número no negativo" }, { status: 400 });
    }

    const finalCurrency = currency || "PEN";

    if (isDemo || !db) {
      return NextResponse.json({
        success: true, isDemo: true, message: "Activo/Stock registrado en modo demostración",
        asset: { id: `ast-demo-${Math.random().toString(36).substring(2, 11)}`, name, value: numericValue.toFixed(2), type, currency: finalCurrency, createdAt: new Date() },
      });
    }

    const newAstList = await db.insert(propertiesAssets).values({ name, value: numericValue.toFixed(2), type, currency: finalCurrency }).returning();
    return NextResponse.json({ success: true, asset: { ...newAstList[0], value: parseFloat(newAstList[0].value).toString() } });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al registrar el activo/stock", details: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const body = await req.json();
    const { name, value, type, currency } = body;

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) {
      return NextResponse.json({ error: "El valor debe ser un número no negativo" }, { status: 400 });
    }

    if (isDemo || !db) {
      return NextResponse.json({ success: true, isDemo: true, message: "Activo actualizado en modo demo" });
    }

    const updated = await db.update(propertiesAssets).set({
      name, value: numericValue.toFixed(2), type, currency: currency || "PEN",
    }).where(eq(propertiesAssets.id, id)).returning();

    if (!updated.length) return NextResponse.json({ error: "Activo no encontrado" }, { status: 404 });
    return NextResponse.json({ success: true, asset: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al actualizar el activo", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    if (isDemo || !db) {
      return NextResponse.json({ success: true, isDemo: true, message: "Activo eliminado en modo demo" });
    }

    await db.delete(propertiesAssets).where(eq(propertiesAssets.id, id));
    return NextResponse.json({ success: true, message: "Activo eliminado" });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al eliminar el activo", details: error.message }, { status: 500 });
  }
}
