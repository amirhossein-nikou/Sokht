import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerConfig } from './common/config/swagger.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import bodyParser, { json } from 'body-parser';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule,{
    bodyParser: false
  });
  SwaggerConfig(app)
  app.useGlobalPipes(new ValidationPipe)
  app.use(json({ limit: '50mb' }));
  app.useStaticAssets('public',{prefix: '/public/'})
  const { PORT } = process.env
  await app.listen(PORT, () => {
    console.log(`server started: http://localhost:${PORT}/swagger`);
  });
}
bootstrap();
