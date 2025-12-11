import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import AlertsList from "@/components/AlertsList";
import SensorsList from "@/components/SensorsList";
import { apiClient } from "@/lib/api";
import { Activity, AlertCircle, Radio, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";

const Index = () => {
  const [stats, setStats] = useState({
    totalSensores: 0,
    alertasAtivos: 0,
    totalLeituras: 0,
  });

  const [leiturasData, setLeiturasData] = useState([]);
  const [sensoresData, setSensoresData] = useState([]);
  const [alertasData, setAlertasData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      await loadStats();
      await loadSensoresData();
      await loadAlertasData();
    };
    fetchData();
  }, []);

  const loadStats = async () => {
    try {
      const [sensores, alertas, dados] = await Promise.all([
        apiClient.getSensores(),
        apiClient.getAlertasAtivos(),
        apiClient.getDados(),
      ]);

      setStats({
        totalSensores: sensores.length,
        alertasAtivos: alertas.length,
        totalLeituras: dados.length,
      });

      // Atualizar leiturasData com dados reais
      const leiturasPorMes = dados.reduce((acc, leitura) => {
        const mes = new Date(leitura.timestamp).toLocaleString("default", { month: "short" });
        acc[mes] = (acc[mes] || 0) + 1;
        return acc;
      }, {});

      const leiturasArray = Object.keys(leiturasPorMes).map((key) => ({
        name: key,
        leituras: leiturasPorMes[key],
      }));

      setLeiturasData(leiturasArray);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const loadSensoresData = async () => {
    try {
      const sensores = await apiClient.getSensores();
      const categorias = sensores.reduce((acc, sensor) => {
        acc[sensor.categoria] = (acc[sensor.categoria] || 0) + 1;
        return acc;
      }, {});

      const data = Object.keys(categorias).map((key) => ({
        name: key,
        count: categorias[key],
      }));

      setSensoresData(data);
    } catch (error) {
      console.error("Erro ao carregar dados dos sensores:", error);
    }
  };

  const loadAlertasData = async () => {
    try {
      const alertas = await apiClient.getAlertasAtivos();
      const ativos = alertas.length;
      const inativos = stats.totalSensores - ativos;

      setAlertasData([
        { name: "Ativos", value: ativos },
        { name: "Inativos", value: inativos },
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados dos alertas:", error);
    }
  };

  const COLORS = ["#0088FE", "#FF8042"];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do sistema de monitoramento de sensores
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Sensores Ativos"
            value={stats.totalSensores}
            icon={Radio}
            description="Todos operacionais"
            trend="neutral"
          />
          <StatCard
            title="Alertas Ativos"
            value={stats.alertasAtivos}
            icon={AlertCircle}
            description={stats.alertasAtivos > 0 ? "Requer atenção" : "Tudo normal"}
            trend={stats.alertasAtivos > 0 ? "up" : "neutral"}
          />
          <StatCard
            title="Leituras Registradas"
            value={stats.totalLeituras}
            icon={TrendingUp}
            description="Total acumulado"
            trend="neutral"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertsList />
          <div className="space-y-6">
            <SensorsList />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Leituras ao longo do tempo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={leiturasData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="leituras" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Sensores por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sensoresData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Proporção de Alertas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={alertasData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {alertasData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
