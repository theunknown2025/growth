import { AssignmentView } from "@/sections/assignement/view/assignement-detail-view"
import { CONFIG } from "@/config-global";

export const metadata = { title: `View Assignement Template | Dashboard - ${CONFIG.site.name}` };

type Props = {
  params: { id: string };
};

export default async function Page({ params }: Props) {
  
  const awaitedParams = await params;
  const { id } = awaitedParams;
  
  return (
    <AssignmentView id={id} />
  )
}
