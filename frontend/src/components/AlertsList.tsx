import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient, Alerta } from "@/lib/api";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const AlertsList = () => {
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
    const variants: Record<string, { variant: any; icon: any }> = {
      CRITICO: { variant: "destructive", icon: AlertCircle },
      ALTO: { variant: "destructive", icon: AlertCircle },
      MEDIO: { variant: "default", icon: Clock },
      BAIXO: { variant: "secondary", icon: Clock },
    };

    const config = variants[nivel] || variants.BAIXO;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {nivel}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Alertas Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Alertas Ativos ({alertas.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alertas.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum alerta ativo no momento</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className="p-4 bg-secondary/30 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getNivelBadge(alerta.nivel)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(alerta.dataHora).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{alerta.tipo}</h4>
                    <p className="text-sm text-muted-foreground">{alerta.mensagem}</p>
                    {alerta.sensorData && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Sensor: {alerta.sensorData.sensor.localizacao} - Valor: {alerta.sensorData.valor}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEncerrarAlerta(alerta.id)}
                  >
                    Encerrar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsList;
