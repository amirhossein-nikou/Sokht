import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'body-parser';
import { SwaggerConfig } from './common/config/swagger.config';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule,{
    bodyParser: false
  });
  SwaggerConfig(app)
  app.useGlobalPipes(new ValidationPipe)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({extended: true}))
  app.useStaticAssets('public',{prefix: '/public/'})
  const { PORT } = process.env
  await app.listen(PORT, () => {
    console.log(`server started: http://localhost:${PORT}/swagger`);
  });
}
bootstrap();
