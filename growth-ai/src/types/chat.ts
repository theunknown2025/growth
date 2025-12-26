export type Message =  {
  _id: string;
  sender: string;
  message: string;
  timestamp?: Date;
  isHistorical?: boolean;
}

export type Conversation = {
  _id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt?: Date;
}