import { CONFIG } from '@/config-global';

import { EvaluationSimpleTestView } from '@/sections/evaluation/simple-test/view/evaluation-simple-test-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Evaluation - Simple Test | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <EvaluationSimpleTestView />;
}