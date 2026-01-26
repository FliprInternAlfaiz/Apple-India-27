import React, { useState, useRef } from "react";
import {
  Flex,
  Text,
  Card,
  Container,
  Button,
  TextInput,
  Box,
  Image,
  Alert,
  Badge,
  Paper,
  Progress,
} from "@mantine/core";
import {
  FaIdCard,
  FaUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCamera,
} from "react-icons/fa";
import { MdWarning } from "react-icons/md";
import { notifications } from "@mantine/notifications";
import classes from "./IdentityVerification.module.scss";
import {
  useVerificationStatusQuery,
  useUploadAadhaarMutation,
  useFileUploadMutation,
} from "../../hooks/query/verification.query";

const IdentityVerificationScreen: React.FC = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: verificationData, isLoading, refetch } =
    useVerificationStatusQuery();

  const fileUploadMutation = useFileUploadMutation();
  const uploadMutation = useUploadAadhaarMutation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notifications.show({
          title: "Error",
          message: "File size should be less than 5MB",
          color: "red",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        notifications.show({
          title: "Error",
          message: "Please select a valid image file",
          color: "red",
        });
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!aadhaarNumber || !selectedFile) {
      notifications.show({
        title: "Error",
        message: "Please provide both Aadhaar number and photo",
        color: "red",
      });
      return;
    }

    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(aadhaarNumber)) {
      notifications.show({
        title: "Error",
        message: "Aadhaar number must be 12 digits",
        color: "red",
      });
      return;
    }

    try {
      setUploadProgress(30);

      fileUploadMutation.mutate(selectedFile, {
        onSuccess: async (res: any) => {
          const fileUrl = res?.url || res?.data?.url;
          if (!fileUrl) {
            throw new Error("File upload failed.");
          }
          setUploadProgress(70);

          uploadMutation.mutate(
            {
              aadhaarNumber,
              aadhaarPhotoUrl: fileUrl,
            },
            {
              onSuccess: async (response: any) => {
                setUploadProgress(100);

                notifications.show({
                  title: response?.data?.title || "Success",
                  message:
                    response?.message ||
                    "Aadhaar verification submitted successfully!",
                  color: "green",
                });

                setSelectedFile(null);
                setPreviewUrl(null);
                setUploadProgress(0);

                await refetch();
              },
              onError: (err: any) => {
                setUploadProgress(0);
                notifications.show({
                  title: err?.response?.data?.title || "Error",
                  message:
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to submit Aadhaar verification.",
                  color: "red",
                });
              },
            }
          );
        },
        onError: (err: any) => {
          setUploadProgress(0);
          notifications.show({
            title: err?.response?.data?.title || "Upload Failed",
            message:
              err?.response?.data?.message ||
              err?.message ||
              "Unable to upload Aadhaar photo.",
            color: "red",
          });
        },
      });
    } catch (error: any) {
      setUploadProgress(0);
      notifications.show({
        title: "Error",
        message: error.message || "Something went wrong.",
        color: "red",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge color="green" size="lg" leftSection={<FaCheckCircle />}>
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge color="yellow" size="lg" leftSection={<FaClock />}>
            Under Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge color="red" size="lg" leftSection={<FaTimesCircle />}>
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge color="gray" size="lg">
            Not Submitted
          </Badge>
        );
    }
  };


  if (isLoading) {
    return (
      <Flex justify="center" align="center" className={classes.fullScreen}>
        <Text c="white" size="lg">
          Loading verification status...
        </Text>
      </Flex>
    );
  }


  const verificationStatus =
    verificationData?.data?.aadhaarVerificationStatus || "not_submitted";
  console.log(verificationData)
  const existingAadhaar = verificationData?.data?.aadhaarNumber;
  const existingPhoto = verificationData?.data?.aadhaarPhoto;
  const isSubmitted = verificationStatus !== "not_submitted";
  const isUploading = fileUploadMutation.isPending || uploadMutation.isPending;

  /* -------------------------------------------------------------
    🎨 Render UI
  ------------------------------------------------------------- */
  return (
    <Flex className={classes.verificationContainer} direction="column">
      <Container className={classes.mainContent}>
        {/* Header */}
        <Card className={classes.headerCard} radius="lg" shadow="md">
          <Flex align="center" gap="md" mb="md">
            <FaIdCard size={32} color="#228be6" />
            <Box>
              <Text size="xl" fw={700}>
                Identity Authentication
              </Text>
              <Text size="sm" c="dimmed">
                Upload Your Aadhaar Card To Unlock All Features
              </Text>
            </Box>
          </Flex>
          <Flex justify="center" mt="md">
            {getStatusBadge(verificationStatus)}
          </Flex>
        </Card>

        {/* Alerts */}
        {verificationStatus === "rejected" && (
          <Alert
            icon={<MdWarning size={20} />}
            title="Verification Rejected"
            color="red"
            radius="md"
            className={classes.alertCard}
          >
            Your Aadhaar verification was rejected. Please resubmit with correct
            information.
          </Alert>
        )}

        {verificationStatus === "pending" && (
          <Alert
            icon={<FaClock size={20} />}
            title="Under Review"
            color="yellow"
            radius="md"
            className={classes.alertCard}
          >
            Your Aadhaar verification is under review. This usually takes 24–48
            hours.
          </Alert>
        )}

        {verificationStatus === "approved" && (
          <Alert
            icon={<FaCheckCircle size={20} />}
            title="Verified Successfully"
            color="green"
            radius="md"
            className={classes.alertCard}
          >
            Your identity has been verified successfully!
          </Alert>
        )}

        {/* Form */}
        <Card className={classes.formCard} radius="lg" shadow="md">
          <Text size="lg" fw={600} mb="lg">
            {isSubmitted ? "Your Aadhaar Details" : "Submit Aadhaar Details"}
          </Text>

          <TextInput
            label="Aadhaar Number"
            placeholder="Enter 12-digit Aadhaar number"
            size="md"
            value={(isSubmitted ? existingAadhaar : aadhaarNumber) || ""}
            onChange={(e) =>
              setAadhaarNumber(e.target.value.replace(/\D/g, "").slice(0, 12))
            }
            maxLength={12}
            disabled={isSubmitted && verificationStatus !== "rejected"}
            leftSection={<FaIdCard />}
            className={classes.input}
            mb="lg"
          />

          {/* Upload Aadhaar Photo */}
          {/* Upload Aadhaar Photo */}
          <Box className={classes.uploadSection}>
            <Text size="md" fw={500} mb="sm">
              Aadhaar Card Photo
            </Text>

            {/* Show existing photo if already submitted */}
            {existingPhoto && verificationStatus !== "rejected" ? (
              <Paper className={classes.previewContainer} radius="md" withBorder>
                <Image
                  src={`${import.meta.env.VITE_PUBLIC_BASE_URL || "http://localhost:5000"}${existingPhoto}`}
                  alt="Aadhaar Card"
                  fit="contain"
                  className={classes.previewImage}
                />
                <Alert
                  mt="md"
                  color={
                    verificationStatus === "pending"
                      ? "yellow"
                      : verificationStatus === "approved"
                        ? "green"
                        : "gray"
                  }
                  radius="md"
                  icon={
                    verificationStatus === "pending" ? (
                      <FaClock />
                    ) : verificationStatus === "approved" ? (
                      <FaCheckCircle />
                    ) : (
                      <FaIdCard />
                    )
                  }
                >
                  {verificationStatus === "pending" && "Your Aadhaar is under review."}
                  {verificationStatus === "approved" && "Your Aadhaar is verified."}
                </Alert>
              </Paper>
            ) : (
              <>
                {/* Show upload section if not submitted or rejected */}
                {previewUrl ? (
                  <Paper className={classes.previewContainer} radius="md" withBorder>
                    <Image
                      src={previewUrl}
                      alt="Preview Aadhaar Card"
                      fit="contain"
                      className={classes.previewImage}
                    />
                    <Button
                      variant="light"
                      size="sm"
                      color="#2d1b4e"
                      mt="md"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      Remove Photo
                    </Button>
                  </Paper>
                ) : (
                  <Paper
                    className={classes.uploadBox}
                    radius="md"
                    withBorder
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaCamera size={48} color="#228be6" />
                    <Text size="md" fw={500} mt="md">
                      Click to upload Aadhaar photo
                    </Text>
                    <Text size="sm" c="dimmed" mt="xs">
                      JPG, PNG (Max 5MB)
                    </Text>
                  </Paper>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                  disabled={isSubmitted && verificationStatus !== "rejected"}
                />
              </>
            )}
          </Box>

          {/* Progress Bar */}
          {isUploading && uploadProgress > 0 && (
            <Box mt="md">
              <Text size="sm" mb="xs">
                Uploading... {uploadProgress}%
              </Text>
              <Progress value={uploadProgress} color="2d1b4e" animated />
            </Box>
          )}

          {/* Submit Button */}
          {(!isSubmitted || verificationStatus === "rejected") && (
            <Button
              fullWidth
              color="#2d1b4e"
              mt="xl"
              leftSection={<FaUpload />}
              onClick={handleSubmit}
              loading={isUploading}
              disabled={aadhaarNumber.length !== 12 || !selectedFile}
            >
              Submit for Verification
            </Button>
          )}

          {isSubmitted && verificationStatus !== "rejected" && (
            <Alert
              icon={<MdWarning size={16} />}
              title="Note"
              color="2d1b4e"
              radius="md"
              mt="lg"
            >
              You can update your Aadhaar details only if verification is
              rejected.
            </Alert>
          )}
        </Card>

        {/* Info Card */}
        <Card className={classes.infoCard} radius="lg" shadow="sm">
          <Text size="md" fw={600} mb="sm">
            Why verify your identity?
          </Text>
          <Flex direction="column" gap="sm">
            {[
              "Unlock withdrawal features",
              "Increase account security",
              "Access premium features",
              "Build trust with the platform",
            ].map((text) => (
              <Flex key={text} align="center" gap="sm">
                <FaCheckCircle color="#51cf66" />
                <Text size="sm">{text}</Text>
              </Flex>
            ))}
          </Flex>
        </Card>
      </Container>
    </Flex>
  );
};

export default IdentityVerificationScreen;
