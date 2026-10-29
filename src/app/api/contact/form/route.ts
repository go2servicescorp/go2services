import { transporter } from "@/lib/email";
import {
  getIp,
  isStr,
  oneLine,
  originAllowed,
  rateLimited,
  verifyTurnstile,
} from "@/lib/security";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\+?[\d\s().-]{7,25}$/;

type BookingData = {
  fullName: string;
  email: string;
  phone: string;
  introduction: string;
  availableDates: string;
  room: string;
  turnstileToken: string;
};

function dateToString(v: unknown): string | null {
  if (isStr(v)) return oneLine(v);
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (v instanceof Date && !isNaN(v.getTime()))
    return v.toISOString().slice(0, 10);
  return null;
}

// Aceita string, array de strings/datas ou objeto { from, to }
function parseDates(v: unknown): string | null {
  const single = dateToString(v);
  if (single !== null) return single;

  if (Array.isArray(v)) {
    if (v.length === 0 || v.length > 31) return null;
    const parts = v.map(dateToString);
    if (parts.some((p) => p === null)) return null;
    return (parts as string[]).join(", ");
  }

  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, unknown>;
    const from = dateToString(o.from ?? o.start);
    const to = dateToString(o.to ?? o.end);
    if (from && to) return `${from} - ${to}`;
    if (from) return from;
  }

  return null;
}

function validate(body: unknown): BookingData | null {
  const fail = (campo: string, valor?: unknown) => {
    console.log(`Falhou em: ${campo}`, valor); // remova depois de testar
    return null;
  };

  if (typeof body !== "object" || body === null) return fail("body");
  const b = body as Record<string, unknown>;

  // Honeypot: precisa vir vazio
  if (isStr(b.website) && b.website.length > 0) return fail("honeypot");

  if (!isStr(b.fullName)) return fail("fullName", b.fullName);
  if (!isStr(b.email)) return fail("email", b.email);
  if (!isStr(b.phone)) return fail("phone", b.phone);
  if (!isStr(b.turnstileToken)) return fail("turnstileToken", b.turnstileToken);

  const introRaw = b.introduction ?? "";
  if (!isStr(introRaw)) return fail("introduction", b.introduction);

  const roomRaw = isStr(b.room)
    ? b.room
    : typeof b.room === "number"
      ? String(b.room)
      : null;
  if (roomRaw === null) return fail("room", b.room);

  const availableDates = parseDates(b.availableDates);
  if (availableDates === null)
    return fail("availableDates (tipo)", b.availableDates);

  const fullName = oneLine(b.fullName);
  const email = b.email.trim().toLowerCase();
  const phone = oneLine(b.phone);
  const introduction = introRaw.trim();
  const room = oneLine(roomRaw);
  const turnstileToken = b.turnstileToken.trim();

  if (fullName.length < 2 || fullName.length > 100)
    return fail("fullName (tamanho)");
  if (email.length > 254 || !EMAIL_REGEX.test(email))
    return fail("email (formato)", email);

  const digits = phone.replace(/\D/g, "");
  if (!PHONE_REGEX.test(phone) || digits.length < 7 || digits.length > 15)
    return fail("phone (formato)", phone);

  if (introduction.length > 3000) return fail("introduction (tamanho)");
  if (availableDates.length < 1 || availableDates.length > 500)
    return fail("availableDates (tamanho)", availableDates);
  if (room.length < 1 || room.length > 100) return fail("room (tamanho)", room);
  if (!turnstileToken) return fail("turnstileToken (vazio)");

  return {
    fullName,
    email,
    phone,
    introduction,
    availableDates,
    room,
    turnstileToken,
  };
}

export async function POST(req: Request) {
  try {
    if (!originAllowed(req)) {
      return Response.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const ip = getIp(req);

    if (rateLimited(`booking:${ip}`)) {
      return Response.json(
        { success: false, error: "Too many requests" },
        { status: 429 },
      );
    }

    const raw = await req.text();
    if (raw.length > 20_000) {
      return Response.json(
        { success: false, error: "Payload too large" },
        { status: 413 },
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return Response.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 },
      );
    }

    const data = validate(body);
    if (!data) {
      return Response.json(
        { success: false, error: "Invalid data" },
        { status: 400 },
      );
    }

    const {
      fullName,
      email,
      phone,
      introduction,
      availableDates,
      room,
      turnstileToken,
    } = data;

    if (!(await verifyTurnstile(turnstileToken, ip))) {
      return Response.json(
        { success: false, error: "Captcha failed" },
        { status: 400 },
      );
    }

    await transporter.sendMail({
      from: `"Site Go2Rent" <${process.env.GMAIL_USER}>`, // fixo
      to: process.env.CONTACT_EMAIL,
      replyTo: `"${fullName.replace(/"/g, "")}" <${email}>`,
      subject: `Website - ${room}`,
      text: [
        `Room: ${room}`,
        `Name: ${fullName}`,
        `E-mail: ${email}`,
        `Phone: ${phone}`,
        `Available Dates: ${availableDates}`,
        "",
        "Introduction:",
        introduction || "(not provided)",
      ].join("\n"),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false }, { status: 500 });
  }
}
