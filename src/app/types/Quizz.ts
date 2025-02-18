import { User } from "./User";

export interface Quiz {
    title: string;
    description: string;
    userId: string;
    createdAt: Date;
    user: User | null;
  }