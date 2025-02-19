import React, { useState } from "react";

export const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  );
};

export const DropdownMenuTrigger = ({ children, isOpen, setIsOpen }) => (
  <div
    className="cursor-pointer"
    onClick={() => setIsOpen((prev) => !prev)} // Toggle state on click
  >
    {children}
  </div>
);

export const DropdownMenuContent = ({ children, align = "end", isOpen }) => {
  if (!isOpen) return null; // Hide content when `isOpen` is false

  return (
    <div
      className={`absolute ${align === "end" ? "right-0" : "left-0"} mt-2 w-48 bg-black text-white border border-gray-700 rounded shadow-md`}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, setIsOpen }) => (
  <div
    onClick={() => {
      onClick && onClick();
      setIsOpen(false); // Close dropdown when an item is clicked
    }}
    className="px-4 py-2 cursor-pointer hover:bg-gray-700"
  >
    {children}
  </div>
);

export const DropdownMenuCheckboxItem = ({ children, checked, onCheckedChange }) => (
  <div className="flex items-center px-4 py-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className="mr-2"
    />
    {children}
  </div>
);

export const DropdownMenuLabel = ({ children }) => (
  <div className="px-4 py-2 font-bold text-gray-600">{children}</div>
);

export const DropdownMenuSeparator = () => (
  <div className="border-t border-gray-200 my-1"></div>
);
