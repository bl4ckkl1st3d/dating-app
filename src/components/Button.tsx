import React from "react";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = "primary" }) => {
  const baseStyle =
    "px-5 py-2 rounded-2xl font-medium transition-all duration-200";
  const styles =
    variant === "primary"
      ? `${baseStyle} bg-pink-500 hover:bg-pink-600 text-white`
      : `${baseStyle} border border-pink-500 text-pink-500 hover:bg-pink-50`;

  return (
    <button onClick={onClick} className={styles}>
      {label}
    </button>
  );
};

export default Button;
