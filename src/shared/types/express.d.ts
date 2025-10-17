declare namespace Express {
  export interface Request {
    user: {
      id: string;
      provider?: string;
      providerId?: string;
      email?: string;
      name?: string;
      avatar?: string;
    };
  }
}
