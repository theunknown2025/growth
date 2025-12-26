import type { Analysis } from '@/types/analysis';
import { fetcher , endpoints } from '@/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: true,     
  revalidateOnFocus: false,    
  revalidateOnReconnect: true, 
};

// ----------------------------------------------------------------------
export function useGetAllAnalysis() {
  const url = endpoints.dashboard.analysis.all; // Adjust the endpoint as needed

  const { data, isLoading, error, isValidating } = useSWR<Analysis>(url, fetcher, swrOptions);
  const memoizedValue = useMemo(
    () => ({
      analysis: data || null,
      analysisLoading: isLoading,
      analysisError: error,
      analysisValidating: isValidating,
      refetchanalysis: () => mutate(url),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}