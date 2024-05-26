import { z } from 'zod';

export const IncomingMessageDto = z.object({
  content: z
    .string()
    .min(1, 'Cannot send an empty message.')
    .max(2000, 'A message cannot be longer than 2000 characters.'),
  replyTo: z
    .string()
    .refine((_) => /^\d+$/.test(_), 'Invalid message ID.')
    .optional()
});

export type IIncomingMessageDto = z.infer<typeof IncomingMessageDto>;
