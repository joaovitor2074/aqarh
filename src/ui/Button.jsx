// src/components/ui/Button.jsx
import React from "react";

export default function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  loading = false,
  className = "",
  onClick
}) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    px-4 py-2
    rounded-lg
    font-medium
    transition
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-[#006A4E] text-white
      hover:bg-[#005a42]
      focus:ring-[#006A4E]
    `,
    secondary: `
      bg-gray-100 text-gray-800
      hover:bg-gray-200
      focus:ring-gray-300
    `,
    danger: `
      bg-red-600 text-white
      hover:bg-red-700
      focus:ring-red-500
    `
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
