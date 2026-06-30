"use client";

export default function DeleteConfirmModal({
  studentName,
  submitting,
  errorMessage,
  onConfirm,
  onClose,
}: {
  studentName: string;
  submitting: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/50 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="corner-ornament relative w-full max-w-sm rounded-2xl border border-gold/30 bg-white p-6 text-center shadow-ornate sm:p-7">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <path
              d="M12 9v4m0 4h.01M10.3 3.9 2.5 17.5A1.5 1.5 0 0 0 3.8 20h16.4a1.5 1.5 0 0 0 1.3-2.5L13.7 3.9a1.5 1.5 0 0 0-2.6 0Z"
              fill="none"
              stroke="#DC2626"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="mb-2 text-lg font-bold text-emerald-800">حذف الطالب؟</h2>
        <p className="mb-6 text-sm leading-relaxed text-night/60">
          هل أنت متأكد من حذف <span className="font-bold text-night">{studentName}</span>؟
          لا يمكن التراجع عن هذا الإجراء.
        </p>

        {errorMessage && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="flex gap-3" dir="rtl">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-emerald-100 py-2.5 text-sm font-semibold text-night/70 transition hover:bg-sand-100 disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? "جارٍ الحذف..." : "حذف نهائيًا"}
          </button>
        </div>
      </div>
    </div>
  );
}
