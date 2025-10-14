import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
    children, 
    onClick, 
    to, 
    variant = 'primary', 
    className = '',
    type = 'button',
    disabled = false
}) => {
  const baseStyles = 'inline-flex items-center justify-center px-6 py-3 font-semibold text-center rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5';

  const variantStyles = {
    primary: 'text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 focus:ring-cyan-500 shadow-lg hover:shadow-cyan-500/30',
    secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500',
    outline: 'border border-cyan-500 bg-transparent text-cyan-400 hover:bg-cyan-500/20 focus:ring-cyan-600',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={combinedClassName} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;