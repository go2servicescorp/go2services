// Rules shared by the browser (instant feedback) and the server (the real check).
// Nothing here depends on Node or the DOM, so it is safe to import from both.

export type OccupationStatus =
  | "student"
  | "worker"
  | "both"
  | "other"
  | undefined;

const ALL_STATUSES = ["student", "worker", "both", "other"] as const;

// appliesTo:   statuses for which the category is shown
// requiredFor: statuses for which the category must have at least one file
export const DOCUMENT_CATEGORIES = [
  {
    key: "photoId",
    label: "Photo ID",
    hint: "Passport, driver's license, or BC ID",
    appliesTo: ALL_STATUSES,
    requiredFor: ALL_STATUSES,
  },
  {
    key: "proofOfIncome",
    label: "Proof of income",
    hint: "Pay slip, job offer letter, bank statement",
    appliesTo: ALL_STATUSES,
    requiredFor: ALL_STATUSES,
  },
  {
    key: "schoolEnrollment",
    label: "School enrollment letter or student ID",
    hint: "Letter of enrollment or valid student ID",
    appliesTo: ["student", "both"],
    requiredFor: ["student", "both"],
  },
  {
    key: "proofOfFunds",
    label: "Proof of funds or sponsorship",
    hint: "If no income",
    appliesTo: ALL_STATUSES,
    requiredFor: ALL_STATUSES,
  },
  {
    key: "otherDocuments",
    label: "Other supporting documents",
    hint: "Any other documents that support your application",
    appliesTo: ALL_STATUSES,
    requiredFor: ALL_STATUSES,
  },
] as const;

export type DocumentKey = (typeof DOCUMENT_CATEGORIES)[number]["key"];
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
export type FileInfo = { name: string; size: number };
export type DocumentFiles<T extends FileInfo = File> = Record<DocumentKey, T[]>;

export const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};
export const ALLOWED_EXTENSIONS = Object.keys(MIME_BY_EXTENSION);
export const ACCEPT_ATTRIBUTE = ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(
  ",",
);

// NOTE: some hosts cap the whole request body (Vercel serverless: about 4.5 MB).
// If you deploy there, lower MAX_TOTAL_SIZE_MB to 4.
export const MAX_FILE_SIZE_MB = 1;
export const MAX_TOTAL_SIZE_MB = 4;
export const MAX_FILES_PER_CATEGORY = 2;

const MB = 1024 * 1024;

// With no status selected yet, only the categories that apply to everyone match.
function matchesStatus(list: readonly string[], status: OccupationStatus) {
  return status ? list.includes(status) : list.length === ALL_STATUSES.length;
}

/** Categories that are shown for the given status. */
export function getCategoriesForStatus(
  status: OccupationStatus,
): DocumentCategory[] {
  return DOCUMENT_CATEGORIES.filter((c) => matchesStatus(c.appliesTo, status));
}

/** True when the category needs at least one file for the given status. */
export function isCategoryRequired(
  category: DocumentCategory,
  status: OccupationStatus,
): boolean {
  return matchesStatus(category.requiredFor, status);
}

export function emptyDocuments<T extends FileInfo = File>(): DocumentFiles<T> {
  return {
    photoId: [],
    proofOfIncome: [],
    schoolEnrollment: [],
    proofOfFunds: [],
    otherDocuments: [],
  };
}

export function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
}

export function formatSize(bytes: number): string {
  return bytes >= MB
    ? `${(bytes / MB).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Returns an error message, or null when everything is fine. */
export function validateDocuments(
  files: DocumentFiles<FileInfo>,
  status: OccupationStatus,
): string | null {
  const categories = getCategoriesForStatus(status);

  // required categories must have at least one file
  for (const category of categories) {
    if (
      isCategoryRequired(category, status) &&
      files[category.key].length === 0
    ) {
      return `Please attach: ${category.label}.`;
    }
  }

  // // students need proof of income OR proof of funds / sponsorship
  // if (
  //   status === "student" &&
  //   files.proofOfIncome.length === 0 &&
  //   files.proofOfFunds.length === 0
  // ) {
  //   return "Please attach a proof of income or a proof of funds / sponsorship.";
  // }

  let total = 0;
  for (const category of categories) {
    const list = files[category.key];

    if (list.length > MAX_FILES_PER_CATEGORY) {
      return `"${category.label}": up to ${MAX_FILES_PER_CATEGORY} files.`;
    }
    for (const file of list) {
      if (!ALLOWED_EXTENSIONS.includes(getExtension(file.name))) {
        return `"${file.name}" is not allowed. Use PDF, JPG or PNG.`;
      }
      if (file.size === 0) {
        return `"${file.name}" is empty.`;
      }
      if (file.size > MAX_FILE_SIZE_MB * MB) {
        return `"${file.name}" is larger than ${MAX_FILE_SIZE_MB} MB.`;
      }
      total += file.size;
    }
  }

  if (total > MAX_TOTAL_SIZE_MB * MB) {
    return `The files together are larger than ${MAX_TOTAL_SIZE_MB} MB.`;
  }
  return null;
}

/** Checks the first bytes of the file, so a renamed .exe cannot pass as a .pdf. */
export function matchesFileSignature(
  bytes: Uint8Array,
  extension: string,
): boolean {
  const startsWith = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  switch (extension) {
    case "pdf":
      return startsWith(0x25, 0x50, 0x44, 0x46); // %PDF
    case "png":
      return startsWith(0x89, 0x50, 0x4e, 0x47);
    case "jpg":
    case "jpeg":
      return startsWith(0xff, 0xd8, 0xff);
    default:
      return false;
  }
}

/** Safe name for an email attachment: no paths, accents or odd characters. */
export function safeFileName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? "file";
  const ext = getExtension(base);
  const name = (ext ? base.slice(0, -(ext.length + 1)) : base)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${name || "file"}.${ext}`;
}

export const BEDDING_FEES: Record<string, number> = {
  none: 0,
  usedSet: 30,
  newSet: 100,
};
