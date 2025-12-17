import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient, Sensor } from "@/lib/api";
import { Thermometer, Droplets, Gauge, Radio, Sun, CloudRain, Leaf, Zap } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "./EmptyState";

interface SensorsListProps {
  compact?: boolean;
  maxItems?: number;
}

const SENSOR_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  TEMPERATURA_AR: { icon: Thermometer, label: "Temperatura do Ar", color: "text-red-500" },
  UMIDADE_AR: { icon: Droplets, label: "Umidade do Ar", color: "text-blue-500" },
  PRESSAO: { icon: Gauge, label: "Pressão", color: "text-purple-500" },
  UMIDADE_SOLO: { icon: Droplets, label: "Umidade do Solo", color: "text-cyan-500" },
  PH_SOLO: { icon: Leaf, label: "pH do Solo", color: "text-green-500" },
  NUTRIENTES: { icon: Zap, label: "Nutrientes", color: "text-yellow-500" },
  LUMINOSIDADE: { icon: Sun, label: "Luminosidade", color: "text-amber-500" },
  INDICE_UV: { icon: Sun, label: "Índice UV", color: "text-orange-500" },
  CHUVA: { icon: CloudRain, label: "Chuva", color: "text-slate-500" },
};

const SensorsList = ({ compact = false, maxItems = 5 }: SensorsListProps) => {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSensores();
  }, []);

  const loadSensores = async () => {
    try {
      const data = await apiClient.getSensores();
      setSensores(data);
    } catch (error) {
      toast.error("Erro ao carregar sensores");
    } finally {
      setLoading(false);
    }
  };

  const getSensorConfig = (tipo: string) => {
    return SENSOR_CONFIG[tipo] || { icon: Radio, label: tipo, color: "text-primary" };
  };

  if (loading) {
    return (
      <Card className="shadow-card h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Sensores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  const displaySensores = compact ? sensores.slice(0, maxItems) : sensores;

  return (
    <Card className="shadow-card h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          Sensores {compact && `(${sensores.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {sensores.length === 0 ? (
          <EmptyState
            title="Nenhum sensor"
            description="Adicione sensores para monitorar"
            variant="info"
          />
        ) : (
          <ScrollArea className={compact ? "h-[240px]" : ""}>
            <div className="space-y-3">
              {displaySensores.map((sensor) => {
                const config = getSensorConfig(sensor.tipo);
                const Icon = config.icon;
                
                return (
                  <div
                    key={sensor.id}
                    className="p-3 bg-secondary/30 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate mt-1">
                          {sensor.localizacao}
                        </p>
                        {!compact && (
                          <p className="text-xs text-muted-foreground truncate">
                            {sensor.descricao}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                        <div>{sensor.limiteMin} - {sensor.limiteMax}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {compact && sensores.length > maxItems && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  + {sensores.length - maxItems} sensores
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SensorsList;
