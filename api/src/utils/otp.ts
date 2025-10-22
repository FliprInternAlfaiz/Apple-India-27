import { randomInt } from 'node:crypto';

const generateSecureOTP = (): string => {
  const firstDigit = randomInt(1, 10).toString();
  const remainingDigits = randomInt(0, 100000).toString().padStart(5, '0');
  return firstDigit + remainingDigits;
};

export default {
  generateSecureOTP,
};
