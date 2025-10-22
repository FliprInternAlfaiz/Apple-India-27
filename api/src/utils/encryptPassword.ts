import bcrypt from 'bcrypt';

export default (password: string) => {
  return bcrypt.hashSync(password as string, 7);
};
