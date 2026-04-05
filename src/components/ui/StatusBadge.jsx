const statusStyles = {
  pending:    'bg-warning/10 text-warning',
  processing: 'bg-slate-green/10 text-slate-green',
  shipped:    'bg-volt/25 text-slate-green',
  delivered:  'bg-success/10 text-success',
  cancelled:  'bg-danger/10 text-danger',
  paid:       'bg-success/10 text-success',
  overdue:    'bg-danger/10 text-danger',
  active:     'bg-success/10 text-success',
  inactive:   'bg-border text-muted',
}

export default function StatusBadge({ status }) {
  const styles = statusStyles[status] || 'bg-border text-muted'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles}`}>
      {status}
    </span>
  )
}
