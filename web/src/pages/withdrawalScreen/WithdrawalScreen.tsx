import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  Button,
  Modal,
  TextInput,
  Select,
  NumberInput,
  PasswordInput,
  Card,
  Badge,
  Loader,
  Radio,
  Group,
  ActionIcon,
  Divider,
  Alert,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  useWalletInfoQuery,
  useBankAccountsQuery,
  useAddBankAccountMutation,
  useDeleteBankAccountMutation,
  useSetDefaultAccountMutation,
  useCreateWithdrawalMutation,
} from "../../hooks/query/useWithdrawal.query";
import classes from "./WithdrawalScreen.module.scss";
import { FaPlus, FaRegTrashAlt, FaInfoCircle } from "react-icons/fa";

const WithdrawalScreen: React.FC = () => {
  const [selectedWallet, setSelectedWallet] = useState("mainWallet");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<number | undefined>();
  const [withdrawalPassword, setWithdrawalPassword] = useState("");

  const [addAccountOpened, { open: openAddAccount, close: closeAddAccount }] =
    useDisclosure(false);

  const [accountForm, setAccountForm] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    branchName: "",
    accountType: "savings",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const predefinedAmounts = [
    280, 750, 1080, 2100, 3500, 6500,
    12000, 21500, 36000, 55000, 108000, 150000,
  ];

  // Queries & Mutations
  const { data: walletInfo, isLoading: walletLoading, error: walletError } = useWalletInfoQuery();
  const { data: bankData = [], isLoading: bankLoading, error: bankError } = useBankAccountsQuery();

 const bankAccounts = bankData?.accounts ?? []; // ✅ Safely extract array

  const addBankMutation = useAddBankAccountMutation();
  const deleteBankMutation = useDeleteBankAccountMutation();
  const setDefaultMutation = useSetDefaultAccountMutation();
  const createWithdrawalMutation = useCreateWithdrawalMutation();

  // Set default account on load
  useEffect(() => {
    if (bankAccounts.length > 0) {
      const defaultAcc = bankAccounts.find((a: any) => a.isDefault);
      if (defaultAcc) {
        setSelectedAccount(defaultAcc._id);
      } else {
        setSelectedAccount(bankAccounts[0]._id);
      }
    }
  }, [bankAccounts]);

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!accountForm.accountHolderName.trim()) {
      errors.accountHolderName = "Account holder name is required";
    } else if (accountForm.accountHolderName.length < 3) {
      errors.accountHolderName = "Name must be at least 3 characters";
    }

    if (!accountForm.bankName.trim()) {
      errors.bankName = "Bank name is required";
    }

    if (!accountForm.accountNumber.trim()) {
      errors.accountNumber = "Account number is required";
    } else if (!/^\d{9,18}$/.test(accountForm.accountNumber)) {
      errors.accountNumber = "Invalid account number (9-18 digits)";
    }

    if (!accountForm.confirmAccountNumber) {
      errors.confirmAccountNumber = "Please confirm account number";
    } else if (accountForm.accountNumber !== accountForm.confirmAccountNumber) {
      errors.confirmAccountNumber = "Account numbers do not match";
    }

    if (!accountForm.ifscCode.trim()) {
      errors.ifscCode = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(accountForm.ifscCode.toUpperCase())) {
      errors.ifscCode = "Invalid IFSC code format";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAccount = () => {
    if (!validateForm()) return;

    if (bankAccounts.length >= 4) {
      return;
    }

    const payload = {
      accountHolderName: accountForm.accountHolderName.trim(),
      bankName: accountForm.bankName.trim(),
      accountNumber: accountForm.accountNumber.trim(),
      ifscCode: accountForm.ifscCode.toUpperCase().trim(),
      branchName: accountForm.branchName.trim(),
      accountType: accountForm.accountType,
      isDefault: bankAccounts.length === 0,
    };

    addBankMutation.mutate(payload, {
      onSuccess: () => {
        closeAddAccount();
        setAccountForm({
          accountHolderName: "",
          bankName: "",
          accountNumber: "",
          confirmAccountNumber: "",
          ifscCode: "",
          branchName: "",
          accountType: "savings",
        });
        setFormErrors({});
      },
    });
  };

  const handleDeleteAccount = (accountId: string) => {
    if (window.confirm("Are you sure you want to delete this bank account?")) {
      deleteBankMutation.mutate(accountId);
    }
  };

  const handleSetDefault = (accountId: string) => {
    setDefaultMutation.mutate(accountId);
  };

  const handleWithdrawal = () => {
    const amount = customAmount || selectedAmount;
    
    if (!amount) {
      return;
    }

    if (amount < 280) {
      return;
    }

    if (!selectedAccount) {
      return;
    }

    if (!withdrawalPassword) {
      return;
    }

    const selectedWalletBalance = selectedWallet === "mainWallet" 
      ? walletInfo?.mainWallet 
      : walletInfo?.commissionWallet;

    if (amount > selectedWalletBalance) {
      return;
    }

    createWithdrawalMutation.mutate(
      {
        walletType: selectedWallet,
        amount,
        bankAccountId: selectedAccount,
        withdrawalPassword,
      },
      {
        onSuccess: () => {
          setSelectedAmount(null);
          setCustomAmount(undefined);
          setWithdrawalPassword("");
        },
      }
    );
  };

  const getSelectedWalletBalance = () => {
    return selectedWallet === "mainWallet" 
      ? walletInfo?.mainWallet || 0 
      : walletInfo?.commissionWallet || 0;
  };

  const canSubmitWithdrawal = () => {
    const amount = customAmount || selectedAmount;
    return (
      amount &&
      amount >= 280 &&
      selectedAccount &&
      withdrawalPassword &&
      amount <= getSelectedWalletBalance()
    );
  };

  if (walletLoading || bankLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Loader size="lg" />
      </Flex>
    );
  }

  if (walletError || bankError) {
    return (
      <Flex justify="center" align="center" h="100vh" p="md">
        <Alert color="red" title="Error" icon={<FaInfoCircle />}>
          Failed to load data. Please refresh the page.
        </Alert>
      </Flex>
    );
  }

  return (
    <div className={classes.container}>
      <Text className={classes.title}>Withdrawal</Text>

      {/* Wallet Info */}
      <Card shadow="sm" p="md" radius="md" className={classes.card}>
        <Text fw={600} mb="xs">
          Select Wallet
        </Text>
        <Radio.Group value={selectedWallet} onChange={setSelectedWallet}>
          <Group>
            <Radio
              value="mainWallet"
              label={`Main Wallet: ₹${walletInfo?.mainWallet?.toFixed(2) || 0}`}
            />
            <Radio
              value="commissionWallet"
              label={`Commission Wallet: ₹${walletInfo?.commissionWallet?.toFixed(2) || 0}`}
            />
          </Group>
        </Radio.Group>
        <Text size="xs" c="dimmed" mt="xs">
          Available Balance: ₹{getSelectedWalletBalance().toFixed(2)}
        </Text>
      </Card>

      {/* Bank Accounts */}
      <Card shadow="sm" p="md" radius="md" className={classes.card}>
        <Flex justify="space-between" align="center" mb="xs">
          <Text fw={600}>Withdrawal Method</Text>
          <Button
            size="xs"
            leftSection={<FaPlus size={14} />}
            onClick={openAddAccount}
            disabled={bankAccounts.length >= 4}
          >
            Add Account ({bankAccounts.length}/4)
          </Button>
        </Flex>

        {bankAccounts.length === 0 ? (
          <Alert color="blue" icon={<FaInfoCircle />} mt="sm">
            No bank accounts added yet. Please add a bank account to proceed.
          </Alert>
        ) : (
          <Flex direction="column" gap="sm">
            {bankAccounts.map((acc: any) => (
              <Card
                key={acc._id}
                withBorder
                radius="md"
                p="sm"
                className={`${classes.bankCard} ${
                  selectedAccount === acc._id ? classes.activeCard : ""
                }`}
                onClick={() => setSelectedAccount(acc._id)}
                style={{ cursor: "pointer" }}
              >
                <Flex justify="space-between" align="center">
                  <div>
                    <Flex align="center" gap="xs">
                      <Text fw={600}>{acc.bankName}</Text>
                      {acc.isDefault && <Badge size="xs" color="green">Default</Badge>}
                    </Flex>
                    <Text size="xs" c="dimmed">
                      {acc.accountHolderName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      ••••{acc.accountNumber?.slice(-4)}
                    </Text>
                  </div>

                  <Group gap="xs">
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAccount(acc._id);
                      }}
                    >
                      <FaRegTrashAlt size={16} />
                    </ActionIcon>
                    {!acc.isDefault && (
                      <Button
                        size="xs"
                        variant="light"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(acc._id);
                        }}
                      >
                        Set Default
                      </Button>
                    )}
                  </Group>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Card>

      {/* Withdrawal Amount */}
      <Card shadow="sm" p="md" radius="md" className={classes.card}>
        <Text fw={600} mb="xs">
          Withdrawal Amount (₹)
        </Text>
        <Text size="xs" c="dimmed" mb="sm">
          Minimum: ₹280 | Maximum: ₹{getSelectedWalletBalance().toFixed(2)}
        </Text>
        <Flex wrap="wrap" gap="xs">
          {predefinedAmounts.map((amt) => (
            <Button
              key={amt}
              variant={selectedAmount === amt ? "default" : "outline"}
              color={selectedAmount ?  "blue ":"gray"}
              onClick={() => {
                setSelectedAmount(amt);
                setCustomAmount(undefined);
              }}
              className={classes.amountBtn}
              disabled={amt > getSelectedWalletBalance()}
            >
              ₹{amt.toLocaleString()}
            </Button>
          ))}
        </Flex>

        <Divider my="sm" />
        <NumberInput
          placeholder="Enter custom amount"
          value={customAmount}
          onChange={(val) => {
            setCustomAmount(val as number);
            setSelectedAmount(null);
          }}
          min={280}
          max={getSelectedWalletBalance()}
          step={100}
          hideControls
        />
      </Card>

      {/* Withdrawal Password */}
      <Card shadow="sm" p="md" radius="md" className={classes.card}>
        <Text fw={600} mb="xs">
          Withdrawal Password
        </Text>
        <PasswordInput
          placeholder="Enter withdrawal password"
          value={withdrawalPassword}
          onChange={(e) => setWithdrawalPassword(e.target.value)}
        />
      </Card>

      {/* Submit */}
      <Button
        fullWidth
        size="lg"
        mt="md"
        onClick={handleWithdrawal}
        loading={createWithdrawalMutation.isPending}
        disabled={!canSubmitWithdrawal()}
      >
          {`Submit Withdrawal Request ${
    customAmount || selectedAmount
      ? `₹${(customAmount || selectedAmount)?.toLocaleString()}`
      : ""
  }`}
      </Button>

      {/* Add Account Modal */}
      <Modal 
        opened={addAccountOpened} 
        onClose={() => {
          closeAddAccount();
          setFormErrors({});
        }} 
        title="Add Bank Account" 
        centered
        size="md"
      >
        <Flex direction="column" gap="md">
          <TextInput
            label="Account Holder Name"
            placeholder="Enter full name as per bank"
            value={accountForm.accountHolderName}
            onChange={(e) => {
              setAccountForm({ ...accountForm, accountHolderName: e.target.value });
              if (formErrors.accountHolderName) {
                setFormErrors({ ...formErrors, accountHolderName: "" });
              }
            }}
            error={formErrors.accountHolderName}
            required
          />
          <TextInput
            label="Bank Name"
            placeholder="Enter bank name"
            value={accountForm.bankName}
            onChange={(e) => {
              setAccountForm({ ...accountForm, bankName: e.target.value });
              if (formErrors.bankName) {
                setFormErrors({ ...formErrors, bankName: "" });
              }
            }}
            error={formErrors.bankName}
            required
          />
          <TextInput
            label="Account Number"
            placeholder="Enter account number"
            value={accountForm.accountNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setAccountForm({ ...accountForm, accountNumber: value });
              if (formErrors.accountNumber) {
                setFormErrors({ ...formErrors, accountNumber: "" });
              }
            }}
            error={formErrors.accountNumber}
            maxLength={18}
            required
          />
          <TextInput
            label="Confirm Account Number"
            placeholder="Re-enter account number"
            value={accountForm.confirmAccountNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setAccountForm({ ...accountForm, confirmAccountNumber: value });
              if (formErrors.confirmAccountNumber) {
                setFormErrors({ ...formErrors, confirmAccountNumber: "" });
              }
            }}
            error={formErrors.confirmAccountNumber}
            maxLength={18}
            required
          />
          <TextInput
            label="IFSC Code"
            placeholder="Enter IFSC code"
            value={accountForm.ifscCode}
            onChange={(e) => {
              setAccountForm({ 
                ...accountForm, 
                ifscCode: e.target.value.toUpperCase() 
              });
              if (formErrors.ifscCode) {
                setFormErrors({ ...formErrors, ifscCode: "" });
              }
            }}
            error={formErrors.ifscCode}
            maxLength={11}
            required
          />
          <TextInput
            label="Branch Name (Optional)"
            placeholder="Enter branch name"
            value={accountForm.branchName}
            onChange={(e) =>
              setAccountForm({ ...accountForm, branchName: e.target.value })
            }
          />
          <Select
            label="Account Type"
            data={[
              { value: "savings", label: "Savings Account" },
              { value: "current", label: "Current Account" },
            ]}
            value={accountForm.accountType}
            onChange={(v) => setAccountForm({ ...accountForm, accountType: v || "savings" })}
          />
          <Button 
            fullWidth 
            onClick={handleAddAccount} 
            loading={addBankMutation.isPending}
            mt="md"
          >
            Add Bank Account
          </Button>
        </Flex>
      </Modal>
    </div>
  );
};

export default WithdrawalScreen;