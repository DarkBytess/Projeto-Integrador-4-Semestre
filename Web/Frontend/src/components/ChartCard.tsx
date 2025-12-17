import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface ChartCardProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

const ChartCard = ({ title, icon: Icon, children, className = "" }: ChartCardProps) => {
  return (
    <Card className={`shadow-card hover:shadow-glow transition-all duration-300 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {Icon && (
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
