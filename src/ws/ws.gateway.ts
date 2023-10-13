import { OnModuleInit } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'ws'
import { HubService } from '../hub/service/hub.service'

@WebSocketGateway()
export class WsGateway implements OnModuleInit {
  @WebSocketServer()
  protected server: Server

  constructor(
    private readonly hubService: HubService,
  ) { }

  onModuleInit() {
    this.hubService.on('data', (data) => {
      const payload = { event: 'video', data }
      this.broadcast(JSON.stringify(payload))
    })
  }

  public broadcast(data: string) {
    this.server.clients.forEach((client) => client.send(data))
  }
}
