import React from "react";

export default function Card({ children, className = "" }) {
  return (
    <div
      className={`
        bg-white
        rounded-lg
        shadow-[0_10px_30px_rgba(15,23,42,0.06)]
        border
        border-gray-200
        p-4 sm:p-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}
