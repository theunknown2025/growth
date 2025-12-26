import { CONFIG } from "@/config-global";
import { AssignementTemplateEditView } from "@/sections/assignement-template/assignement-template-edit-view";

export const metadata = { title: `Modify Assignement Template | Dashboard - ${CONFIG.site.name}` };

type Props = {
  params: { id: string };
};

export default async function AssignmentEditPage({ params }: Props) {
  
  const awaitedParams = await params;
  const { id } = awaitedParams;
  
  return (
    <AssignementTemplateEditView assignementId={id} />
  )
}