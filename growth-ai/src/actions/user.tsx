import { fetcher , endpoints } from '@/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import { CompanyDetails } from '@/types/user';
// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: true,     
  revalidateOnFocus: false,    
  revalidateOnReconnect: true, 
};

// ----------------------------------------------------------------------
export function useGetcompany() {
  const url = endpoints.dashboard.user.getCompany;

  const { data, isLoading, error, isValidating } = useSWR<CompanyDetails>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      company: data || null,
      companyLoading: isLoading,
      companyError: error,
      companyValidating: isValidating,
      refetchCompany: () => mutate(url),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
export function useCreateCompany() {
  const url = endpoints.dashboard.user.createCompany;

  const createCompany = async (data: CompanyDetails) => {
    const response = await fetcher(url, 'post', data);
    mutate(endpoints.dashboard.user.getCompany);
    return response;
  };

  return { createCompany };
}

// ----------------------------------------------------------------------
export function useUpdateCompany() {
  const url = endpoints.dashboard.user.updateCompany;

  const updateCompany = async (data: CompanyDetails) => {
    const response = await fetcher(url, 'put', data);
    mutate(endpoints.dashboard.user.getCompany);
    return response;
  };

  return { updateCompany };
}


// ----------------------------------------------------------------------
export function useUpdateUser() {
  const url = endpoints.dashboard.user.update;

  const updateUsers = async ({
    firstName,
    lastName,
    username,
    email,
  }: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
  }) => {
    const response = await fetcher(url, 'put', { 
        firstName,
        lastName,
        username,
        email,
     });
    mutate(endpoints.dashboard.chat.list);
    return response;
  };

  const updateUserPassword = async ({
    password,
    newPassword,
  }: {
    password: string;
    newPassword: string;
  }) => {
    const response = await fetcher(endpoints.dashboard.user.updatePassword, 'put', { 
        password,
        newPassword,
     });
    return response;
  }

  return { updateUsers , updateUserPassword};
}

// ----------------------------------------------------------------------