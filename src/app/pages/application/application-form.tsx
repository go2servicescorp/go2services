"use client";

import { useRef, useState } from "react";
import { FormField } from "@/components/form/form-field";
import { SignaturePad } from "@/components/form/signature-pad";
import { DocumentUpload } from "@/components/form/document-upload";
import type { ApplicationData } from "@/lib/form-pdf";
import {
  DOCUMENT_CATEGORIES,
  MAX_FILES_PER_CATEGORY,
  MAX_FILE_SIZE_MB,
  MAX_TOTAL_SIZE_MB,
  emptyDocuments,
  formatSize,
  validateDocuments,
  type DocumentFiles,
  type DocumentKey,
} from "@/lib/documents";
import { StatusModal } from "@/components/modal/statuses-modal/status-modal";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import PhoneField from "./phone-field";
import LimitModal from "@/components/modal/size-limit/size-limit";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundBack } from "react-icons/io";

type Status = "idle" | "sending" | "ok" | "error";
type OccupationStatus = ApplicationData["status"];

const MB = 1024 * 1024;

type TextField = {
  name: keyof ApplicationData;
  label: string;
  type?: "text" | "email" | "tel" | "date";
  placeholder?: string;
  required?: boolean;
};

export type ApplicationFormProps = {
  room: string;
  street: string;
  monthlyRent: string;
  deposit: string;
};

const PROPERTY: TextField[] = [
  {
    name: "moveIn",
    label: "Desired Move-In Date",
    type: "date",
    required: true,
  },
  {
    name: "moveOut",
    label: "Desired Move-Out Date",
    type: "date",
    required: true,
  },
];

const PERSONAL_TOP: TextField[] = [
  {
    name: "fullName",
    label: "Full Name",
    placeholder: "John Doe",
    required: true,
  },
  { name: "email", label: "Email", type: "email", required: true },
];

const PERSONAL_BOTTOM: TextField[] = [
  { name: "countryOfOrigin", label: "Country of Origin", required: true },
  {
    name: "dateMovedToCanada",
    label: "Date You Moved to Canada (if applicable)",
    type: "date",
  },
];

// every field that belongs to the Occupation section (used to clear stale values)
const OCCUPATION_KEYS: (keyof ApplicationData)[] = [
  "schoolName",
  "program",
  "employerName",
  "position",
  "startDate",
  "monthlyIncome",
  "workplaceAddress",
  "employerSchool",
  "statusOther",
];

function getOccupationFields(status: OccupationStatus): TextField[] {
  const isStudent = status === "student" || status === "both";
  const isWorker = status === "worker" || status === "both";
  const isBoth = status === "both";

  if (!isStudent && !isWorker) return []; // "other" or not selected yet

  const fields: TextField[] = [];

  if (isStudent) {
    fields.push(
      { name: "schoolName", label: "School Name" },
      { name: "program", label: "Program / Major" },
    );
  }

  if (isWorker) {
    fields.push(
      { name: "employerName", label: "Employer Name" },
      { name: "position", label: "Position / Role" },
    );
  }

  fields.push(
    {
      name: "startDate",
      label: isBoth
        ? "Start Date (Employment / Studies)"
        : isStudent
          ? "Start Date (Studies)"
          : "Start Date (Employment)",
      type: "date",
    },
    {
      name: "monthlyIncome",
      label: isWorker
        ? "Monthly Income"
        : "Monthly Income (or proof of support)",
    },
    {
      name: "workplaceAddress",
      label: isBoth
        ? "Address of School / Workplace"
        : isStudent
          ? "Address of School"
          : "Address of Workplace",
    },
  );

  return fields;
}

function getEmployerSchoolLabel(status: OccupationStatus): string {
  if (status === "both") return "Employer / School Contact";
  if (status === "student") return "School Contact";
  return "Employer Contact";
}

const REFERENCES: TextField[] = [
  { name: "referenceName", label: "Personal Reference Name" },
  { name: "referenceRelationship", label: "Relationship" },
  { name: "referenceContact", label: "Contact Information" },
];

export function ApplicationForm(props: ApplicationFormProps) {
  const initialValue: ApplicationData = {
    room: props.room,
    street: props.street,
    monthlyRent: props.monthlyRent,
    deposit: props.deposit,
  };

  const router = useRouter();
  const [data, setDados] = useState<ApplicationData>(initialValue);
  const [status, setStatus] = useState<Status>("idle");
  const [semAssinatura, setSemAssinatura] = useState(false);
  const [documents, setDocuments] = useState<DocumentFiles>(emptyDocuments);
  const [documentsError, setDocumentsError] = useState("");
  const [limitMessage, setLimitMessage] = useState(""); // file size / count modal
  const [serverError, setServerError] = useState("");
  const [formKey, setFormKey] = useState(0); // muda para limpar o formulário
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [token, setToken] = useState("");

  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneValid = !!data.phone && isValidPhoneNumber(data.phone);

  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyPhoneTouched, setEmergencyPhoneTouched] = useState(false);
  const emergencyPhoneValid =
    !!emergencyPhone && isValidPhoneNumber(emergencyPhone);

  const [employerSchoolName, setEmployerSchoolName] = useState("");
  const [employerSchoolPhone, setEmployerSchoolPhone] = useState("");
  const [employerSchoolPhoneTouched, setEmployerSchoolPhoneTouched] =
    useState(false);

  const hasOccupationFields =
    data.status === "student" ||
    data.status === "worker" ||
    data.status === "both";

  // optional: only invalid if filled in and wrong
  const employerSchoolPhoneValid =
    !employerSchoolPhone || isValidPhoneNumber(employerSchoolPhone);

  function setCampo<K extends keyof ApplicationData>(
    name: K,
    value: ApplicationData[K],
  ) {
    setDados((prev) => ({ ...prev, [name]: value }));
  }

  function handleChange(name: keyof ApplicationData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCampo(name, e.target.value as never);
    };
  }

  function resetEmployerSchool() {
    setEmployerSchoolName("");
    setEmployerSchoolPhone("");
    setEmployerSchoolPhoneTouched(false);
  }

  function handleStatusChange(value: string) {
    setDados((prev) => {
      const next = { ...prev } as Partial<ApplicationData>;
      // clear values from fields that may no longer be visible
      for (const key of OCCUPATION_KEYS) delete next[key];
      next.status = value as OccupationStatus;
      return next as ApplicationData;
    });
    resetEmployerSchool();

    // the school document is only shown for student / both: drop it otherwise,
    // so a hidden file never travels in the request or counts toward the limit
    if (value !== "student" && value !== "both") {
      setDocuments((prev) => ({ ...prev, schoolEnrollment: [] }));
    }
  }

  function addDocuments(key: DocumentKey, newFiles: File[]) {
    setDocumentsError("");

    const current = documents[key];
    // ignore a file that is already in the list (same name and size)
    const fresh = newFiles.filter(
      (f) => !current.some((p) => p.name === f.name && p.size === f.size),
    );

    // everything in state goes into the request, so count all categories
    let total = DOCUMENT_CATEGORIES.reduce(
      (sum, c) => sum + documents[c.key].reduce((s, f) => s + f.size, 0),
      0,
    );

    const accepted: File[] = [];
    let message = "";

    for (const file of fresh) {
      if (current.length + accepted.length >= MAX_FILES_PER_CATEGORY) {
        message ||= `You can attach up to ${MAX_FILES_PER_CATEGORY} files in this category.`;
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * MB) {
        message ||= `"${file.name}" (${formatSize(file.size)}) is larger than the ${MAX_FILE_SIZE_MB} MB limit per file.`;
        continue;
      }
      if (total + file.size > MAX_TOTAL_SIZE_MB * MB) {
        message ||= `"${file.name}" cannot be added: the total size of all files is limited to ${MAX_TOTAL_SIZE_MB} MB (currently ${formatSize(total)}).`;
        continue;
      }
      accepted.push(file);
      total += file.size;
    }

    if (message) setLimitMessage(message);
    if (accepted.length > 0) {
      setDocuments((prev) => ({
        ...prev,
        [key]: [...prev[key], ...accepted],
      }));
    }
  }

  function removeDocument(key: DocumentKey, index: number) {
    setDocumentsError("");
    setDocuments((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  }

  function renderFieldItems(fields: TextField[]) {
    return fields.map((c) => (
      <FormField
        key={c.name}
        label={c.label}
        name={c.name}
        type={c.type ?? "text"}
        required={c.required}
        placeholder={c.placeholder}
        onChange={handleChange(c.name)}
      />
    ));
  }

  function renderFields(fields: TextField[]) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {renderFieldItems(fields)}
      </div>
    );
  }

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const docsError = validateDocuments(documents, data.status);
    setDocumentsError(docsError ?? "");
    setSemAssinatura(!data.signatureImage);
    setPhoneTouched(true);
    setEmergencyPhoneTouched(true);
    setEmployerSchoolPhoneTouched(true);
    if (
      docsError ||
      !data.signatureImage ||
      !phoneValid ||
      !emergencyPhoneValid ||
      (hasOccupationFields && !employerSchoolPhoneValid)
    )
      return;

    setServerError("");
    setStatus("sending");

    try {
      // multipart/form-data: the form data goes in one JSON field and each
      // document goes as a file. Do NOT set Content-Type; the browser does it.
      const formData = new FormData();
      const employerSchool = hasOccupationFields
        ? [employerSchoolName.trim(), employerSchoolPhone]
            .filter(Boolean)
            .join(" - ") || undefined
        : undefined;

      formData.append(
        "data",
        JSON.stringify({
          ...data,
          // avoids sending the "Other" text if the user changed the option
          statusOther: data.status === "other" ? data.statusOther : undefined,
          emergencyContact: `${emergencyName.trim()} - ${emergencyPhone}`,
          employerSchool,
          applicantName: data.fullName,
          // user's local date, formatted as YYYY-MM-DD
          date: new Date().toLocaleDateString("en-CA"),
          turnstileToken: token,
        }),
      );
      for (const category of DOCUMENT_CATEGORIES) {
        for (const file of documents[category.key]) {
          formData.append(category.key, file);
        }
      }

      const res = await fetch("/api/send-application", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setStatus("ok");
        setDados(initialValue);
        setSemAssinatura(false);
        setDocuments(emptyDocuments());
        setDocumentsError("");
        setFormKey((k) => k + 1); // remounts the form and the signature
        setPhoneTouched(false);
        setEmergencyName("");
        setEmergencyPhone("");
        setEmergencyPhoneTouched(false);
        resetEmployerSchool();
      } else {
        // 400 = the server rejected something the user can fix: show the reason
        if (res.status === 400) {
          const body = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          setServerError(body?.error ?? "");
        }
        // 413 = the host rejected the request body before reaching our code
        if (res.status === 413) {
          setServerError(
            `The files are too large. Keep the total under ${MAX_TOTAL_SIZE_MB} MB.`,
          );
        }
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      // remounts the Turnstile to generate a new token
      turnstileRef.current?.reset();
      setToken("");
    }
  }

  const canSubmit =
    !!data.depositAcknowledged && !!data.signatureImage && token !== "";

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }
  return (
    <main className="flex flex-col gap-5 py-5 sm:px-20 px-7">
      <header className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1 self-start text-sm font-bold text-[#0ABDAD] underline-offset-4 hover:underline cursor-pointer"
        >
          <IoMdArrowRoundBack />
          Back
        </button>
        <h1 className="text-center text-2xl font-bold">Application to Rent</h1>
      </header>

      <form key={formKey} onSubmit={send} className="flex flex-col gap-8">
        {/* Property Information */}
        <section className="flex flex-col gap-5">
          <h2 className="text-md font-bold">Property Information</h2>
          {renderFields(PROPERTY)}
        </section>

        {/* Personal Information */}
        <section className="flex flex-col gap-5">
          <h2 className="text-md font-bold">Personal Information</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {renderFieldItems(PERSONAL_TOP)}

            <PhoneField
              label="Phone"
              required
              value={data.phone}
              onChange={(v) => setCampo("phone", v)}
              touched={phoneTouched}
              onBlur={() => setPhoneTouched(true)}
              valid={phoneValid}
            />

            {renderFieldItems(PERSONAL_BOTTOM)}
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Options
              legenda="Do you have a Canadian Bank Account?"
              name="canadianBankAccount"
              required
              options={[
                { label: "Yes", value: "true" },
                { label: "No", value: "false" },
              ]}
              onChange={(v) => setCampo("canadianBankAccount", v === "true")}
            />
            <Options
              legenda="Are you a smoker?"
              name="smoker"
              required
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
                { label: "Occasionally", value: "occasionally" },
              ]}
              onChange={(v) =>
                setCampo("smoker", v as ApplicationData["smoker"])
              }
            />
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="flex flex-col gap-5">
          <h2 className="text-md font-bold">Emergency Contact</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              label="Emergency Contact Name"
              name="emergencyContactName"
              type="text"
              required
              onChange={(e) => setEmergencyName(e.target.value)}
            />
            <PhoneField
              label="Emergency Contact Phone"
              required
              value={emergencyPhone}
              onChange={setEmergencyPhone}
              touched={emergencyPhoneTouched}
              onBlur={() => setEmergencyPhoneTouched(true)}
              valid={emergencyPhoneValid}
            />
          </div>
        </section>

        {/* Occupation / Education */}
        <section className="flex flex-col gap-5">
          <h2 className="text-md font-bold">Occupation / Education</h2>
          <Options
            legenda="Current Status"
            name="status"
            required
            options={[
              { label: "Student", value: "student" },
              { label: "Worker", value: "worker" },
              { label: "Both", value: "both" },
              { label: "Other", value: "other" },
            ]}
            onChange={handleStatusChange}
          />

          {/* key remounts the fields when the status changes,
              so the inputs reset together with the state */}
          <div key={data.status ?? "none"} className="flex flex-col gap-5">
            {data.status === "other" && (
              <FormField
                label="Other"
                name="statusOther"
                type="text"
                required
                onChange={handleChange("statusOther")}
              />
            )}
            {hasOccupationFields && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {renderFieldItems(getOccupationFields(data.status))}

                <FormField
                  label={`${getEmployerSchoolLabel(data.status)} Name`}
                  name="employerSchoolName"
                  type="text"
                  onChange={(e) => setEmployerSchoolName(e.target.value)}
                />
                <PhoneField
                  label={`${getEmployerSchoolLabel(data.status)} Phone`}
                  value={employerSchoolPhone}
                  onChange={setEmployerSchoolPhone}
                  touched={employerSchoolPhoneTouched}
                  onBlur={() => setEmployerSchoolPhoneTouched(true)}
                  valid={employerSchoolPhoneValid}
                />
              </div>
            )}
          </div>
        </section>

        {/* References */}
        <section className="flex flex-col gap-5">
          <h2 className="text-md font-bold">References</h2>
          {renderFields(REFERENCES)}
        </section>

        {/* Additional Information */}
        <section className="flex flex-col gap-5">
          <h2 className="text-md font-bold">Additional Information</h2>
          <p>
            The bedding set (sheet, pillows, and duvet/blanket) is not included.
            All rooms come with a mattress protector, which must stay on the bed
            upon move-out.
          </p>
          <Options
            legenda="Bedding options"
            name="bedding"
            required
            options={[
              { label: "No bedding needed", value: "none" },
              {
                label: "Rent used set: one-time fee of $30 (non-refundable)",
                value: "usedSet",
              },
              {
                label:
                  "New full set: $100, and you may keep it after moving out",
                value: "newSet",
              },
            ]}
            onChange={(v) =>
              setCampo("bedding", v as ApplicationData["bedding"])
            }
          />
          <FormField
            label="Anything you would like to add or explain"
            name="notes1"
            type="textarea"
            required={false}
            rows={3}
            maxLength={220}
            onChange={handleChange("notes1")}
          />
        </section>

        {/* Required Documents */}
        <section className="flex flex-col gap-5">
          <DocumentUpload
            files={documents}
            onAdd={addDocuments}
            onRemove={removeDocument}
            error={documentsError}
            status={data.status}
          />
        </section>

        {/* Declaration and Signature */}
        <section className="flex flex-col gap-4">
          <h2 className="text-md font-bold">Declaration and Signature</h2>
          <p>
            I confirm that the information provided in this application is true
            and complete to the best of my knowledge. I authorize GO 2 Rent &
            Services Corp to verify the information provided above.
          </p>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              required
              onChange={(e) =>
                setCampo("depositAcknowledged", e.target.checked)
              }
            />
            <span>
              I acknowledge that, in order to rent the room, I must pay a
              security deposit equivalent to 50% of the monthly rent via
              e-transfer to support@go2servicesca.com, plus the additional
              amount for the bedding set, if applicable.
            </span>
          </label>

          <div className="flex flex-col gap-2">
            <h2 className="text-md font-bold">Signature</h2>
            <SignaturePad
              onChange={(url) => {
                setCampo("signatureImage", url ?? undefined);
                if (url) setSemAssinatura(false);
              }}
            />
            {semAssinatura && (
              <p role="alert">Please sign before submitting.</p>
            )}
          </div>
        </section>

        <div className="mt-2">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={setToken}
            onExpire={() => setToken("")}
            onError={() => setToken("")}
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending" || !canSubmit}
          className="w-fit self-end rounded-md px-3 py-1.5 text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 bg-teal-500 hover:bg-teal-800 text-white"
        >
          {status === "sending" ? "Sending..." : "Submit application"}
        </button>
      </form>

      <StatusModal
        status={status}
        errorMessage={serverError}
        onClose={() => {
          if (status === "ok") window.scrollTo({ top: 0, behavior: "smooth" });
          setStatus("idle");
        }}
      />

      <LimitModal message={limitMessage} onClose={() => setLimitMessage("")} />
    </main>
  );
}

function Options({
  legenda,
  name,
  options,
  onChange,
  required,
}: {
  legenda: string;
  name: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-3">
        {legenda} {required && <span className="text-red-500">*</span>}
      </legend>
      {options.map((o) => (
        <label key={o.value} className="flex items-center gap-2">
          <input
            type="radio"
            name={name}
            value={o.value}
            required={required}
            onChange={() => onChange(o.value)}
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}
