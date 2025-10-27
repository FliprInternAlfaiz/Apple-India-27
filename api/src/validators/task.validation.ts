import * as yup from "yup";

export const createTask = yup.object().shape({
  thumbnail: yup
    .string()
    .required("Thumbnail URL is required")
    .url("Invalid thumbnail URL format"),
  level: yup
    .string()
    .required("Level is required")
    .trim(),
  rewardPrice: yup
    .number()
    .required("Reward price is required")
    .min(0, "Reward price must be positive"),
  order: yup
    .number()
    .optional()
    .min(0, "Order must be positive"),
});

export default {
  createTask,
};