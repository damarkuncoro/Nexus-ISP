
import React, { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Flex } from '../ui/flex';
import { cn } from '../../utils/cn';

// --- 1. Page Header (Navigation & Actions) ---
interface PageHeaderProps {
  title?: string;
  onBack: () => void;
  actions?: ReactNode;
  children?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, onBack, actions, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 dark:border-slate-700 pb-4">
    <Flex align="center" gap={4}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBack}
        className="rounded-full bg-white hover:bg-gray-100 border border-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-gray-300 shadow-sm"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <div>
        {title && <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>}
        {children}
      </div>
    </Flex>
    {actions && <Flex gap={2} className="self-start sm:self-center">{actions}</Flex>}
  </div>
);

// --- 2. Hero Section (Avatar, Main Info, Status) ---
interface DetailHeroProps {
  title: string;
  subtitle?: ReactNode;
  status?: ReactNode;
  avatarFallback: string;
  avatarUrl?: string;
  metadata?: ReactNode;
  className?: string;
  roleIcon?: React.ElementType;
}

export const DetailHero: React.FC<DetailHeroProps> = ({ 
  title, subtitle, status, avatarFallback, avatarUrl, metadata, className, roleIcon: Icon 
}) => (
  <div className={cn("bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 relative overflow-hidden", className)}>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-blue-600" />
    <div className="flex flex-col sm:flex-row gap-6 relative z-10">
      <div className="shrink-0">
        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-gray-50 dark:border-slate-700 shadow-sm">
          <AvatarImage src={avatarUrl} className="object-cover" />
          <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 text-gray-500 dark:text-gray-300">
            {Icon ? <Icon className="w-10 h-10 opacity-50" /> : avatarFallback.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1 space-y-3">
        <div>
          <Flex align="center" gap={3} wrap="wrap" className="mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
            {status}
          </Flex>
          {subtitle && <div className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">{subtitle}</div>}
        </div>

        {metadata && (
          <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
            {metadata}
          </div>
        )}
      </div>
    </div>
  </div>
);

// --- 3. Stat Card (Metrics) ---
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color = 'blue', subtext }) => {
  const colors = {
    blue:   'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber:  'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    red:    'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    gray:   'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-start justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div className={cn("p-3 rounded-xl", colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

// --- 4. Detail Section (Card Wrapper) ---
interface DetailSectionProps { 
  title: string; 
  icon?: React.ElementType; 
  children: ReactNode; 
  action?: ReactNode; 
  className?: string; 
}

export const DetailSection: React.FC<DetailSectionProps> = ({ title, icon: Icon, children, action, className }) => (
  <Card className={cn("h-full", className)}>
    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 py-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">{title}</CardTitle>
      </div>
      {action}
    </CardHeader>
    <CardContent className="p-0">
        {children}
    </CardContent>
  </Card>
);

// --- 5. Info Item (List Row) ---
interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value?: ReactNode;
  className?: string;
}

export const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value, className }) => (
  <div className={cn("flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors border-b last:border-0 border-gray-100 dark:border-slate-700/50", className)}>
    <div className="p-2 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shrink-0">
      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <div className="text-sm font-medium text-gray-900 dark:text-gray-200 mt-0.5 break-words">{value || <span className="text-gray-400 italic">Not set</span>}</div>
    </div>
  </div>
);
