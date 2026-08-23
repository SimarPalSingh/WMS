"use client"

import { useState } from "react"
import { AlertTriangle, Trash2, X } from "lucide-react"

interface DeleteConfirmModalProps {
  isOpen: boolean
  title: string
  itemName: string
  itemType: string // e.g. "Client", "Vehicle", "Job Card", "Tax Invoice", "Quotation"
  warningMessage?: string
  onClose: () => void
  onConfirm: () => Promise<void> | void
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  itemName,
  itemType,
  warningMessage,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    setDeleting(false)
    onClose()
  }

  const handleFinalDelete = async () => {
    setDeleting(true)
    try {
      await onConfirm()
      handleClose()
    } catch (err) {
      console.error(err)
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
              <p className="text-[10px] text-gray-500 font-mono">
                Confirm Deletion
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Content */}
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-xl space-y-1.5">
            <p className="font-bold text-red-900 text-sm">
              Are you sure you want to delete this {itemType.toLowerCase()}?
            </p>
            <p className="font-mono font-bold text-gray-800 text-sm bg-white/70 px-2 py-1 rounded border border-red-100">
              {itemName}
            </p>
            <p className="text-red-700 leading-relaxed text-[11px] pt-1">
              {warningMessage ||
                `This action cannot be undone. All associated records, logs, and references will be permanently removed.`}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={deleting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFinalDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? "Deleting..." : `Yes, Delete ${itemType}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
