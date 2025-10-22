import { object, string } from 'yup';

export default object().shape({
  email: string().required('email is required').email('invalid email'),
  password: string()
    .required('password is required')
    .min(8, 'password must be at least 8 characters long')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
});
