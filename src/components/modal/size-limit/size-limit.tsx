export default function LimitModal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  if (!message) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="limit-title"
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="limit-title" className="mb-2 text-lg font-bold">
          File not added
        </h2>
        <p className="mb-5 text-sm">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto block rounded-md bg-teal-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
        >
          OK
        </button>
      </div>
    </div>
  );
}
