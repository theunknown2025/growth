// ----------------------------------------------------------------------

const ROOTS = {
    AUTH: '/auth',
    DASHBOARD: '/dashboard',
  };
  
  // ----------------------------------------------------------------------
  
  export const paths = {
    auth: {
      jwt: {
        signIn: `${ROOTS.AUTH}/login`,
        signUp: `${ROOTS.AUTH}/signup`,
      },
    },
    dashboard: {
      chat: `${ROOTS.DASHBOARD}/chat`,
      evaluation: {
        root: `${ROOTS.DASHBOARD}/evaluation`,
        simpleTest: `${ROOTS.DASHBOARD}/evaluation/simple-test`,
        details: (id: string) => `${ROOTS.DASHBOARD}/evaluation/${id}`,
      },
      settings: `${ROOTS.DASHBOARD}/settings`,
      manage: {
        root: `${ROOTS.DASHBOARD}/manage`,
        assignement: (userId:string) => `${ROOTS.DASHBOARD}/manage/${userId}/assignement`,
      },
      assignements: {
        root : `${ROOTS.DASHBOARD}/assignements`,
        details : (id: string) => `${ROOTS.DASHBOARD}/assignements/${id}`,
        edit : (id: string) => `${ROOTS.DASHBOARD}/assignements/${id}/edit`,
      },
      assignmentTemplates: {
        root: `${ROOTS.DASHBOARD}/assignement-templates`,
        create: `${ROOTS.DASHBOARD}/assignement-templates/create`,
        edit: (id: string) => `${ROOTS.DASHBOARD}/assignement-templates/${id}/edit`,
        details: (id: string) => `${ROOTS.DASHBOARD}/assignement-templates/${id}`,
      },
      processing: {
        root: `${ROOTS.DASHBOARD}/processing`,
        details: (id: string) => `${ROOTS.DASHBOARD}/processing/${id}`,
        edit: (id: string) => `${ROOTS.DASHBOARD}/processing/${id}`,
      },
    },
  };
