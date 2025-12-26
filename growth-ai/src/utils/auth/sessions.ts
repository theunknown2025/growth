import { paths } from '@/routes/paths';

import axios from '@/utils/axios';

import { STORAGE_KEY } from '@/constant/auth';

import { useMemo, useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export function jwtDecode(token: string) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken: string) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    if (!decoded || !('exp' in decoded)) {
      return false;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}

// ----------------------------------------------------------------------

export function tokenExpired(exp: number) {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  setTimeout(() => {
    try {
      alert('Token expired!');
      sessionStorage.removeItem(STORAGE_KEY);
      window.location.href = paths.auth.jwt.signIn;
    } catch (error) {
      console.error('Error during token expiration:', error);
      throw error;
    }
  }, timeLeft);
}

// ----------------------------------------------------------------------

export async function setSession(accessToken: string | null) {
  try {
    if (accessToken) {
      sessionStorage.setItem(STORAGE_KEY, accessToken);

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const decodedToken = jwtDecode(accessToken); // ~3 days by minimals server

      if (decodedToken && 'exp' in decodedToken) {
        tokenExpired(decodedToken.exp);
      } else {
        throw new Error('Invalid access token!');
      }
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
      delete axios.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export type UseSetStateReturn<T> = {
  state: T;
  canReset: boolean;
  onResetState: () => void;
  setState: (updateState: T | Partial<T>) => void;
  setField: (name: keyof T, updateValue: T[keyof T]) => void;
};

export function useSetState<T>(initialState: T): UseSetStateReturn<T> {
  const [state, set] = useState(initialState);

  const canReset = !isEqual(state, initialState);

  const setState = useCallback((updateState: T | Partial<T>) => {
    set((prevValue) => ({ ...prevValue, ...updateState }));
  }, []);

  const setField = useCallback(
    (name: keyof T, updateValue: T[keyof T]) => {
      setState({ [name]: updateValue } as Partial<T>);
    },
    [setState]
  );

  const onResetState = useCallback(() => {
    set(initialState);
  }, [initialState]);

  const memoizedValue = useMemo(
    () => ({
      state,
      setState,
      setField,
      onResetState,
      canReset,
    }),
    [canReset, onResetState, setField, setState, state]
  );

  return memoizedValue;
}


// ----------------------------------------------------------------------

export function isEqual(a: any, b: any): boolean {
    if (a === null || a === undefined || b === null || b === undefined) {
      return a === b;
    }
  
    if (typeof a !== typeof b) {
      return false;
    }
  
    if (typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean') {
      return a === b;
    }
  
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
  
      return a.every((item, index) => isEqual(item, b[index]));
    }
  
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a!);
      const keysB = Object.keys(b!);
  
      if (keysA.length !== keysB.length) {
        return false;
      }
  
      return keysA.every((key) => isEqual(a[key], b[key]));
    }
  
    return false;
  }