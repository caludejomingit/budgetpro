import { zodResolver } from '@hookform/resolvers/zod';
import { Feather } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChartColors } from '@/constants/theme';
import { useAuth } from '@/lib/auth/AuthContext';

const schema = z.object({
  displayName: z.string().min(1, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { displayName: '', email: '', password: '' } });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    const { error } = await signUp(values.email, values.password, values.displayName);
    if (error) setFormError(error);
    else router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <Feather name="pie-chart" size={36} color={ChartColors.light.accent} />
        </View>
        <ThemedText type="title" style={styles.title}>
          Create account
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Start tracking your income and expenses.
        </ThemedText>

        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Name" placeholder="Your name" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.displayName?.message} />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              placeholder="At least 6 characters"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        {formError ? (
          <ThemedText style={{ color: ChartColors.light.expense, marginBottom: 8 }}>{formError}</ThemedText>
        ) : null}

        <View style={styles.spacer} />
        <Button label="Sign up" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

        <View style={styles.footer}>
          <ThemedText themeColor="textSecondary">Already have an account? </ThemedText>
          <Link href="/(auth)/login">
            <ThemedText style={{ color: ChartColors.light.accent, fontWeight: '600' }}>Log in</ThemedText>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, marginBottom: 4 },
  subtitle: { marginBottom: 32 },
  spacer: { height: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});
