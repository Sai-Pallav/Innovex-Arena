import React from 'react';
import {
  Layout,
  Brain,
  Cloud,
  Trophy,
  GraduationCap,
  Users,
  Target,
  Lightbulb,
  Zap,
  BookOpen,
  Award,
  FileText,
  MessageSquare,
  FolderGit2,
  Briefcase,
  Radio,
  Cpu,
  Shield,
  BarChart3,
  Blocks,
  Glasses,
  Code,
  Laptop,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Layout,
  Brain,
  Cloud,
  Trophy,
  GraduationCap,
  Users,
  Target,
  Lightbulb,
  Zap,
  BookOpen,
  Award,
  FileText,
  MessageSquare,
  FolderGit2,
  Briefcase,
  Radio,
  Cpu,
  Shield,
  BarChart3,
  Blocks,
  Glasses,
  Code,
  Laptop,
  Sparkles,
};

interface IconRendererProps {
  name: string;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-5 h-5' }) => {
  const IconComponent = ICON_MAP[name] || Sparkles;
  return <IconComponent className={className} />;
};
