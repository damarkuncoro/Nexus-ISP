import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Flex } from './flex';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message, action }) => {
  return (
    <Flex
      direction="col"
      align="center"
      justify="center"
      className="text-center py-12 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200"
    >
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick} size="sm">
            {action.label}
          </Button>
        </div>
      )}
    </Flex>
  );
};
