"use client";

import { useRef, useState } from "react";
import { FormField } from "@/components/form/form-field";
import { SignaturePad } from "@/components/form/signature-pad";
import { DocumentUpload } from "@/components/form/document-upload";
import type { ApplicationData } from "@/lib/form-pdf";
import {
  DOCUMENT_CATEGORIES,
  MAX_FILES_PER_CATEGORY,
  emptyDocuments,
  validateDocuments,
  type DocumentFiles,
  type DocumentKey,
} from "@/lib/documents";
import { StatusModal } from "@/components/modal/statuses-modal/status-modal";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";

type Status = "idle" | "enviando" | "ok" | "erro";
type OccupationStatus = ApplicationData["status"];

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
  { name: "moveIn", label: "Desired Move-In Date", type: "date" },
  { name: "moveOut", label: "Desired Move-Out Date", type: "date" },
];

const PERSONAL: TextField[] = [
  {
    name: "fullName",
    label: "Full Name",
    placeholder: "John Doe",
    required: true,
  },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone Number", type: "tel" },
  { name: "countryOfOrigin", label: "Country of Origin" },
  {
    name: "dateMovedToCanada",
    label: "Date You Moved to Canada (if applicable)",
    type: "date",
  },
];

const EMERGENCY: TextField[] = [
  { name: "emergencyContact", label: "Emergency Contact Name & Phone" },
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
  "employerContact",
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
    {
      name: "employerContact",
      label: isBoth
        ? "Employer / School Contact (Name & Phone)"
        : isStudent
          ? "School Contact (Name & Phone)"
          : "Employer Contact (Name & Phone)",
    },
  );

  return fields;
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

  const [data, setDados] = useState<ApplicationData>(initialValue);
  const [status, setStatus] = useState<Status>("idle");
  const [semAssinatura, setSemAssinatura] = useState(false);
  const [documents, setDocuments] = useState<DocumentFiles>(emptyDocuments);
  const [documentsError, setDocumentsError] = useState("");
  const [serverError, setServerError] = useState("");
  const [formKey, setFormKey] = useState(0); // muda para limpar o formulário
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [token, setToken] = useState("");

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

  function handleStatusChange(value: string) {
    setDados((prev) => {
      const next = { ...prev } as Partial<ApplicationData>;
      // clear values from fields that may no longer be visible
      for (const key of OCCUPATION_KEYS) delete next[key];
      next.status = value as OccupationStatus;
      return next as ApplicationData;
    });
  }

  function addDocuments(key: DocumentKey, newFiles: File[]) {
    setDocumentsError("");
    setDocuments((prev) => {
      // ignore a file that is already in the list (same name and size)
      const fresh = newFiles.filter(
        (f) => !prev[key].some((p) => p.name === f.name && p.size === f.size),
      );
      return {
        ...prev,
        [key]: [...prev[key], ...fresh].slice(0, MAX_FILES_PER_CATEGORY),
      };
    });
  }

  function removeDocument(key: DocumentKey, index: number) {
    setDocumentsError("");
    setDocuments((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  }

  function renderFields(fields: TextField[]) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {fields.map((c) => (
          <FormField
            key={c.name}
            label={c.label}
            name={c.name}
            type={c.type ?? "text"}
            required={c.required}
            placeholder={c.placeholder}
            onChange={handleChange(c.name)}
          />
        ))}
      </div>
    );
  }

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const docsError = validateDocuments(documents, data.status);
    setDocumentsError(docsError ?? "");
    setSemAssinatura(!data.signatureImage);
    if (docsError || !data.signatureImage) return;

    setServerError("");
    setStatus("enviando");

    try {
      // multipart/form-data: the form data goes in one JSON field and each
      // document goes as a file. Do NOT set Content-Type; the browser does it.
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          ...data,
          // avoids sending the "Other" text if the user changed the option
          statusOther: data.status === "other" ? data.statusOther : undefined,
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
        setFormKey((k) => k + 1); // remonta o formulário e a assinatura
      } else {
        // 400 = the server rejected something the user can fix: show the reason
        if (res.status === 400) {
          const body = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          setServerError(body?.error ?? "");
        }
        setStatus("erro");
      }
    } catch {
      setStatus("erro");
    } finally {
      // remonta o Turnstile para gerar um novo token
      turnstileRef.current?.reset();
      setToken("");
    }
  }

  const canSubmit =
    !!data.depositAcknowledged && !!data.signatureImage && token !== "";

  return (
    <main className="flex flex-col gap-5 py-5 sm:px-20 px-7">
      <header className="flex items-center justify-center">
        <h1 className="text-2xl font-bold">Application to Rent</h1>
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
          {renderFields(PERSONAL)}
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
          {renderFields(EMERGENCY)}
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
            {renderFields(getOccupationFields(data.status))}
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
            label="Anything you would like to add or explain (line 1)"
            name="notes1"
            type="text"
            required={false}
            onChange={handleChange("notes1")}
          />
          <FormField
            label="Anything you would like to add or explain (line 2)"
            name="notes2"
            type="text"
            required={false}
            onChange={handleChange("notes2")}
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
          disabled={status === "enviando" || !canSubmit}
          className="w-fit self-end rounded-md px-3 py-1.5 text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 bg-teal-500 hover:bg-teal-800 text-white"
        >
          {status === "enviando" ? "Sending..." : "Submit application"}
        </button>

        {/* {status === "ok" && <p>Application sent successfully!</p>}
        {status === "erro" && (
          <p role="alert">
            {serverError || "Something went wrong. Please try again."}
          </p>
        )} */}
      </form>

      <StatusModal
        status={status}
        errorMessage={serverError}
        onClose={() => {
          if (status === "ok") window.scrollTo({ top: 0, behavior: "smooth" });
          setStatus("idle");
        }}
      />
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
      <legend>{legenda}</legend>
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
