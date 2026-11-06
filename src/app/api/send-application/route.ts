import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { fillOutForm, ApplicationData } from "@/lib/form-pdf";
import {
  DOCUMENT_CATEGORIES,
  emptyDocuments,
  getExtension,
  matchesFileSignature,
  safeFileName,
  validateDocuments,
  MIME_BY_EXTENSION,
} from "@/lib/documents";

export const runtime = "nodejs";

const port = Number(process.env.SMTP_PORT ?? 465);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: port,
  secure: port === 465, // 465 = SSL direto; 587 = STARTTLS (secure: false)
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// The client reads `body.error` on a 400, so every message uses the key "error".
const badRequest = (error: string) =>
  NextResponse.json({ error }, { status: 400 });

async function verifyTurnstile(token: string, ip?: string | null) {
  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY ?? "",
    response: token,
  });
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const result = (await res.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false; // if the check cannot run, do not let the request through
  }
}

export async function POST(req: Request) {
  try {
    // multipart/form-data: JSON in the "data" field + one list of files per category
    const form = await req.formData();

    const token = form.get("turnstileToken");
    if (typeof token !== "string" || !token) {
      return badRequest("Please complete the security check.");
    }

    const ip =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    if (!(await verifyTurnstile(token, ip))) {
      return badRequest("Security check failed. Please try again.");
    }

    const raw = form.get("data");
    if (typeof raw !== "string") {
      return badRequest("Missing form data.");
    }

    let data: ApplicationData;
    try {
      data = JSON.parse(raw) as ApplicationData;
    } catch {
      return badRequest("Invalid form data.");
    }

    if (!data.fullName || !data.email || !validEmail(data.email)) {
      return badRequest("A name and a valid email are required.");
    }
    if (data.depositAcknowledged !== true) {
      return badRequest("Please confirm the security deposit.");
    }
    if (
      !data.signatureImage ||
      !data.signatureImage.startsWith("data:image/png;base64,") ||
      data.signatureImage.length > 500_000
    ) {
      return badRequest("Invalid signature.");
    }

    // documents: collect, validate (the real check) and verify the file signatures
    const files = emptyDocuments<File>();
    for (const category of DOCUMENT_CATEGORIES) {
      files[category.key] = form
        .getAll(category.key)
        .filter((f): f is File => f instanceof File);
    }

    const docsError = validateDocuments(files, data.status);
    if (docsError) {
      return badRequest(docsError);
    }

    const attachments: {
      filename: string;
      content: Buffer;
      contentType: string;
    }[] = [];
    const summary: string[] = [];

    for (const category of DOCUMENT_CATEGORIES) {
      const list = files[category.key];
      if (list.length === 0) continue;
      summary.push(`- ${category.label}: ${list.length} file(s)`);

      for (const [index, file] of list.entries()) {
        const extension = getExtension(file.name);
        const bytes = new Uint8Array(await file.arrayBuffer());

        if (!matchesFileSignature(bytes, extension)) {
          return badRequest(`"${file.name}" is not a valid PDF, JPG or PNG.`);
        }

        attachments.push({
          filename: `${category.key}-${index + 1}-${safeFileName(file.name)}`,
          content: Buffer.from(bytes),
          contentType: MIME_BY_EXTENSION[extension],
        });
      }
    }

    // application PDF
    const modelo = await fs.readFile(
      path.join(
        process.cwd(),
        "public",
        "templates",
        "application_to_rent_go_2_corp_2026_v2.pdf",
      ),
    );
    const pdfBytes = await fillOutForm(data, modelo);

    const fileName = data.fullName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-");

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.CONTACT_EMAIL,
      replyTo: data.email,
      subject: `Application to Rent - ${data.fullName}`,
      text: [
        `Nova aplicação de ${data.fullName} (${data.email}).`,
        "",
        "Anexos: PDF da aplicação e documentos:",
        ...summary,
      ].join("\n"),
      attachments: [
        {
          filename: `application-${fileName}.pdf`,
          content: Buffer.from(pdfBytes),
          contentType: "application/pdf",
        },
        ...attachments,
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e); // the details stay in the server log
    return NextResponse.json(
      { error: "Failed to send the application. Please try again." },
      { status: 500 },
    );
  }
}
