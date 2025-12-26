import { DashboardLayout } from '@/layouts/dashabord/DashboardLayout';

import { AuthGuard } from '@/sections/auth/context/AuthGuard';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}