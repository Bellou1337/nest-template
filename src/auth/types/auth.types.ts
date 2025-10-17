export type AuthResponse = {
  message: string;
  data: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar: string | null;
    authProvider: string;
  };
};
