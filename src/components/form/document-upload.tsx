"use client";

import { memo, useCallback, useMemo, useState } from "react";
import {
  ACCEPT_ATTRIBUTE,
  MAX_FILES_PER_CATEGORY,
  MAX_FILE_SIZE_MB,
  formatSize,
  getCategoriesForStatus,
  isCategoryRequired,
  type DocumentCategory,
  type DocumentFiles,
  type DocumentKey,
  type OccupationStatus,
} from "@/lib/documents";
import { IoInformationCircleOutline } from "react-icons/io5";
import { RiCloseCircleLine } from "react-icons/ri";
import Tooltip from "../tooltip/tooltip";
import Modal from "../modal/modal";

type DocumentUploadProps = {
  files: DocumentFiles;
  status: OccupationStatus; // "student" | "worker" | "both" | "other" | undefined
  onAdd: (key: DocumentKey, newFiles: File[]) => void;
  onRemove: (key: DocumentKey, index: number) => void;
  error?: string;
};

type ModalContent = { title: string; message: string };
type ShowModal = (title: string, message: string) => void;

const NARROW_LABELS: DocumentKey[] = ["proofOfFunds", "otherDocuments"];

/* ------------------------------------------------------------------ */
/* One row per category. Memoized: it only re-renders when its own     */
/* files, its required flag or the (stable) callbacks change.          */
/* ------------------------------------------------------------------ */

type CategoryRowProps = {
  category: DocumentCategory;
  list: File[];
  required: boolean;
  onAdd: (key: DocumentKey, newFiles: File[]) => void;
  onRemove: (key: DocumentKey, index: number) => void;
  onShowModal: ShowModal;
};

const CategoryRow = memo(function CategoryRow({
  category,
  list,
  required,
  onAdd,
  onRemove,
  onShowModal,
}: CategoryRowProps) {
  const inputId = `doc-${category.key}`;
  const titleId = `${inputId}-title`;
  const isFull = list.length >= MAX_FILES_PER_CATEGORY;
  const isNarrow = NARROW_LABELS.includes(category.key);

  function showLimitModal() {
    onShowModal(
      "File limit reached",
      `You can attach up to ${MAX_FILES_PER_CATEGORY} files in "${category.label}". Remove one of them to add another.`,
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="flex sm:flex-row gap-5">
          <span id={titleId} className="flex items-center gap-1">
            <span className={isNarrow ? "w-min sm:w-auto" : ""}>
              {category.label}
            </span>
            {required && <span className="text-red-500"> *</span>}
            <Tooltip content={category.hint}>
              <button
                type="button"
                aria-label={`More information: ${category.label}`}
                onClick={() => onShowModal(category.label, category.hint)}
                className="inline-flex cursor-pointer"
              >
                <IoInformationCircleOutline
                  className="inline-block h-4 w-4 text-[#0ABDAD]"
                  size={20}
                />
              </button>
            </Tooltip>
          </span>

          <div className="flex items-center gap-3 justify-end sm:w-auto">
            <input
              id={inputId}
              type="file"
              multiple
              accept={ACCEPT_ATTRIBUTE}
              disabled={isFull}
              aria-labelledby={titleId}
              hidden
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                // picked more files than the remaining slots
                if (picked.length > MAX_FILES_PER_CATEGORY - list.length) {
                  showLimitModal();
                }
                onAdd(category.key, picked);
                e.target.value = ""; // allows picking the same file again
              }}
            />
            <label
              htmlFor={inputId}
              aria-disabled={isFull}
              onClick={(e) => {
                // the input is disabled when full, so open the modal instead
                if (isFull) {
                  e.preventDefault();
                  showLimitModal();
                }
              }}
              className={`inline-flex min-w-fit shrink-0 items-center rounded-md border border-current px-3 py-1.5 text-sm font-medium ${
                isFull ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
            >
              {list.length === 0 ? "Choose files" : "Add more files"}
            </label>
          </div>
        </div>

        <div>
          {list.length > 0 && (
            <ul className="flex flex-col gap-1 items-end">
              {list.map((file, index) => (
                <li
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center gap-3 text-gray-600 text-sm"
                >
                  <span>
                    {file.name} ({formatSize(file.size)})
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(category.key, index)}
                    aria-label={`Remove ${file.name}`}
                    className="text-sm text-red-600 underline hover:text-red-800 cursor-pointer"
                  >
                    <RiCloseCircleLine size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="h-px w-full bg-[#d1cfcf]"></div>
    </div>
  );
});

/* ------------------------------------------------------------------ */

function DocumentUploadBase({
  files,
  status,
  onAdd,
  onRemove,
  error,
}: DocumentUploadProps) {
  const [modal, setModal] = useState<ModalContent | null>(null);

  // only the categories that apply to the selected status
  const categories = useMemo(() => getCategoriesForStatus(status), [status]);

  // stable reference (setModal never changes), so memoized rows are not invalidated
  const showModal = useCallback<ShowModal>(
    (title, message) => setModal({ title, message }),
    [],
  );

  return (
    <fieldset className="flex flex-col gap-5">
      <legend>Required Documents (Important – Must be attached)</legend>

      <p>
        Please upload clear copies of the following documents (PDF, JPG or PNG,
        up to {MAX_FILE_SIZE_MB} MB each).
      </p>
      <p>
        <strong>Applications without documents will not be processed.</strong>
      </p>

      {categories.map((category) => (
        <CategoryRow
          key={category.key}
          category={category}
          list={files[category.key]}
          required={isCategoryRequired(category, status)}
          onAdd={onAdd}
          onRemove={onRemove}
          onShowModal={showModal}
        />
      ))}

      {error && <p role="alert">{error}</p>}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.title ?? ""}
      >
        <p>{modal?.message}</p>
      </Modal>
    </fieldset>
  );
}

// memo: typing in any other field of the form no longer re-renders this component
export const DocumentUpload = memo(DocumentUploadBase);
