/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // thêm prefix cho đường dẫn api
  app.setGlobalPrefix('api');
  // thêm filter cho exception
  app.useGlobalFilters(new HttpExceptionFilter());
  // thêm interceptor cho response
  app.useGlobalInterceptors(new ResponseInterceptor());



  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to match DTO types
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description for the NestJS application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
    console.log(`Swagger is available at http://localhost:${process.env.PORT ?? 3000}/api/docs`);
    console.log(`API is available at http://localhost:${process.env.PORT ?? 3000}/api`);
  });
}
bootstrap();
