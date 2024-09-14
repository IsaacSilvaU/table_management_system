import React from 'react';

const Button = ({ variant = "outline", children, className = "", ...props }) => {
    const baseClass = "px-4 py-2 rounded font-bold transition-all duration-200 ";
    const variantClass = variant === "outline" 
        ? "border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white" 
        : "bg-blue-500 text-white hover:bg-blue-700";
    
    return (
        <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;

