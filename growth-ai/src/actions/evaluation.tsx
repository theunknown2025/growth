import type { 
  AdvancedTestResult, 
  AllTestResult, 
  TestAnswers, 
  TestResult,
  CountEvaluation
} from '@/types/evaluation';
import { fetcher , endpoints } from '@/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import { AdvancedTestAnswers } from '@/types/evaluation';
// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: true,     
  revalidateOnFocus: false,    
  revalidateOnReconnect: true, 
};

// ----------------------------------------------------------------------
export function useGetAllEvaluations() {
  const url = endpoints.dashboard.evaluation.all;

  const { data, isLoading, error, isValidating } = useSWR<AllTestResult>(url, fetcher, swrOptions);
  const memoizedValue = useMemo(
    () => ({
      evaluations: data || null,
      evaluationsLoading: isLoading,
      evaluationsError: error,
      evaluationsValidating: isValidating,
      refetchEvaluations: () => mutate(url),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
export function useGetCounterEvaluations() {
  const url = endpoints.dashboard.evaluation.count;
  const { data, isLoading, error, isValidating } = useSWR<CountEvaluation>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      counterevaluations: data || null,
      counterevaluationsLoading: isLoading,
      counterevaluationsError: error,
      counterevaluationsValidating: isValidating,
      refetchCounterEvaluations: () => mutate(url),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
export function useGetSimpleEvaluation() {
  const url = endpoints.dashboard.evaluation.allsimpletests;
  
    const { data, isLoading, error, isValidating } = useSWR<TestResult[]>(url, fetcher, swrOptions);
    console.log("data", data)
    const memoizedValue = useMemo(
      () => ({
        simpleevaluations: data || [],
        simpleevaluationsLoading: isLoading,
        simpleevaluationsError: error,
        simpleevaluationsValidating: isValidating,
        simpleevaluationsEmpty: !isLoading && !data?.length,
        refetchSimpleEvaluations: () => mutate(url),
      }),
      [data, error, isLoading, isValidating]
    );
  
    return memoizedValue;
  }

// ----------------------------------------------------------------------
export function useGetAdvcancedEvaluation() {
  const url = endpoints.dashboard.evaluation.alladvancedtests;  
  const { data, isLoading, error, isValidating } = useSWR<AdvancedTestResult[]>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      advancedevaluations: data || [],
      advancedevaluationsLoading: isLoading,
      advancedevaluationsError: error,
      advancedevaluationsValidating: isValidating,
      advancedevaluationsEmpty: !isLoading && !data?.length,
      refetchAdvancedEvaluations: () => mutate(url),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
export function useAnswerSimpleEvaluation() {
  const url = endpoints.dashboard.evaluation.answersimpletest

  const answerSimpleEvaluation = async (data: TestAnswers) => {
    const response = await fetcher(url, 'post', data);
    mutate(endpoints.dashboard.evaluation.list);
    return response;
  };

  return { answerSimpleEvaluation };
}

// ----------------------------------------------------------------------
export function useSaveSimpleEvaluationProgress() {
  const url = endpoints.dashboard.evaluation.savesimpletestprogress;

  const saveProgress = async (data: TestAnswers) => {
    const response = await fetcher(url, 'post', data);
    mutate(endpoints.dashboard.evaluation.allsimpletests);
    return response;
  };

  return { saveProgress };
}

// ----------------------------------------------------------------------
export function useAnswerAdvancedEvaluation() {
  const url = endpoints.dashboard.evaluation.answeradvancedtest

  const answerAdvancedEvaluation = async (data: AdvancedTestAnswers) => {
    const response = await fetcher(url, 'post', data);
    mutate(endpoints.dashboard.evaluation.list);
    return response;
  };

  return { answerAdvancedEvaluation };
}

// ----------------------------------------------------------------------
export function useSaveAdvancedEvaluationProgress() {
  const url = endpoints.dashboard.evaluation.saveadvancedtestprogress;

  const saveProgress = async (data: AdvancedTestAnswers) => {
    const response = await fetcher(url, 'post', data);
    mutate(endpoints.dashboard.evaluation.alladvancedtests);
    return response;
  };

  return { saveProgress };
}

// ----------------------------------------------------------------------
export function useGetSimpleEvaluationById(evaluationId: string) {
  const url = endpoints.dashboard.evaluation.getsimpletest(evaluationId);
  const { data, isLoading, error, isValidating } = useSWR<TestResult>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      simpleevaluation: data || null,
      simpleevaluationLoading: isLoading,
      simpleevaluationError: error,
      simpleevaluationValidating: isValidating,
      refetchSimpleEvaluation: () => mutate(url),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
export function useGetAdvancedEvaluationById(evaluationId: string) {
  const url = endpoints.dashboard.evaluation.getadvancedtest(evaluationId);
  const { data, isLoading, error, isValidating } = useSWR<AdvancedTestResult>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      advancedevaluation: data || null,
      advancedevaluationLoading: isLoading,
      advancedevaluationError: error,
      advancedevaluationValidating: isValidating,
      refetchAdvancedEvaluation: () => mutate(url),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
export function useCompleteSimpleEvaluation() {
  const completeTest = async (testId: string) => {
    const url = endpoints.dashboard.evaluation.completesimpletest(testId);
    const response = await fetcher(url, 'post');
    mutate(endpoints.dashboard.evaluation.allsimpletests);
    mutate(endpoints.dashboard.evaluation.getsimpletest(testId));
    return response;
  };

  return { completeTest };
}

// ----------------------------------------------------------------------
export function useCompleteAdvancedEvaluation() {
  const completeTest = async (testId: string) => {
    const url = endpoints.dashboard.evaluation.completeadvancedtest(testId);
    const response = await fetcher(url, 'post');
    mutate(endpoints.dashboard.evaluation.alladvancedtests);
    mutate(endpoints.dashboard.evaluation.getadvancedtest(testId));
    return response;
  };

  return { completeTest };
}