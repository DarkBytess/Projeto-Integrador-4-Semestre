import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient, Sensor, Alerta } from '../../lib/api';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';

interface Stats {
  totalSensores: number;
  alertasAtivos: number;
  totalLeituras: number;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalSensores: 0,
    alertasAtivos: 0,
    totalLeituras: 0,
  });
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [sensoresData, alertasData, dadosData] = await Promise.all([
        apiClient.getSensores(),
        apiClient.getAlertasAtivos(),
        apiClient.getDados(),
      ]);

      setSensores(sensoresData);
      setAlertas(alertasData);
      setStats({
        totalSensores: sensoresData.length,
        alertasAtivos: alertasData.length,
        totalLeituras: dadosData.length,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'CRITICO':
        return colors.alertCritico;
      case 'ALTO':
        return colors.alertAlto;
      case 'MEDIO':
        return colors.alertMedio;
      case 'BAIXO':
        return colors.alertBaixo;
      default:
        return colors.textSecondary;
    }
  };

  const handleEncerrarAlerta = async (id: number) => {
    try {
      await apiClient.encerrarAlerta(id);
      loadData();
    } catch (error) {
      console.error('Erro ao encerrar alerta:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.nome?.split(' ')[0] || 'Usuário'}!</Text>
          <Text style={styles.headerSubtitle}>Bem-vindo ao AgroMonitor</Text>
        </View>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.nome?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="radio" size={24} color={colors.card} />
            </View>
            <Text style={styles.statValue}>{stats.totalSensores}</Text>
            <Text style={styles.statLabel}>Sensores</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.warning }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="alert-circle" size={24} color={colors.card} />
            </View>
            <Text style={styles.statValue}>{stats.alertasAtivos}</Text>
            <Text style={styles.statLabel}>Alertas</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.info }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-up" size={24} color={colors.card} />
            </View>
            <Text style={styles.statValue}>{stats.totalLeituras}</Text>
            <Text style={styles.statLabel}>Leituras</Text>
          </View>
        </View>

        {/* Alertas Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alertas Ativos</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{alertas.length}</Text>
            </View>
          </View>

          {alertas.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
              <Text style={styles.emptyText}>Nenhum alerta ativo</Text>
            </View>
          ) : (
            alertas.slice(0, 5).map((alerta) => (
              <View key={alerta.id} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <View
                    style={[
                      styles.alertBadge,
                      { backgroundColor: getNivelColor(alerta.nivel) },
                    ]}
                  >
                    <Ionicons name="warning" size={12} color={colors.card} />
                    <Text style={styles.alertBadgeText}>{alerta.nivel}</Text>
                  </View>
                  <Text style={styles.alertTime}>
                    {new Date(alerta.dataHora).toLocaleString('pt-BR')}
                  </Text>
                </View>
                <Text style={styles.alertMessage}>{alerta.mensagem}</Text>
                <TouchableOpacity
                  style={styles.encerrarButton}
                  onPress={() => handleEncerrarAlerta(alerta.id)}
                >
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                  <Text style={styles.encerrarButtonText}>Encerrar</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Sensores Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sensores Recentes</Text>

          {sensores.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="radio-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhum sensor cadastrado</Text>
            </View>
          ) : (
            sensores.slice(0, 5).map((sensor) => (
              <View key={sensor.id} style={styles.sensorCard}>
                <View style={styles.sensorIcon}>
                  <Ionicons name="hardware-chip" size={24} color={colors.primary} />
                </View>
                <View style={styles.sensorInfo}>
                  <Text style={styles.sensorTipo}>{sensor.tipo}</Text>
                  <Text style={styles.sensorLocal}>{sensor.localizacao}</Text>
                </View>
                <View style={styles.sensorLimites}>
                  <Text style={styles.limiteText}>
                    Min: {sensor.limiteMin}
                  </Text>
                  <Text style={styles.limiteText}>
                    Max: {sensor.limiteMax}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.card,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.card,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.card,
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
  },
  badgeText: {
    color: colors.card,
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
  },
  emptyText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  alertCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  alertBadgeText: {
    color: colors.card,
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  alertTime: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  alertMessage: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  encerrarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  encerrarButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  sensorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sensorIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorTipo: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  sensorLocal: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  sensorLimites: {
    alignItems: 'flex-end',
  },
  limiteText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
