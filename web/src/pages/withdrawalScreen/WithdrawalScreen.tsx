import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  Button,
  Modal,
  TextInput,
  Select,
  PasswordInput,
  Card,
  Badge,
  Loader,
  Radio,
  Group,
  ActionIcon,
  Divider,
  Alert,
  Center,
  Tabs,
  FileInput,
  Image,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  useWalletInfoQuery,
  useBankAccountsQuery,
  useAddBankAccountMutation,
  useAddQRCodeMutation,
  useDeleteBankAccountMutation,
  useSetDefaultAccountMutation,
  useCreateWithdrawalMutation,
  useWithdrawalSchedule,
} from "../../hooks/query/useWithdrawal.query";
import classes from "./WithdrawalScreen.module.scss";
import {
  FaPlus,
  FaRegTrashAlt,
  FaInfoCircle,
  FaCalendarAlt,
  FaLock,
  FaUniversity,
  FaQrcode,
  FaImage,
} from "react-icons/fa";

const WithdrawalScreen: React.FC = () => {
  const [selectedWallet, setSelectedWallet] = useState("mainWallet");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [withdrawalPassword, setWithdrawalPassword] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>("bank");

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

  const [qrForm, setQrForm] = useState({
    qrName: "",
    upiId: "",
    qrImage: null as File | null,
    qrPreview: "" as string,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const predefinedAmounts = [
    280, 1080, 3500, 12000, 21500, 36000, 55000, 108000, 150000,
  ];

  const {
    data: walletInfo,
    isLoading: walletLoading,
  } = useWalletInfoQuery();
  
  const {
    data: bankData = [],
    isLoading: bankLoading,
  } = useBankAccountsQuery();

  const { data: scheduleData, isLoading: scheduleLoading } =
    useWithdrawalSchedule();

  const bankAccounts = bankData?.accounts ?? [];

  const addBankMutation = useAddBankAccountMutation();
  const addQRMutation = useAddQRCodeMutation();
  const deleteBankMutation = useDeleteBankAccountMutation();
  const setDefaultMutation = useSetDefaultAccountMutation();
  const createWithdrawalMutation = useCreateWithdrawalMutation();

  const schedule = scheduleData?.schedule || [];
  const userLevel = scheduleData?.userLevel;
  const todaySchedule = scheduleData?.today;

  const isTodayAllowed =
    todaySchedule?.isActive &&
    Array.isArray(todaySchedule?.allowedLevels) &&
    todaySchedule.allowedLevels.includes(userLevel);

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

  // Validate bank form
  const validateBankForm = () => {
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
    } else if (
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(accountForm.ifscCode.toUpperCase())
    ) {
      errors.ifscCode = "Invalid IFSC code format";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate QR form
  const validateQRForm = () => {
    const errors: Record<string, string> = {};

    if (!qrForm.qrName.trim()) {
      errors.qrName = "QR name is required";
    }

    if (!qrForm.qrImage) {
      errors.qrImage = "QR code image is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddBankAccount = () => {
    if (!validateBankForm()) return;

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

  const handleAddQRCode = () => {
    if (!validateQRForm()) return;

    if (bankAccounts.filter((a: any) => a.accountType === 'qr').length >= 4) {
      return;
    }

    const formData = new FormData();
    formData.append('qrName', qrForm.qrName.trim());
    formData.append('upiId', qrForm.upiId.trim());
    formData.append('qrCodeImage', qrForm.qrImage!);
    formData.append('isDefault', String(bankAccounts.length === 0));

    addQRMutation.mutate(formData, {
      onSuccess: () => {
        closeAddAccount();
        setQrForm({
          qrName: "",
          upiId: "",
          qrImage: null,
          qrPreview: "",
        });
        setFormErrors({});
      },
    });
  };

  const handleQRImageChange = (file: File | null) => {
    if (file) {
      setQrForm({ ...qrForm, qrImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrForm((prev) => ({ ...prev, qrPreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setQrForm({ ...qrForm, qrImage: null, qrPreview: "" });
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      deleteBankMutation.mutate(accountId);
    }
  };

  const handleSetDefault = (accountId: string) => {
    setDefaultMutation.mutate(accountId);
  };

  const handleWithdrawal = () => {
    const amount = selectedAmount;
    if (!amount || amount < 280 || !selectedAccount || !withdrawalPassword)
      return;

    const selectedWalletBalance =
      selectedWallet === "mainWallet"
        ? walletInfo?.mainWallet
        : walletInfo?.commissionWallet;

    if (amount > selectedWalletBalance) return;

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

  if (walletLoading || bankLoading || scheduleLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }


  return (
    <div className={classes.container}>
      <Text className={classes.title}>Withdrawal</Text>

      {!isTodayAllowed && (
        <Alert
          icon={<FaLock />}
          color="red"
          title="Withdrawals Not Available Today"
          mb="md"
        >
          <Text size="sm">
            Your Apple Level {userLevel} is not allowed to withdraw today.
            Please check your withdrawal schedule below.
          </Text>
        </Alert>
      )}

      {isTodayAllowed && todaySchedule && (
        <Alert
          icon={<FaCalendarAlt />}
          color="green"
          title="Withdrawals Available Today"
          mb="md"
        >
          <Text size="sm">
            Apple Level {userLevel} can withdraw between{" "}
            {todaySchedule.startTime} - {todaySchedule.endTime}.
          </Text>
        </Alert>
      )}

      {isTodayAllowed && (
        <>
          <Card shadow="sm" p="md" radius="md" className={classes.card}>
            <Text fw={600} mb="xs">
              Select Wallet
            </Text>
            <Radio.Group
              value={selectedWallet}
              onChange={(value) => {
                setSelectedWallet(value);
                setSelectedAmount(null);
              }}
            >
              <Group>
                <Radio
                  value="mainWallet"
                  label={`Prime wallet: ₹${
                    walletInfo?.mainWallet?.toFixed(2) || 0
                  }`}
                />
                <Radio
                  value="commissionWallet"
                  label={`Task Wallet: ₹${
                    walletInfo?.commissionWallet?.toFixed(2) || 0
                  }`}
                />
              </Group>
            </Radio.Group>
            <Text size="xs" c="dimmed" mt="xs">
              Available Balance: ₹{getSelectedWalletBalance().toFixed(2)}
            </Text>
          </Card>

          {/* Bank Accounts & QR Codes */}
          <Card shadow="sm" p="md" radius="md" className={classes.card}>
            <Flex justify="space-between" align="center" mb="xs">
              <Text fw={600}>Withdrawal Method</Text>
              <Button
                size="xs"
                leftSection={<FaPlus size={14} />}
                onClick={openAddAccount}
                disabled={bankAccounts.length >= 4}
              >
                Add Method ({bankAccounts.length}/4)
              </Button>
            </Flex>

            {bankAccounts.length === 0 ? (
              <Alert color="blue" icon={<FaInfoCircle />} mt="sm">
                No withdrawal methods added yet. Please add a bank account or QR code to proceed.
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
                      <Flex align="center" gap="md">
                        {acc.accountType === 'qr' && acc.qrCodeImage && (
                          <Image
                            src={`${import.meta.env.VITE_PUBLIC_BASE_URL}/${acc.qrCodeImage}`}
                            alt="QR Code"
                            width={50}
                            height={50}
                            radius="sm"
                          />
                        )}
                        <div>
                          <Flex align="center" gap="xs">
                            {acc.accountType === 'qr' ? (
                              <FaQrcode size={16} />
                            ) : (
                              <FaUniversity size={16} />
                            )}
                            <Text fw={600}>{acc.bankName}</Text>
                            {acc.isDefault && (
                              <Badge size="xs" color="green">
                                Default
                              </Badge>
                            )}
                          </Flex>
                          <Text size="xs" c="dimmed">
                            {acc.accountHolderName}
                          </Text>
                          {acc.accountType !== 'qr' && (
                            <Text size="xs" c="dimmed">
                              ••••{acc.accountNumber?.slice(-4)}
                            </Text>
                          )}
                        </div>
                      </Flex>

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
            <Flex justify="space-between" align="center" mb="sm">
              <Text fw={600}>Select Withdrawal Amount</Text>
              <Badge color="blue" variant="light" size="sm">
                Balance: ₹{getSelectedWalletBalance().toLocaleString()}
              </Badge>
            </Flex>

            <Text size="xs" c="dimmed" mb="md">
              Choose from the available withdrawal amounts below.
            </Text>

            <div className={classes.amountGrid}>
              {predefinedAmounts.map((amt) => {
                const disabled = amt > getSelectedWalletBalance();
                const isSelected = selectedAmount === amt;

                return (
                  <div
                    key={amt}
                    className={`${classes.amountCard} ${
                      isSelected ? classes.amountSelected : ""
                    } ${disabled ? classes.amountDisabled : ""}`}
                    onClick={() => !disabled && setSelectedAmount(amt)}
                  >
                    <Text fw={700} size="md">
                      ₹{amt.toLocaleString()}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {disabled ? "Insufficient" : "Available"}
                    </Text>
                  </div>
                );
              })}
            </div>

            {selectedAmount && (
              <Alert
                color="green"
                mt="md"
                variant="light"
                icon={<FaCalendarAlt />}
              >
                <Text size="sm">
                  You have selected{" "}
                  <strong>₹{selectedAmount.toLocaleString()}</strong> for
                  withdrawal.
                </Text>
              </Alert>
            )}
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
            disabled={!selectedAmount || !selectedAccount || !withdrawalPassword}
          >
            {`Submit Withdrawal Request ${
              selectedAmount ? `₹${selectedAmount.toLocaleString()}` : ""
            }`}
          </Button>
        </>
      )}

      {/* Withdrawal Schedule */}
      <Card shadow="sm" p="md" radius="md" className={classes.card} mt="md">
        <Text fw={600} mb="sm" ta="center">
          📅 Withdrawal Schedule
        </Text>
        <Divider mb="sm" />
        {schedule
          .filter((s: any) => s.isActive && s.allowedLevels?.length > 0)
          .map((day: any) => (
            <Text key={day.day} size="sm" mb="xs">
              <strong>{day.day}:</strong> Apple Levels{" "}
              {day.allowedLevels.join(", ")} — {day.startTime}–{day.endTime}
            </Text>
          ))}

        <Alert color="blue" icon={<FaInfoCircle />} mt="md">
          <Text size="sm">
            Please make the withdrawal on the corresponding date according to
            your Apple level. If you encounter any problems with withdrawals,
            please contact your work manager immediately.
          </Text>
        </Alert>
      </Card>

      {/* Add Account/QR Modal */}
      <Modal
        opened={addAccountOpened}
        onClose={() => {
          closeAddAccount();
          setFormErrors({});
          setActiveTab("bank");
        }}
        title="Add Withdrawal Method"
        centered
        size="md"
      >
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="bank" leftSection={<FaUniversity size={14} />}>
              Bank Account
            </Tabs.Tab>
            <Tabs.Tab value="qr" leftSection={<FaQrcode size={14} />}>
              QR Code
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="bank" pt="md">
            <Flex direction="column" gap="md">
              <TextInput
                label="Account Holder Name"
                placeholder="Enter full name as per bank"
                value={accountForm.accountHolderName}
                onChange={(e) => {
                  setAccountForm({
                    ...accountForm,
                    accountHolderName: e.target.value,
                  });
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
                  setAccountForm({
                    ...accountForm,
                    confirmAccountNumber: value,
                  });
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
                    ifscCode: e.target.value.toUpperCase(),
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
                onChange={(v) =>
                  setAccountForm({
                    ...accountForm,
                    accountType: v || "savings",
                  })
                }
              />
              <Button
                fullWidth
                onClick={handleAddBankAccount}
                loading={addBankMutation.isPending}
                mt="md"
              >
                Add Bank Account
              </Button>
            </Flex>
          </Tabs.Panel>

          <Tabs.Panel value="qr" pt="md">
            <Flex direction="column" gap="md">
              <TextInput
                label="QR Name/Label"
                placeholder="e.g., PhonePe, Google Pay, etc."
                value={qrForm.qrName}
                onChange={(e) => {
                  setQrForm({ ...qrForm, qrName: e.target.value });
                  if (formErrors.qrName) {
                    setFormErrors({ ...formErrors, qrName: "" });
                  }
                }}
                error={formErrors.qrName}
                required
              />
              <TextInput
                label="UPI ID (Optional)"
                placeholder="Enter UPI ID"
                value={qrForm.upiId}
                onChange={(e) =>
                  setQrForm({ ...qrForm, upiId: e.target.value })
                }
              />
              <FileInput
                label="QR Code Image"
                placeholder="Upload QR code"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                leftSection={<FaImage size={14} />}
                onChange={handleQRImageChange}
                error={formErrors.qrImage}
                required
              />
              {qrForm.qrPreview && (
                <Center>
                  <Image
                    src={qrForm.qrPreview}
                    alt="QR Preview"
                    width={200}
                    height={200}
                    radius="md"
                  />
                </Center>
              )}
              <Alert color="blue" icon={<FaInfoCircle />}>
                <Text size="xs">
                  Upload a clear image of your payment QR code. This will be shown to admin for payment processing.
                </Text>
              </Alert>
              <Button
                fullWidth
                onClick={handleAddQRCode}
                loading={addQRMutation.isPending}
                mt="md"
                disabled={!qrForm.qrImage}
              >
                Add QR Code
              </Button>
            </Flex>
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </div>
  );
};

export default WithdrawalScreen;