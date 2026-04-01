import { Dialog, DialogHeader, DialogBody, DialogFooter } from './dialog';
import { Button } from './button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const variantIcons = {
  danger: { icon: 'triangle-exclamation', color: 'text-red-600 bg-red-50' },
  warning: { icon: 'circle-exclamation', color: 'text-amber-600 bg-amber-50' },
  info: { icon: 'circle-info', color: 'text-blue-600 bg-blue-50' },
};

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Bevestigen', cancelLabel = 'Annuleren', variant = 'danger', loading }: ConfirmDialogProps) {
  const v = variantIcons[variant];
  return (
    <Dialog open={open} onClose={onClose}>
      <div className="flex gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${v.color}`}>
          <i className={`far fa-${v.icon} text-lg`} />
        </div>
        <div>
          <DialogHeader>{title}</DialogHeader>
          <DialogBody><p className="text-sm text-zinc-500">{message}</p></DialogBody>
        </div>
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>{cancelLabel}</Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </DialogFooter>
    </Dialog>
  );
}
