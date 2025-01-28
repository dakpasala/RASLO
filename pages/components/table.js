import React from "react";

export const Table = ({ children }) => (
  <table className="min-w-full border border-gray-200">{children}</table>
);

export const TableHeader = ({ children }) => (
  <thead className="bg-gray-200 text-left">{children}</thead>
);

export const TableBody = ({ children }) => <tbody>{children}</tbody>;

export const TableRow = ({ children, ...props }) => (
  <tr className="hover:bg-gray-100" {...props}>
    {children}
  </tr>
);

export const TableCell = ({ children }) => (
  <td className="px-4 py-2 border-t">{children}</td>
);

export const TableHead = ({ children }) => (
  <th className="px-4 py-2 font-bold border-t">{children}</th>
);
