import type { Metadata } from 'next';
import AdminDashboard from './components/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard - PhishGuard',
  description: 'PhishGuard Admin Control Panel',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
