import {
  BadRequestException,
  ConsoleLogger,
  HttpException,
  InternalServerErrorException
} from '@nestjs/common';
import { ZodError } from 'zod';
import { formatError } from './helpers';
import { LongParseError } from './errors/LongParseError';

export function controllerErrorHandler(e: any, logger: ConsoleLogger, context: string) {
  if (e instanceof ZodError) {
    throw new BadRequestException({ error: formatError(e) });
  }
  if (e instanceof HttpException || e instanceof LongParseError) {
    throw e;
  }
  logger.error(e, context);
  throw new InternalServerErrorException();
}
