import React, { useState } from 'react';

export const DropdownMenu = ({ children }) => {
    return <div className="relative">{children}</div>;
};

export const DropdownMenuTrigger = ({ children }) => {
    return <div>{children}</div>;
};

export const DropdownMenuContent = ({ children, align = "end" }) => {
    return (
        <div className={`absolute mt-2 ${align === "end" ? "right-0" : "left-0"} bg-white border border-gray-200 rounded shadow-lg`}>
            {children}
        </div>
    );
};

export const DropdownMenuItem = ({ children, ...props }) => {
    return (
        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" {...props}>
            {children}
        </button>
    );
};
