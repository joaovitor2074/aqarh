// src/components/ui/Input.jsx
import React from "react";

export default function Input({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  error = false,
  className = "",
  ...props
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        w-full
        px-3 py-2
        rounded-lg
        border
        text-sm
        focus:outline-none focus:ring-2
        transition
        ${
          error
            ? "border-red-500 focus:ring-red-400"
            : "border-gray-300 focus:ring-[#006A4E]"
        }
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  );
}

//uso example

/* <Input
  placeholder="Nome do projeto"
  value={nome}
  onChange={(e) => setNome(e.target.value)}
/>
*/