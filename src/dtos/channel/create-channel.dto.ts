import { z } from 'zod';
import { channelNameValidator } from '../validators';

export const ChanCreationDto = z.object({
  name: channelNameValidator,
  users: z
    .array(z.string())
    .nonempty('Channel must have at least one user.')
    .refine((v) => v.every((_) => /^\d+$/.test(_)), 'Invalid user ID(s).')
});

export type IChanCreationDto = z.infer<typeof ChanCreationDto>;
