import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import AlertsList from "@/components/AlertsList";
import SensorsList from "@/components/SensorsList";
import ChartCard from "@/components/ChartCard";
import EmptyState from "@/components/EmptyState";
import { StatCardSkeleton, ChartSkeleton } from "@/components/Skeletons";
import { apiClient, Sensor, SensorData, Alerta } from "@/lib/api";
import { 
  AlertCircle, 
  Radio, 
  TrendingUp, 
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

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

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSensores: 0,
    alertasAtivos: 0,
    totalLeituras: 0,
  });

  const [sensoresPorTipo, setSensoresPorTipo] = useState<any[]>([]);
  const [leiturasPorDia, setLeiturasPorDia] = useState<any[]>([]);
  const [alertasPorNivel, setAlertasPorNivel] = useState<any[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [sensores, alertas, dados] = await Promise.all([
        apiClient.getSensores(),
        apiClient.getAlertasAtivos(),
        apiClient.getDados(),
      ]);

      // Stats
      setStats({
        totalSensores: sensores.length,
        alertasAtivos: alertas.length,
        totalLeituras: dados.length,
      });

      // Sensores por tipo
      const tipoCount = sensores.reduce((acc: Record<string, number>, sensor: Sensor) => {
        const tipo = sensor.tipo || "Outros";
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});

      setSensoresPorTipo(
        Object.entries(tipoCount).map(([name, value]) => ({
          name: SENSOR_LABELS[name] || name,
          value,
          fullName: name,
        }))
      );

      // Leituras por dia (últimos 7 dias)
      const hoje = new Date();
      const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(hoje);
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });

      const leiturasPorData = dados.reduce((acc: Record<string, number>, dado: SensorData) => {
        const data = dado.dataHora?.split("T")[0];
        if (data && ultimos7Dias.includes(data)) {
          acc[data] = (acc[data] || 0) + 1;
        }
        return acc;
      }, {});

      setLeiturasPorDia(
        ultimos7Dias.map((data) => ({
          name: new Date(data).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }),
          leituras: leiturasPorData[data] || 0,
        }))
      );

      // Alertas por nível
      const nivelCount = alertas.reduce((acc: Record<string, number>, alerta: Alerta) => {
        const nivel = alerta.nivel || "BAIXO";
        acc[nivel] = (acc[nivel] || 0) + 1;
        return acc;
      }, {});

      const nivelOrder = ["ALTO", "MEDIO", "BAIXO"];
      setAlertasPorNivel(
        nivelOrder
          .filter((nivel) => nivelCount[nivel])
          .map((nivel) => ({
            name: nivel,
            value: nivelCount[nivel],
          }))
      );
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Dashboard</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Visão geral do sistema de monitoramento
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
            Dashboard
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Visão geral do sistema de monitoramento de sensores agrícolas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            title="Sensores Ativos"
            value={stats.totalSensores}
            icon={Radio}
            description="Dispositivos conectados"
            trend="neutral"
          />
          <StatCard
            title="Alertas Ativos"
            value={stats.alertasAtivos}
            icon={AlertCircle}
            description={stats.alertasAtivos > 0 ? "Requer atenção imediata" : "Sistema estável"}
            trend={stats.alertasAtivos > 0 ? "up" : "neutral"}
          />
          <StatCard
            title="Total de Leituras"
            value={stats.totalLeituras.toLocaleString("pt-BR")}
            icon={TrendingUp}
            description="Dados coletados"
            trend="neutral"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Leituras por Dia */}
          <ChartCard title="Leituras dos Últimos 7 Dias" icon={LineChartIcon}>
            {leiturasPorDia.some(d => d.leituras > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={leiturasPorDia} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeituras" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="leituras"
                    name="Leituras"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLeituras)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="Sem dados de leituras"
                description="Nenhuma leitura registrada nos últimos 7 dias"
                variant="info"
              />
            )}
          </ChartCard>

          {/* Sensores por Tipo */}
          <ChartCard title="Sensores por Tipo" icon={PieChartIcon}>
            {sensoresPorTipo.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={sensoresPorTipo}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {sensoresPorTipo.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="Nenhum sensor cadastrado"
                description="Adicione sensores para visualizar a distribuição"
                variant="info"
              />
            )}
          </ChartCard>
        </div>

        {/* Charts Row 2 - Alertas por Nível, Alertas Ativos e Sensores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Alertas por Nível */}
          <ChartCard title="Alertas por Nível" icon={AlertCircle} className="h-[360px]">
            {alertasPorNivel.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={alertasPorNivel} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Alertas" radius={[0, 4, 4, 0]}>
                    {alertasPorNivel.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "ALTO" ? "#ef4444" :
                          entry.name === "MEDIO" ? "#f59e0b" : "#22c55e"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="Nenhum alerta"
                description="Sistema funcionando normalmente"
                variant="success"
              />
            )}
          </ChartCard>

          {/* Alertas Ativos */}
          <div className="h-[360px]">
            <AlertsList maxItems={4} />
          </div>

          {/* Sensores */}
          <div className="h-[360px]">
            <SensorsList compact maxItems={4} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
