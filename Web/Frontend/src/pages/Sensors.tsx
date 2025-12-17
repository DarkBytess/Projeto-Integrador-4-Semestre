import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiClient, Sensor } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Plus, Radio, MapPin, Gauge } from "lucide-react";

const SENSOR_TYPES = [
  { value: "TEMPERATURA_AR", label: "Temperatura do Ar" },
  { value: "UMIDADE_AR", label: "Umidade do Ar" },
  { value: "PRESSAO", label: "Pressão Atmosférica" },
  { value: "UMIDADE_SOLO", label: "Umidade do Solo" },
  { value: "PH_SOLO", label: "pH do Solo" },
  { value: "NUTRIENTES", label: "Nutrientes" },
  { value: "LUMINOSIDADE", label: "Luminosidade" },
  { value: "INDICE_UV", label: "Índice UV" },
  { value: "CHUVA", label: "Pluviômetro (Chuva)" },
];

const Sensors = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [formData, setFormData] = useState({
    tipo: "",
    localizacao: "",
    descricao: "",
    limiteMin: 0,
    limiteMax: 0,
  });

  useEffect(() => {
    loadSensors();
  }, []);

  const loadSensors = async () => {
    try {
      const data = await apiClient.getSensores();
      setSensors(data);
    } catch (error: any) {
      toast.error("Erro ao carregar sensores: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSensor) {
        await apiClient.updateSensor(editingSensor.id, formData);
        toast.success("Sensor atualizado com sucesso!");
      } else {
        await apiClient.createSensor(formData);
        toast.success("Sensor criado com sucesso!");
      }
      setIsDialogOpen(false);
      resetForm();
      loadSensors();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este sensor?")) return;
    try {
      await apiClient.deleteSensor(id);
      toast.success("Sensor deletado com sucesso!");
      loadSensors();
    } catch (error: any) {
      toast.error("Erro ao deletar sensor: " + error.message);
    }
  };

  const handleEdit = (sensor: Sensor) => {
    setEditingSensor(sensor);
    setFormData({
      tipo: sensor.tipo,
      localizacao: sensor.localizacao,
      descricao: sensor.descricao,
      limiteMin: sensor.limiteMin,
      limiteMax: sensor.limiteMax,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSensor(null);
    setFormData({
      tipo: "",
      localizacao: "",
      descricao: "",
      limiteMin: 0,
      limiteMax: 0,
    });
  };

  const getSensorLabel = (tipo: string) => {
    return SENSOR_TYPES.find(t => t.value === tipo)?.label || tipo;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Radio className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              Gestão de Sensores
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Gerencie os sensores do sistema de monitoramento
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Novo Sensor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>{editingSensor ? "Editar Sensor" : "Novo Sensor"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Sensor</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de sensor" />
                    </SelectTrigger>
                    <SelectContent>
                      {SENSOR_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao}
                    onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                    placeholder="Ex: Estufa A - Setor Norte"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Ex: Sensor de temperatura principal"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="limiteMin">Limite Mínimo</Label>
                    <Input
                      id="limiteMin"
                      type="number"
                      value={formData.limiteMin}
                      onChange={(e) => setFormData({ ...formData, limiteMin: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limiteMax">Limite Máximo</Label>
                    <Input
                      id="limiteMax"
                      type="number"
                      value={formData.limiteMax}
                      onChange={(e) => setFormData({ ...formData, limiteMax: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingSensor ? "Atualizar" : "Criar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{sensors.length}</div>
              <p className="text-xs text-muted-foreground">Total de Sensores</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">
                {new Set(sensors.map(s => s.tipo)).size}
              </div>
              <p className="text-xs text-muted-foreground">Tipos Diferentes</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-500">
                {new Set(sensors.map(s => s.localizacao)).size}
              </div>
              <p className="text-xs text-muted-foreground">Localizações</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-500">
                {sensors.length > 0 ? "Ativos" : "-"}
              </div>
              <p className="text-xs text-muted-foreground">Status</p>
            </CardContent>
          </Card>
        </div>

        {/* Table Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lista de Sensores</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : sensors.length === 0 ? (
              <div className="text-center py-12">
                <Radio className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhum sensor cadastrado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comece adicionando um novo sensor para monitorar
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Sensor
                </Button>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="block lg:hidden space-y-3">
                  {sensors.map((sensor) => (
                    <div 
                      key={sensor.id}
                      className="p-4 bg-secondary/30 rounded-lg border border-border/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Badge variant="outline" className="mb-2">{getSensorLabel(sensor.tipo)}</Badge>
                          <h4 className="font-medium text-foreground">{sensor.localizacao}</h4>
                          <p className="text-sm text-muted-foreground">{sensor.descricao}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">#{sensor.id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Gauge className="w-3 h-3" />
                          <span>Min: {sensor.limiteMin} | Max: {sensor.limiteMax}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(sensor)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(sensor.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden lg:block">
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">ID</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead className="hidden xl:table-cell">Descrição</TableHead>
                          <TableHead className="text-center">Limite Min</TableHead>
                          <TableHead className="text-center">Limite Max</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sensors.map((sensor) => (
                          <TableRow key={sensor.id}>
                            <TableCell className="font-mono text-muted-foreground">#{sensor.id}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{getSensorLabel(sensor.tipo)}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                {sensor.localizacao}
                              </div>
                            </TableCell>
                            <TableCell className="hidden xl:table-cell text-muted-foreground">
                              {sensor.descricao}
                            </TableCell>
                            <TableCell className="text-center">{sensor.limiteMin}</TableCell>
                            <TableCell className="text-center">{sensor.limiteMax}</TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEdit(sensor)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => handleDelete(sensor.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
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

export default Sensors;
