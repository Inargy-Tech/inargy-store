import DashboardShell from '../../components/layout/DashboardShell'

export const metadata = {
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>
}
