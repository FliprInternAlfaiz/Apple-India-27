import React, { useState, useRef } from "react";
import {
  Modal,
  TextInput,
  Button,
  Box,
  Group,
  Text,
  Avatar,
  FileButton,
  Stack,
  ActionIcon,
  rem,
} from "@mantine/core";
import { FaUser, FaPhone, FaCamera, FaTimes } from "react-icons/fa";
import { notifications } from "@mantine/notifications";
import { useUpdateProfileMutation } from "../../hooks/mutations/useUpdateProfile.mutation";

interface UpdateProfileModalProps {
  opened: boolean;
  onClose: () => void;
  userData: {
    name?: string;
    phone?: string;
    picture?: string;
    username?: string;
  };
}

interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  picture?: File;
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({
  opened,
  onClose,
  userData,
}) => {
  const [name, setName] = useState(userData.name || "");
  const [phone, setPhone] = useState(userData.phone || "");
  const [previewImage, setPreviewImage] = useState<string | null>(
    userData.picture || null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const resetRef = useRef<() => void>(null);

  const updateProfileMutation = useUpdateProfileMutation();

  const getInitials = (name?: string): string => {
    if (!name || typeof name !== "string" || name.trim() === "") {
      return "U";
    }
    return name
      .trim()
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notifications.show({
          title: "File Too Large",
          message: "Please select an image smaller than 5MB",
          color: "red",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        notifications.show({
          title: "Invalid File Type",
          message: "Please select an image file",
          color: "red",
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewImage(userData.picture || null);
    resetRef.current?.();
  };

  const handleSubmit = async () => {
    try {
      const payload: UpdateProfilePayload = {};

      if (name.trim() && name !== userData.name) payload.name = name.trim();
      if (phone.trim() && phone !== userData.phone) payload.phone = phone.trim();
      if (selectedFile) payload.picture = selectedFile;

      // Check if there's anything to update
      if (!payload.name && !payload.phone && !payload.picture) {
        notifications.show({
          title: "No Changes",
          message: "Please make some changes before saving",
          color: "blue",
        });
        return;
      }

      const response = await updateProfileMutation.mutateAsync(payload);

      if (response.status === "success") {
        notifications.show({
          title: "Success",
          message: response.message || "Profile updated successfully",
          color: "green",
        });
        
        // Reset selected file after successful update
        setSelectedFile(null);
        onClose();
      } else {
        notifications.show({
          title: "Update Failed",
          message: response.message || "Failed to update profile",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);

      let errorMessage = "Failed to update profile";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }

      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    }
  };

  const handleClose = () => {
    setName(userData.name || "");
    setPhone(userData.phone || "");
    setPreviewImage(userData.picture || null);
    setSelectedFile(null);
    updateProfileMutation.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text size="lg" fw={700} c="#000">
          Update Profile
        </Text>
      }
      centered
      size="md"
      radius="lg"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        header: {
          borderBottom: "1px solid #eee",
          paddingBottom: "16px",
        },
        body: {
          padding: "24px",
        },
      }}
    >
      <Stack gap="md">
        <Box style={{ textAlign: "center" }}>
          <Box style={{ position: "relative", display: "inline-block" }}>
            {previewImage ? (
              <Avatar
                src={previewImage}
                size={120}
                radius="50%"
                style={{
                  border: "4px solid #8FABD4",
                  boxShadow: "0 4px 12px rgba(143, 171, 212, 0.3)",
                }}
              />
            ) : (
              <Avatar
                size={120}
                radius="50%"
                style={{
                  border: "4px solid #8FABD4",
                  background: "#8FABD4",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(143, 171, 212, 0.3)",
                }}
              >
                {getInitials(name || userData.username)}
              </Avatar>
            )}

            <FileButton
              resetRef={resetRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/webp"
            >
              {(props) => (
                <ActionIcon
                  {...props}
                  size={40}
                  radius="50%"
                  variant="filled"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    background: "#8FABD4",
                    border: "3px solid white",
                    cursor: "pointer",
                  }}
                >
                  <FaCamera size={18} color="#fff" />
                </ActionIcon>
              )}
            </FileButton>

            {selectedFile && (
              <ActionIcon
                size={32}
                radius="50%"
                variant="filled"
                color="red"
                onClick={handleRemoveImage}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  border: "2px solid white",
                }}
              >
                <FaTimes size={14} />
              </ActionIcon>
            )}
          </Box>

          <Text size="xs" c="dimmed" mt="md">
            Click the camera icon to upload a new photo
          </Text>
          <Text size="xs" c="dimmed">
            Max size: 5MB • Formats: JPG, PNG, WEBP
          </Text>
        </Box>

        <TextInput
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftSection={<FaUser size={16} style={{ color: "#8FABD4" }} />}
          size="md"
          radius="md"
          styles={{
            label: {
              fontSize: rem(14),
              fontWeight: 600,
              color: "#000",
              marginBottom: rem(8),
            },
            input: {
              border: "1px solid #e0e0e0",
              "&:focus": {
                borderColor: "#8FABD4",
              },
            },
          }}
        />

        <TextInput
          label="Phone Number"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftSection={<FaPhone size={16} style={{ color: "#8FABD4" }} />}
          size="md"
          radius="md"
          styles={{
            label: {
              fontSize: rem(14),
              fontWeight: 600,
              color: "#000",
              marginBottom: rem(8),
            },
            input: {
              border: "1px solid #e0e0e0",
              "&:focus": {
                borderColor: "#8FABD4",
              },
            },
          }}
        />

        <Group grow mt="md">
          <Button
            variant="outline"
            color="gray"
            size="md"
            radius="xl"
            onClick={handleClose}
            disabled={updateProfileMutation.isPending}
            styles={{
              root: {
                border: "2px solid #e0e0e0",
                color: "#555",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              },
            }}
          >
            Cancel
          </Button>
          <Button
            size="md"
            radius="xl"
            onClick={handleSubmit}
            loading={updateProfileMutation.isPending}
            style={{
              background: "linear-gradient(135deg, #8FABD4 0%, #6B8FB8 100%)",
              fontWeight: 600,
              border: "none",
            }}
          >
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default UpdateProfileModal;