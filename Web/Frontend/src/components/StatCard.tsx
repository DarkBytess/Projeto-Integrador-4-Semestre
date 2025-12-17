import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend = "neutral",
  variant = "default" 
}: StatCardProps) => {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-muted-foreground",
  };

  const variantStyles = {
    default: "bg-primary/10 text-primary",
    primary: "bg-blue-500/10 text-blue-500",
    success: "bg-green-500/10 text-green-500",
    warning: "bg-amber-500/10 text-amber-500",
    danger: "bg-red-500/10 text-red-500",
  };

  return (
    <Card className="shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] border-border/50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{value}</h3>
            {description && (
              <p className={cn("text-xs sm:text-sm mt-1 sm:mt-2", trendColors[trend])}>{description}</p>
            )}
          </div>
          <div className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            variantStyles[variant]
          )}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
