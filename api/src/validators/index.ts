import taskValidation from "./task.validation";
import { userSignUpValidation } from "./userSignUp.validation";

export const Validators = {
  userSignup: userSignUpValidation,
  userTask:taskValidation,
};
