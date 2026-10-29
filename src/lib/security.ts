// Remove quebras de linha (evita injeção de cabeçalho)
export const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export const isStr = (v: unknown): v is string => typeof v === "string";

export function getIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// Rate limit em memória (use Upstash em serverless, como comentado antes)
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimited(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > limit;
}

// Só aceita requisições vindas dos seus domínios
export function originAllowed(req: Request) {
  const allowed = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Sem lista configurada: libera em desenvolvimento, bloqueia em produção
  if (allowed.length === 0) return process.env.NODE_ENV !== "production";

  const origin = req.headers.get("origin");
  return !!origin && allowed.includes(origin);
}

export async function verifyTurnstile(token: string, ip: string) {
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY ?? "",
          response: token,
          remoteip: ip,
        }),
      },
    );
    const data = await res.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile error:", error);
    return false;
  }
}
