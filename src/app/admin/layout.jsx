import AdminLayoutShell from './AdminLayoutShell'

export const metadata = {
  title: 'Admin',
}

export default function AdminLayout({ children }) {
  return (
    <AdminLayoutShell>
      {children}
    </AdminLayoutShell>
  )
}
