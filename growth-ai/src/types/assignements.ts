export type Question = {
    question: string;
    description: string;
    answer?: string;
    urlresources?: string[];
    fileresources?: (File | string)[];
};

export type Assignement = {
    title: string;
    description: string;
    questions: Question[];
    deadline?: Date;
    assignedTo?: string;
    status?: string;
    type?: string;
};

export type AssignementTemplate = {
    id : number,
    title: string,
    description: string,
    questions: Question[],
    status: string,
    deadline: Date,
    createdAt: string,
    type: string,
};

export type AssignementUpdate = {
    title: string;
    description: string;
    questions: Question[];
    deadline?: Date;
};

export type AssignementList = {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    deadline: string;
    status: string;
    questions: Question[];
    type?: string;
};

export type AssignementCount = {
    inProgress: number;
    finished: number;
};

export type AssignementData = {
    _id: string
    id: number
    title: string
    userFullName: string
    companyName: string
    status: string
    sectorOfActivity: string
    deadline: string
    createdAt: string
    type: string
}