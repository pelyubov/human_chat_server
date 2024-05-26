import { z } from 'zod';
import { channelNameValidator } from '../validators';

export const UpdateChanDto = z.object({
  name: channelNameValidator.optional()
});

export type IUpdateUserDto = z.infer<typeof UpdateChanDto>;
