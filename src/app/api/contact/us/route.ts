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

type ContactData = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken: string;
};

function validate(body: unknown): ContactData | null {
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
  if (!isStr(b.subject)) return fail("subject", b.subject);
  if (!isStr(b.message)) return fail("message", b.message);
  if (!isStr(b.turnstileToken)) return fail("turnstileToken", b.turnstileToken);

  const fullName = oneLine(b.fullName);
  const email = b.email.trim().toLowerCase();
  const subject = oneLine(b.subject);
  const message = b.message.trim();
  const turnstileToken = b.turnstileToken.trim();

  if (fullName.length < 2 || fullName.length > 100)
    return fail("fullName (tamanho)");
  if (email.length > 254 || !EMAIL_REGEX.test(email))
    return fail("email (formato)", email);
  if (subject.length < 2 || subject.length > 150)
    return fail("subject (tamanho)");
  if (message.length < 10 || message.length > 5000)
    return fail("message (tamanho)");
  if (!turnstileToken) return fail("turnstileToken (vazio)");

  return { fullName, email, subject, message, turnstileToken };
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

    if (rateLimited(`contact:${ip}`)) {
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

    const { fullName, email, subject, message, turnstileToken } = data;

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
      subject: `Website = ${subject}`,
      text: `Name: ${fullName}\nE-mail: ${email}\n\nMessage:\n${message}`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false }, { status: 500 });
  }
}
