import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  icon,
  ...props 
}) => {
  // Variant stilleri
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-700',
    outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700',
    success: 'bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600 hover:border-yellow-700'
  };

  // Size stilleri
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  // Base stiller
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-md border
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  // Focus ring stilleri
  const focusRingClasses = {
    primary: 'focus:ring-blue-500',
    secondary: 'focus:ring-gray-500',
    outline: 'focus:ring-gray-500',
    danger: 'focus:ring-red-500',
    success: 'focus:ring-green-500',
    warning: 'focus:ring-yellow-500'
  };

  const buttonClasses = `${baseClasses} ${focusRingClasses[variant]}`;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button; 