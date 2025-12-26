import { CONFIG } from '@/config-global';

import EvaluationAdvancedTestView from '@/sections/evaluation/advanced-test/view/evaluation-advanced-test-view';
// ----------------------------------------------------------------------

export const metadata = { title: `Evaluation - Simple Test | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <EvaluationAdvancedTestView />;
}