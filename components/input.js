import React from "react";

export const Input = ({ className, ...props }) => (
  <input
    className={`border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:ring-blue-500 ${className}`}
    {...props}
  />
);
