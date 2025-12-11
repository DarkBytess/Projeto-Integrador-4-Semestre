import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient, Sensor } from "@/lib/api";
import { Thermometer, Droplets, Gauge, Radio } from "lucide-react";
import { toast } from "sonner";

const SensorsList = () => {
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

  const getSensorIcon = (tipo: string) => {
    const icons: Record<string, any> = {
      TEMPERATURA: Thermometer,
      UMIDADE: Droplets,
      PRESSAO: Gauge,
      default: Radio,
    };
    const Icon = icons[tipo] || icons.default;
    return <Icon className="w-5 h-5 text-primary" />;
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Sensores</CardTitle>
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
          <Radio className="w-5 h-5 text-primary" />
          Sensores Cadastrados ({sensores.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensores.map((sensor) => (
            <div
              key={sensor.id}
              className="p-4 bg-secondary/30 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {getSensorIcon(sensor.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{sensor.tipo}</Badge>
                  </div>
                  <h4 className="font-semibold text-foreground truncate">{sensor.localizacao}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{sensor.descricao}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>Min: {sensor.limiteMin}</span>
                    <span>•</span>
                    <span>Max: {sensor.limiteMax}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorsList;
