import React from "react";

export const Checkbox = ({ checked, onCheckedChange, ...props }) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className="w-4 h-4 border-gray-300 rounded focus:ring-blue-500"
      {...props}
    />
  );
};
