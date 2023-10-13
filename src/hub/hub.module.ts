import { Module } from '@nestjs/common'
import { HubController } from './controller/hub.controller'
import { HubService } from './service/hub.service'

@Module({
  imports: [
  ],
  controllers: [
    HubController,
  ],
  providers: [
    HubService,
  ],
  exports: [
    HubService,
  ],
})
export class HubModule { }
