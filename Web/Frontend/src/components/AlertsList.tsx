import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient, Alerta } from "@/lib/api";
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "./EmptyState";

interface AlertsListProps {
  maxItems?: number;
}

const AlertsList = ({ maxItems = 5 }: AlertsListProps) => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlertas();
  }, []);

  const loadAlertas = async () => {
    try {
      const data = await apiClient.getAlertasAtivos();
      setAlertas(data);
    } catch (error) {
      toast.error("Erro ao carregar alertas");
    } finally {
      setLoading(false);
    }
  };

  const handleEncerrarAlerta = async (id: number) => {
    try {
      await apiClient.encerrarAlerta(id);
      toast.success("Alerta encerrado com sucesso");
      loadAlertas();
    } catch (error) {
      toast.error("Erro ao encerrar alerta");
    }
  };

  const getNivelBadge = (nivel: string) => {
    const variants: Record<string, { variant: any; icon: any; color: string }> = {
      CRITICO: { variant: "destructive", icon: AlertCircle, color: "bg-red-500" },
      ALTO: { variant: "destructive", icon: AlertTriangle, color: "bg-red-500" },
      MEDIO: { variant: "default", icon: Clock, color: "bg-amber-500" },
      BAIXO: { variant: "secondary", icon: Clock, color: "bg-green-500" },
    };

    const config = variants[nivel] || variants.BAIXO;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1 text-xs">
        <Icon className="w-3 h-3" />
        {nivel}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="shadow-card h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  const displayAlertas = alertas.slice(0, maxItems);

  return (
    <Card className="shadow-card h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Alertas Ativos ({alertas.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {alertas.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="Nenhum alerta ativo"
            description="Sistema funcionando normalmente"
            variant="success"
          />
        ) : (
          <ScrollArea className="h-[240px]">
            <div className="space-y-3 pr-2">
              {displayAlertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className="p-3 bg-secondary/30 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {getNivelBadge(alerta.nivel)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(alerta.dataHora).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm text-foreground mb-1 truncate">{alerta.tipo}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{alerta.mensagem}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 text-xs h-8"
                      onClick={() => handleEncerrarAlerta(alerta.id)}
                    >
                      Encerrar
                    </Button>
                  </div>
                </div>
              ))}
              {alertas.length > maxItems && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  + {alertas.length - maxItems} alertas
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsList;
