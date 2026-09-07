import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-5 h-5' }) => {
  // @ts-ignore
  const IconComponent = LucideIcons[name] || LucideIcons.Sparkles;
  return <IconComponent className={className} />;
};
