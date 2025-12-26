import { CONFIG } from '@/config-global';
import AssignmentViewPage from '@/sections/manage/view/manage-test-view';
export const metadata = { title: `View Evaluation | Dashboard - ${CONFIG.site.name}` };

type Props = {
  params: { id: string };
};

export default async function Page({ params }: Props) {
  
  const awaitedParams = await params;
  const { id } = awaitedParams;

  return (
      <AssignmentViewPage params={{ id }} />
  );
}
