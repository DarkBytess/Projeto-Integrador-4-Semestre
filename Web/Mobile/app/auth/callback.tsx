import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, fontSize } from '../../lib/theme';

export default function AuthCallback() {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const params = useLocalSearchParams<{
    token?: string;
    email?: string;
    nome?: string;
    role?: string;
  }>();

  useEffect(() => {
    const handleCallback = async () => {
      const { token } = params;

      if (token) {
        try {
          await loginWithToken(token);
          router.replace('/(tabs)');
        } catch (error) {
          console.error('Erro ao processar callback:', error);
          router.replace('/(auth)/login');
        }
      } else {
        router.replace('/(auth)/login');
      }
    };

    handleCallback();
  }, [params, router, loginWithToken]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Autenticando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
