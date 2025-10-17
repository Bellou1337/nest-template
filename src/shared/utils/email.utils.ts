import { randomBytes } from 'crypto';

export const generateRandomEmail = async (
  domain = 'oauth.local',
): Promise<string> => {
  const localPart = randomBytes(6).toString('hex');
  return `${localPart}@${domain}`;
};
