export type CreateUser = {
  email: string;
  password: string;
  name: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
};
