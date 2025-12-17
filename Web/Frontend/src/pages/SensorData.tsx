import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiClient, SensorData, Sensor } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trash2, Database, Filter, Activity, Calendar, Gauge } from "lucide-react";

const SENSOR_LABELS: Record<string, string> = {
  "TEMPERATURA_AR": "Temp. Ar",
  "UMIDADE_AR": "Umid. Ar",
  "PRESSAO": "Pressão",
  "UMIDADE_SOLO": "Umid. Solo",
  "PH_SOLO": "pH Solo",
  "NUTRIENTES": "Nutrientes",
  "LUMINOSIDADE": "Luminosidade",
  "INDICE_UV": "Índice UV",
  "CHUVA": "Chuva",
};

const SensorDataPage = () => {
  const [data, setData] = useState<SensorData[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSensors();
    loadData();
  }, []);

  useEffect(() => {
    if (selectedSensor !== "all") {
      loadDataBySensor(Number(selectedSensor));
    } else {
      loadData();
    }
  }, [selectedSensor]);

  const loadSensors = async () => {
    try {
      const sensorsData = await apiClient.getSensores();
      setSensors(sensorsData);
    } catch (error: any) {
      toast.error("Erro ao carregar sensores: " + error.message);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const sensorData = await apiClient.getDados();
      setData(sensorData);
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDataBySensor = async (sensorId: number) => {
    try {
      setLoading(true);
      const sensorData = await apiClient.getDadosBySensor(sensorId);
      setData(sensorData);
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este dado?")) return;
    try {
      await apiClient.deleteDado(id);
      toast.success("Dado deletado com sucesso!");
      if (selectedSensor !== "all") {
        loadDataBySensor(Number(selectedSensor));
      } else {
        loadData();
      }
    } catch (error: any) {
      toast.error("Erro ao deletar dado: " + error.message);
    }
  };

  const getSensorLabel = (tipo: string) => {
    return SENSOR_LABELS[tipo] || tipo;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Database className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              Dados dos Sensores
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Visualize e gerencie as leituras dos sensores
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <Select value={selectedSensor} onValueChange={setSelectedSensor}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Filtrar por sensor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Sensores</SelectItem>
                {sensors.map((sensor) => (
                  <SelectItem key={sensor.id} value={sensor.id.toString()}>
                    {getSensorLabel(sensor.tipo)} - {sensor.localizacao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{data.length}</div>
              <p className="text-xs text-muted-foreground">Total de Leituras</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-500">{sensors.length}</div>
              <p className="text-xs text-muted-foreground">Sensores</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">
                {data.length > 0 
                  ? (data.reduce((sum, d) => sum + d.valor, 0) / data.length).toFixed(1)
                  : "-"}
              </div>
              <p className="text-xs text-muted-foreground">Média dos Valores</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-500">
                {data.length > 0
                  ? formatDateTime(data[0]?.dataHora || "").split(" ")[0]
                  : "-"}
              </div>
              <p className="text-xs text-muted-foreground">Última Leitura</p>
            </CardContent>
          </Card>
        </div>

        {/* Table Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Histórico de Leituras
              {selectedSensor !== "all" && (
                <Badge variant="outline" className="ml-2">
                  Filtrado
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-8 w-16" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhum dado encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedSensor !== "all" 
                    ? "Não há leituras para o sensor selecionado"
                    : "Os dados das leituras aparecerão aqui"}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="block lg:hidden space-y-3">
                  {data.slice(0, 20).map((item) => {
                    const sensor = sensors.find((s) => s.id === item.sensorId);
                    return (
                      <div 
                        key={item.id}
                        className="p-4 bg-secondary/30 rounded-lg border border-border/50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline">{getSensorLabel(sensor?.tipo || "N/A")}</Badge>
                          <span className="text-xs text-muted-foreground">#{item.id}</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">{sensor?.localizacao || "N/A"}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Gauge className="w-4 h-4 text-primary" />
                              <span className="text-lg font-bold text-foreground">{item.valor}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {formatDateTime(item.dataHora)}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {data.length > 20 && (
                    <p className="text-center text-sm text-muted-foreground py-2">
                      Mostrando 20 de {data.length} registros
                    </p>
                  )}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden lg:block">
                  <ScrollArea className="h-[450px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">ID</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead className="text-center">Valor</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((item) => {
                          const sensor = sensors.find((s) => s.id === item.sensorId);
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-mono text-muted-foreground">#{item.id}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{getSensorLabel(sensor?.tipo || "N/A")}</Badge>
                              </TableCell>
                              <TableCell className="font-medium">{sensor?.localizacao || "N/A"}</TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center gap-1 font-mono bg-primary/10 px-2 py-1 rounded text-primary">
                                  {item.valor}
                                </span>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatDateTime(item.dataHora)}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SensorDataPage;