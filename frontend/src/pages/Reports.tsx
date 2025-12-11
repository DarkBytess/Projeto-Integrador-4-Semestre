import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiClient, Sensor } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart3, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Reports = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string | undefined>();
  const [tendencias, setTendencias] = useState<any>(null);
  const [medias, setMedias] = useState<any>(null);
  const [alertas, setAlertas] = useState<any>(null);
  const [dias, setDias] = useState("7");
  const [periodo, setPeriodo] = useState("dia");
  const [loading, setLoading] = useState(true);

  const inicio = new Date(new Date().setDate(new Date().getDate() - parseInt(dias))).toISOString();
  const fim = new Date().toISOString();

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const sensorsData = await apiClient.getSensores();
        setSensors(sensorsData);
        if (sensorsData.length > 0) {
          setSelectedSensor(String(sensorsData[0].id));
        }
      } catch (error: any) {
        toast.error("Erro ao carregar sensores: " + error.message);
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

  const renderTable = (data: any) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(data).map(([key, value]) => (
          <TableRow key={key}>
            <TableCell>{key}</TableCell>
            <TableCell className="text-right">{String(value)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>

        <div className="flex items-center space-x-2">
          <Select value={selectedSensor} onValueChange={setSelectedSensor}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecione um sensor" />
            </SelectTrigger>
            <SelectContent>
              {sensors.map((sensor) => (
                <SelectItem key={sensor.id} value={String(sensor.id)}>
                  {sensor.tipo} - {sensor.localizacao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="tendencias" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tendencias">
              <TrendingUp className="mr-2 h-4 w-4" />
              Tendências
            </TabsTrigger>
            <TabsTrigger value="medias">
              <BarChart3 className="mr-2 h-4 w-4" />
              Médias
            </TabsTrigger>
            <TabsTrigger value="alertas">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Alertas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tendencias">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Tendências</CardTitle>
                <CardDescription>Análise de tendências dos dados do sensor.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Select value={dias} onValueChange={setDias}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecionar dias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="15">Últimos 15 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {loading ? (
                  <p>Carregando...</p>
                ) : (
                  renderTable(tendencias)
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medias">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Médias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Select value={dias} onValueChange={setDias}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecionar dias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="15">Últimos 15 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {loading ? (
                  <p>Carregando...</p>
                ) : (
                  renderTable(medias)
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alertas">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Alertas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Select value={dias} onValueChange={setDias}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecionar dias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="15">Últimos 15 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {loading ? (
                  <p>Carregando...</p>
                ) : (
                  alertas && alertas.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Mensagem</TableHead>
                          <TableHead>Nível</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alertas.map((alerta: any) => (
                          <TableRow key={alerta.id}>
                            <TableCell>{new Date(alerta.dataHora).toLocaleString()}</TableCell>
                            <TableCell>{alerta.mensagem}</TableCell>
                            <TableCell>{alerta.nivel}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p>Nenhum alerta encontrado.</p>
                  )
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
