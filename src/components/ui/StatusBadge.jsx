import { Chip } from '@heroui/react'

const statusColors = {
  pending: 'warning',
  processing: 'secondary',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'danger',
  paid: 'success',
  overdue: 'danger',
  active: 'success',
  inactive: 'default',
}

export default function StatusBadge({ status }) {
  const color = statusColors[status] || 'default'
  return (
    <Chip color={color} variant="flat" size="sm" className="capitalize">
      {status}
    </Chip>
  )
}
