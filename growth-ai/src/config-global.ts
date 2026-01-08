import { paths } from './routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  site: {
    name: string;
    serverUrl: string;
    version: string;
  };
  auth: {
    method: 'jwt';
    redirectByRole: {
      [role: string]: string;
    };
  };
};

// ----------------------------------------------------------------------

export const CONFIG: ConfigValue = {
  site: {
    name: 'Brand Impact',
    serverUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:5000',
    version: packageJson.version,
  },
  auth: {
    method: 'jwt',
    redirectByRole: {
      client: paths.dashboard.evaluation.root,
      admin: paths.dashboard.settings,
    },
  },
};
