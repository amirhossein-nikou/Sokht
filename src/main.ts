import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerConfig } from './common/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  SwaggerConfig(app)
  app.useGlobalPipes(new ValidationPipe)
  const { PORT } = process.env
  await app.listen(PORT, () => {
    console.log(`server started: http://localhost:${PORT}/swagger`);
  });
}
bootstrap();
