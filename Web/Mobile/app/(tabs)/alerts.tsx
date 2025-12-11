import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient, Alerta } from '../../lib/api';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';

export default function AlertsScreen() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const loadAlertas = useCallback(async () => {
    try {
      setLoading(true);
      let data: Alerta[];
      
      if (showAll) {
        data = await apiClient.getAlertas();
      } else {
        data = await apiClient.getAlertasAtivos();
      }
      
      setAlertas(data);
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  }, [showAll]);

  useEffect(() => {
    loadAlertas();
  }, [loadAlertas]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAlertas();
    setRefreshing(false);
  }, [loadAlertas]);

  const handleEncerrar = async (alerta: Alerta) => {
    Alert.alert(
      'Encerrar Alerta',
      'Deseja realmente encerrar este alerta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Encerrar',
          onPress: async () => {
            try {
              await apiClient.encerrarAlerta(alerta.id);
              Alert.alert('Sucesso', 'Alerta encerrado com sucesso!');
              loadAlertas();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao encerrar alerta');
            }
          },
        },
      ]
    );
  };

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

  const getNivelIcon = (nivel: string): keyof typeof Ionicons.glyphMap => {
    switch (nivel) {
      case 'CRITICO':
      case 'ALTO':
        return 'alert-circle';
      case 'MEDIO':
        return 'warning';
      case 'BAIXO':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alertas</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {alertas.filter(a => a.ativo).length} ativos
          </Text>
        </View>
      </View>

      {/* Filtro */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, !showAll && styles.filterButtonActive]}
          onPress={() => setShowAll(false)}
        >
          <Text style={[styles.filterText, !showAll && styles.filterTextActive]}>
            Apenas Ativos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, showAll && styles.filterButtonActive]}
          onPress={() => setShowAll(true)}
        >
          <Text style={[styles.filterText, showAll && styles.filterTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Alertas */}
      {loading && alertas.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
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
          {alertas.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={64} color={colors.success} />
              <Text style={styles.emptyTitle}>
                {showAll ? 'Nenhum alerta encontrado' : 'Nenhum alerta ativo'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {showAll 
                  ? 'Os alertas aparecerão aqui' 
                  : 'Todos os alertas foram resolvidos'}
              </Text>
            </View>
          ) : (
            alertas.map((alerta) => (
              <View
                key={alerta.id}
                style={[
                  styles.alertCard,
                  !alerta.ativo && styles.alertCardInactive,
                ]}
              >
                <View style={styles.alertHeader}>
                  <View
                    style={[
                      styles.alertBadge,
                      { backgroundColor: getNivelColor(alerta.nivel) },
                    ]}
                  >
                    <Ionicons
                      name={getNivelIcon(alerta.nivel)}
                      size={14}
                      color={colors.card}
                    />
                    <Text style={styles.alertBadgeText}>{alerta.nivel}</Text>
                  </View>
                  
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: alerta.ativo ? colors.success : colors.textMuted },
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {alerta.ativo ? 'Ativo' : 'Encerrado'}
                    </Text>
                  </View>
                </View>

                <View style={styles.alertContent}>
                  <View style={styles.alertTypeContainer}>
                    <Ionicons name="pricetag" size={14} color={colors.textSecondary} />
                    <Text style={styles.alertType}>{alerta.tipo}</Text>
                  </View>
                  
                  <Text style={styles.alertMessage}>{alerta.mensagem}</Text>
                  
                  <View style={styles.alertTimeContainer}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.alertTime}>
                      {new Date(alerta.dataHora).toLocaleString('pt-BR')}
                    </Text>
                  </View>
                </View>

                {alerta.ativo && (
                  <TouchableOpacity
                    style={styles.encerrarButton}
                    onPress={() => handleEncerrar(alerta)}
                  >
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    <Text style={styles.encerrarButtonText}>Encerrar Alerta</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.warning,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: colors.card,
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.card,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  alertCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertCardInactive: {
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  alertContent: {
    marginBottom: spacing.md,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  alertType: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  alertMessage: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  alertTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  alertTime: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  encerrarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  encerrarButtonText: {
    color: colors.success,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
