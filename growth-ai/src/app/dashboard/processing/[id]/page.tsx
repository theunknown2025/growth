import { CONFIG } from '@/config-global';
import ProcessingView from '@/sections/processing/view/processing-edit-view';

// ----------------------------------------------------------------------

export const metadata = { title: `View Assignements | Dashboard - ${CONFIG.site.name}` };

type Props = {
    params: { id: string };
  };
  
export default async function Page({ params }: Props) {

    const awaitedParams = await params;
    const { id } = awaitedParams;

  return <ProcessingView assignementId={id} />;
}