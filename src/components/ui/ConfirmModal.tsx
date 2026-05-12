'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (note?: string) => void | Promise<void>
  title: string
  description: string
  confirmLabel: string
  confirmVariant?: 'danger' | 'primary'
  note?: { label: string; placeholder: string }
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  confirmVariant = 'danger',
  note,
  loading,
}: ConfirmModalProps) {
  const [noteValue, setNoteValue] = useState('')

  const handleConfirm = async () => {
    await onConfirm(note ? noteValue : undefined)
    setNoteValue('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>

      {note && (
        <div className="mt-4">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
            {note.label}
          </label>
          <input
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            placeholder={note.placeholder}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      )}

      <div className="flex gap-3 mt-6 justify-end">
        <Button variant="ghost" onClick={onClose} size="sm" type="button">
          Cancelar
        </Button>
        <Button
          variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
          onClick={handleConfirm}
          loading={loading}
          size="sm"
          type="button"
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
