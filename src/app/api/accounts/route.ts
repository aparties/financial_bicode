import { NextResponse } from "next/server";
import { db, isDemo } from "@/db/connection";
import { accounts } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, balance, type, currency } = body;

    // Validation
    if (!name || balance === undefined || !type) {
      return NextResponse.json(
        { error: "Campos obligatorios faltantes (name, balance, type)" },
        { status: 400 }
      );
    }

    const numericBalance = parseFloat(balance);
    if (isNaN(numericBalance)) {
      return NextResponse.json(
        { error: "El balance debe ser un número válido" },
        { status: 400 }
      );
    }

    const finalCurrency = currency || "PEN";

    if (isDemo || !db) {
      return NextResponse.json({
        success: true,
        isDemo: true,
        message: "Cuenta creada en modo demostración",
        account: {
          id: `acc-demo-${Math.random().toString(36).substring(2, 11)}`,
          name,
          balance: numericBalance.toFixed(2),
          type,
          currency: finalCurrency,
          createdAt: new Date(),
        },
      });
    }

    // Insert new account in PostgreSQL
    const newAccList = await db.insert(accounts).values({
      name,
      balance: numericBalance.toFixed(2),
      type,
      currency: finalCurrency,
    }).returning();

    return NextResponse.json({
      success: true,
      account: {
        ...newAccList[0],
        balance: parseFloat(newAccList[0].balance).toString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al crear la cuenta", details: error.message },
      { status: 500 }
    );
  }
}
