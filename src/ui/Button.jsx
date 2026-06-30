// src/components/ui/Button.jsx
import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  className = "",
  onClick,
  ...props
}) {
  const baseClasses = `
    inline-flex max-w-full items-center justify-center gap-2
    rounded-lg
    font-medium
    leading-tight
    transition
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed
  `;

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

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
    `,
    outline: `
      bg-white text-gray-700 border border-gray-300
      hover:bg-gray-50
      focus:ring-gray-300
    `,
    success: `
      bg-emerald-600 text-white
      hover:bg-emerald-700
      focus:ring-emerald-500
    `,
    warning: `
      bg-amber-500 text-white
      hover:bg-amber-600
      focus:ring-amber-400
    `,
    info: `
      bg-sky-600 text-white
      hover:bg-sky-700
      focus:ring-sky-500
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
