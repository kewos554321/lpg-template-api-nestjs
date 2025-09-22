import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { DemoModule } from './modules/demo/demo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => {
        const c = cs.get('database');
        console.log(c);
        return {
          type: 'postgres',
          host: c.host,
          port: c.port,
          username: c.username,
          password: c.password,
          database: c.database,
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    HealthModule,
    DemoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
