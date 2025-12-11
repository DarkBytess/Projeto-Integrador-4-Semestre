import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, borderRadius, fontSize } from '../../lib/theme';
import { API_BASE_URL } from '../../lib/api';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (mode === 'register' && !nome) {
      Alert.alert('Erro', 'Preencha seu nome');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, senha);
      } else {
        await register(nome, email, senha);
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.message || 'Erro ao processar sua solicitação'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setNome('');
    setEmail('');
    setSenha('');
  };

  const handleGoogleLogin = async () => {
    try {
      // OAuth2 precisa usar localhost:8080 pois é o que está configurado no Google Console
      // O backend redirecionará de volta para o mobile após autenticação
      const googleAuthUrl = 'http://localhost:8080/oauth2/authorization/google';
      
      if (Platform.OS === 'web') {
        // Na web, redireciona diretamente
        window.location.href = googleAuthUrl;
      } else {
        // Em dispositivos móveis, abre no navegador
        const canOpen = await Linking.canOpenURL(googleAuthUrl);
        if (canOpen) {
          await Linking.openURL(googleAuthUrl);
        } else {
          Alert.alert('Erro', 'Não foi possível abrir o navegador');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao iniciar login com Google');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="leaf" size={40} color={colors.card} />
          </View>
          <Text style={styles.title}>AgroMonitor</Text>
          <Text style={styles.subtitle}>
            Monitoramento e controle em tempo real
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => setMode('login')}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'login' && styles.tabTextActive,
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'register' && styles.tabActive]}
              onPress={() => setMode('register')}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'register' && styles.tabTextActive,
                ]}
              >
                Cadastro
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome completo"
                  value={nome}
                  onChangeText={setNome}
                  editable={!isLoading}
                  autoCapitalize="words"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.buttonText}>
                  {mode === 'login' ? 'Entrar' : 'Cadastrar'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Divisor */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Botão Google */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.googleButtonText}>
                Continuar com Google
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.text,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.sm,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  passwordInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  eyeButton: {
    padding: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.card,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  googleButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
});
