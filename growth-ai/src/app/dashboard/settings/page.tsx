import { CONFIG } from '@/config-global';

import { SettingsView } from '@/sections/settings/view/settings-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Settings | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <SettingsView />;
}