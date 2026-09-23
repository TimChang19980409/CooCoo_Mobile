import { z } from 'zod';

export const nicknameSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, 'Nickname is required')
    .max(20, 'Nickname must be at most 20 characters'),
});

export const nicknameResponseSchema = z.object({
  nickname: z.string(),
});

export type NicknameFormValues = z.infer<typeof nicknameSchema>;
