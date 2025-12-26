import type { 
  Assignement , 
  AssignementCount , 
  AssignementData, 
  AssignementList,
  AssignementTemplate
} from '@/types/assignements';
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
export function useGetAllAssignement() {
    const url = endpoints.dashboard.assignements.all;

    const { data, isLoading, error, isValidating } = useSWR<AssignementData[]>(url, fetcher, swrOptions);
    const memoizedValue = useMemo(
        () => ({
        assignements: data || null,
        assignementsLoading: isLoading,
        assignementsError: error,
        assignementsValidating: isValidating,
        refetchAssignements: () => mutate(url),
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------
export function useGetAllAssignementByUserId() {
    const url = endpoints.dashboard.assignements.user.all;

    const { data, isLoading, error, isValidating } = useSWR<AssignementData[]>(url, fetcher, swrOptions);
    const memoizedValue = useMemo(
        () => ({
            assignements: data || null,
            assignementsLoading: isLoading,
            assignementsError: error,
            assignementsValidating: isValidating,
            refetchAssignements: () => mutate(url),
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

/// ----------------------------------------------------------------------
export function useGetAllAssignementByClientId(clientId: string) {
    const url = endpoints.dashboard.assignements.user.client(clientId);

    const { data, isLoading, error, isValidating } = useSWR<AssignementData[]>(url, fetcher, swrOptions);
    const memoizedValue = useMemo(
        () => ({
            assignements: data || null,
            assignementsLoading: isLoading,
            assignementsError: error,
            assignementsValidating: isValidating,
            refetchAssignements: () => mutate(url),
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------
export function useGetAssignementById(id: string) {
    const url = endpoints.dashboard.assignements.details(id);

    const { data, isLoading, error, isValidating } = useSWR<AssignementList>(url, fetcher, swrOptions);
    const memoizedValue = useMemo(
        () => ({
            assignement: data || null,
            assignementLoading: isLoading,
            assignementError: error,
            assignementValidating: isValidating,
            refetchAssignement: () => mutate(url),
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------
export function useCountAssignement() {
  const url = endpoints.dashboard.assignements.count;

  const { data, isLoading, error, isValidating } = useSWR<AssignementCount>(url, fetcher, swrOptions);
  const memoizedValue = useMemo(
    () => ({
      assignementsCount: data || null,
      assignementsCountLoading: isLoading,
      assignementsCountError: error,
      assignementsCountValidating: isValidating,
      refetchAssignementsCount: () => mutate(url),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
export function useGetAssignementByUserIdCount() {
  const url = endpoints.dashboard.assignements.user.count;

  const { data, isLoading, error, isValidating } = useSWR<AssignementCount>(url, fetcher, swrOptions);
  const memoizedValue = useMemo(
    () => ({
      assignementsCount: data || null,
      assignementsCountLoading: isLoading,
      assignementsCountError: error,
      assignementsCountValidating: isValidating,
      refetchAssignementsCount: () => mutate(url),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
export function useCreateAssignement() {
    const url = endpoints.dashboard.assignements.create;
  
    const createAssignement = async (data: any) => {
      try {
        // If data is already a FormData, use it directly
        if (data instanceof FormData) {
          const response = await fetcher(url, 'post', data);
          mutate(endpoints.dashboard.assignements.all); 
          return response;
        }
        
        // Otherwise create a FormData object
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('deadline', data.deadline instanceof Date ? 
          data.deadline.toISOString() : new Date(data.deadline).toISOString());
        formData.append('assignedTo', data.assignedTo);
        
        // Process questions to prevent File objects from being JSON-stringified
        const processedQuestions = data.questions.map((q: any, qIndex: number) => {
          const questionCopy = { ...q };
          // Remove File objects from fileresources
          questionCopy.fileresources = [];
          return questionCopy;
        });
        
        formData.append('questions', JSON.stringify(processedQuestions));
        
        // Add files separately with correct field names
        data.questions.forEach((question: any, qIndex: number) => {
          if (question.fileresources && question.fileresources.length > 0) {
            question.fileresources.forEach((file: any, fIndex: number) => {
              if (file instanceof File) {
                // This creates a field name like: questions[0].fileresources
                formData.append(`questions[${qIndex}].fileresources`, file);
              }
            });
          }
        });
        
        const response = await fetcher(url, 'post', formData);
        mutate(endpoints.dashboard.assignements.all); 
        return response;
      } catch (error) {
        console.error('Error creating assignment:', error);
        throw error;
      }
    };
  
    return { createAssignement };
}

// ----------------------------------------------------------------------
export function useUpdateAssignement() {

    const updateAssignement = async (data: any, id: string) => {
      const url = endpoints.dashboard.assignements.update(id);
      
      try {
        // If data is already a FormData, use it directly
        let formData: FormData;
        if (data instanceof FormData) {
          formData = data;
        } else {
          // Otherwise create a new FormData
          formData = new FormData();
          
          const deadlineValue = data.deadline 
            ? (data.deadline instanceof Date 
                ? data.deadline.toISOString() 
                : new Date(data.deadline).toISOString()) 
            : '';
        
          formData.append('title', data.title);
          formData.append('description', data.description);
          formData.append('deadline', deadlineValue);
          if (data.assignedTo) formData.append('assignedTo', data.assignedTo);
          if (data.status) formData.append('status', data.status); 
          
          // Process questions to prevent File objects from being JSON-stringified
          const processedQuestions = data.questions.map((q: any) => {
            const questionCopy = { ...q };
            // Keep only string entries (filenames) in fileresources
            questionCopy.fileresources = Array.isArray(q.fileresources) 
              ? q.fileresources.filter((f: any) => typeof f === 'string')
              : [];
            return questionCopy;
          });
          
          formData.append('questions', JSON.stringify(processedQuestions));
          
          // Add files separately with correct field names
          data.questions.forEach((question: any, qIndex: number) => {
            if (question.fileresources && question.fileresources.length > 0) {
              question.fileresources.forEach((file: any) => {
                if (file instanceof File) {
                  // This creates a field name like: questions[0].fileresources
                  formData.append(`questions[${qIndex}].fileresources`, file);
                }
              });
            }
          });
        }
      
        const response = await fetcher(url, 'put', formData);
        mutate(endpoints.dashboard.assignements.all);
        mutate(endpoints.dashboard.assignements.details(id)); 
        return response;
      } catch (error) {
        console.error('Error updating assignment:', error);
        throw error;
      }
    };
  
    return { updateAssignement };
}

// ----------------------------------------------------------------------
export function useDeleteAssignement() {
    const url = endpoints.dashboard.assignements.delete;
  
    const deleteAssignement = async (id: string) => {
      try {
        const response = await fetcher(url(id), 'delete');
        mutate(endpoints.dashboard.assignements.all); 
        return response;
      } catch (error) {
        console.error('Error deleting assignment:', error);
        throw error;
      }
    };
  
    return { deleteAssignement };
}

// ----------------------------------------------------------------------
export function useAnswerAssignement() {
  
  const answerAssignement = async (data : any, id : string) => {
    const url = endpoints.dashboard.assignements.update(id);
    
    try {
      const currentAssignment = await fetcher(endpoints.dashboard.assignements.details(id), 'get');
      const updatedQuestions = currentAssignment.questions.map((question : any, index : any) => {
        // Preserve existing resources when updating just the answers
        return {
          ...question,
          answer: data.answers[index]?.answer || question.answer || "",
          urlresources: question.urlresources || [],
          fileresources: question.fileresources || []
        };
      });
      
      const payload = {
        questions: updatedQuestions,
      };
            
      const response = await fetcher(url, 'put', payload);
      
      mutate(endpoints.dashboard.assignements.details(id));
      mutate(endpoints.dashboard.assignements.all);
      mutate(endpoints.dashboard.assignements.user.all);
      
      return response;
    } catch (error) {
      console.error('Error answering assignment:', error);
      throw error;
    }
  };

  return { answerAssignement };
}


// --------------------------Assignement Template----------------------
// ----------------------------------------------------------------------
export function useGetAllAssignementTemplates() {
    const url = endpoints.dashboard.assignements.templates.all;

    const { data, isLoading, error, isValidating } = useSWR<AssignementTemplate[]>(url, fetcher, swrOptions);
    const memoizedValue = useMemo(
        () => ({
            assignementTemplates: data || null,
            assignementTemplatesLoading: isLoading,
            assignementTemplatesError: error,
            assignementTemplatesValidating: isValidating,
            refetchAssignementTemplates: () => mutate(url),
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------
export function useGetAssignementTemplateById(id: string) {
    const url = endpoints.dashboard.assignements.templates.details(id);

    const { data, isLoading, error, isValidating } = useSWR<AssignementTemplate>(url, fetcher, swrOptions);
    const memoizedValue = useMemo(
        () => ({
            assignementTemplate: data || null,
            assignementTemplateLoading: isLoading,
            assignementTemplateError: error,
            assignementTemplateValidating: isValidating,
            refetchAssignementTemplate: () => mutate(url),
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------
export function useCreateAssignementTemplate() {
    const url = endpoints.dashboard.assignements.templates.create;
  
    const createAssignementTemplate = async (data: any) => {
      try {
        // If data is already a FormData, use it directly
        if (data instanceof FormData) {
          const response = await fetcher(url, 'post', data);
          mutate(endpoints.dashboard.assignements.templates.all); 
          return response;
        }
        
        // Otherwise create a FormData object
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('deadline', data.deadline instanceof Date ? 
          data.deadline.toISOString() : new Date(data.deadline).toISOString());
        
        // Process questions to prevent File objects from being JSON-stringified
        const processedQuestions = data.questions.map((q: any, qIndex: number) => {
          const questionCopy = { ...q };
          // Remove File objects from fileresources
          questionCopy.fileresources = [];
          return questionCopy;
        });
        
        formData.append('questions', JSON.stringify(processedQuestions));
        
        // Add files separately with correct field names
        data.questions.forEach((question: any, qIndex: number) => {
          if (question.fileresources && question.fileresources.length > 0) {
            question.fileresources.forEach((file: any, fIndex: number) => {
              if (file instanceof File) {
                // This creates a field name like: questions[0].fileresources
                formData.append(`questions[${qIndex}].fileresources`, file);
              }
            });
          }
        });
        
        const response = await fetcher(url, 'post', formData);
        mutate(endpoints.dashboard.assignements.templates.all); 
        return response;
      } catch (error) {
        console.error('Error creating assignment template:', error);
        throw error;
      }
    };
  
    return { createAssignementTemplate };
}

// ----------------------------------------------------------------------
export function useUpdateAssignementTemplate() {

    const updateAssignementTemplate = async (data: any, id: string) => {
      const url = endpoints.dashboard.assignements.templates.update(id);
      
      try {
        // If data is already a FormData, use it directly
        let formData: FormData;
        if (data instanceof FormData) {
          formData = data;
        } else {
          // Otherwise create a new FormData
          formData = new FormData();
          
          const deadlineValue = data.deadline 
            ? (data.deadline instanceof Date 
                ? data.deadline.toISOString() 
                : new Date(data.deadline).toISOString()) 
            : '';
        
          formData.append('title', data.title);
          formData.append('description', data.description);
          formData.append('deadline', deadlineValue);
          
          // Process questions to prevent File objects from being JSON-stringified
          const processedQuestions = data.questions.map((q: any) => {
            const questionCopy = { ...q };
            // Keep only string entries (filenames) in fileresources
            questionCopy.fileresources = Array.isArray(q.fileresources) 
              ? q.fileresources.filter((f: any) => typeof f === 'string')
              : [];
            return questionCopy;
          });
          
          formData.append('questions', JSON.stringify(processedQuestions));
          
          // Add files separately with correct field names
          data.questions.forEach((question: any, qIndex: number) => {
            if (question.fileresources && question.fileresources.length > 0) {
              question.fileresources.forEach((file: any) => {
                if (file instanceof File) {
                  // This creates a field name like: questions[0].fileresources
                  formData.append(`questions[${qIndex}].fileresources`, file);
                }
              });
            }
          });
        }
      
        const response = await fetcher(url, 'put', formData);
        mutate(endpoints.dashboard.assignements.templates.all); 
        mutate(endpoints.dashboard.assignements.templates.details(id)); 
        return response;
      } catch (error) {
        console.error('Error updating assignment template:', error);
        throw error;
      }
    };
  
    return { updateAssignementTemplate };
}

// ----------------------------------------------------------------------
export function useDeleteAssignementTemplate() {
    const url = endpoints.dashboard.assignements.templates.delete;
  
    const deleteAssignementTemplate = async (id: string) => {
      try {
        const response = await fetcher(url(id), 'delete');
        mutate(endpoints.dashboard.assignements.templates.all); 
        return response;
      } catch (error) {
        console.error('Error deleting assignment template:', error);
        throw error;
      }
    };
  
    return { deleteAssignementTemplate };
}

// ----------------------------------------------------------------------
export function useAssignTemplate() {
    const url = endpoints.dashboard.assignements.templates.assign;
  
    const assignTemplate = async ({ userId , templateId , deadline} : {userId: string , templateId:string , deadline : string}) => {
      try {
        const response = await fetcher(url, 'post', { userId, templateId , deadline});
        mutate(endpoints.dashboard.assignements.all); 
        return response;
      } catch (error) {
        console.error('Error assigning template to assignment:', error);
        throw error;
      }
    };
  
    return { assignTemplate };
}