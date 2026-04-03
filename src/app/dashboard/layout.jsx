import DashboardLayoutShell from './DashboardLayoutShell'

export const metadata = {
  title: 'Dashboard',
}

export default function DashboardLayout({ children }) {
  return (
    <DashboardLayoutShell>
      {children}
    </DashboardLayoutShell>
  )
}
