'use client'

import { AlertDialog } from '@heroui/react/alert-dialog'
import { Button } from '@heroui/react/button'

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
              <Button
                variant="light"
                onPress={onClose}
                className="text-muted font-medium"
              >
                Cancel
              </Button>
              <Button
                onPress={onConfirm}
                isLoading={loading}
                className={
                  danger
                    ? 'bg-danger text-white font-semibold rounded-full hover:bg-danger/90 transition-colors'
                    : 'bg-slate-green text-white font-semibold rounded-full hover:bg-volt hover:text-slate-green transition-colors'
                }
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
