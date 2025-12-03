import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BadgeProps {
  label: string;
  className?: string;
  icon?: LucideIcon | React.ElementType;
}

export const Badge: React.FC<BadgeProps> = ({ label, className = "bg-gray-100 text-gray-800 border-gray-200", icon: Icon }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {label}
    </span>
  );
};