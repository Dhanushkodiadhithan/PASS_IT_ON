import {
  BookOpen,
  CircleAlert,
  Eye,
  EyeOff,
  FileText,
  FlaskConical,
  History,
  List,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  history_edu: History,
  format_list_bulleted: List,
  menu_book: BookOpen,
  science: FlaskConical,
  priority_high: CircleAlert,

  // Password icons
  visibility: Eye,
  visibility_off: EyeOff,

  // Common file/document icons
  description: FileText,
};

export default function Icon({
  name,
  size = 20,
  filled = false,
  className = '',
}: {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
}) {
  const IconComponent = iconMap[name] ?? FileText;

  return (
    <IconComponent
      aria-hidden="true"
      size={size}
      className={className}
      strokeWidth={filled ? 2.5 : 2}
    />
  );
}