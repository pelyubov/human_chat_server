import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: '*'
  });
  app.use((req: Request, res, next) => {
    console.log(req.headers);
    // console.log(req);
    next();
  });
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

main();
