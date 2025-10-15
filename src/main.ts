import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  // Security & performance middlewares
  app.use(compression());
  app.use(helmet());
  app.use(cookieParser());
  //called the ● 	Input validation (Nest JS class validation)  
   app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,      // strips unknown fields
      forbidNonWhitelisted: true, // throw error if unknown fields
      transform: true,      // auto-transform payloads to DTO classes
    }),
  );
  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:8080',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  //add csrf token to protect the access of the api by CSRF protection 
    app.use(
    csurf({
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // true if HTTPS
      },
    }),
  );

  // app.use(
  //   csurf({
  //     cookie: {
  //       httpOnly: true,   // can't be accessed by JS
  //       secure: process.env.NODE_ENV === 'local',  // when file upload on aws --production // only over HTTPS
  //       sameSite: 'strict', // prevent cross-site sending
  //     },
  //   }),
  // );

  // Only enable Swagger in non-production environments
  if (process.env.ENVIRONMENT !== 'Production') {
    const config = new DocumentBuilder()
      .setTitle('Your API Title')
      .setDescription('API description')
      .setVersion('1.0').addBearerAuth()
  .addApiKey(
    { type: 'apiKey', name: 'X-CSRF-Token', in: 'header' },
    'csrf-token',
  )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
