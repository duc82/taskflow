export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  role: string;
}

export interface UserReponse {
  message: string;
  user: User;
}
