import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateRandomPassword = async (
  length: number = 12,
): Promise<string> => {
  const password = randomBytes(length).toString('hex').slice(0, length);
  return await hashPassword(password);
};
