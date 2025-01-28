import React from "react";

export const Button = ({ children, variant = "default", className, ...props }) => {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-400 text-gray-700 hover:bg-gray-100",
  };

  return (
    <button
      className={`px-4 py-2 rounded ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
