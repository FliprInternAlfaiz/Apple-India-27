import { TextInput, type TextInputProps,  } from "@mantine/core";
import classes from "./MtextInput.module.css";

interface MInputProps {
  placeholder?: string;
  label: string;
  formhandler?: TextInputProps;
  withAsterisk?: boolean;
  size: "sm" | "md" | "lg";
  radius?: number;
}

export const MTextInput = ({
  label,
  placeholder,
  formhandler,
  withAsterisk = false,
  radius,
  size,
}: MInputProps) => {
  return (
    <TextInput
      label={label}
      classNames={{
        input: classes.mTextInput,
        label: classes.mInputLabel,
        error: classes.mInputError,
      }}
      w={"100%"}
      placeholder={placeholder}
      {...formhandler}
      radius={radius}
      size={size}
      withAsterisk={withAsterisk}
      type="text"
    ></TextInput>
  );
};
