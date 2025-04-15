export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  role: string;
}

export interface UserReponse {
  message: string;
  user: User;
}
