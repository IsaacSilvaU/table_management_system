import React from 'react';

const Input = ({ type = "text", className = "", ...props }) => {
    return (
        <input
            type={type}
            className={`border rounded px-3 py-2 text-sm ${className}`}
            {...props}
        />
    );
};

export default Input;
