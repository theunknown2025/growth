import { CONFIG } from '@/config-global';
import { AssignmentDashboard } from '@/sections/assignement/view/assignement-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Manage Assignements | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <AssignmentDashboard />;
}