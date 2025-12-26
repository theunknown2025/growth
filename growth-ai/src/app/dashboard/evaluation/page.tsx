import { CONFIG } from '@/config-global';

import { EvaluationView } from '@/sections/evaluation/evaluation-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Evaluation | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <EvaluationView />;
}