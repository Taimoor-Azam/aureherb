import React from "react"

import { IconProps } from "types/icon"

const Facebook: React.FC<IconProps> = ({
  size = "20",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...attributes}
    >
      <path
        d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.174 2.097 15.943 2 14.643 2 11.928 2 10 3.657 10 6.7V9.5H7v4h3V22h4v-8.5z"
        fill={color}
      />
    </svg>
  )
}

export default Facebook
