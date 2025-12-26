import { CONFIG } from '@/config-global';
import { ProcesssingDashboard } from '@/sections/processing/view/processing-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Manage Assignements | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <ProcesssingDashboard />;
}