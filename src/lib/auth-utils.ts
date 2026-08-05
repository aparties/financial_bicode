import crypto from "crypto";

const secret = process.env.SESSION_SECRET || "fallback-secret-key-for-bicode-control-premium-123456";

export interface SessionPayload {
  username: string;
  expiresAt: number;
}

export function signSession(payload: SessionPayload): string {
  const data = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return Buffer.from(data).toString("base64") + "." + signature;
}

export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  try {
    const [dataBase64, signature] = token.split(".");
    if (!dataBase64 || !signature) return null;

    const data = Buffer.from(dataBase64, "base64").toString("utf-8");
    const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("hex");

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(data) as SessionPayload;
    if (payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch (e) {
    return null;
  }
}
