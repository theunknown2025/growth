'use client';

import { useEffect, useCallback, useState } from 'react';
import { paths } from '@/routes/paths';
import { useRouter,useSearchParams , usePathname } from 'next/navigation';
import { AuthContext } from './AuthContext';
import { useContext } from 'react';
import LoadingView from '@/components/loading-screen/loading-screen';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: Props) {
  const router = useRouter();

  const context = useContext(AuthContext);

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const [isChecking, setIsChecking] = useState<boolean>(true);

  const { authenticated, loading } = context || {};

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const checkPermissions = async (): Promise<void> => {
    if (loading) {
      return;
    }

    if (!authenticated) {
      const method = 'jwt';

      const signInPath = {
        jwt: paths.auth.jwt.signIn,
      }[method];

      const href = `${signInPath}?${createQueryString('returnTo', pathname)}`;

      router.replace(href);
      return;
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
  }, [authenticated, loading]);

  if (isChecking) {
    return <LoadingView />;
  }

  return <>{children}</>;
}
