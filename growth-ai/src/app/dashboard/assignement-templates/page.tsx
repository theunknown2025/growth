import { CONFIG } from '@/config-global';
import { AssignementsTemplateListView } from '@/sections/assignement-template/assignement-template-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Assignements Templates | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <AssignementsTemplateListView />;
}