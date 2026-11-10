import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";

export type ApplicationData = {
  // Property Information
  room?: string;
  street?: string;
  moveIn?: string;
  moveOut?: string;
  monthlyRent?: string;
  deposit?: string;
  // Personal Information
  fullName?: string;
  email?: string;
  phone?: string;
  countryOfOrigin?: string;
  dateMovedToCanada?: string;
  canadianBankAccount?: boolean;
  smoker?: "yes" | "no" | "occasionally";
  emergencyContact?: string; // "Name - +14165551234"
  // Occupation / Education
  status?: "student" | "worker" | "both" | "other";
  statusOther?: string;
  schoolName?: string;
  program?: string;
  employerName?: string;
  position?: string;
  startDate?: string;
  monthlyIncome?: string;
  workplaceAddress?: string;
  employerSchool?: string; // "Name - +14165551234"
  // References
  referenceName?: string;
  referenceRelationship?: string;
  referenceContact?: string;
  // Bedding
  bedding?: "none" | "usedSet" | "newSet";
  notes1?: string;
  notes2?: string;
  // Declaration and Signature
  depositAcknowledged?: boolean;
  applicantName?: string;
  signature?: string;
  signatureImage?: string; // data URL (PNG) gerado pelo canvas
  date?: string;
};

/**
 * O PDF não tem campos de formulário, então escrevemos por cima.
 * Todas as medidas estão em pontos (1 pt = 1/72"), com a origem no TOPO da
 * página (como em um editor de PDF). A conversão para o sistema do pdf-lib
 * (origem embaixo) é feita em `yPdf`.
 */

// Campos de text: [página, x inicial, x final da linha, base da linha]
type Position = { page: number; x0: number; x1: number; base: number };

const LABELS: Record<string, Position> = {
  // Página 1 — Property Information
  room: { page: 1, x0: 108.0, x1: 144.7, base: 150.2 },
  street: { page: 1, x0: 180.2, x1: 394.2, base: 150.2 },
  moveIn: { page: 1, x0: 182.6, x1: 292.7, base: 174.2 },
  moveOut: { page: 1, x0: 414.3, x1: 536.6, base: 174.2 },
  monthlyRent: { page: 1, x0: 149.6, x1: 223.0, base: 198.2 },
  deposit: { page: 1, x0: 287.8, x1: 361.1, base: 198.2 },
  // Página 1 — Personal Information
  fullName: { page: 1, x0: 125.8, x1: 535.4, base: 272.5 },
  email: { page: 1, x0: 103.1, x1: 378.3, base: 292.6 },
  phone: { page: 1, x0: 149.6, x1: 333.1, base: 314.6 },
  countryOfOrigin: { page: 1, x0: 158.8, x1: 268.8, base: 334.6 },
  dateMovedToCanada: { page: 1, x0: 278.8, x1: 401.1, base: 354.1 },
  emergencyContact: { page: 1, x0: 249.1, x1: 536.5, base: 454.6 },
  // Página 1 — Occupation / Education
  statusOther: { page: 1, x0: 400.1, x1: 522.4, base: 570.8 },
  schoolName: { page: 1, x0: 141.7, x1: 337.3, base: 590.4 },
  program: { page: 1, x0: 154.5, x1: 337.9, base: 609.9 },
  employerName: { page: 1, x0: 154.5, x1: 337.9, base: 629.4 },
  position: { page: 1, x0: 146.5, x1: 342.2, base: 648.9 },
  startDate: { page: 1, x0: 242.5, x1: 364.8, base: 668.4 },
  monthlyIncome: { page: 1, x0: 253.5, x1: 369.7, base: 687.9 },
  workplaceAddress: { page: 1, x0: 225.8, x1: 501.0, base: 707.4 },
  employerSchool: { page: 1, x0: 290.8, x1: 535.4, base: 726.9 },
  // Página 2 — References
  referenceName: { page: 2, x0: 205.2, x1: 480.4, base: 137.9 },
  referenceRelationship: { page: 2, x0: 136.2, x1: 313.5, base: 157.6 },
  referenceContact: { page: 2, x0: 171.6, x1: 312.2, base: 179.6 },
  // Página 2 — Anything you would like to add
  notes1: { page: 2, x0: 71.8, x1: 530.5, base: 410.2 },
  notes2: { page: 2, x0: 71.8, x1: 530.5, base: 428.2 },
  // Página 3 — Declaration and Signature
  applicantName: { page: 3, x0: 152.5, x1: 537.8, base: 280.9 },
  signature: { page: 3, x0: 122.7, x1: 306.2, base: 300.9 },
  date: { page: 3, x0: 98.9, x1: 215.1, base: 320.4 },
};

// Quadradinhos de 8x8: [página, x, topo]
type Boxe = { page: number; x: number; topo: number };

const CHECKBOXES = {
  bankYes: { page: 1, x: 93, topo: 384 },
  bankNo: { page: 1, x: 354, topo: 384 },
  smokerYes: { page: 1, x: 93, topo: 425 },
  smokerNo: { page: 1, x: 267, topo: 425 },
  smokerOccasionally: { page: 1, x: 442, topo: 425 },
  statusStudent: { page: 1, x: 93, topo: 539 },
  statusWorker: { page: 1, x: 93, topo: 560 },
  statusBoth: { page: 1, x: 354, topo: 539 },
  statusOther: { page: 1, x: 354, topo: 560 },
  beddingNone: { page: 2, x: 129, topo: 275 },
  beddingUsedSet: { page: 2, x: 129, topo: 290 },
  beddingNewSet: { page: 2, x: 129, topo: 304 },
  depositAcknowledged: { page: 3, x: 93, topo: 199 },
} satisfies Record<string, Boxe>;

// Aparência
const FONT_SIZE = 10;
const MIN_SIZE = 7; // o text encolhe até aqui para caber na linha
const UNDERLINE = 3; // pt entre a linha sublinhada e a base do text
const COLOR = rgb(0, 0, 0);

// Espaço disponível para a assinatura desenhada (em pontos).
// Na página 3 há só ~20 pt entre "Applicant Name" e "Signature".
const MAX_SIGN = { width: 184, altura: 20 };

/** Converte "base" (medida a partir do topo) para a coordenada y do pdf-lib. */
const yPdf = (alturaPagina: number, base: number) => alturaPagina - base;

/** Troca por "?" os caracteres que a fonte padrão não consegue desenhar. */
function safeText(text: string, font: PDFFont): string {
  const supported = new Set(font.getCharacterSet());
  return Array.from(text.replace(/\s+/g, " ").trim())
    .map((c) => (supported.has(c.codePointAt(0)!) ? c : "?"))
    .join("");
}

/** Erro lançado quando as observações não cabem nas duas linhas do PDF. */
export class NotesTooLongError extends Error {
  constructor() {
    super("The notes are too long. Please shorten them.");
    this.name = "NotesTooLongError";
  }
}

// Tamanho mínimo da fonte das observações (as duas linhas usam o mesmo size)
const NOTES_MIN_SIZE = 7;

/** Quebra o text em linhas por palavras, sem passar de `width`. */
function wrapWords(
  words: string[],
  font: PDFFont,
  width: number,
  size: number,
): string[] | null {
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    // Uma palavra sozinha maior que a linha nunca vai caber neste size
    if (font.widthOfTextAtSize(word, size) > width) return null;

    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= width) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Encaixa o text nas duas linhas (notes1 / notes2) SEM cortar nada:
 * tenta o size normal e vai encolhendo a fonte até caber em 2 linhas.
 * Retorna null se não couber nem no size mínimo.
 */
function fitNotes(
  text: string,
  font: PDFFont,
  width: number,
): { lines: string[]; size: number } | null {
  const words = safeText(text, font).split(" ").filter(Boolean);
  if (words.length === 0) return { lines: [], size: FONT_SIZE };

  for (let size = FONT_SIZE; size >= NOTES_MIN_SIZE; size -= 0.5) {
    const lines = wrapWords(words, font, width, size);
    if (lines && lines.length <= 2) return { lines, size };
  }
  return null;
}

export async function fillOutForm(
  data: ApplicationData,
  modeloBytes: Uint8Array | ArrayBuffer,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(modeloBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  // Observações: encaixa nas duas linhas sem reticências (ou falha com erro claro)
  const notesText = [data.notes1, data.notes2].filter(Boolean).join(" ");
  const notesFit = fitNotes(
    notesText,
    font,
    LABELS.notes1.x1 - LABELS.notes1.x0,
  );
  if (!notesFit) throw new NotesTooLongError();

  // Campos de text
  for (const [chave, pos] of Object.entries(LABELS)) {
    if (chave === "notes1" || chave === "notes2") continue; // desenhados abaixo

    const valor = (data as Record<string, unknown>)[chave];
    if (typeof valor !== "string" || valor.trim() === "") continue;

    let text = safeText(valor, font);
    const page = pages[pos.page - 1];
    const lineWidth = pos.x1 - pos.x0;

    // Encolhe a fonte se o text for maior que a linha
    let size = FONT_SIZE;
    while (size > MIN_SIZE && font.widthOfTextAtSize(text, size) > lineWidth) {
      size -= 0.5;
    }

    // Ainda não coube no size mínimo: corta e coloca reticências
    if (font.widthOfTextAtSize(text, size) > lineWidth) {
      while (
        text.length > 1 &&
        font.widthOfTextAtSize(text + "…", size) > lineWidth
      ) {
        text = text.slice(0, -1);
      }
      text = text.trimEnd() + "…";
    }

    page.drawText(text, {
      x: pos.x0 + 1,
      y: yPdf(page.getHeight(), pos.base) + UNDERLINE,
      size: size,
      font,
      color: COLOR,
    });
  }

  // Observações (duas linhas, mesmo size, sem cortar)
  const notesPositions = [LABELS.notes1, LABELS.notes2];
  notesFit.lines.forEach((line, i) => {
    const pos = notesPositions[i];
    const page = pages[pos.page - 1];
    page.drawText(line, {
      x: pos.x0 + 1,
      y: yPdf(page.getHeight(), pos.base) + UNDERLINE,
      size: notesFit.size,
      font,
      color: COLOR,
    });
  });

  // Desenha um ✓ dentro do quadradinho
  const check = (boxe: Boxe, condition: boolean) => {
    if (!condition) return;
    const page = pages[boxe.page - 1];
    const H = page.getHeight();
    const p = (dx: number, dy: number) => ({
      x: boxe.x + dx,
      y: yPdf(H, boxe.topo + dy),
    });
    const options = { thickness: 1.3, color: COLOR };
    page.drawLine({ start: p(1.4, 4.4), end: p(3.3, 6.6), ...options });
    page.drawLine({ start: p(3.3, 6.6), end: p(7.2, 1.0), ...options });
  };

  // Conta bancária canadense
  if (data.canadianBankAccount !== undefined) {
    check(CHECKBOXES.bankYes, data.canadianBankAccount);
    check(CHECKBOXES.bankNo, !data.canadianBankAccount);
  }

  // Fumante
  check(CHECKBOXES.smokerYes, data.smoker === "yes");
  check(CHECKBOXES.smokerNo, data.smoker === "no");
  check(CHECKBOXES.smokerOccasionally, data.smoker === "occasionally");

  // Status
  check(CHECKBOXES.statusStudent, data.status === "student");
  check(CHECKBOXES.statusWorker, data.status === "worker");
  check(CHECKBOXES.statusBoth, data.status === "both");
  check(CHECKBOXES.statusOther, data.status === "other");

  // Roupa de cama
  check(CHECKBOXES.beddingNone, data.bedding === "none");
  check(CHECKBOXES.beddingUsedSet, data.bedding === "usedSet");
  check(CHECKBOXES.beddingNewSet, data.bedding === "newSet");

  // Confirmação do depósito de segurança (página 3)
  check(CHECKBOXES.depositAcknowledged, data.depositAcknowledged === true);

  // Assinatura desenhada (imagem) sobre a linha "Signature"
  if (data.signatureImage) {
    const base64 = data.signatureImage.split(",")[1] ?? "";
    const png = await pdfDoc.embedPng(Buffer.from(base64, "base64"));

    const pos = LABELS.signature;
    const page = pages[pos.page - 1];
    const larguraMax = Math.min(pos.x1 - pos.x0, MAX_SIGN.width);
    const escala = Math.min(
      larguraMax / png.width,
      MAX_SIGN.altura / png.height,
    );

    page.drawImage(png, {
      x: pos.x0,
      y: yPdf(page.getHeight(), pos.base) + 1,
      width: png.width * escala,
      height: png.height * escala,
    });
  }

  return pdfDoc.save();
}
