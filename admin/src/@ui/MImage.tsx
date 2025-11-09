import React, { memo } from "react";
import { IMAGES } from "../assets/images";
import { ICONS } from "../assets/icons";
import type { TIcons, TImages } from "../types";

interface IProps {
  name: TImages | TIcons;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  url?: string;
}

const FImage = ({
  name,
  alt,
  className,
  style,
  width,
  height,
  url,
}: IProps) => {
  return (
    <img
      style={style}
      className={className}
      alt={alt}
      src={url ?? `${IMAGES[name as TImages] || ICONS[name as TIcons]}`}
      width={width}
      height={height}
    />
  );
};

const MImage = memo(FImage);

export default MImage;
