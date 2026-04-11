export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-muted" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-green mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  )
}
