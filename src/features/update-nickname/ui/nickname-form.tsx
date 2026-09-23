import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/shared/ui';

import { submitNickname } from '../api/update-nickname';
import { type NicknameFormValues, nicknameSchema } from '../model/nickname';

export function NicknameForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NicknameFormValues>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: { nickname: '' },
  });
  const mutation = useMutation({
    mutationFn: submitNickname,
  });

  return (
    <>
      <Controller
        control={control}
        name="nickname"
        render={({ field }) => (
          <TextInput
            testID="nickname-input"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoCapitalize="none"
            style={styles.input}
          />
        )}
      />
      {errors.nickname?.message ? (
        <ThemedText type="small">{errors.nickname.message}</ThemedText>
      ) : null}
      <Pressable
        testID="nickname-submit"
        onPress={handleSubmit((values) => {
          mutation.mutate(values.nickname);
        })}
      >
        <ThemedText type="smallBold">Save nickname</ThemedText>
      </Pressable>
      {mutation.isSuccess ? (
        <ThemedText type="small">Saved {mutation.data.nickname}</ThemedText>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    alignSelf: 'stretch',
    minHeight: 44,
  },
});
