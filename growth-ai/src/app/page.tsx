'use client';

import { useEffect , useContext} from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/sections/auth/context/AuthContext';
import { paths } from '@/routes/paths';
import { CONFIG } from '@/config-global';

export default function Page() {
  const router = useRouter();
  const { user, loading } = useContext(AuthContext) || {};
  
  useEffect(() => {
    if (loading) return;
    const path = user
      ? CONFIG.auth.redirectByRole[user.role as keyof typeof CONFIG.auth.redirectByRole]
      : paths.auth.jwt.signUp;

    router.push(path);
  }, [router, user, loading]);

  return null;
}
