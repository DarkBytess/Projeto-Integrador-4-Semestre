import { LucideIcon, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
}

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  variant = "default" 
}: EmptyStateProps) => {
  const variantConfig = {
    default: { icon: Info, color: "text-muted-foreground", bg: "bg-muted/50" },
    success: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
    warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
    error: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
    info: { icon: Info, color: "text-info", bg: "bg-info/10" },
  };

  const config = variantConfig[variant];
  const DisplayIcon = Icon || config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className={`w-16 h-16 ${config.bg} rounded-full flex items-center justify-center mb-4`}>
        <DisplayIcon className={`w-8 h-8 ${config.color}`} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
