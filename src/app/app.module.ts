import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { LoggingInterceptor } from '../common/interceptor/logging.interceptor'
import { HubModule } from '../hub/hub.module'
import { WsModule } from '../ws/ws.module'
import { AppController } from './controller/app.controller'
import { LoggerModule } from './logger/logger.module'
import { AppService } from './service/app.service'

@Module({
  imports: [
    LoggerModule,
    HubModule,
    WsModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,

    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule { }
