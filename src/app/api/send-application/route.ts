import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import {
  fillOutForm,
  NotesTooLongError,
  type ApplicationData,
} from "@/lib/form-pdf";
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

// Gmail rejects messages above 25 MB; keep a safety margin
const MAX_TOTAL_ATTACHMENTS_BYTES = 20 * 1024 * 1024;

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
    const result = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (!result.success) {
      // reason for the failure (invalid-input-secret, timeout-or-duplicate, ...)
      console.warn("turnstile failed:", result["error-codes"]);
    }
    return result.success === true;
  } catch (e) {
    console.error("turnstile request error:", e);
    return false; // if the check cannot run, do not let the request through
  }
}

export async function POST(req: Request) {
  try {
    // multipart/form-data: JSON in the "data" field + one list of files per category
    const form = await req.formData();

    const raw = form.get("data");
    if (typeof raw !== "string") {
      return badRequest("Missing form data.");
    }

    // the Turnstile token travels inside the JSON ("turnstileToken")
    let data: ApplicationData & { turnstileToken?: string };
    try {
      data = JSON.parse(raw);
    } catch {
      return badRequest("Invalid form data.");
    }

    const token = data.turnstileToken;
    if (typeof token !== "string" || !token) {
      return badRequest("Please complete the security check.");
    }

    const ip =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    if (!(await verifyTurnstile(token, ip))) {
      return badRequest("Security check failed. Please try again.");
    }

    if (!data.fullName || !data.email || !validEmail(data.email)) {
      return badRequest("A name and a valid email are required.");
    }
    if (!data.phone || !data.emergencyContact) {
      return badRequest("Phone and emergency contact are required.");
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

    const totalBytes = attachments.reduce((n, a) => n + a.content.length, 0);
    if (totalBytes > MAX_TOTAL_ATTACHMENTS_BYTES) {
      return badRequest(
        "The attached files are too large (max 20 MB in total).",
      );
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

    let pdfBytes: Uint8Array;
    try {
      pdfBytes = await fillOutForm(data, modelo);
    } catch (e) {
      if (e instanceof NotesTooLongError) return badRequest(e.message);
      throw e;
    }

    const fileName =
      data.fullName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "applicant";

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.CONTACT_EMAIL,
      replyTo: data.email,
      subject: `Application to Rent - ${data.fullName}`,
      text: [
        `New application from ${data.fullName} (${data.email}).`,
        `Phone: ${data.phone}`,
        `Room: ${data.room ?? "-"} | ${data.street ?? "-"}`,
        "",
        "Attachments: application PDF and documents:",
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
