import { BadRequestException, ClassSerializerInterceptor, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'body-parser';
import { SwaggerConfig } from './common/config/swagger.config';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false
  });
  const server = app.getHttpServer()
  server.keepAliveTimeout = 30000
  server.headersTimeout = 32000
  app.enableCors();
  SwaggerConfig(app)
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      const errors = validationErrors.map((error) => {
        const constraints = error.constraints;
        if (constraints) {
          console.log(Object.values(constraints)[0]);
          throw new BadRequestException(Object.values(constraints)[0]);
        }
        return 'Validation error';
      });
      return new BadRequestException(errors);
    },
    stopAtFirstError: false,
  }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true }))
  app.useStaticAssets('public', { prefix: '/public/' })
  const { PORT } = process.env
  await app.listen(PORT, () => {
    console.log(`server started: http://localhost:${PORT}/swagger`);
  });
}
bootstrap();
