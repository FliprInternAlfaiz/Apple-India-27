import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  Button,
  TextInput,
  NumberInput,
  Card,
  Loader,
  Radio,
  Group,
  Divider,
  Alert,
  Image,
  CopyButton,
  Tooltip,
  ActionIcon,
  Progress,
  Timeline,
  Stack,
  Paper,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  useWalletInfoQuery,
  usePaymentMethodsQuery,
  useCreateRechargeOrderMutation,
  useVerifyRechargePaymentMutation,
} from "../../hooks/query/useRecharge.query";
import classes from "./RechargeScreen.module.scss";
import {
  FaInfoCircle,
  FaCopy,
  FaCheck,
  FaWallet,
  FaQrcode,
  FaUniversity,
  FaMobileAlt,
  FaCheckCircle,
  FaSpinner,
  FaArrowRight,
} from "react-icons/fa";

const RechargeStep = {
  SELECT_AMOUNT: 1,
  SELECT_PAYMENT: 2,
  PAYMENT_DETAILS: 3,
  SUBMIT_UTR: 4,
  SUCCESS: 5,
} as const;

type RechargeStep = (typeof RechargeStep)[keyof typeof RechargeStep];

const RechargeScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<RechargeStep>(
    RechargeStep.SELECT_AMOUNT
  );
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<number | undefined>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);

  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const predefinedAmounts = [
    280, 750, 1080, 2100, 3500, 6500, 12000, 21500, 36000, 55000, 108000,
    150000,
  ];

  // Queries & Mutations
  const {
    data: walletInfo,
    isLoading: walletLoading,
    refetch: refetchWallet,
  } = useWalletInfoQuery();
  const { data: paymentMethods = [], isLoading: paymentLoading } =
    usePaymentMethodsQuery();

  const createOrderMutation = useCreateRechargeOrderMutation();
  const verifyPaymentMutation = useVerifyRechargePaymentMutation();

  // Set default payment method
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethod) {
      const activeMethod = paymentMethods.find((m: any) => m.isActive);
      if (activeMethod) {
        setSelectedPaymentMethod(activeMethod._id);
      }
    }
  }, [paymentMethods, selectedPaymentMethod]);

  const getSelectedAmount = () => customAmount || selectedAmount || 0;

  const handleAmountNext = () => {
    const amount = getSelectedAmount();
    if (amount >= 280 && amount <= 500000) {
      setCurrentStep(RechargeStep.SELECT_PAYMENT);
    }
  };

  const handlePaymentMethodNext = () => {
    if (!selectedPaymentMethod) return;

    const amount = getSelectedAmount();
    createOrderMutation.mutate(
      { amount, paymentMethodId: selectedPaymentMethod },
      {
        onSuccess: (data) => {
          setPaymentDetails(data.order);
          setCurrentStep(RechargeStep.PAYMENT_DETAILS);
          openModal();
        },
      }
    );
  };

  const handleProceedToUTR = () => {
    setCurrentStep(RechargeStep.SUBMIT_UTR);
  };

  const handleSubmitUTR = () => {
    if (!transactionId.trim() || transactionId.trim().length < 10) return;

    const formData = new FormData();
    formData.append("orderId", paymentDetails._id);
    formData.append("transactionId", transactionId.trim());
    if (paymentProof) {
      formData.append("paymentProof", paymentProof);
    }

    verifyPaymentMutation.mutate(formData, {
      onSuccess: (data) => {
        setOrderData(data.order);
        setCurrentStep(RechargeStep.SUCCESS);
        refetchWallet();
      },
    });
  };

  const handleComplete = () => {
    closeModal();
    // Reset state
    setCurrentStep(RechargeStep.SELECT_AMOUNT);
    setSelectedAmount(null);
    setCustomAmount(undefined);
    setTransactionId("");
    setPaymentProof(null);
    setPaymentDetails(null);
    setOrderData(null);
  };

  const renderStepIndicator = () => {
    const steps = [
      { step: RechargeStep.SELECT_AMOUNT, label: "Amount" },
      { step: RechargeStep.SELECT_PAYMENT, label: "Payment" },
      { step: RechargeStep.PAYMENT_DETAILS, label: "Details" },
      { step: RechargeStep.SUBMIT_UTR, label: "Verify" },
      { step: RechargeStep.SUCCESS, label: "Success" },
    ];

    const currentStepIndex = steps.findIndex((s) => s.step === currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    return (
      <Card shadow="sm" p="md" radius="md" mb="lg">
        <Progress value={progress} color="blue" size="sm" mb="xs" />
        <Flex justify="space-between">
          {steps.map((s) => (
            <Text
              key={s.step}
              size="xs"
              fw={currentStep >= s.step ? 600 : 400}
              c={currentStep >= s.step ? "blue" : "dimmed"}
            >
              {s.label}
            </Text>
          ))}
        </Flex>
      </Card>
    );
  };

  const renderAmountSelection = () => (
    <>
      <Card shadow="sm" p="md" radius="md" mb="md">
        <Text fw={600} mb="xs">
          Current Balance
        </Text>
        <Group>
          <div>
            <Text size="xs" c="dimmed">
              Main Wallet
            </Text>
            <Text size="xl" fw={700} c="blue">
              ₹{walletInfo?.mainWallet?.toFixed(2) || 0}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Commission Wallet
            </Text>
            <Text size="xl" fw={700} c="green">
              ₹{walletInfo?.commissionWallet?.toFixed(2) || 0}
            </Text>
          </div>
        </Group>
      </Card>

      <Card shadow="sm" p="md" radius="md" mb="md">
        <Text fw={600} mb="xs">
          Select Recharge Amount
        </Text>
        <Text size="xs" c="dimmed" mb="sm">
          Minimum: ₹280 | Maximum: ₹500,000
        </Text>

        <Flex wrap="wrap" gap="xs" mb="md">
          {predefinedAmounts.map((amt) => (
            <Button
              key={amt}
              variant={selectedAmount === amt ? "filled" : "outline"}
              color={selectedAmount === amt ? "blue" : "gray"}
              onClick={() => {
                setSelectedAmount(amt);
                setCustomAmount(undefined);
              }}
              style={{ flex: "1 0 calc(25% - 8px)", minWidth: "80px" }}
            >
              ₹{amt.toLocaleString()}
            </Button>
          ))}
        </Flex>

        <Divider my="sm" label="OR" labelPosition="center" />

        <NumberInput
          placeholder="Enter custom amount"
          value={customAmount}
          onChange={(val) => {
            setCustomAmount(val as number);
            setSelectedAmount(null);
          }}
          min={280}
          max={500000}
          step={100}
          hideControls
          size="lg"
          leftSection={<Text fw={600}>₹</Text>}
        />
      </Card>

      <Button
        fullWidth
        size="lg"
        onClick={handleAmountNext}
        disabled={!getSelectedAmount() || getSelectedAmount() < 280}
        rightSection={<FaArrowRight />}
      >
        Continue - ₹{getSelectedAmount().toLocaleString()}
      </Button>
    </>
  );

  const renderPaymentMethodSelection = () => (
    <>
      <Card shadow="sm" p="md" radius="md" mb="md">
        <Flex justify="space-between" align="center" mb="md">
          <div>
            <Text fw={600}>Selected Amount</Text>
            <Text size="xl" fw={700} c="blue">
              ₹{getSelectedAmount().toLocaleString()}
            </Text>
          </div>
          <Button
            variant="subtle"
            size="xs"
            onClick={() => setCurrentStep(RechargeStep.SELECT_AMOUNT)}
          >
            Change
          </Button>
        </Flex>
        <Divider />
      </Card>

      <Card shadow="sm" p="md" radius="md" mb="md">
        <Text fw={600} mb="md">
          Select Payment Method
        </Text>

        {paymentMethods.length === 0 ? (
          <Alert color="blue" icon={<FaInfoCircle />}>
            No payment methods available. Please contact support.
          </Alert>
        ) : (
          <Radio.Group
            value={selectedPaymentMethod}
            onChange={setSelectedPaymentMethod}
          >
            <Stack gap="sm">
              {paymentMethods.map((method: any) => (
                <Paper
                  key={method._id}
                  withBorder
                  p="md"
                  radius="md"
                  style={{
                    cursor: "pointer",
                    borderColor:
                      selectedPaymentMethod === method._id
                        ? "#228be6"
                        : undefined,
                    borderWidth: selectedPaymentMethod === method._id ? 2 : 1,
                  }}
                  onClick={() => setSelectedPaymentMethod(method._id)}
                >
                  <Radio
                    value={method._id}
                    label={
                      <Flex align="center" gap="md">
                        {method.methodType === "upi" && (
                          <FaMobileAlt size={24} color="#228be6" />
                        )}
                        {method.methodType === "bank" && (
                          <FaUniversity size={24} color="#228be6" />
                        )}
                        {method.methodType === "qr" && (
                          <FaQrcode size={24} color="#228be6" />
                        )}
                        <div>
                          <Text fw={600}>{method.methodName}</Text>
                          <Text size="xs" c="dimmed">
                            {method.methodType === "upi"
                              ? "UPI Payment"
                              : method.methodType === "bank"
                              ? "Bank Transfer"
                              : "QR Code Payment"}
                          </Text>
                        </div>
                      </Flex>
                    }
                  />
                </Paper>
              ))}
            </Stack>
          </Radio.Group>
        )}
      </Card>

      <Group grow>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentStep(RechargeStep.SELECT_AMOUNT)}
        >
          Back
        </Button>
        <Button
          size="lg"
          onClick={handlePaymentMethodNext}
          disabled={!selectedPaymentMethod}
          loading={createOrderMutation.isPending}
          rightSection={<FaArrowRight />}
        >
          Proceed to Pay
        </Button>
      </Group>
    </>
  );

  const renderPaymentDetails = () => {
    if (!paymentDetails) return null;

    const method = paymentDetails.paymentMethod;

    return (
      <Stack gap="md">
        <Alert color="blue" icon={<FaInfoCircle />}>
          Complete the payment using the details below
        </Alert>

        <Card withBorder p="md">
          <Text size="sm" fw={600} mb="xs" c="dimmed">
            ORDER DETAILS
          </Text>
          <Flex justify="space-between" mb="xs">
            <Text size="sm" c="dimmed">
              Order ID
            </Text>
            <Text size="sm" fw={500}>
              {paymentDetails.orderId}
            </Text>
          </Flex>
          <Flex justify="space-between">
            <Text size="sm" c="dimmed">
              Amount to Pay
            </Text>
            <Text size="xl" fw={700} c="blue">
              ₹{paymentDetails.amount.toLocaleString()}
            </Text>
          </Flex>
        </Card>

        <Card withBorder p="md">
          <Text size="sm" fw={600} mb="md" c="dimmed">
            PAYMENT DETAILS
          </Text>

          {method.methodType === "upi" && method.upiId && (
            <Flex direction="column" gap="md">
              <Flex justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  UPI ID
                </Text>
                <Flex align="center" gap="xs">
                  <Text size="sm" fw={600}>
                    {method.upiId}
                  </Text>
                  <CopyButton value={method.upiId}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? "Copied!" : "Copy UPI ID"}>
                        <ActionIcon
                          color={copied ? "teal" : "blue"}
                          onClick={copy}
                          size="sm"
                        >
                          {copied ? (
                            <FaCheck size={14} />
                          ) : (
                            <FaCopy size={14} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Flex>
              </Flex>

              {method.qrCode && (
                <>
                  <Divider label="OR SCAN QR CODE" labelPosition="center" />
                  <Flex
                    justify="center"
                    align="center"
                    direction="column"
                    gap="xs"
                  >
                    <Image
                      src={method.qrCode}
                      alt="Payment QR Code"
                      width={250}
                      height={250}
                      fit="contain"
                      style={{ border: "2px solid #e9ecef", borderRadius: 8 }}
                    />
                    <Text size="xs" c="dimmed" ta="center">
                      Scan with any UPI app to pay
                    </Text>
                  </Flex>
                </>
              )}
            </Flex>
          )}

          {method.methodType === "bank" && (
            <Stack gap="xs">
              <Flex justify="space-between">
                <Text size="sm" c="dimmed">
                  Account Name
                </Text>
                <Text size="sm" fw={500}>
                  {method.accountName}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text size="sm" c="dimmed">
                  Account Number
                </Text>
                <Flex align="center" gap="xs">
                  <Text size="sm" fw={600}>
                    {method.accountNumber}
                  </Text>
                  <CopyButton value={method.accountNumber}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? "Copied!" : "Copy"}>
                        <ActionIcon
                          color={copied ? "teal" : "blue"}
                          onClick={copy}
                          size="sm"
                        >
                          {copied ? (
                            <FaCheck size={14} />
                          ) : (
                            <FaCopy size={14} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Flex>
              </Flex>
              <Flex justify="space-between">
                <Text size="sm" c="dimmed">
                  IFSC Code
                </Text>
                <Flex align="center" gap="xs">
                  <Text size="sm" fw={600}>
                    {method.ifscCode}
                  </Text>
                  <CopyButton value={method.ifscCode}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? "Copied!" : "Copy"}>
                        <ActionIcon
                          color={copied ? "teal" : "blue"}
                          onClick={copy}
                          size="sm"
                        >
                          {copied ? (
                            <FaCheck size={14} />
                          ) : (
                            <FaCopy size={14} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Flex>
              </Flex>
              <Flex justify="space-between">
                <Text size="sm" c="dimmed">
                  Bank Name
                </Text>
                <Text size="sm" fw={500}>
                  {method.bankName}
                </Text>
              </Flex>
            </Stack>
          )}

          {method.methodType === "qr" && method.qrCode && (
            <Flex justify="center" align="center" direction="column" gap="xs">
              <Image
                src={method.qrCode}
                alt="Payment QR Code"
                width={250}
                height={250}
                fit="contain"
                style={{ border: "2px solid #e9ecef", borderRadius: 8 }}
              />
              <Text size="xs" c="dimmed" ta="center">
                Scan this QR code to complete payment
              </Text>
            </Flex>
          )}
        </Card>

        <Alert color="orange" icon={<FaInfoCircle />}>
          After completing the payment, click below to submit your transaction
          details
        </Alert>

        <Button
          fullWidth
          size="lg"
          onClick={handleProceedToUTR}
          rightSection={<FaArrowRight />}
        >
          I Have Completed Payment
        </Button>
      </Stack>
    );
  };

  const renderUTRSubmission = () => (
    <Stack gap="md">
      <Alert color="green" icon={<FaCheckCircle />}>
        Payment Initiated Successfully!
      </Alert>

      <Card withBorder p="md">
        <Text size="sm" fw={600} mb="md">
          Enter Transaction Details
        </Text>

        <TextInput
          label="UTR / Transaction ID"
          placeholder="Enter 12-digit UTR number"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          required
          size="lg"
          mb="md"
          description="Find this in your payment app under transaction details"
          error={
            transactionId && transactionId.length < 10
              ? "UTR must be at least 10 characters"
              : undefined
          }
        />

        <div>
          <Text size="sm" fw={500} mb="xs">
            Payment Proof (Optional)
          </Text>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setPaymentProof(e.target.files[0]);
              }
            }}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
            }}
          />
          {paymentProof && (
            <Text size="xs" c="dimmed" mt="xs">
              ✓ {paymentProof.name}
            </Text>
          )}
        </div>
      </Card>

      <Alert color="blue" icon={<FaInfoCircle />}>
        Your recharge will be processed within 5-10 minutes after verification
      </Alert>

      <Group grow>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentStep(RechargeStep.PAYMENT_DETAILS)}
        >
          Back
        </Button>
        <Button
          size="lg"
          onClick={handleSubmitUTR}
          disabled={!transactionId || transactionId.length < 10}
          loading={verifyPaymentMutation.isPending}
        >
          Submit for Verification
        </Button>
      </Group>
    </Stack>
  );

  const renderSuccess = () => (
    <Stack gap="md" align="center">
      <div style={{ textAlign: "center" }}>
        <FaCheckCircle size={64} color="#51cf66" />
        <Text size="xl" fw={700} mt="md">
          Payment Submitted Successfully!
        </Text>
        <Text size="sm" c="dimmed" mt="xs">
          Your recharge is being processed
        </Text>
      </div>

      <Card withBorder p="md" w="100%">
        <Timeline active={2} bulletSize={24} lineWidth={2}>
          <Timeline.Item
            bullet={<FaCheckCircle size={12} />}
            title="Payment Initiated"
          >
            <Text size="xs" c="dimmed">
              Order #{paymentDetails?.orderId}
            </Text>
          </Timeline.Item>
          <Timeline.Item
            bullet={<FaSpinner size={12} />}
            title="Under Verification"
          >
            <Text size="xs" c="dimmed">
              Processing your payment
            </Text>
          </Timeline.Item>
          <Timeline.Item
            bullet={<FaWallet size={12} />}
            title="Amount will be credited"
          >
            <Text size="xs" c="dimmed">
              Within 5-10 minutes
            </Text>
          </Timeline.Item>
        </Timeline>
      </Card>

      <Alert color="blue" icon={<FaInfoCircle />} w="100%">
        <Text size="sm">
          Amount: <strong>₹{paymentDetails?.amount?.toLocaleString()}</strong>
        </Text>
        <Text size="sm">
          Transaction ID: <strong>{orderData?.transactionId}</strong>
        </Text>
      </Alert>

      <Button fullWidth size="lg" onClick={handleComplete}>
        Done
      </Button>
    </Stack>
  );

  if (walletLoading || paymentLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Loader size="lg" />
      </Flex>
    );
  }

  return (
    <div className={classes.container}>
      <Text className={classes.title}>Recharge Wallet</Text>

      {!modalOpened && renderStepIndicator()}

      {!modalOpened &&
        currentStep === RechargeStep.SELECT_AMOUNT &&
        renderAmountSelection()}
      {!modalOpened &&
        currentStep === RechargeStep.SELECT_PAYMENT &&
        renderPaymentMethodSelection()}

      {currentStep === RechargeStep.PAYMENT_DETAILS && renderPaymentDetails()}
      {currentStep === RechargeStep.SUBMIT_UTR && renderUTRSubmission()}
      {currentStep === RechargeStep.SUCCESS && renderSuccess()}
    </div>
  );
};

export default RechargeScreen;
