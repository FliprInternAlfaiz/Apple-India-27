// validators/withdrawal.validator.ts
import * as yup from "yup";

export const addBankAccount = yup.object({
  body: yup.object({
    accountHolderName: yup
      .string()
      .required("Account holder name is required")
      .min(3, "Name must be at least 3 characters"),
    bankName: yup.string().required("Bank name is required"),
    accountNumber: yup
      .string()
      .required("Account number is required")
      .matches(/^[0-9]+$/, "Account number must contain only digits")
      .min(9, "Account number must be at least 9 digits")
      .max(18, "Account number must not exceed 18 digits"),
    ifscCode: yup
      .string()
      .required("IFSC code is required")
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
    branchName: yup.string(),
    accountType: yup
      .string()
      .oneOf(["savings", "current"], "Invalid account type"),
    isDefault: yup.boolean(),
  }),
});

export const createWithdrawal = yup.object({
  body: yup.object({
    walletType: yup
      .string()
      .required("Wallet type is required")
      .oneOf(
        ["mainWallet", "commissionWallet"],
        "Invalid wallet type"
      ),
    amount: yup
      .number()
      .required("Amount is required")
      .min(280, "Minimum withdrawal amount is Rs 280")
      .positive("Amount must be positive"),
    bankAccountId: yup
      .string()
      .required("Bank account is required")
      .matches(/^[0-9a-fA-F]{24}$/, "Invalid bank account ID"),
    withdrawalPassword: yup
      .string()
      .required("Withdrawal password is required")
      .min(4, "Password must be at least 4 characters"),
  }),
});

export const setWithdrawalPassword = yup.object({
  body: yup.object({
    currentPassword: yup.string(),
    newPassword: yup
      .string()
      .required("New password is required")
      .min(4, "Password must be at least 4 characters")
      .max(20, "Password must not exceed 20 characters"),
  }),
});