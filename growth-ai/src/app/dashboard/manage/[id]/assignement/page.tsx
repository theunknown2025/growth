import { CONFIG } from '@/config-global';
import CreateAssignmentPage from '@/sections/assignement/view/create-assignement';
// ----------------------------------------------------------------------

export const metadata = { title: `Make Assignement | Dashboard - ${CONFIG.site.name}` };

type Props = {
  params: { id: string };
};

export default async function Page({ params }: Props) {
  
  const awaitedParams = await params;
  const { id } = awaitedParams;

  return <CreateAssignmentPage userId={id} />;
}
 