import { CONFIG } from '@/config-global';

import { DashboardContent } from '@/sections/manage/view/manage-evalution-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Manage Evaluation | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <DashboardContent />;
}