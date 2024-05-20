import { z } from 'zod';

export const IncomingMessageDto = z.object({
  content: z
    .string()
    .min(1, 'Cannot send an empty message')
    .max(2000, 'A message cannot be longer than 2000 characters'),
  replyTo: z.bigint().nullable()
});

export type IIncomingMessageDto = z.infer<typeof IncomingMessageDto>;
