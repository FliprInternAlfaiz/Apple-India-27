import { object, string } from "yup";

export const userSignUpValidation = object({
  name: string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters long"),
  phone: string()
    .required("Phone number is required")
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits"),
});
