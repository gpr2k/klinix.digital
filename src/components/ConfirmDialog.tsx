import { Modal } from './Modal';

interface Props {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  errorMessage,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onCancel} title={title}>
      <p className="text-sm text-slate-600">{description}</p>
      {errorMessage ? (
        <p
          role="alert"
          className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
        >
          {errorMessage}
        </p>
      ) : null}
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Excluindo…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
