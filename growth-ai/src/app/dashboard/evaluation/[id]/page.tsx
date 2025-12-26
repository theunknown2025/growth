import { CONFIG } from '@/config-global';
import { AssignmentView } from '@/sections/manage/manage-assigenement-view';
// ----------------------------------------------------------------------

export const metadata = { title: `View Evaluation | Dashboard - ${CONFIG.site.name}` };

type Props = {
  params: { id: string };
};

export default async function Page({ params }: Props) {
  
  const awaitedParams = await params;
  const { id } = awaitedParams;
 
  return <AssignmentView id={id} />;
}
