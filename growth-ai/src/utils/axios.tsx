import type { AxiosRequestConfig } from 'axios';
import axios, { all } from 'axios';

// ----------------------------------------------------------------------
const axiosInstance = axios.create({ baseURL: process.env.NEXT_PUBLIC_BASE_URL });

axiosInstance.interceptors.request.use(
  (config) => {
    const token = "";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (
  args: string | [string, AxiosRequestConfig],
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  data?: any
) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];
    const axiosConfig = { ...config, method };

    if (method === 'post' || method === 'put' || method === 'patch') {
      axiosConfig.data = data;
    }

    const res = await axiosInstance(url, axiosConfig);

    return res.data;
  } catch (error) {
    console.log('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/api/v1/users/current',
    signIn: '/api/v1/users/login',
    signUp: '/api/v1/users/register',
  },
  dashboard: {
    home: '/api/v1/dashboard/home',
    evaluation : {
      all : '/api/v1/evaluation//alltests',
      count : '/api/v1/evaluation/counttestbymonth',
      allsimpletests : '/api/v1/evaluation/allsimpletests',
      alladvancedtests : '/api/v1/evaluation/alladvancedtests',
      list : '/api/v1/evaluation/answer',
      answersimpletest : '/api/v1/evaluation/simpletest',
      answeradvancedtest : '/api/v1/evaluation/advancedtest',
      savesimpletestprogress: '/api/v1/evaluation/simpletest/progress',
      saveadvancedtestprogress: '/api/v1/evaluation/advancedtest/progress',
      completesimpletest: (testId: string) => `/api/v1/evaluation/simpletest/${testId}/complete`,
      completeadvancedtest: (testId: string) => `/api/v1/evaluation/advancedtest/${testId}/complete`,
      getsimpletest : (evaluationId: string) => `/api/v1/evaluation/simpletest/${evaluationId}`,
      getadvancedtest : (evaluationId: string) => `/api/v1/evaluation/advancedtest/${evaluationId}`,
    },
    chat : {
      list : '/api/v1/chat/conversations/all',
      create: '/api/v1/chat/conversation/create',
      sendMessage: (conversationId: string) => `/api/v1/chat/conversations/${conversationId}/messages`,
      deleteConversation: (conversationId: string) => `/api/v1/chat/conversation/${conversationId}/delete`,
      get: (conversationId: string) => `/api/v1/chat/conversation/${conversationId}`,
    },
    user: {
      update: '/api/v1/users/update',
      updatePassword: '/api/v1/users/updatepassword',
      createCompany: '/api/v1/users/createcompany',
      getCompany: '/api/v1/users/companydetails',
      updateCompany: '/api/v1/users/updatecompany',
    },
    analysis: {
      all: '/api/v1/analysis/all',
    },
    assignements : {
      all : '/api/v1/assignements/all',
      create : '/api/v1/assignements/create',
      count : '/api/v1/assignements/count',
      details : (id: string) => `/api/v1/assignements/${id}/details`,
      update : (id: string) => `/api/v1/assignements/${id}/update`,
      delete : (id: string) => `/api/v1/assignements/${id}/delete`,
      user : {
        all : '/api/v1/assignements/user/all',
        count : '/api/v1/assignements/user/count',
        client : (id: string) => `/api/v1/assignements/client/${id}/all`, 
      } ,
      templates : {
        all : '/api/v1/assignements/template/all',
        create : '/api/v1/assignements/template/create',
        details : (id: string) => `/api/v1/assignements/template/${id}/details`,
        update : (id: string) => `/api/v1/assignements/template/${id}/update`,
        delete : (id: string) => `/api/v1/assignements/${id}/delete`,
        assign : '/api/v1/assignements/template/assign',
      }
    },
    assignmentTemplates: {
      all: '/api/v1/assignment-templates/all',
      create: '/api/v1/assignment-templates/create',
      details: (id: string) => `/api/v1/assignment-templates/${id}`,
      update: (id: string) => `/api/v1/assignment-templates/${id}/update`,
      delete: (id: string) => `/api/v1/assignment-templates/${id}/delete`,
      assign: '/api/v1/assignment-templates/assign',
    }
  },

};