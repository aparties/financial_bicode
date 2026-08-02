import { NextResponse } from "next/server";
import { db, isDemo } from "@/db/connection";
import { transactions, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { accountId, type, amount, description, category, currency } = body;

    // Validate fields
    if (!type || !amount || !description || !category) {
      return NextResponse.json(
        { error: "Campos obligatorios faltantes (type, amount, description, category)" },
        { status: 400 }
      );
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser un número positivo" },
        { status: 400 }
      );
    }

    let finalCurrency = currency || "PEN";
    if (accountId === "acc-2") {
      finalCurrency = "USD";
    }

    if (isDemo || !db) {
      return NextResponse.json({
        success: true,
        isDemo: true,
        message: "Transacción creada en modo demostración",
        transaction: {
          id: `tx-demo-${Math.random().toString(36).substring(2, 11)}`,
          accountId: accountId || null,
          type,
          amount: numericAmount.toString(),
          description,
          category,
          currency: finalCurrency,
          date: new Date(),
          createdAt: new Date(),
        },
      });
    }

    // Retrieve account's currency in DB mode if accountId is present
    if (accountId) {
      const selectedAccount = await db
        .select()
        .from(accounts)
        .where(eq(accounts.id, accountId));
      if (selectedAccount.length > 0) {
        finalCurrency = selectedAccount[0].currency;
      }
    }

    // Insert new transaction
    const newTxList = await db.insert(transactions).values({
      accountId: accountId || null,
      type,
      amount: numericAmount.toFixed(2),
      description,
      category,
      currency: finalCurrency,
      date: new Date(),
    }).returning();

    const newTx = newTxList[0];

    // If transaction is linked to an account, adjust the balance
    if (accountId) {
      const selectedAccount = await db
        .select()
        .from(accounts)
        .where(eq(accounts.id, accountId));

      if (selectedAccount.length > 0) {
        const currentBalance = parseFloat(selectedAccount[0].balance);
        let updatedBalance = currentBalance;

        if (type === "income") {
          updatedBalance += numericAmount;
        } else {
          // expense or rent
          updatedBalance -= numericAmount;
        }

        await db
          .update(accounts)
          .set({ balance: updatedBalance.toFixed(2) })
          .where(eq(accounts.id, accountId));
      }
    }

    return NextResponse.json({
      success: true,
      transaction: {
        ...newTx,
        amount: parseFloat(newTx.amount).toString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al crear la transacción", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const body = await req.json();
    const { type, amount, description, category, currency } = body;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "El monto debe ser un número positivo" }, { status: 400 });
    }

    if (isDemo || !db) {
      return NextResponse.json({ success: true, isDemo: true, message: "Transacción actualizada en modo demo" });
    }

    // Fetch current transaction to reverse balance impact
    const current = await db.select().from(transactions).where(eq(transactions.id, id));
    if (!current.length) return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });

    const old = current[0];

    // Reverse old balance effect on account
    if (old.accountId) {
      const accRows = await db.select().from(accounts).where(eq(accounts.id, old.accountId));
      if (accRows.length) {
        const oldAmount = parseFloat(old.amount);
        let bal = parseFloat(accRows[0].balance);
        // Undo old effect
        if (old.type === "income") bal -= oldAmount;
        else bal += oldAmount;
        // Apply new effect
        if (type === "income") bal += numericAmount;
        else bal -= numericAmount;
        await db.update(accounts).set({ balance: bal.toFixed(2) }).where(eq(accounts.id, old.accountId));
      }
    }

    const updated = await db.update(transactions).set({
      type, amount: numericAmount.toFixed(2), description, category, currency: currency || old.currency,
    }).where(eq(transactions.id, id)).returning();

    return NextResponse.json({ success: true, transaction: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al actualizar la transacción", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    if (isDemo || !db) {
      return NextResponse.json({ success: true, isDemo: true, message: "Transacción eliminada en modo demo" });
    }

    // Fetch transaction to reverse balance
    const current = await db.select().from(transactions).where(eq(transactions.id, id));
    if (!current.length) return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });

    const old = current[0];
    if (old.accountId) {
      const accRows = await db.select().from(accounts).where(eq(accounts.id, old.accountId));
      if (accRows.length) {
        const oldAmount = parseFloat(old.amount);
        let bal = parseFloat(accRows[0].balance);
        if (old.type === "income") bal -= oldAmount;
        else bal += oldAmount;
        await db.update(accounts).set({ balance: bal.toFixed(2) }).where(eq(accounts.id, old.accountId));
      }
    }

    await db.delete(transactions).where(eq(transactions.id, id));
    return NextResponse.json({ success: true, message: "Transacción eliminada" });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al eliminar la transacción", details: error.message }, { status: 500 });
  }
}
