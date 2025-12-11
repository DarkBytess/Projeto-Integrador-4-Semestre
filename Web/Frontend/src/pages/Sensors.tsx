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
import { Pencil, Trash2, Plus } from "lucide-react";

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Gestão de Sensores</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Sensor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSensor ? "Editar Sensor" : "Novo Sensor"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Input
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao}
                    onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="limiteMin">Limite Mínimo</Label>
                  <Input
                    id="limiteMin"
                    type="number"
                    value={formData.limiteMin}
                    onChange={(e) => setFormData({ ...formData, limiteMin: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="limiteMax">Limite Máximo</Label>
                  <Input
                    id="limiteMax"
                    type="number"
                    value={formData.limiteMax}
                    onChange={(e) => setFormData({ ...formData, limiteMax: Number(e.target.value) })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingSensor ? "Atualizar" : "Criar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Sensores</CardTitle>
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
                    <TableHead>Descrição</TableHead>
                    <TableHead>Limite Min</TableHead>
                    <TableHead>Limite Max</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sensors.map((sensor) => (
                    <TableRow key={sensor.id}>
                      <TableCell>{sensor.id}</TableCell>
                      <TableCell>{sensor.tipo}</TableCell>
                      <TableCell>{sensor.localizacao}</TableCell>
                      <TableCell>{sensor.descricao}</TableCell>
                      <TableCell>{sensor.limiteMin}</TableCell>
                      <TableCell>{sensor.limiteMax}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(sensor)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Sensors;
