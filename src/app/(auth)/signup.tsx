import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { AuthShell } from '@/components/auth/AuthShell';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth/AuthContext';

const schema = z.object({
  displayName: z.string().min(1, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function SignupScreen() {
  const theme = useTheme();
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
    <AuthShell mode="signup">
      {formError ? (
        <View style={{ backgroundColor: theme.clayLight, borderRadius: 9, padding: 12, marginBottom: 16 }}>
          <ThemedText type="small" style={{ color: theme.danger }}>
            {formError}
          </ThemedText>
        </View>
      ) : null}

      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Full name" placeholder="e.g. Jomin George" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.displayName?.message} />
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

      <View style={{ height: 8 }} />
      <Button label="Create account" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
    </AuthShell>
  );
}
