import { Button } from "@mantine/core";
import React from "react";
import classes from "./Mbutton.module.css";

interface MButtonProps {
  label: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  padding?: number;
  borderColor?: string;
  bgColor?: string;
  type?: "submit" | "button" | "reset";
  leftSection?: React.ReactNode;
  style?: React.CSSProperties;
}

const MButton = (props: MButtonProps) => {
  const {
    label,
    disabled = false,
    onClick,
    padding,
    bgColor = "blue",
    type = "submit",
    leftSection,
    style,
  } = props;
  return (
    <Button
      radius={"7px"}
      classNames={{ label: classes.mButtonLabel }}
      type={type}
      bg={bgColor}
      w={"100%"}
      disabled={disabled}
      onClick={onClick}
      p={padding ?? 16}
      variant="filled"
      className=""
      justify="center"
      leftSection={leftSection}
      style={style}
    >
      {label}
    </Button>
  );
};

export default MButton;
