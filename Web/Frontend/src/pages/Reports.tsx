import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiClient, Sensor } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BarChart3, AlertTriangle, FileText, Filter, Calendar, Database } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

const Reports = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string | undefined>();
  const [tendencias, setTendencias] = useState<any>(null);
  const [medias, setMedias] = useState<any>(null);
  const [alertas, setAlertas] = useState<any>(null);
  const [dias, setDias] = useState("7");
  const [periodo, setPeriodo] = useState("dia");
  const [loading, setLoading] = useState(true);
  const [loadingSensors, setLoadingSensors] = useState(true);

  const inicio = new Date(new Date().setDate(new Date().getDate() - parseInt(dias))).toISOString();
  const fim = new Date().toISOString();

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        setLoadingSensors(true);
        const sensorsData = await apiClient.getSensores();
        setSensors(sensorsData);
        if (sensorsData.length > 0) {
          setSelectedSensor(String(sensorsData[0].id));
        }
      } catch (error: any) {
        toast.error("Erro ao carregar sensores: " + error.message);
      } finally {
        setLoadingSensors(false);
      }
    };
    fetchSensors();
  }, []);

  useEffect(() => {
    if (selectedSensor) {
      loadReports();
    }
  }, [dias, periodo, selectedSensor]);

  const loadReports = async () => {
    if (!selectedSensor) return;

    setLoading(true);
    try {
      const sensorId = parseInt(selectedSensor);
      const [tendenciasData, mediasData, alertasData] = await Promise.all([
        apiClient.getRelatorioTendencias(sensorId, parseInt(dias)),
        apiClient.getRelatorioMedias(sensorId, periodo),
        apiClient.getRelatorioAlertas(sensorId, inicio, fim),
      ]);
      setTendencias(tendenciasData);
      setMedias(mediasData);
      setAlertas(alertasData);
    } catch (error: any) {
      toast.error("Erro ao carregar relatórios: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSensorLabel = (tipo: string) => {
    return SENSOR_LABELS[tipo] || tipo;
  };

  const renderTable = (data: any) => (
    <ScrollArea className="h-[300px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Período</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(data).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell className="font-medium">{key}</TableCell>
              <TableCell className="text-right">
                <span className="font-mono bg-primary/10 px-2 py-1 rounded text-primary">
                  {typeof value === 'number' ? value.toFixed(2) : String(value)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );

  // Estado vazio - nenhum sensor cadastrado
  if (!loadingSensors && sensors.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                Relatórios
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Análises e estatísticas dos sensores
              </p>
            </div>
          </div>

          {/* Empty State */}
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                <Database className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhum sensor cadastrado
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Para visualizar relatórios, você precisa primeiro cadastrar sensores e registrar dados.
              </p>
              <a 
                href="/sensors" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Cadastrar Sensores
              </a>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Loading inicial
  if (loadingSensors) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                Relatórios
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Análises e estatísticas dos sensores
              </p>
            </div>
          </div>

          {/* Loading Cards */}
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-[250px]" />
                  <Skeleton className="h-10 w-[180px]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72 mt-2" />
            </CardHeader>
            <CardContent>
              <LoadingSkeleton />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              Relatórios
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Análises e estatísticas dos sensores
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Select value={selectedSensor} onValueChange={setSelectedSensor}>
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Selecione um sensor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sensors.map((sensor) => (
                      <SelectItem key={sensor.id} value={String(sensor.id)}>
                        {getSensorLabel(sensor.tipo)} - {sensor.localizacao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={dias} onValueChange={setDias}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="15">Últimos 15 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="tendencias" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="tendencias" className="flex-col sm:flex-row gap-1 py-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Tendências</span>
            </TabsTrigger>
            <TabsTrigger value="medias" className="flex-col sm:flex-row gap-1 py-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Médias</span>
            </TabsTrigger>
            <TabsTrigger value="alertas" className="flex-col sm:flex-row gap-1 py-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Alertas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tendencias">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Relatório de Tendências
                </CardTitle>
                <CardDescription>
                  Análise de tendências dos dados do sensor nos últimos {dias} dias.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingSkeleton />
                ) : tendencias && Object.keys(tendencias).length > 0 ? (
                  renderTable(tendencias)
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Nenhum dado de tendência encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medias">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Relatório de Médias
                </CardTitle>
                <CardDescription>
                  Médias calculadas por período do sensor selecionado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingSkeleton />
                ) : medias && Object.keys(medias).length > 0 ? (
                  renderTable(medias)
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Nenhum dado de média encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alertas">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Relatório de Alertas
                </CardTitle>
                <CardDescription>
                  Alertas gerados pelo sensor no período selecionado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingSkeleton />
                ) : alertas && alertas.length > 0 ? (
                  <>
                    {/* Mobile View */}
                    <div className="block lg:hidden space-y-3">
                      {alertas.map((alerta: any) => (
                        <div 
                          key={alerta.id}
                          className="p-4 bg-secondary/30 rounded-lg border border-border/50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge 
                              variant={alerta.nivel === "ALTO" ? "destructive" : "secondary"}
                            >
                              {alerta.nivel}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(alerta.dataHora).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{alerta.mensagem}</p>
                        </div>
                      ))}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden lg:block">
                      <ScrollArea className="h-[300px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data/Hora</TableHead>
                              <TableHead>Mensagem</TableHead>
                              <TableHead>Nível</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alertas.map((alerta: any) => (
                              <TableRow key={alerta.id}>
                                <TableCell className="text-muted-foreground">
                                  {new Date(alerta.dataHora).toLocaleString("pt-BR")}
                                </TableCell>
                                <TableCell>{alerta.mensagem}</TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={alerta.nivel === "ALTO" ? "destructive" : "secondary"}
                                  >
                                    {alerta.nivel}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Nenhum alerta encontrado no período</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
