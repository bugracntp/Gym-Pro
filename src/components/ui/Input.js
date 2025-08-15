import React from 'react';

const Input = ({ 
  type = 'text',
  value = '',
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
  label,
  error,
  name,
  ...props 
}) => {
  
  const handleChange = (e) => {
    if (onChange) {
      // name prop'unu event objesine ekle
      const eventWithName = {
        ...e,
        target: {
          ...e.target,
          name: name
        }
      };
      onChange(eventWithName);
    }
  };

  const baseClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-md 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-200
  `;

  const inputClasses = `${baseClasses} ${className} ${error ? 'border-red-500' : ''}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Input variants
Input.Text = (props) => {
  return <Input type="text" {...props} />;
};

Input.Tel = (props) => {
  return <Input type="tel" {...props} />;
};

Input.Email = (props) => {
  return <Input type="email" {...props} />;
};

Input.Date = (props) => {
  return <Input type="date" {...props} />;
};

Input.Number = (props) => {
  return <Input type="number" {...props} />;
};

// Select component
Input.Select = ({ label, options = [], error, name, value, onChange, ...props }) => {
  
  const handleChange = (e) => {
    
    if (onChange) {
      // name prop'unu event objesine ekle
      const eventWithName = {
        ...e,
        target: {
          ...e.target,
          name: name,
          value: e.target.value
        }
      };
      onChange(eventWithName);
    }
  };
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 border border-gray-300 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-colors duration-200 ${error ? 'border-red-500' : ''}`}
        value={value || ''}
        onChange={handleChange}
        {...props}
      >
        {options.map((option) => {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Textarea component
Input.Textarea = ({ label, rows = 3, error, name, onChange, ...props }) => {
  
  const handleChange = (e) => {
    if (onChange) {
      // name prop'unu event objesine ekle
      const eventWithName = {
        ...e,
        target: {
          ...e.target,
          name: name
        }
      };
      onChange(eventWithName);
    }
  };
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-colors duration-200 resize-vertical ${error ? 'border-red-500' : ''}`}
        onChange={handleChange}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Search component
Input.Search = ({ leftIcon, rightIcon, name, onChange, ...props }) => {
  const handleChange = (e) => {
    if (onChange) {
      // name prop'unu event objesine ekle
      const eventWithName = {
        ...e,
        target: {
          ...e.target,
          name: name
        }
      };
      onChange(eventWithName);
    }
  };
  
  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <div className="h-5 w-5 text-gray-400">
            {leftIcon}
          </div>
        </div>
      )}
      <input
        type="text"
        className={`w-full py-2 border border-gray-300 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors duration-200 ${leftIcon ? 'pl-10' : 'pl-3'} ${rightIcon ? 'pr-10' : 'pr-3'}`}
        onChange={handleChange}
        {...props}
      />
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <div className="h-5 w-5 text-gray-400">
            {rightIcon}
          </div>
        </div>
      )}
    </div>
  );
};

export default Input; 