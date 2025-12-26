import { CONFIG } from '@/config-global';
import { AssignementTemplateCreateView } from '@/sections/assignement-template/assignement-template-create-view';
// ----------------------------------------------------------------------

export const metadata = { title: `Create Assignements Templates | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <AssignementTemplateCreateView />;
}