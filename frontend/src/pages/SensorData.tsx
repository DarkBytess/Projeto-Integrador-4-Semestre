import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiClient, SensorData, Sensor } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Dados dos Sensores</h1>
          <Select value={selectedSensor} onValueChange={setSelectedSensor}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filtrar por sensor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Sensores</SelectItem>
              {sensors.map((sensor) => (
                <SelectItem key={sensor.id} value={sensor.id.toString()}>
                  {sensor.tipo} - {sensor.localizacao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Dados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => {
                    const sensor = sensors.find((s) => s.id === item.sensorId);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{sensor?.tipo || "N/A"}</TableCell>
                        <TableCell>{sensor?.localizacao || "N/A"}</TableCell>
                        <TableCell>{item.valor}</TableCell>
                        <TableCell>{new Date(item.dataHora).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SensorDataPage;