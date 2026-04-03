'use client'

import { Button } from '@heroui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize)

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between pt-6">
      <p className="text-xs text-muted">
        Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          isIconOnly
          isDisabled={page <= 1}
          onPress={() => onPageChange(page - 1)}
          className="w-11 h-11 rounded-xl border border-border text-muted hover:bg-surface disabled:opacity-40 min-w-0"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="text-sm font-medium text-slate-green px-2">
          {page} / {totalPages}
        </span>
        <Button
          variant="ghost"
          isIconOnly
          isDisabled={page >= totalPages}
          onPress={() => onPageChange(page + 1)}
          className="w-11 h-11 rounded-xl border border-border text-muted hover:bg-surface disabled:opacity-40 min-w-0"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
