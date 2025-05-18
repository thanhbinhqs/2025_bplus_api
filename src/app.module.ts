import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ContentTypeMiddleware } from './common/middlewares/content-type';
import { UploadModule } from './upload/upload.module';
import { SocketModule } from './socket/socket.module';
import { MetadataModule } from './metadata/metadata.module';
import { JigModule } from './jig/jig.module';


@Module({
  imports: [
    // import ConfigModule\
    ConfigModule.forRoot({
      isGlobal: true, // make the config global
    }),
    // add typeorm module
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        // console.log('Database Config:', {
        //   type: 'postgres',
        //   host: configService.get('DB_HOST'),
        //   port: +configService.get('DB_PORT'),
        //   username: configService.get('DB_USERNAME'),
        //   password: configService.get('DB_PASSWORD'),
        //   database: configService.get('DB_DATABASE'),
        //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
        //   synchronize: true,
        //   logger: 'advanced-console',
        //   logging: 'all'
        // });
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          logger: 'file',
          logging: 'all',
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    UploadModule,
    SocketModule,
    MetadataModule,
    JigModule,
    // JigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    //consumer.apply(ContentTypeMiddleware).forRoutes('*path'); // Apply the middleware to all routes
    //exlucde /api/upload/*file
    consumer
      .apply(ContentTypeMiddleware)
      .exclude('/api/chat/*p')
      .exclude('/api/upload/*p')
      .forRoutes('*path'); // Apply the middleware to all routes
  }
}


