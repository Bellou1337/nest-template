import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  app.use(cookieParser());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));

  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API description')
    .setVersion('1.0')
    .addCookieAuth('accessToken')
    .addCookieAuth('refreshToken')
    .build();

  const swaggerPath = configService.get<string>('SWAGGER_PATH')!;
  const swaggerURL = configService.get<string>('SWAGGER_URL')!;
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(swaggerPath, app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
    },
  });

  const port = configService.get<number>('APP_PORT')!;

  await app.listen(port);

  Logger.log(`Application successfully started on port: ${port}`, 'Bootstrap');
  Logger.log(
    `Swagger url is: ${swaggerURL}:${port}/${swaggerPath}`,
    'Bootstrap',
  );
}
bootstrap();
