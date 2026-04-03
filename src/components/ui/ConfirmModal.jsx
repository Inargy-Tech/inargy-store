'use client'

import { AlertDialog, Button } from '@heroui/react'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
}) {
  return (
    <AlertDialog isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <AlertDialog.Backdrop isDismissable>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
              <AlertDialog.CloseTrigger />
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-muted">{message}</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color={danger ? 'danger' : 'primary'}
                onPress={onConfirm}
                isLoading={loading}
                className={danger ? '' : 'bg-slate-green'}
              >
                {confirmLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}
