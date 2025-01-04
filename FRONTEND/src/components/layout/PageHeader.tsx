import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-1">
        
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      {children}
    </div>
  );
}