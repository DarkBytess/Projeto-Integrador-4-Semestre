import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient, Sensor } from '../../lib/api';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';

export default function SensorsScreen() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    tipo: '',
    localizacao: '',
    descricao: '',
    limiteMin: '',
    limiteMax: '',
  });

  const loadSensors = useCallback(async () => {
    try {
      const data = await apiClient.getSensores();
      setSensors(data);
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao carregar sensores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSensors();
  }, [loadSensors]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSensors();
    setRefreshing(false);
  }, [loadSensors]);

  const resetForm = () => {
    setFormData({
      tipo: '',
      localizacao: '',
      descricao: '',
      limiteMin: '',
      limiteMax: '',
    });
    setEditingSensor(null);
  };

  const openModal = (sensor?: Sensor) => {
    if (sensor) {
      setEditingSensor(sensor);
      setFormData({
        tipo: sensor.tipo,
        localizacao: sensor.localizacao,
        descricao: sensor.descricao,
        limiteMin: String(sensor.limiteMin),
        limiteMax: String(sensor.limiteMax),
      });
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!formData.tipo || !formData.localizacao || !formData.descricao) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      const sensorData = {
        tipo: formData.tipo,
        localizacao: formData.localizacao,
        descricao: formData.descricao,
        limiteMin: Number(formData.limiteMin) || 0,
        limiteMax: Number(formData.limiteMax) || 100,
      };

      if (editingSensor) {
        await apiClient.updateSensor(editingSensor.id, sensorData);
        Alert.alert('Sucesso', 'Sensor atualizado com sucesso!');
      } else {
        await apiClient.createSensor(sensorData);
        Alert.alert('Sucesso', 'Sensor criado com sucesso!');
      }

      closeModal();
      loadSensors();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao salvar sensor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (sensor: Sensor) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente excluir o sensor "${sensor.tipo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.deleteSensor(sensor.id);
              Alert.alert('Sucesso', 'Sensor excluído com sucesso!');
              loadSensors();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao excluir sensor');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestão de Sensores</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Ionicons name="add" size={24} color={colors.card} />
        </TouchableOpacity>
      </View>

      {/* Lista de Sensores */}
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
        {sensors.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="radio-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhum sensor cadastrado</Text>
            <Text style={styles.emptySubtitle}>
              Toque no botão + para adicionar um novo sensor
            </Text>
          </View>
        ) : (
          sensors.map((sensor) => (
            <View key={sensor.id} style={styles.sensorCard}>
              <View style={styles.sensorHeader}>
                <View style={styles.sensorIcon}>
                  <Ionicons name="hardware-chip" size={24} color={colors.primary} />
                </View>
                <View style={styles.sensorInfo}>
                  <Text style={styles.sensorTipo}>{sensor.tipo}</Text>
                  <Text style={styles.sensorId}>ID: {sensor.id}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openModal(sensor)}
                  >
                    <Ionicons name="pencil" size={18} color={colors.info} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(sensor)}
                  >
                    <Ionicons name="trash" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.sensorDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{sensor.localizacao}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="document-text" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{sensor.descricao}</Text>
                </View>
              </View>

              <View style={styles.limiteContainer}>
                <View style={styles.limiteBox}>
                  <Text style={styles.limiteLabel}>Limite Mín</Text>
                  <Text style={styles.limiteValue}>{sensor.limiteMin}</Text>
                </View>
                <View style={styles.limiteBox}>
                  <Text style={styles.limiteLabel}>Limite Máx</Text>
                  <Text style={styles.limiteValue}>{sensor.limiteMax}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de Criação/Edição */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingSensor ? 'Editar Sensor' : 'Novo Sensor'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.tipo}
                  onChangeText={(text) =>
                    setFormData({ ...formData, tipo: text })
                  }
                  placeholder="Ex: Temperatura, Umidade"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Localização *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.localizacao}
                  onChangeText={(text) =>
                    setFormData({ ...formData, localizacao: text })
                  }
                  placeholder="Ex: Campo Norte, Estufa 1"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.descricao}
                  onChangeText={(text) =>
                    setFormData({ ...formData, descricao: text })
                  }
                  placeholder="Descrição do sensor"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Limite Mínimo</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.limiteMin}
                    onChangeText={(text) =>
                      setFormData({ ...formData, limiteMin: text })
                    }
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ width: spacing.md }} />

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Limite Máximo</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.limiteMax}
                    onChangeText={(text) =>
                      setFormData({ ...formData, limiteMax: text })
                    }
                    placeholder="100"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.card} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editingSensor ? 'Atualizar' : 'Criar'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
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
  sensorCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sensorIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorTipo: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  sensorId: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
  },
  sensorDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  limiteContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  limiteBox: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  limiteLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  limiteValue: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalForm: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.card,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
