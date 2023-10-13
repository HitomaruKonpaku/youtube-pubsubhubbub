import { Module } from '@nestjs/common'
import { HubModule } from '../hub/hub.module'
import { WsGateway } from './ws.gateway'

@Module({
  imports: [
    HubModule,
  ],
  providers: [
    WsGateway,
  ],
})
export class WsModule { }
