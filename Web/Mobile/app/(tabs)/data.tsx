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
import { Picker } from '@react-native-picker/picker';
import { apiClient, Sensor, SensorData } from '../../lib/api';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';

export default function DataScreen() {
  const [data, setData] = useState<SensorData[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSensors = useCallback(async () => {
    try {
      const sensorsData = await apiClient.getSensores();
      setSensors(sensorsData);
    } catch (error: any) {
      console.error('Erro ao carregar sensores:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      let sensorData: SensorData[];
      
      if (selectedSensor !== 'all') {
        sensorData = await apiClient.getDadosBySensor(Number(selectedSensor));
      } else {
        sensorData = await apiClient.getDados();
      }
      
      setData(sensorData);
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [selectedSensor]);

  useEffect(() => {
    loadSensors();
  }, [loadSensors]);

  useEffect(() => {
    loadData();
  }, [loadData, selectedSensor]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleDelete = (item: SensorData) => {
    Alert.alert(
      'Confirmar exclusão',
      'Deseja realmente excluir este dado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.deleteDado(item.id);
              Alert.alert('Sucesso', 'Dado excluído com sucesso!');
              loadData();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao excluir dado');
            }
          },
        },
      ]
    );
  };

  const getSensorInfo = (item: SensorData) => {
    if (item.sensor) {
      return {
        tipo: item.sensor.tipo,
        localizacao: item.sensor.localizacao,
      };
    }
    const sensor = sensors.find((s) => s.id === item.sensorId);
    return {
      tipo: sensor?.tipo || 'N/A',
      localizacao: sensor?.localizacao || 'N/A',
    };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dados dos Sensores</Text>
      </View>

      {/* Filtro */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por sensor:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSensor}
            onValueChange={(value) => setSelectedSensor(value)}
            style={styles.picker}
          >
            <Picker.Item label="Todos os Sensores" value="all" />
            {sensors.map((sensor) => (
              <Picker.Item
                key={sensor.id}
                label={`${sensor.tipo} - ${sensor.localizacao}`}
                value={String(sensor.id)}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Lista de Dados */}
      {loading && data.length === 0 ? (
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
          {data.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="analytics-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>Nenhum dado encontrado</Text>
              <Text style={styles.emptySubtitle}>
                Os dados dos sensores aparecerão aqui
              </Text>
            </View>
          ) : (
            data.map((item) => {
              const sensorInfo = getSensorInfo(item);
              return (
                <View key={item.id} style={styles.dataCard}>
                  <View style={styles.dataHeader}>
                    <View style={styles.dataIcon}>
                      <Ionicons name="pulse" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.dataInfo}>
                      <Text style={styles.dataTipo}>{sensorInfo.tipo}</Text>
                      <Text style={styles.dataLocal}>{sensorInfo.localizacao}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item)}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dataContent}>
                    <View style={styles.valorContainer}>
                      <Text style={styles.valorLabel}>Valor</Text>
                      <Text style={styles.valorText}>{item.valor}</Text>
                    </View>
                    <View style={styles.dataTimeContainer}>
                      <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.dataTime}>
                        {new Date(item.dataHora).toLocaleString('pt-BR')}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
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
  filterContainer: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  pickerContainer: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: colors.text,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: spacing.sm,
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
  dataCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dataIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  dataInfo: {
    flex: 1,
  },
  dataTipo: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  dataLocal: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  dataContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valorContainer: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  valorLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  valorText: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  dataTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dataTime: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
